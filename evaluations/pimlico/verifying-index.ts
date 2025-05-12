import "dotenv/config"
import { writeFileSync } from "fs"
import { toSafeSmartAccount } from "permissionless/accounts"
import { Hex, createPublicClient, getContract, http, getAddress, parseAbi } from "viem"
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts"
import { sepolia, baseSepolia } from "viem/chains"
import { createPimlicoClient } from "permissionless/clients/pimlico"
import {  createBundlerClient, entryPoint07Address, EntryPointVersion } from "viem/account-abstraction"
import { createSmartAccountClient } from "permissionless"

import {
	maxUint256,
} from "viem";

console.log("Starting Pimlico Verifying Paymaster Tutorial (Tutorial 1 adapted)...");

// 1. API Key and Private Key handling
const apiKey = process.env.PIMLICO_API_KEY;
if (!apiKey) {
	console.error("Error: PIMLICO_API_KEY is not set in .env file.");
	process.exit(1);
}

let rawPrivateKey = process.env.PRIVATE_KEY;
let finalPrivateKey: Hex;

if (rawPrivateKey) {
	if (!rawPrivateKey.startsWith('0x')) {
		finalPrivateKey = `0x${rawPrivateKey}` as Hex;
	} else {
		finalPrivateKey = rawPrivateKey as Hex;
	}
} else {
	console.log("PRIVATE_KEY not found in .env, generating a new one...");
	const pk = generatePrivateKey(); // This already returns Hex (0x...)
	try {
		// Write the new private key WITHOUT the 0x prefix to .env
		writeFileSync(".env", `PRIVATE_KEY=${pk.substring(2)}\n`, { flag: 'a' }); 
		console.log("New private key generated and saved to .env (without 0x prefix)");
	} catch (error) {
		console.error("Error writing new private key to .env:", error);
		// Decide if to proceed with the generated key even if saving failed
	}
	finalPrivateKey = pk;
}
const privateKey: Hex = finalPrivateKey;
console.log("Private key loaded/generated.");

// 2. Create Public Client for Sepolia
const publicClient = createPublicClient({
	chain: sepolia,
	// Using the RPC from Pimlico's Tutorial 1 for Sepolia.
	transport: http("https://sepolia.rpc.thirdweb.com"), 
});
console.log("Public client for Sepolia created.");

// 3. Create Pimlico Client for Sepolia (Bundler & Paymaster)
const pimlicoUrl = `https://api.pimlico.io/v2/sepolia/rpc?apikey=${apiKey}`;
const pimlicoClient = createPimlicoClient({
	chain: sepolia, 
	transport: http(pimlicoUrl),
	entryPoint: {
		address: entryPoint07Address,
		version: "0.7" as EntryPointVersion,
	},
});
console.log("Pimlico client for Sepolia created.");

async function main() {
	console.log("\nStarting main execution for Verifying Paymaster tutorial...");

	// 4. Create SmartAccount (Safe) instance
	const account = await toSafeSmartAccount({
		client: publicClient,
		owners: [privateKeyToAccount(privateKey)],
		entryPoint: { // As per Tutorial 1, entryPoint is specified here for toSafeSmartAccount
			address: entryPoint07Address,
			version: "0.7", // Explicitly use string "0.7"
		},
		version: "1.4.1",
	});
	console.log(`Smart account address (Sepolia): https://sepolia.etherscan.io/address/${account.address}`);

	// 5. Create SmartAccountClient
	const smartAccountClient = createSmartAccountClient({
		account,
		chain: sepolia,
		bundlerTransport: http(pimlicoUrl),
		paymaster: pimlicoClient, // PimlicoClient acts as the paymaster interface for Verifying Paymaster
		userOperation: {
			estimateFeesPerGas: async () => {
				const gasPrice = await pimlicoClient.getUserOperationGasPrice();
				if (!gasPrice || !gasPrice.fast) {
					console.error("Could not fetch gas prices from Pimlico client.");
					// Fallback or throw, e.g., return a default or throw new Error
					throw new Error("Failed to get gas price from Pimlico"); 
				}
				return gasPrice.fast;
			},
		},
	});
	console.log(`SmartAccountClient created for address: ${account.address}`);

	// 6. Submit a transaction from the smart account
	const vitalikEthAddress = getAddress("0xd8da6bf26964af9d7eed9e03e53415d37aa96045");
	console.log(`Attempting to send a transaction to ${vitalikEthAddress} using Verifying Paymaster...`);

	const txHash = await smartAccountClient.sendTransaction({
		to: vitalikEthAddress,
		value: 0n,
		data: "0x1234" as Hex,
		// No paymasterContext is typically needed for Pimlico's Verifying Paymaster 
		// when pimlicoClient is set as the paymaster in smartAccountClient.
		// Sponsorship should be automatic if API key supports it.
	});

	console.log(`Transaction hash: ${txHash}`);
	console.log(`User operation included: https://sepolia.etherscan.io/tx/${txHash}`);
	console.log("\nVerifying Paymaster tutorial script completed successfully!");
}

main().catch(error => {
	console.error("\nError in main execution:", error);
	process.exit(1);
});