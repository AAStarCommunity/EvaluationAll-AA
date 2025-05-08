# Biconomy部署和测试指南

## 环境准备

1. 安装Node.js和包管理工具

```bash
# 检查Node.js版本
node -v  # 建议使用v16或更高版本
```

推荐使用pnpm作为包管理工具：

```bash
# 安装pnpm
npm install -g pnpm
```

2. 创建Biconomy Dashboard账户

在[Biconomy Dashboard](https://dashboard.biconomy.io/)注册并创建应用程序以获取API密钥。

## 测试Biconomy智能账户与SDK

### 克隆示例项目

```bash
# 创建项目目录
mkdir biconomy-test && cd biconomy-test

# 初始化项目
pnpm init
```

创建一个`.env`文件，添加以下内容：

```
PRIVATE_KEY=<YOUR_PRIVATE_KEY>
BICONOMY_PAYMASTER_URL=<YOUR_PAYMASTER_API_URL>
```

### 安装依赖

```bash
pnpm add @biconomy/account @biconomy/bundler @biconomy/paymaster @biconomy/common @biconomy/core-types viem
```

### 创建使用Biconomy智能账户的示例

创建一个`index.js`文件：

```javascript
import { Wallet, providers } from "ethers";
import { 
  BiconomySmartAccountV2, 
  DEFAULT_ENTRYPOINT_ADDRESS 
} from "@biconomy/account";
import { Bundler } from "@biconomy/bundler";
import { BiconomyPaymaster } from "@biconomy/paymaster";
import { ChainId } from "@biconomy/core-types";

// 配置项
const bundlerUrl = "https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44"; // 例如 Mumbai 测试网
const paymasterApiKey = process.env.BICONOMY_PAYMASTER_URL;
const privateKey = process.env.PRIVATE_KEY;

const provider = new providers.JsonRpcProvider("https://rpc.ankr.com/polygon_mumbai");
const wallet = new Wallet(privateKey, provider);

async function main() {
  // 1. 创建Bundler实例
  const bundler = new Bundler({
    bundlerUrl,
    chainId: ChainId.POLYGON_MUMBAI,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  });

  // 2. 创建Paymaster实例
  const paymaster = new BiconomyPaymaster({
    paymasterUrl: paymasterApiKey
  });

  // 3. 创建智能账户实例
  const smartAccount = await BiconomySmartAccountV2.create({
    chainId: ChainId.POLYGON_MUMBAI,
    bundler,
    paymaster,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
    defaultValidationModule: await ECDSAOwnershipValidationModule.create({
      signer: wallet
    })
  });

  const address = await smartAccount.getAccountAddress();
  console.log("智能账户地址:", address);

  // 4. 执行简单的交易（无Gas费用）
  const transaction = {
    to: "0xRecipientAddress",
    data: "0x",
    value: ethers.utils.parseEther("0.001"),
  };

  // 5. 通过Paymaster赞助交易
  const userOp = await smartAccount.buildUserOp([transaction]);
  const paymasterAndDataResponse = await smartAccount.paymaster.getPaymasterAndData(userOp);
  userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;

  // 6. 发送用户操作
  const userOpResponse = await smartAccount.sendUserOp(userOp);
  console.log("等待交易确认...");
  const transactionDetails = await userOpResponse.wait();
  console.log("交易哈希:", transactionDetails.receipt.transactionHash);
}

main().catch(console.error);
```

### 运行示例

```bash
pnpm add -D tsx
pnpm tsx index.js
```

## 测试Biconomy Paymaster

### Verifying Paymaster

创建一个`verifying-paymaster-test.js`文件：

```javascript
import { Wallet, providers } from "ethers";
import { 
  BiconomySmartAccountV2, 
  DEFAULT_ENTRYPOINT_ADDRESS 
} from "@biconomy/account";
import { Bundler } from "@biconomy/bundler";
import { BiconomyPaymaster } from "@biconomy/paymaster";
import { ChainId } from "@biconomy/core-types";

async function testVerifyingPaymaster() {
  // 设置与上面示例相同
  // ...
  
  // 构建一个交易请求
  const transaction = {
    to: "0xRecipientAddress",
    data: "0x",
    value: ethers.utils.parseEther("0.001"),
  };

  // 构建用户操作
  const userOp = await smartAccount.buildUserOp([transaction]);
  
  // 使用Verifying Paymaster赞助交易
  const biconomyPaymaster = smartAccount.paymaster;
  const paymasterServiceData = {
    mode: "SPONSORED",  // SPONSORED模式表示完全赞助
    smartAccountInfo: {
      name: "BICONOMY",
      version: "2.0.0"
    },
    calculateGasLimits: true
  };

  const paymasterAndDataResponse = await biconomyPaymaster.getPaymasterAndData(
    userOp,
    paymasterServiceData
  );
  userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;

  // 更新Gas参数
  userOp.callGasLimit = paymasterAndDataResponse.callGasLimit;
  userOp.verificationGasLimit = paymasterAndDataResponse.verificationGasLimit;
  userOp.preVerificationGas = paymasterAndDataResponse.preVerificationGas;

  // 发送用户操作
  const userOpResponse = await smartAccount.sendUserOp(userOp);
  console.log("Verifying Paymaster交易哈希:", await userOpResponse.wait());
}

testVerifyingPaymaster().catch(console.error);
```

### ERC20 Paymaster

创建一个`erc20-paymaster-test.js`文件：

```javascript
import { Wallet, providers } from "ethers";
import { 
  BiconomySmartAccountV2, 
  DEFAULT_ENTRYPOINT_ADDRESS 
} from "@biconomy/account";
import { Bundler } from "@biconomy/bundler";
import { BiconomyPaymaster } from "@biconomy/paymaster";
import { ChainId } from "@biconomy/core-types";
import { ethers } from "ethers";

async function testERC20Paymaster() {
  // 设置与上面示例相同
  // ...
  
  // 构建一个交易请求
  const transaction = {
    to: "0xRecipientAddress",
    data: "0x",
    value: ethers.utils.parseEther("0.001"),
  };

  // 构建用户操作
  const userOp = await smartAccount.buildUserOp([transaction]);
  
  // 使用ERC20代币支付Gas费用
  const biconomyPaymaster = smartAccount.paymaster;
  const tokenAddress = "0xTokenAddress"; // 例如USDC地址
  const paymasterServiceData = {
    mode: "ERC20",
    tokenList: [{
      tokenAddress: tokenAddress,
      decimals: 6, // USDC是6位小数
      logoUrl: "",
      symbol: "USDC",
      name: "USD Coin"
    }],
    preferredToken: tokenAddress,
    smartAccountInfo: {
      name: "BICONOMY",
      version: "2.0.0"
    },
    calculateGasLimits: true
  };

  const paymasterAndDataResponse = await biconomyPaymaster.getPaymasterAndData(
    userOp,
    paymasterServiceData
  );
  userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;

  // 更新Gas参数
  userOp.callGasLimit = paymasterAndDataResponse.callGasLimit;
  userOp.verificationGasLimit = paymasterAndDataResponse.verificationGasLimit;
  userOp.preVerificationGas = paymasterAndDataResponse.preVerificationGas;

  // 发送用户操作
  const userOpResponse = await smartAccount.sendUserOp(userOp);
  console.log("ERC20 Paymaster交易哈希:", await userOpResponse.wait());
}

testERC20Paymaster().catch(console.error);
```

## 测试Biconomy会话密钥

创建一个`session-key-test.js`文件：

```javascript
import { Wallet, providers } from "ethers";
import { 
  BiconomySmartAccountV2, 
  DEFAULT_ENTRYPOINT_ADDRESS 
} from "@biconomy/account";
import { Bundler } from "@biconomy/bundler";
import { BiconomyPaymaster } from "@biconomy/paymaster";
import { ChainId } from "@biconomy/core-types";
import { ethers } from "ethers";

async function testSessionKey() {
  // 设置与上面示例相同
  // ...
  
  // 创建会话密钥
  const sessionKey = Wallet.createRandom();
  const sessionKeyAddress = await sessionKey.getAddress();
  console.log("会话密钥地址:", sessionKeyAddress);
  
  // 定义会话密钥的权限
  const sessionKeyData = {
    sessionKeyData: {
      sessionKey: sessionKeyAddress,
      sessionKeyAdmin: await smartAccount.getAccountAddress(),
      validUntil: Math.floor(Date.now() / 1000) + 3600, // 1小时有效期
      validAfter: 0,
      permissions: [
        {
          target: "0xTargetContractAddress",
          valueLimit: ethers.utils.parseEther("0.1").toString(),
          functionSelector: "0xFunction4bytes", // 函数选择器
          requirementData: ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes("requirements")
          ),
        },
      ],
    }
  };
  
  // 创建会话模块并将其添加到智能账户
  const sessionKeyCreationResponse = await smartAccount.createSession(sessionKeyData);
  console.log("创建会话密钥交易哈希:", sessionKeyCreationResponse.receipt.transactionHash);
  
  // 使用会话密钥执行交易
  // 需要重新配置智能账户以使用会话验证模块
  // ...
}

testSessionKey().catch(console.error);
```

## 故障排除

### 常见问题

1. **API密钥问题**

如果看到与API密钥相关的错误，请确保：
- 您已经在Biconomy Dashboard上创建了项目并获取了正确的API密钥
- API密钥已正确设置在环境变量中
- 您的项目有足够的配额/余额

2. **交易失败**

如果交易失败，常见原因包括：
- 智能账户没有足够的资金（对于非赞助交易）
- Paymaster配置不正确
- 网络拥堵或Gas估算不准确

3. **智能账户地址问题**

如果遇到智能账户地址相关问题，请确保：
- 使用了正确的链ID
- EntryPoint地址正确
- Bundler URL正确配置

### 获取帮助

如果遇到问题，可以通过以下方式获取帮助：

- [Biconomy文档](https://docs.biconomy.io/)
- [Biconomy Discord社区](https://discord.gg/biconomy)
- [GitHub仓库Issues页面](https://github.com/bcnmy/biconomy-client-sdk/issues) 