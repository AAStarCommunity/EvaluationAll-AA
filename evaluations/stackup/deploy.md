# Stackup部署和测试指南

本指南将帮助您部署和测试Stackup的账户抽象解决方案，包括Bundler、简单智能账户和Paymaster服务。

## 环境准备

### 前提条件

- Node.js v16或更高版本
- Git
- Go 1.20或更高版本（如果需要运行自托管Bundler）
- 访问以太坊RPC节点（如Infura、Alchemy等）
- 测试网ETH（用于测试）

### 安装开发工具

推荐使用pnpm作为包管理工具：

```bash
# 安装pnpm
npm install -g pnpm
```

## 使用Stackup ERC-4337示例

Stackup提供了一套完整的ERC-4337示例代码，我们可以用它来了解和测试基本的账户抽象功能。

### 克隆示例仓库

```bash
# 克隆ERC-4337示例仓库
git clone https://github.com/stackup-wallet/erc-4337-examples.git
cd erc-4337-examples

# 安装依赖
pnpm install
```

### 初始化配置

使用以下命令创建并配置必要的设置：

```bash
pnpm run init
```

这将生成一个`config.json`文件，您需要根据自己的需求修改以下字段：

- `bundlerUrl`: Bundler服务的URL（可以使用Stackup的托管服务或自托管）
- `rpcUrl`: 以太坊节点的RPC URL
- `signingKey`: 用于签名用户操作的私钥
- `entryPoint`: EntryPoint合约地址（默认为标准ERC-4337 EntryPoint）
- `simpleAccountFactory`: SimpleAccount工厂合约地址
- `paymasterUrl`: Paymaster服务的URL（可选）

### 测试简单账户操作

#### 获取账户地址

```bash
pnpm run simpleAccount address
```

这将生成并显示基于您的`signingKey`的智能合约账户地址。

#### 转账ETH

确保您的智能合约账户已经有一些ETH用于支付Gas费用：

```bash
pnpm run simpleAccount transfer --to 0xRecipientAddress --amount 0.01
```

#### 使用Paymaster

要使用Paymaster赞助交易费用，可以在命令后添加`--withPaymaster`标志：

```bash
pnpm run simpleAccount transfer --to 0xRecipientAddress --amount 0.01 --withPaymaster
```

#### 转账ERC-20代币

```bash
pnpm run simpleAccount erc20Transfer --token 0xTokenAddress --to 0xRecipientAddress --amount 10
```

#### 批量转账

同时向多个地址转账ETH：

```bash
pnpm run simpleAccount batchTransfer --to 0xAddress1,0xAddress2,0xAddress3 --amount 0.01
```

批量转账ERC-20代币：

```bash
pnpm run simpleAccount batchErc20Transfer --token 0xTokenAddress --to 0xAddress1,0xAddress2 --amount 10
```

## 部署自托管Bundler

如果您需要部署自己的Bundler服务，可以使用Stackup的开源Bundler实现。

### 克隆Bundler仓库

```bash
git clone https://github.com/stackup-wallet/stackup-bundler.git
cd stackup-bundler
```

### 安装依赖和配置

```bash
# 安装开发依赖
make install-dev

# 生成基本的.env文件
make generate-environment
```

您需要编辑生成的`.env`文件，填写必要的配置信息，包括：

- RPC节点URL
- 私钥信息
- 数据库设置

### 启动Bundler服务

```bash
# 以私有模式运行Bundler
make dev-private-mode
```

Bundler服务默认将在`http://localhost:4337`上运行，提供符合ERC-4337规范的API。

## 创建和使用自定义Paymaster

本节将介绍如何部署和测试自定义Paymaster合约。

### 部署Verifying Paymaster

以下是部署Verifying Paymaster合约的基本步骤：

1. 克隆账户抽象合约仓库：

```bash
git clone https://github.com/eth-infinitism/account-abstraction.git
cd account-abstraction
pnpm install
```

2. 编译合约：

```bash
pnpm hardhat compile
```

3. 部署Paymaster合约（以Goerli测试网为例）：

