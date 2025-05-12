import "dotenv/config"
import { writeFileSync } from "fs"
import { toSafeSmartAccount } from "permissionless/accounts"
import { Hex, createPublicClient, getContract, http } from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { sepolia, baseSepolia } from "viem/chains"
import { createPimlicoClient } from "permissionless/clients/pimlico"
import {  createBundlerClient, entryPoint07Address } from "viem/account-abstraction"
import { createSmartAccountClient } from "permissionless"

import {
	getAddress,
	maxUint256,
	parseAbi,
} from "viem";
import {
	EntryPointVersion,
} from "viem/account-abstraction";

import { encodeFunctionData, parseAbiItem } from "viem"

console.log("Hello world!")

// Define USDC address on Base Sepolia (from tutorial)
const usdcAddress = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as Hex;

// Get private key from environment variable or generate a new one
let rawPrivateKey = process.env.PRIVATE_KEY;
let finalPrivateKey: Hex;

if (rawPrivateKey) {
    if (!rawPrivateKey.startsWith('0x')) {
        finalPrivateKey = `0x${rawPrivateKey}` as Hex;
    } else {
        finalPrivateKey = rawPrivateKey as Hex;
    }
} else {
    const pk = generatePrivateKey(); // This already returns Hex (0x...)
    try {
        // Append to .env file, ensuring it knows this is a new addition
        // and respects other content if any.
        // The tutorial writes `PRIVATE_KEY=${pk}`. generatePrivateKey() includes 0x.
        // So, we should write it as is, without adding another 0x.
        writeFileSync(".env", `PRIVATE_KEY=${pk.substring(2)}\n`, { flag: 'a' }); 
        console.log("New private key generated and saved to .env (without 0x prefix)");
    } catch (error) {
        console.error("Error writing new private key to .env:", error);
    }
    finalPrivateKey = pk;
}

const privateKey: Hex = finalPrivateKey;

// Create Public Client
const publicClient = createPublicClient({
	chain: baseSepolia,
	transport: http("https://sepolia.base.org"), // Tutorial uses this, but your config.ts had a different Base Sepolia RPC.
													 // For consistency with the tutorial, I'll use their RPC for now.
});

// Create Pimlico Client (acts as the bundler client)
const apiKey = process.env.PIMLICO_API_KEY;
if (!apiKey) {
	throw new Error("PIMLICO_API_KEY is not set in the environment variables. Please add it to your .env file.");
}
const pimlicoUrl = `https://api.pimlico.io/v2/${baseSepolia.id}/rpc?apikey=${apiKey}`;

const pimlicoClient = createPimlicoClient({
	chain: baseSepolia,
	transport: http(pimlicoUrl),
	// entryPoint: entryPoint07Address, // The tutorial specifies entryPoint configuration later when creating smartAccountClient or directly in pimlicoClient
	// As per the latest tutorial structure, entryPoint is configured in createPimlicoClient
	entryPoint: {
		address: entryPoint07Address,
		version: "0.7" as EntryPointVersion,
	},
});

console.log("Public and Pimlico clients created.");
console.log("Using private key:", privateKey ? "********** (loaded)" : "Could not load private key");
console.log("Pimlico API Key used:", apiKey ? "********** (loaded)" : "Could not load PIMLICO_API_KEY");

