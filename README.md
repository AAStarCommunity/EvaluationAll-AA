# EvaluationAllPaymaster

We collect Pimlico，Alchemy，Stackup，ZeroDev，Coinbase，Biconomy and Particle,
their solution and demo, to practice the gasless account abstraction solution.
It is a investigation on the gasless account abstraction solution.

## List

Please know something about the solutions: One Account, One Balance, Any Chain.

[1] Particle announcement for their token to be unified gas unit:
https://blog.particle.network/celebrating-15m-end-users-debuting-our-token-centric-economy/

Universal Account(Paymaster) Solution: https://whitepaper.particle.network/

[2] Pimilico: Build with smart accounts The world's most trusted and advanced
smart account infrastructure platform https://www.pimlico.io/#products

singleton paymaster https://github.com/pimlicolabs/singleton-paymaster Alto
bundler: https://github.com/pimlicolabs/alto

[3] ZeroDev ZeroDev is the most powerful toolkit for building with smart
accounts, including both "smart EOAs" (EIP-7702) and "smart contract accounts"
(ERC-4337). https://docs.zerodev.app/ bundler:
https://github.com/zerodevapp/ultra-relay

[4] Alchemy Enterprise-grade smart accounts Fully abstract the user experience
with the most secure, cost-efficient, and extensible smart accounts. Account
Abstraction Solution: https://www.alchemy.com/account-contracts

[5] Stackup Stackup's collaborative self-custody wallet offers invoicing, bill
payments, and financial controls for how companies actually operate. Account
Abstraction Solution: https://www.stackup.fi/

[6] Coinbase Account Abstraction Kit: PAYMASTER & BUNDLER

Create magical onchain experiences Sponsor gas and bundle multi-step
transactions to create delightful user experiences
https://www.coinbase.com/developer-platform/solutions/account-abstraction-kit
Coinbase Bundler and Paymaster:
https://portal.cdp.coinbase.com/products/bundler-and-paymaster

[7] Biconomy Biconomy is the leading solution for building user-friendly onchain
apps. Smart Contract Account Solution:
https://docs.biconomy.io/multichain-gas-abstraction/for-sca

[8] AAStar Build Decentralized Infra for Community. SuperPaymaster Contract:
https://github.com/AAStarCommunity/SuperPaymaster-Contract

## Evaluation

We use pnpm to cache all npm packages, and use pnpm to install all dependencies.
we will try the solutions provided by the above industry companies. Do these
jobs:

1. list productions/sdks and their serveice from website
2. get github repo from docs url
3. install dependencies and run demo in the start
4. finish basic operations with SDK: create account, initate gas payment, config
   paymaster, send tx, etc
5. give a simple analysis for project purpose, solution, cost, usability&UX in
   HCI, Decentralization in gas payment, Account, Relay; analysis traits in
   simple, time/efficiency, customize ERC20, direct cost; talk about HCI, TAM,
   SLT, support.
6. Evaluation on:
   1. Summary of main features, interfaces provided, and user scenarios
      demonstrating interface capabilities
   2. Developer complexity
   3. Acceptance of third-party ERC20 gas tokens
   4. Gas sponsor payment methods
   5. Open-source status
   6. SDK name for core capabilities, installation instructions, usage
      guidelines, and application demo
7. Finally, we will give a simple analysis Summary in the signle named below
   with contents above.

### Pimlico

#### 介绍

Pimlico是一个专注于账户抽象(Account Abstraction)的基础设施平台，提供可靠、高性能的ERC-4337实现。Pimlico的服务主要包括Bundler和Paymaster，旨在帮助开发者轻松实现无Gas交易和改善用户体验。

#### 主要产品

1. **Bundler**: 高性能的ERC-4337 UserOperation处理服务
2. **Verifying Paymaster**: 允许开发者代替用户支付Gas费用
3. **ERC-20 Paymaster**: 支持使用ERC-20代币支付Gas费用
4. **Singleton Paymaster**: 开源的通用Paymaster合约
5. **Alto Bundler**: 基于TypeScript的高性能Bundler实现

#### 关键能力

1. 跨链支持：支持多条主流EVM兼容区块链
2. 开发者工具：提供完整的SDK和API
3. 赞助政策管理：可定制的Gas赞助策略
4. 高可靠性和性能：高可用性基础设施和低延迟交易处理

#### 示例演示

