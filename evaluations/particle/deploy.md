# Particle Network部署和测试指南

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

2. 创建Particle Dashboard账户

在[Particle Dashboard](https://dashboard.particle.network/)注册并创建应用程序以获取以下凭据：
- Project ID
- Client Key
- App ID

## 测试Particle ConnectKit和Account Abstraction

### 克隆示例项目

```bash
# 克隆示例仓库
git clone https://github.com/Particle-Network/connectkit-aa-usage.git
cd connectkit-aa-usage
```

### 设置环境变量

创建一个`.env`文件，添加以下内容：

```
NEXT_PUBLIC_PROJECT_ID=your_project_id
NEXT_PUBLIC_CLIENT_KEY=your_client_key
NEXT_PUBLIC_APP_ID=your_app_id
```

### 安装依赖并运行

```bash
# 安装依赖
pnpm install

# 运行开发服务器
pnpm dev
```

访问`http://localhost:3000`查看运行中的应用。

### 测试社交登录和智能账户

1. 在首页点击"Connect Wallet"按钮
2. 选择"Particle Auth"，然后选择一种社交登录方式（如Google、Twitter等）
3. 完成认证流程
4. 登录成功后，页面将显示您的账户信息和智能账户地址

### 测试无Gas交易

在连接账户后，可以测试发送无Gas交易：

1. 在交易部分输入接收地址
2. 点击"Send Transaction (Native AA)"按钮
3. 确认交易
4. 交易哈希将显示在页面上，并提供区块浏览器链接

## 测试Particle Auth和AA SDK

### 克隆另一个示例项目

```bash
# 克隆示例仓库
git clone https://github.com/Particle-Network/upgrade-authkit-demo.git
cd upgrade-authkit-demo/particle-aa-nextjs
```

### 设置环境变量和运行

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑.env文件，添加您的凭据

# 安装依赖
pnpm install

# 运行开发服务器
pnpm dev
```

访问`http://localhost:3000`测试AuthKit与AA SDK的集成。

## 测试Particle的AA SDK（直接集成）

### 创建测试项目

```bash
# 创建项目目录
mkdir particle-aa-test && cd particle-aa-test

# 初始化项目
pnpm init
```

### 安装依赖

```bash
pnpm add @particle-network/aa ethers@6 viem
```

### 创建测试脚本

创建一个`index.js`文件：

```javascript
import { SmartAccount } from '@particle-network/aa';
import { ethers } from 'ethers';

// 创建provider（可以使用任何EIP-1193兼容的provider）
const provider = window.ethereum; // 或者其他provider实现

// 初始化SmartAccount
const smartAccount = new SmartAccount(provider, {
  projectId: 'YOUR_PROJECT_ID',
  clientKey: 'YOUR_CLIENT_KEY',
  appId: 'YOUR_APP_ID',
  aaOptions: {
    accountContracts: {
      BICONOMY: [
        {
          version: '2.0.0',
          chainIds: [1, 5, 137, 80001], // 主网和测试网链ID
        },
      ],
    },
  },
});

// 设置当前使用的智能账户合约
smartAccount.setSmartAccountContract({ name: 'BICONOMY', version: '2.0.0' });

async function main() {
  try {
    // 获取智能账户地址
    const address = await smartAccount.getAddress();
    console.log('Smart Account地址:', address);
    
    // 获取EOA地址
    const owner = await smartAccount.getOwner();
    console.log('EOA地址:', owner);
    
    // 检查智能账户是否已部署
    const isDeployed = await smartAccount.isDeployed();
    console.log('Smart Account是否已部署:', isDeployed);
    
    // 如果未部署，则部署智能账户
    if (!isDeployed) {
      console.log('正在部署Smart Account...');
      const txHash = await smartAccount.deployWalletContract();
      console.log('部署交易哈希:', txHash);
    }
    
    // 构建交易对象
    const tx = {
      to: '0xRecipientAddress', // 替换为接收地址
      value: ethers.parseEther('0.001').toString(),
      data: '0x',
    };
    
    // 获取费用报价
    console.log('获取费用报价...');
    const feeQuotesResult = await smartAccount.getFeeQuotes(tx);
    console.log('费用报价:', feeQuotesResult);
    
    // 使用无Gas模式发送交易
    if (feeQuotesResult.verifyingPaymasterGasless) {
      console.log('使用无Gas模式发送交易...');
      const { userOp, userOpHash } = feeQuotesResult.verifyingPaymasterGasless;
      
      const txHash = await smartAccount.sendUserOperation({
        userOp,
        userOpHash,
      });
      
      console.log('交易哈希:', txHash);
    } else {
      console.log('无Gas模式不可用，使用ERC20支付Gas...');
      // 使用ERC20代币支付Gas
      if (feeQuotesResult.tokenPaymaster && feeQuotesResult.tokenPaymaster.feeQuotes.length > 0) {
        const feeQuote = feeQuotesResult.tokenPaymaster.feeQuotes[0];
        const tokenPaymasterAddress = feeQuotesResult.tokenPaymaster.tokenPaymasterAddress;
        
        // 构建用户操作
        const userOpBundle = await smartAccount.buildUserOperation({
          tx,
          feeQuote,
          tokenPaymasterAddress,
        });
        
        // 发送用户操作
        const txHash = await smartAccount.sendUserOperation(userOpBundle);
        console.log('交易哈希:', txHash);
      } else {
        console.log('没有可用的费用支付选项');
      }
    }
  } catch (error) {
    console.error('错误:', error);
  }
}

main();
```

### 在Web应用中使用AAWrapProvider

如果要在现有Web应用中集成，可以使用AAWrapProvider来包装任何EIP-1193 provider：

```javascript
import { AAWrapProvider, SendTransactionMode } from '@particle-network/aa';
import { ethers } from 'ethers';

// 使用无Gas模式包装provider
const wrapProvider = new AAWrapProvider(smartAccount, SendTransactionMode.Gasless);

// 创建ethers provider
const ethersProvider = new ethers.BrowserProvider(wrapProvider);

// 获取signer
const signer = await ethersProvider.getSigner();

// 发送交易（将自动使用无Gas模式）
const tx = {
  to: '0xRecipientAddress',
  value: ethers.parseEther('0.001'),
};

const txResponse = await signer.sendTransaction(tx);
console.log('交易哈希:', txResponse.hash);
```

## 测试Particle Omnichain Paymaster

### 为Paymaster充值

1. 登录[Particle Dashboard](https://dashboard.particle.network/)
2. 导航到"Paymaster"部分
3. 点击"Deposit"按钮，选择要在哪个链上充值USDT（支持Ethereum和BNB Chain）
4. 按照指示完成充值过程

### 配置Paymaster Webhook（可选）

如果需要自定义赞助逻辑，可以配置Webhook：

1. 在Dashboard的"Paymaster"部分，找到"Webhook"卡片
2. 点击"Add Webhook"
3. 输入Webhook URL（例如：`https://your-server.com/before-paymaster-sign`）
4. 选择Webhook类型（before_paymaster_sign或after_paymaster_sign）
5. 保存配置

### 配置智能合约白名单（可选）

如果只想赞助特定合约方法的交易：

1. 在Dashboard的"Paymaster"部分，找到"Whitelist Smart Contracts"卡片
2. 点击"Add Contract"
3. 输入智能合约地址和方法选择器
4. 保存配置

## 测试BTC Connect

由于BTC Connect需要比特币钱包（如UniSat或Xverse），测试过程与普通的AA测试略有不同。

### 克隆BTC Connect示例

```bash
# 克隆示例仓库
git clone https://github.com/Particle-Network/particle-btc-connect.git
cd particle-btc-connect
```

### 设置环境变量和运行

```bash
# 安装依赖
pnpm install

# 运行开发服务器
pnpm dev
```

访问`http://localhost:3000`测试BTC Connect功能。

### 测试流程

1. 打开UniSat或Xverse钱包浏览器扩展
2. 在示例应用中点击"Connect"按钮
3. 选择您的比特币钱包
4. 授权连接
5. 连接成功后，可以测试发送交易等功能

## 故障排除

### 常见问题

1. **API密钥问题**

如果看到与API密钥相关的错误，请确保：
- 您已经在Particle Dashboard上创建了项目并获取了正确的凭据
- 凭据已正确设置在环境变量中

2. **交易失败**

如果交易失败，常见原因包括：
- 测试网上没有足够的测试代币
- Paymaster余额不足（对于主网）
- 网络拥堵或Gas估算不准确

3. **智能账户地址问题**

如果遇到智能账户地址相关问题，请确保：
- 使用了正确的链ID和智能账户配置

### 获取帮助

如果遇到问题，可以通过以下方式获取帮助：

- [Particle Network文档](https://developers.particle.network/)
- [Particle Network Discord社区](https://discord.gg/2y44qr6CR2)
- [GitHub仓库Issues页面](https://github.com/Particle-Network) 