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

#### Introduce

#### Key products

#### Key abilities

#### Demo

#### How to use

#### Summary

Include evaluation and analysis.

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

#### Introduce

#### Key products

#### Key abilities

#### Demo

#### How to use

#### Summary

Include evaluation and analysis.

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
