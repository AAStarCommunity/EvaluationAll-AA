# AAStar评估报告

## 介绍

AAStar是一个社区版的账户抽象(Account
Abstraction)全生命周期解决方案，支持ERC-4337和EIP-7702以及未来的RIP7560标准的账户和交易。AAStar核心是服务社区，提供去中心的账户计算服务和开源框架，提供是双签名（指纹+TEE）、支持三组合（个人+亲友+社区）社交恢复，支持一键搬家、支持社区自定义ERC20支付gas、支持NFT/SBT无感认证免gas、支持和社区积分打通支付gas等features。

## 主要产品

1. **Core**:
   - 简单不可升级，易用安全，基于SimpleAccount增加了双签名
   - 支持ERC20 定制gas token
   - 分层安全机制，根据资产特性和规模来均衡易用性和安全
   - 支持多种验证器（ECDSA、Passkey、多签等）
   - 团队成员曾获得以太坊AA first prize和EF grant

2. **AAStar SDK**:
   - 基于Core的智能账户开发工具包，包括SuperPaymaster
   - 支持多种身份绑定和验证方式（Web2，Email，SMS and more）
   - 提供丰富的API接口用于交易、会话密钥管理等
   - 与第三方Auth集成(如Auth.js等)集成

3. **Permissionless Relay**:
   - 借鉴Particle和ZeroDev的bundler实现的ERC-4337 Bundler
   - 高效：合并了Gas Sponsor（Paymaster）和Bundler功能，高性能交易捆绑和执行
   - 特别优化了提交后的执行效率，减少45%网络通信
   - 支持压缩UserOp

4. **Meta Infrastructure**:
   - 也支持外部Bundler和Paymaster提供商(Alchemy、Gelato、Pimlico、StackUp)
   - 提供更高可靠性的AA基础设施
   - 支持多种链上操作

## 关键能力

1. **密钥抽象**:
   - 支持Passkey认证(WebAuthn)
   - 支持社交账户登录
   - 支持账户恢复机制
   - 支持多签验证

2. **Gas抽象**:
   - 为用户赞助Gas费用
   - 使用ERC20代币支付Gas
   - 灵活的Gas策略

3. **交易抽象**:
   - 批量处理多个交易
   - 通过会话密钥自动化交易
   - 减少用户交互环节
   - 支持delegatecall

4. **链抽象**:
   - 跨链支付无需桥接
   - 支持多链部署
   - 兼容L2解决方案

## 系统模块

内嵌功能模块

1. **Passkey插件**:
   - 支持基于设备的生物认证
   - 无需记忆助记词或私钥
   - 支持使用ERC-7212预编译优化gas效率

2. **ECDSA签名和验证**:
   - 标准私钥验证机制
   - 兼容现有EOA账户绑定和交易

3. **加权ECDSA**:（TODO）
   - 支持多签功能
   - 不同签名者可设置不同权重
   - 便于设置账户监护人

4. **会话密钥**:
   - 支持有限权限的临时密钥
   - 可设置细粒度的操作权限
   - 支持所有者创建和代理创建两种模式
   - 便于自动化和代理交易

5. **社交恢复**:
   - 账户恢复机制
   - 基于PublicGuardian系统

## Demo

展示各种功能：

1. **创建账户**:
   - 使用ECDSA验证器创建账户
   - 通过中心化或者去中心化Paymaster发送无Gas交易
   - 验证UserOperation上链过程

2. **会话密钥**:
   - 实现一键交易功能
   - 实现交易自动化
   - 展示会话密钥的撤销功能

3. **ERC20支付Gas**:
   - 使用USDC代币支付交易费用
   - 估算Gas费用
   - 处理代币授权流程

4. **批量交易**:
   - 在一次操作中执行多个交易
   - 减少用户交互和总体Gas成本

## 使用方法

### 安装

```bash
pnpm install @aastar/airaccount @aastar/sdss viem
```

### 基本用法

