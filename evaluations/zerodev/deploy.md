# ZeroDev部署和测试指南

## 环境准备

1. 安装Node.js和npm/pnpm

```bash
# 检查Node.js版本
node -v  # 建议使用v16或更高版本
npm -v
```

2. 克隆ZeroDev示例代码

```bash
git clone https://github.com/zerodevapp/zerodev-examples.git zerodev-tutorial
cd zerodev-tutorial
```

3. 安装依赖

```bash
npm install
# 或使用pnpm
pnpm install
```

4. 配置环境变量

创建`.env`文件并添加以下内容：

```
ZERODEV_RPC=https://rpc.zerodev.app/api/v2/bundler/<YOUR_PROJECT_ID>
PRIVATE_KEY=<YOUR_PRIVATE_KEY>
```

> 注意：请从[ZeroDev仪表板](https://dashboard.zerodev.app/)获取Project ID

## 运行基本示例

### 创建账户并发送交易

```bash
cd create-account
npx ts-node main.ts
```

成功执行后，你将看到类似以下输出：

```
My account: 0x...
userOp hash: 0x...
bundle txn hash: 0x...
userOp completed
```

### 使用会话密钥

```bash
cd ../session-keys
npx ts-node 1-click-trading.ts
```

### 使用ERC20代币支付Gas

在运行此示例前，确保你的账户已经有一些测试网USDC代币。可以从[Circle Faucet](https://faucet.circle.com/)获取Sepolia测试网上的USDC。

```bash
cd ../pay-gas-with-erc20
npx ts-node main.ts
```

### 批量交易

```bash
cd ../batch-transactions
npx ts-node main.ts
```

## 创建自己的ZeroDev应用

### 1. 初始化项目

```bash
mkdir my-zerodev-app
cd my-zerodev-app
npm init -y
npm install @zerodev/sdk @zerodev/ecdsa-validator viem dotenv
```

### 2. 创建基本代码结构

创建`index.ts`文件：

```typescript
import "dotenv/config";
import {
  createKernelAccount,
  createZeroDevPaymasterClient,
  createKernelAccountClient,
} from "@zerodev/sdk";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { http, Hex, createPublicClient, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { getEntryPoint, KERNEL_V3_1 } from "@zerodev/sdk/constants";

if (!process.env.ZERODEV_RPC || !process.env.PRIVATE_KEY) {
  throw new Error("ZERODEV_RPC or PRIVATE_KEY is not set");
}

const chain = sepolia;
const publicClient = createPublicClient({
  transport: http(process.env.ZERODEV_RPC),
  chain,
});

const signer = privateKeyToAccount(process.env.PRIVATE_KEY as Hex);
const entryPoint = getEntryPoint("0.7");

const main = async () => {
  // 创建ECDSA验证器
  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    entryPoint,
    signer,
    kernelVersion: KERNEL_V3_1,
  });

  // 创建Kernel账户
  const account = await createKernelAccount(publicClient, {
    entryPoint,
    plugins: {
      sudo: ecdsaValidator,
    },
    kernelVersion: KERNEL_V3_1,
  });
  console.log("账户地址:", account.address);

  // 创建Paymaster客户端
  const paymasterClient = createZeroDevPaymasterClient({
    chain,
    transport: http(process.env.ZERODEV_RPC),
  });

  // 创建Kernel客户端
  const kernelClient = createKernelAccountClient({
    account,
    chain,
    bundlerTransport: http(process.env.ZERODEV_RPC),
    paymaster: {
      getPaymasterData(userOperation) {
        return paymasterClient.sponsorUserOperation({ userOperation });
      },
    },
  });

  // 发送交易
  const userOpHash = await kernelClient.sendUserOperation({
    callData: await account.encodeCalls([
      {
        // 替换为你想发送交易的地址
        to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
        value: parseEther("0"),
        data: "0x",
      },
    ]),
  });
  console.log("UserOp哈希:", userOpHash);

  // 等待交易完成
  const receipt = await kernelClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });
  console.log("交易哈希:", receipt.receipt.transactionHash);
  console.log("交易完成!");
};

main().catch(console.error);
```

### 3. 运行你的应用

```bash
npx ts-node index.ts
```

## 故障排除

### 1. RPC URL错误

如果看到以下错误：

```
Error: ZERODEV_RPC is not set
```

请确保：
- 你已在ZeroDev仪表板创建了项目并获取了Project ID
- 正确设置了环境变量

### 2. Gas费用问题

如果交易因Gas相关原因失败：
- 确认你使用的测试网络是否正确
- 检查你的项目Gas赞助配额是否充足

### 3. 插件加载错误

如果遇到插件相关错误：
- 确认SDK版本是否匹配
- 检查插件配置是否正确 