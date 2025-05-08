# Coinbase账户抽象部署和测试指南

## 环境准备

1. 安装Node.js和包管理工具

```bash
# 检查Node.js版本
node -v  # 建议使用v16或更高版本
```

推荐使用yarn作为包管理工具：

```bash
# 如果需要，安装yarn
npm install -g yarn
```

2. 获取Base Sepolia测试网RPC URL

在[Coinbase Developer Platform](https://www.coinbase.com/developer-platform/products/base-node)注册并创建应用程序：

- 登录Coinbase Developer Platform
- 在"Build Onchain"部分选择"Node"
- 在配置下拉菜单中选择"Base Testnet (Sepolia)"
- 复制RPC端点，格式应类似于：`https://api.developer.coinbase.com/rpc/v1/base-sepolia/<api_key>`

## 克隆示例代码

```bash
# 克隆示例仓库
git clone https://github.com/coinbase/paymaster-bundler-examples.git
cd paymaster-bundler-examples

# 设置环境变量
cp .env.example .env
```

编辑`.env`文件，添加您的RPC URL和一个私钥（用于创建和签名智能账户）：

```
RPC_URL=https://api.developer.coinbase.com/rpc/v1/base-sepolia/<YOUR_API_KEY>
PRIVATE_KEY=<YOUR_PRIVATE_KEY>
```

> 注意：由于交易将由Paymaster赞助，您的账户不需要有资金。如果没有现成的私钥，可以使用Foundry工具生成新的密钥对。

## 运行Alchemy示例

Alchemy示例展示了如何使用Alchemy的aa-core SDK与Coinbase的Paymaster和Bundler集成：

```bash
# 进入Alchemy示例目录
cd examples/alchemy

# 安装依赖
yarn install

# 运行示例
yarn dev
```

成功执行后，您将看到类似以下输出：

```
Minting to 0xF19CEA17462220437000F459f721e3e393bd1fc9
Waiting for transaction...
 ⛽ Successfully sponsored gas for mintTo transaction with Coinbase Developer Platform!
 🔍 View on Etherscan: https://sepolia.basescan.org/tx/0xe51e9bf6fea0dfecfcbf7168bcc7da2c833ad0dcac5651940953a89857674885
```

您可以在[Base Sepolia区块浏览器](https://sepolia.basescan.org/)上查看交易详情。

## 运行Pimlico示例

Pimlico示例展示了如何使用Pimlico的permissionless.js库与Coinbase的基础设施交互：

```bash
# 进入Pimlico示例目录
cd examples/pimlico

# 安装依赖
yarn install

# 运行示例
yarn dev
```

> 注意：您可以通过在`.env`文件中设置`account_type`变量来更改智能账户类型。有效值包括：`simple`、`safe`和`kernel`。

## 运行ZeroDev示例

ZeroDev示例展示了如何使用ZeroDev的SDK与Coinbase的Paymaster和Bundler集成：

```bash
# 进入ZeroDev示例目录
cd examples/zerodev

# 安装依赖
yarn install

# 运行示例
yarn dev
```

## 运行Wagmi示例

Wagmi示例提供了一个前端应用示例，展示如何在React应用中集成Coinbase的账户抽象服务：

```bash
# 进入Wagmi示例目录
cd examples/wagmi

# 安装依赖
yarn install

# 启动开发服务器
yarn dev
```

访问`http://localhost:3000`查看运行中的应用程序。

## 故障排除

### 常见问题

1. **RPC连接问题**

如果遇到RPC连接错误，请确保：
- 您的API密钥有效
- RPC URL格式正确
- 没有网络连接问题

2. **交易失败**

如果交易失败，可能的原因包括：
- Paymaster余额不足
- 用户操作验证失败
- 区块链网络拥堵

请检查终端输出中的错误消息，通常会提供有用的诊断信息。

3. **私钥问题**

如果看到与私钥相关的错误，请确保：
- 私钥格式正确（64个十六进制字符，不包含"0x"前缀）
- 私钥已正确设置在`.env`文件中

### 获取帮助

如果遇到问题，可以通过以下方式获取帮助：

- [Coinbase Developer Platform文档](https://docs.cloud.coinbase.com/developer-platform/docs)
- [Coinbase Developer Discord](https://discord.gg/coinbasedeveloperplatform)
- [GitHub仓库Issues页面](https://github.com/coinbase/paymaster-bundler-examples/issues) 