```typescript
// 创建智能账户
const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
  entryPoint,
  signer,
  version: v0.2,
});

const account = await createKernelAccount(publicClient, {
  entryPoint,
  plugins: {
    sudo: ecdsaValidator,
  },
  kernelVersion: KERNEL_V3_1,
});

// 创建Paymaster客户端
const paymasterClient = createZeroDevPaymasterClient({
  chain,
  transport: http(process.env.ZERODEV_RPC),
});

// 创建账户客户端
const kernelClient = createKernelAccountClient({
  account,
  chain,
  bundlerTransport: http(process.env.ZERODEV_RPC),
  paymaster: paymasterClient,
});

// 发送交易
const userOpHash = await kernelClient.sendUserOperation({
  callData: await account.encodeCalls([
    {
      to: targetAddress,
      value: parseEther("0.01"),
      data: "0x",
    },
  ]),
});
```

## 评估总结

### 主要功能和用户场景

AAStar高度贴合社区，特别适合以下用户场景：

- 新人快速onboarding
- 无Gas入门体验
- 基于Passkey的无助记词登录
- 自动化交易和AI代理
- 社区Web3游戏交易简化
- DApp中的用户友好体验

### 开发者复杂度

- **学习曲线**: 中等
- **文档质量**: 中等，文档详细且结构清晰
- **集成难度**: 中等，模块化设计使集成相对简单
- **调试工具**: 提供详细的错误信息和调试工具

### 第三方ERC20 Gas代币接受度

- 支持多种ERC20代币作为Gas代币
- 内置代币授权功能
- 简单的Gas估算机制

### Gas赞助支付方式

- 支持Meta Infrastructure多提供商
- 灵活的赞助策略
- 基于策略的按条件赞助
- 自定义赞助条件

### 开源状态

- AirAccount智能账户: 开源
- Paymaster/Bundler: 开源
- SDK: 开源核心组件

### SDK核心能力

- **SDK名称**: @aastar/sdk
- **安装**: `pnpm install @aastar/sdk`
- **主要功能**:
  - 智能账户创建和管理
  - 插件系统集成
  - 会话密钥管理
  - 多链支持
  - Gas代币支付
  - 批量交易处理

## 优缺点分析

### 优点

1. 模块化设计，高度可扩展和可定制
2. 全面支持ERC-7579插件系统
3. 高燃气效率，经过优化的智能账户设计
4. 多签名和社交恢复支持
5. 强大的会话密钥功能
6. RainComputing Infrastructure提高了基础设施可靠性
7. 活跃的开发社区和完善的文档

### 缺点

1. 相对复杂的插件系统需要更多学习时间
2. Rain Computing依赖无许可的节点服务提供商加入
3. 一些高级功能需要更多的自定义开发
4. 当前主要依赖外部 RPC，可能存在中心化风险

## 整体评价

AAStar的使命是赋能社区，是一群厌倦公司的程序员加入以太坊社区后成立的以AA为起点，提供非商业化的账户全生命周期服务的开源组织。
AAStar的核心服务是基于RainComputing的账户全生命周期服务和打通社区任务和积分的gas无感支付SBT/NFT。
从开源和抗审查角度看，AAStar是最好的社区版本，每个社区开源200U运行起来一个社区节点，无论是加密还是数字游民，是KOL还是同好俱乐部，都是社区，可以基于AAStar提供的全套工具，建立自己的积分、任务和声望体系，完成社区围绕账户为核心的onbaording、check和激励。
我们有了很多商业化公司，提供很棒的账户、gas代付和凭证管理等服务。但从多样性角度看，区块链行业需要借鉴开源社区思路，建立类似于Windows和Linux关系的社区版本生态，而账户是一切加密的起点和核心。社区版本的核心优点是社区视角更贴切，去中心计算更彻底，更符合区块链的精神价值观。

## 设计思路

1. 使用viem配合核心sdk、airaccount等sdk，基于公共物品构建公共物品。
2.