通过[Pimlico的教程](https://docs.pimlico.io/tutorial/tutorial-1)，我们实现了一个基于Safe智能合约钱包的无Gas交易示例。示例使用TypeScript、Viem和permissionless.js库，完整演示了账户创建、交易构建和Gas赞助流程。

主要步骤包括：
1. 创建Safe智能账户
2. 设置Pimlico客户端(Bundler和Paymaster)
3. 构建交易
4. 通过Paymaster请求Gas赞助
5. 使用Bundler发送UserOperation到链上

#### 使用方法

安装依赖：
```bash
npm install permissionless viem
```

基本用法：

```typescript
// 创建Pimlico客户端
const pimlicoClient = createPimlicoClient({
  transport: http(pimlicoUrl),
  entryPoint: { address: entryPoint07Address, version: "0.7" },
})

// 创建智能账户客户端
const smartAccountClient = createSmartAccountClient({
  account,
  bundlerTransport: http(pimlicoUrl),
  paymaster: pimlicoClient,
})

// 发送无Gas交易
const txHash = await smartAccountClient.sendTransaction({
  to: targetAddress,
  data: "0x1234",
})
```

#### 评估总结

Pimlico提供了成熟的账户抽象解决方案，具有以下特点：

1. **主要功能**：完整的ERC-4337基础设施，优化无Gas onboarding和DApp中的Gas赞助体验
2. **开发者复杂度**：中等学习曲线，高质量文档，完善SDK支持
3. **第三方ERC20支持**：支持多种主流ERC-20代币，实时定价机制
4. **Gas赞助方式**：API密钥授权，可定制赞助政策，支持Webhook验证
5. **开源状态**：核心组件开源，基础设施作为服务提供
6. **SDK能力**：permissionless.js提供智能账户管理、UserOperation构建、Bundler交互等功能

**优点**：优秀的开发者体验，高性能基础设施，强大的跨链支持，灵活的Gas赞助机制
**缺点**：API密钥方式需要中心化管理，作为服务使用时存在依赖风险

总体而言，Pimlico为注重用户体验的DApp开发者提供了全面且专业的账户抽象实现方案，是目前该领域最成熟的解决方案之一。

### ZeroDev

#### 介绍

ZeroDev是一个强大的账户抽象(Account Abstraction)解决方案，提供支持ERC-4337和EIP-7702的智能账户系统。ZeroDev专注于提供最佳的Web3用户体验，通过解决密钥管理、交易费用和跨链操作等问题，使Web3应用更易用、更灵活。

#### 主要产品

1. **Kernel**: 模块化智能账户，支持ERC-7579插件系统，高度燃气效率优化
2. **ZeroDev SDK**: 基于Kernel的智能账户开发工具包
3. **Ultra Relay**: 基于Pimlico的Alto修改而来的ERC-4337 Bundler实现
4. **Meta Infrastructure**: 代理多个Bundler和Paymaster提供商，提高基础设施可靠性

#### 关键能力

1. **密钥抽象**: 支持Passkey认证、社交账户登录、账户恢复机制和多签验证
2. **Gas抽象**: 赞助Gas费用、使用ERC20代币支付Gas
3. **交易抽象**: 批量处理交易、会话密钥自动化交易
4. **链抽象**: 跨链支付无需桥接、支持多链部署

#### 示例演示

我们通过ZeroDev示例仓库克隆了多个示例，实践了Kernel账户的各种功能，包括：

1. 创建账户并发送无Gas交易
2. 使用会话密钥实现一键交易和交易自动化
3. 使用ERC20代币(USDC)支付Gas费用
4. 批量执行多个交易以减少用户交互

ZeroDev的Kernel智能账户支持丰富的插件系统，包括Passkey插件、ECDSA验证器、加权ECDSA(多签功能)、会话密钥和恢复插件等。

#### 使用方法

安装SDK：
```bash
npm install @zerodev/sdk @zerodev/ecdsa-validator viem
```

基本用法：
```typescript
// 创建智能账户
const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
  entryPoint,
  signer,
  kernelVersion: KERNEL_V3_1,
});

const account = await createKernelAccount(publicClient, {
  entryPoint,
  plugins: {
    sudo: ecdsaValidator,
  },
  kernelVersion: KERNEL_V3_1,
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

#### 评估总结

ZeroDev提供了一个功能全面、设计精良的账户抽象解决方案，特别适合以下场景：
- 无Gas入门体验
- 基于Passkey的无助记词登录
- 自动化交易和AI代理
- Web3游戏交易简化

**优点**：模块化设计高度可扩展、支持ERC-7579插件系统、高燃气效率、多签名和社交恢复支持、强大的会话密钥功能、基础设施可靠性高

**缺点**：插件系统学习曲线较陡、部分依赖第三方服务、一些高级功能需要更多自定义开发

ZeroDev已经在超过30个网络上支持超过400万个智能账户，是目前市场上最成熟、最被广泛使用的账户抽象解决方案之一。

### Coinbase

#### Introduce

#### Key products

#### Key abilities

#### Demo

#### How to use

#### Summary

Include evaluation and analysis.

### Biconomy

#### Introduce

#### Key products

#### Key abilities

#### Demo

#### How to use

#### Summary

Include evaluation and analysis.

### Stackup

#### Introduce

#### Key products

#### Key abilities

#### Demo

#### How to use

#### Summary

Include evaluation and analysis.

### Alchemy

#### 介绍

Alchemy是一个全面的账户抽象（Account Abstraction）解决方案提供商，专注于提供完整的工具链来构建和部署智能合约账户。Alchemy的产品套件覆盖了账户抽象的各个方面，从智能账户合约到开发工具包，再到基础设施服务，旨在简化开发并提供高可靠性的用户体验。

#### 主要产品

1. **Account Kit**: 一个完整的工具包，用于在应用程序中嵌入智能钱包，包含aa-sdk、Light Account、Modular Account、Signers和Alchemy Signer。
2. **Bundler API (Rundler)**: 用Rust编写的高性能ERC-4337 bundler实现，专注于高性能和高可靠性。
3. **Gas Manager API**: 可编程的API，用于在应用中赞助gas费用，支持自定义赞助策略。
4. **Smart EOA (EIP-7702)**: 允许将现有的EOA升级为智能账户，无需迁移资产。

#### 关键能力

1. **用户体验优化**: 零摩擦的用户入门体验，支持社交登录和会话密钥无交易体验。
2. **开发者友好**: 全面的SDK支持，与主流库无缝集成，提供即插即用组件。
3. **灵活性和可扩展性**: 模块化设计，通过插件系统提供可扩展性，支持多链部署。
4. **安全性和可靠性**: 经过双重审计的智能合约，开源的Bundler实现，全面的插件安全模型。

#### 示例演示

我们克隆了Alchemy的aa-sdk仓库，该仓库包含多个示例项目，展示了Account Kit的主要功能，包括：

1. 创建和部署智能账户
2. 使用社交登录和电子邮件身份验证
3. 使用Gas Manager进行gas赞助
4. 批量执行多个交易
5. 使用会话密钥简化用户体验
6. 使用EIP-7702升级现有EOA

#### 使用方法

安装依赖：
```bash
pnpm install @alchemy/aa-alchemy @alchemy/aa-core
```

基本用法：
```typescript
// 创建模块化账户客户端
const smartAccountClient = await createModularAccountAlchemyClient({
  apiKey: "YOUR_ALCHEMY_API_KEY",
  chain: sepolia,
  signer,
  gasManagerConfig: {
    policyId: "YOUR_GAS_POLICY_ID", // 可选，用于gas赞助
  },
});

// 发送交易
const hash = await smartAccountClient.sendUserOperation({
  uo: {
    target: "0xTargetAddress",
    data: "0xCallData",
    value: 0n,
  },
});
```

#### 评价

Alchemy提供了一套全面、集成的账户抽象解决方案，具有企业级的安全性和性能。其Modular Account系统通过ERC-6900标准支持灵活的插件扩展，而Rundler作为高性能Bundler实现，提供了可靠的UserOperation处理能力。对EIP-7702的支持使现有EOA用户能够平滑升级到智能账户体验，无需迁移资产，这是推动账户抽象大规模采用的重要一步。

### Particle

#### Introduce

#### Key products

#### Key abilities

#### Demo

#### How to use

#### Summary

Include evaluation and analysis.

### SuperPaymaster

#### Introduce

#### Key products

#### Key abilities

#### Demo

#### How to use

#### Summary

Include evaluation and analysis.

## Analysis table online

online table:
https://docs.google.com/spreadsheets/d/1moSf9YBlGXoemydpC7eYDjs6oQa2JdHplg7L6a4kTkU/edit?usp=sharing