```bash
pnpm hardhat --network goerli deploy --tags verifying
```

4. 为Paymaster存入一些ETH用于预付Gas费用：

```bash
pnpm hardhat --network goerli fund-paymaster --paymaster <PAYMASTER_ADDRESS> --amount 0.5
```

### 部署和配置TokenPaymaster

如果您想允许用户使用ERC-20代币支付Gas费用，可以部署TokenPaymaster：

```bash
# 部署TokenPaymaster
pnpm hardhat --network goerli deploy --tags tokenPaymaster

# 为TokenPaymaster存入ETH
pnpm hardhat --network goerli fund-paymaster --paymaster <TOKEN_PAYMASTER_ADDRESS> --amount 0.5
```

## 集成到前端应用

要将Stackup的账户抽象解决方案集成到前端应用中，您可以使用以下步骤：

### 使用现有SDK

Stackup提供了与多个AA SDK兼容的Bundler，包括：

- ERC-4337 SDK (`@account-abstraction/sdk`)
- Stackup SDK
- permissionless.js 或 userop.js

### 基本集成步骤

以下是使用ERC-4337 SDK的基本集成示例：

```typescript
import { SimpleAccountAPI } from '@account-abstraction/sdk'
import { ethers } from 'ethers'

// 配置提供商
const provider = new ethers.providers.JsonRpcProvider('YOUR_RPC_URL')
const bundler = new ethers.providers.JsonRpcProvider('YOUR_BUNDLER_URL')

// 创建账户API实例
const owner = new ethers.Wallet('YOUR_PRIVATE_KEY')
const simpleAccount = new SimpleAccountAPI({
  provider,
  entryPointAddress: 'ENTRY_POINT_ADDRESS',
  owner,
  factoryAddress: 'FACTORY_ADDRESS'
})

// 获取钱包地址
const walletAddress = await simpleAccount.getCounterFactualAddress()

// 创建交易
const op = await simpleAccount.createSignedUserOp({
  target: 'RECIPIENT_ADDRESS',
  data: '0x',
  value: ethers.utils.parseEther('0.01')
})

// 发送交易
const userOpHash = await bundler.send('eth_sendUserOperation', [
  op,
  'ENTRY_POINT_ADDRESS'
])

// 等待交易确认
const txHash = await simpleAccount.getUserOpReceipt(userOpHash)
console.log(`Transaction hash: ${txHash}`)
```

## 故障排除

### 常见问题解决

1. **Bundler拒绝UserOperation**
   - 检查Gas参数是否合理
   - 确保用户操作签名正确
   - 验证Paymaster（如使用）是否有足够的存款

2. **交易估算失败**
   - 检查合约账户是否有足够的ETH
   - 验证调用的函数是否存在并且参数正确

3. **Paymaster验证失败**
   - 确保Paymaster合约有足够的ETH存款
   - 检查用户是否满足Paymaster的条件（如持有足够的代币）

### 联系支持

如果您遇到技术问题，可以通过以下渠道获取支持：

- 访问Stackup的Discord服务器，在`dev-hub`频道提问
- 查阅Stackup的文档网站获取更多信息

## 进阶配置

### Bundler性能优化

对于生产环境，可以调整Bundler的性能参数：

```
# 优化内存使用和处理速度的.env配置示例
NODE_MAX_OLD_SPACE_SIZE=8192
MAX_BUNDLED_OPS=42
MAX_MEMPOOL_USER_OPS_PER_SENDER=4
USER_OP_TIMEOUT_SEC=300
```

### 多链支持

Stackup支持多个EVM兼容链，要为不同的链配置Bundler，需要为每个链指定相应的RPC节点和EntryPoint地址。

### 监控设置

对于生产环境，建议设置监控系统来跟踪Bundler和Paymaster的性能和健康状况：

- 使用Prometheus监控Bundler的处理能力和错误率
- 创建警报系统监控Paymaster的ETH余额
- 跟踪链上交易确认时间和成功率

通过以上步骤，您应该能够成功部署和测试Stackup的账户抽象解决方案，并将其集成到您的应用程序中。 