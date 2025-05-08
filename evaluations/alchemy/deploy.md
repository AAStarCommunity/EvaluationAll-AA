# Alchemy部署和测试指南

## 环境准备

1. 安装Node.js和包管理工具

```bash
# 检查Node.js版本
node -v  # 建议使用v18或更高版本
```

推荐使用pnpm作为包管理工具：

```bash
# 安装pnpm
npm install -g pnpm
```

2. 创建Alchemy账户并获取API密钥

在[Alchemy Dashboard](https://dashboard.alchemy.com/)注册并创建应用程序以获取API密钥。

## 测试Account Kit

### 克隆示例项目

```bash
# 克隆aa-sdk仓库
git clone https://github.com/alchemyplatform/aa-sdk.git
cd aa-sdk

# 安装依赖
pnpm install
```

### 运行嵌入式账户快速入门示例

```bash
cd examples/embedded-accounts-quickstart

# 安装依赖
pnpm install

# 设置环境变量
cp .env.example .env
```

编辑`.env`文件，添加您的Alchemy API密钥和其他必要信息：

```
VITE_ALCHEMY_API_KEY=your_api_key_here
NEXT_PUBLIC_ALCHEMY_API_KEY=your_api_key_here
PRIVATE_KEY=your_private_key_here  # 可选，用于创建LightSmartContractAccount
```

启动演示应用：

```bash
pnpm dev
```

访问`http://localhost:3000`查看运行中的应用。

### 运行UI演示

UI演示提供了一个更完整的Account Kit功能展示：

```bash
cd examples/ui-demo

# 安装依赖
pnpm install

# 设置环境变量
cp .env.example .env
```

编辑`.env`文件，添加您的Alchemy API密钥。然后启动演示：

```bash
pnpm dev
```

访问`http://localhost:3000`体验UI演示。

## 测试Bundler API

要测试Alchemy的Bundler API，您可以通过Account Kit中的示例发送UserOperation并监控其处理过程。

1. 确保您的API密钥有权限访问Bundler服务
2. 在Account Kit示例中发送交易
3. 使用Alchemy Dashboard监控交易状态

也可以使用直接API调用测试Bundler功能：

```typescript
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";

// 创建智能账户客户端
const smartAccountClient = await createModularAccountAlchemyClient({
  apiKey: "YOUR_ALCHEMY_API_KEY",
  chain: sepolia,
  // 其他配置...
});

// 发送用户操作
const hash = await smartAccountClient.sendUserOperation({
  uo: {
    target: "0xTargetAddress",
    data: "0xCallData",
    value: 0n,
  },
});

// 等待交易完成
const transactionHash = await smartAccountClient.waitForUserOperationTransaction(hash);
console.log("交易哈希:", transactionHash);
```

## 测试Gas Manager API

使用Gas Manager进行gas赞助需要以下步骤：

1. 在[Alchemy Dashboard](https://dashboard.alchemy.com/)中创建一个Gas Policy
2. 设置您的赞助策略（支出限制、地址allowlist等）
3. 将Gas Policy ID添加到您的应用配置中

示例代码：

```typescript
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";

// 创建带有Gas Manager支持的客户端
const smartAccountClient = await createModularAccountAlchemyClient({
  apiKey: "YOUR_ALCHEMY_API_KEY",
  chain: sepolia,
  gasManagerConfig: {
    policyId: "YOUR_GAS_POLICY_ID",
  },
  // 其他配置...
});

// 发送赞助的交易
const hash = await smartAccountClient.sendUserOperation({
  uo: {
    target: "0xTargetAddress",
    data: "0xCallData",
    value: 0n,
  },
});
```

## 测试Modular Account

Modular Account是一个可扩展的、支持插件的智能账户实现。

示例代码：

```typescript
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";
import { LocalAccountSigner } from "@alchemy/aa-core";

// 创建签名器
const signer = LocalAccountSigner.privateKeyToAccountSigner("YOUR_PRIVATE_KEY");

// 创建模块化账户客户端
const smartAccountClient = await createModularAccountAlchemyClient({
  apiKey: "YOUR_ALCHEMY_API_KEY",
  chain: sepolia,
  signer,
});

// 安装多所有者插件
await smartAccountClient.installPlugin({
  pluginAddress: "0xMultiOwnerPluginAddress",
  pluginInitData: "0x", // 初始化数据
});

// 安装会话密钥插件
await smartAccountClient.installPlugin({
  pluginAddress: "0xSessionKeyPluginAddress",
  pluginInitData: "0x", // 初始化数据
});
```

## 测试Smart EOA (EIP-7702)

要测试EIP-7702功能（将EOA升级为智能账户），请使用以下代码：

```typescript
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { sepolia } from "@alchemy/aa-core";
import { LocalAccountSigner } from "@alchemy/aa-core";

// 创建签名器
const signer = LocalAccountSigner.privateKeyToAccountSigner("YOUR_PRIVATE_KEY");

// 创建使用EIP-7702的模块化账户客户端
const smartAccountClient = await createModularAccountAlchemyClient({
  apiKey: "YOUR_ALCHEMY_API_KEY",
  chain: sepolia,
  signer,
  mode: "7702", // 指定使用EIP-7702模式
});

// 发送交易（将自动使用EIP-7702授权）
const hash = await smartAccountClient.sendUserOperation({
  uo: {
    target: "0xTargetAddress", 
    data: "0xCallData",
    value: 0n,
  },
});
```

注意：EIP-7702目前在Sepolia测试网上可用，主网支持即将推出。

## 故障排除

### 常见问题

1. **Gas估算错误**：
   - 检查是否使用了最新版本的aa-sdk
   - 确认您的API密钥有效且有足够的配额
   - 查看具体错误消息以获取详细信息

2. **交易失败**：
   - 检查目标合约是否正确
   - 确认您的Gas Policy设置正确
   - 查看交易哈希以获取更多详细信息

3. **插件安装失败**：
   - 确认插件地址正确
   - 检查初始化数据格式是否正确
   - 确认账户有足够的资金支付插件安装费用

### 获取帮助

如果遇到问题，可以通过以下渠道获取帮助：

- [Alchemy Discord](https://discord.gg/alchemyplatform)
- [Alchemy Support](https://support.alchemy.com)
- [GitHub Issues](https://github.com/alchemyplatform/aa-sdk/issues) 