async function main() {
	// Create the Safe account instance
	const account = await toSafeSmartAccount({
		client: publicClient,
		owners: [privateKeyToAccount(privateKey)],
		version: "1.4.1", // As per tutorial
		// entryPoint: entryPoint07Address, // entryPoint is usually associated with the SmartAccountClient or bundler actions
										// toSafeSmartAccount might not need it directly, or infers from client if compatible.
										// The tutorial doesn't specify it here, so omitting.
	});

	console.log(`Smart account (Safe) generated with address: ${account.address}`);

	// Create SmartAccount Client
	const smartAccountClient = createSmartAccountClient({
		account,
		chain: baseSepolia,
		bundlerTransport: http(pimlicoUrl), // Re-using pimlicoUrl for bundler transport
		// paymaster: pimlicoClient, // The tutorial adds this in two forms: pimlicoClient or pimlicoPaymasterClient
								// For now, setting as pimlicoClient as per the text, will adjust if needed for ERC20 paymaster section
		// The tutorial shows `paymaster: pimlicoClient` for the ERC20 paymaster part later.
		// For the initial setup of getting the address, it doesn't seem to use `paymaster` here.
		// However, it's often needed for `estimateUserOperationGas` or `sendUserOperation` if sponsorship is intended.
		// Let's include it as the tutorial structure has it with `pimlicoClient` for the combined `smartAccountClient`.
		paymaster: pimlicoClient, 
		userOperation: {
			estimateFeesPerGas: async () => {
				// The tutorial uses pimlicoClient.getUserOperationGasPrice()
				// Make sure pimlicoClient (our bundler client) has this method.
				// Permissionless.js's PimlicoClient should support this.
				const gasPrices = await pimlicoClient.getUserOperationGasPrice();
				if (!gasPrices || !gasPrices.fast) {
					throw new Error("Could not fetch gas prices from Pimlico client");
				}
				return gasPrices.fast;
			},
		},
		// The tutorial for permissionless.js v0.2.x has entryPoint within pimlicoClient config.
		// If createSmartAccountClient needs it explicitly for some reason, we can add:
		// entryPoint: entryPoint07Address 
		// But let's follow the tutorial which implies pimlicoClient handles the EP context.
	});

	console.log(`Smart account client created for address: ${smartAccountClient.account.address}`);
	console.log(`View your smart account on Base Sepolia: https://sepolia.basescan.org/address/${smartAccountClient.account.address}`);

	// Verify USDC balance on the counterfactual sender address
	const senderUsdcBalance = await publicClient.readContract({
		abi: parseAbi(["function balanceOf(address account) returns (uint256)"]),
		address: usdcAddress, // Defined earlier
		functionName: "balanceOf",
		args: [account.address],
	});

	const minUsdcRequired = 1_000_000n; // 1 USDC (assuming 6 decimals for USDC)
	if (senderUsdcBalance < minUsdcRequired) {
		throw new Error(
			`Insufficient USDC balance for counterfactual wallet address ${account.address}: ${
				Number(senderUsdcBalance) / Number(minUsdcRequired) // Display as full USDC units
			} USDC, required at least 1 USDC. Load up balance at https://faucet.circle.com/`,
		);
	}

	console.log(`Smart account USDC balance: ${Number(senderUsdcBalance) / Number(minUsdcRequired)} USDC`);

	// Send a transaction from the smart account, paying only with USDC for gas fees.
	console.log("\nAttempting to send a transaction from the smart account...");

	// Get token quotes to find the paymaster for USDC
	// The tutorial uses pimlicoClient.getTokenQuotes which might be a v1 feature or specific to their extended client.
	// For permissionless.js v0.2.x with Pimlico, sponsoring is typically done by configuring the paymaster client (pimlicoClient here)
	// and then the smartAccountClient uses it. The sendTransaction call will include paymasterContext.
	// The tutorial snippet for this section directly uses `pimlicoClient.getTokenQuotes`.
	// Let's assume `pimlicoClient` (our `createPimlicoClient` instance) has this method as per the tutorial context.

	// const quotes = await pimlicoClient.getTokenQuotes({ // This method might not be on the standard PimlicoClient from permissionless v0.2.x
	//     tokens: [usdcAddress]                        // It's part of Pimlico's specific extensions or older versions.
	// });
	// if (!quotes || quotes.length === 0 || !quotes[0].paymaster) {
	//     throw new Error("Could not get paymaster address from Pimlico token quotes for USDC.");
	// }
	// const usdcPaymasterAddress = quotes[0].paymaster;
	// console.log(`Using USDC Paymaster: ${usdcPaymasterAddress}`);

	// The tutorial example for sendTransaction directly specifies the `paymasterContext` without explicitly fetching `usdcPaymasterAddress` beforehand for the approve call target.
	// However, an approval IS needed to the paymaster contract that will be used.
	// The `pimlicoClient` when used as a paymaster in `createSmartAccountClient` will handle the paymaster interactions.
	// The actual paymaster contract address that needs approval is often the bundler/paymaster service's own contract.
	// Pimlico's ERC20Paymaster address for Base Sepolia needs to be approved.
	// This address isn't explicitly returned by `getTokenQuotes` in the tutorial snippet for the `approve` call, 
	// but is implied to be known or handled by the `paymasterContext`.

	// According to Pimlico docs, the ERC20 Paymaster for Base Sepolia (EntryPoint v0.7) is:
	// 0x00000000003255596f56A263A879599709eC14C9 (This is for EntryPoint v0.6, need to find v0.7 or use what Pimlico implies via context)
	// The tutorial for permissionless.js doesn't explicitly state the paymaster address for v0.7 for the approval step.
	// Let's check the Pimlico docs for the correct ERC20 Paymaster address for Base Sepolia & EP 0.7
	// From Pimlico docs (https://docs.pimlico.io/paymaster/erc20-paymaster/contract-addresses):
	// Base Sepolia (EntryPoint v0.7.0) ERC20 Paymaster: 0x8422A9B67f997A7B37570089932E0122021396C8
	// However, the bundler interaction seems to use a general Pimlico verifying paymaster.
	// The UserOp receipt from the error log showed: paymaster: 0x777777777777AeC03fd955926DbF81597e66834C
	// This is likely the address that needs to be approved.
	const pimlicoVerifyingPaymasterAddress = getAddress("0x777777777777AeC03fd955926DbF81597e66834C");
	
	console.log(`Approving Pimlico Verifying Paymaster (${pimlicoVerifyingPaymasterAddress}) to spend USDC...`);

	const rawVitalikAddress = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";
	const vitalikEthAddress = getAddress(rawVitalikAddress); // vitalik.eth

	const txHash = await smartAccountClient.sendTransaction({
		// account: account, // already part of smartAccountClient
		// chain: baseSepolia, // already part of smartAccountClient
		calls: [
			{
				to: usdcAddress, // The USDC token contract address
				abi: parseAbi(["function approve(address spender, uint256 amount)"]),
				functionName: "approve",
				args: [pimlicoVerifyingPaymasterAddress, maxUint256], // Approve the verifying paymaster
			},
			{
				to: vitalikEthAddress,
				data: "0x1234" as Hex, // Example data
				value: 0n, // No ETH value being sent
			},
		],
		// The paymaster sponsoring is handled by the smartAccountClient's `paymaster` configuration (pimlicoClient)
		// We need to provide the context for the ERC20 token being used.
		paymasterContext: {
			token: usdcAddress, // Specify the ERC20 token to use for gas payment
			// The tutorial example shows `type: "erc20"` or similar but `permissionless.js` paymasterContext for Pimlico
			// seems to infer this from the presence of the `token` field.
			// Let's ensure this matches `permissionless.js` expectations for Pimlico ERC20 Paymaster.
			// Looking at permissionless.js v0.2.x, for Pimlico, the `paymasterContext` can indeed just be `{ token: usdcAddress }`
			// or specific to the paymaster being used (e.g. `sponsorUserOperation` on `pimlicoClient` might take specific params).
			// The `sendTransaction` on `SmartAccountClient` with `pimlicoClient` as paymaster should handle this context.
		},
		// gasPrice and other fee parameters will be estimated by `estimateFeesPerGas` in smartAccountClient config.
	});

	console.log(`Transaction hash: ${txHash}`);
	console.log(`User operation included: https://sepolia.basescan.org/tx/${txHash}`);

	console.log("\nTutorial completed successfully!");
}

main().catch(error => {
	console.error("Error in main execution:", error);
	process.exit(1);
});