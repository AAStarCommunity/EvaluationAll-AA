# 变更记录

## v0.1.0 (初始版本)
- 初始化项目结构
- 创建PLAN.md开发计划
- 创建CHANGES.md变更记录
- 准备评估Pimlico解决方案

## v0.2.0 (Pimlico评估)
- 克隆Pimlico示例代码
- 分析Pimlico的主要产品和能力
- 创建Pimlico评估文档
- 更新主README中的Pimlico部分
- 编写示例代码展示Pimlico的无Gas交易功能

## v0.3.0 (ZeroDev评估)
- 克隆ZeroDev示例代码仓库
- 分析ZeroDev的主要产品和核心能力
- 研究Kernel智能账户和插件系统
- 创建ZeroDev评估文档
- 更新主README中的ZeroDev部分
- 记录ZeroDev的无Gas交易、会话密钥、ERC20支付Gas等功能

## v0.4.0 (Alchemy评估)
- 克隆Alchemy的aa-sdk仓库
- 分析Alchemy的主要产品和核心能力
- 研究Account Kit、Rundler、Gas Manager和Modular Account
- 创建Alchemy评估文档
- 创建Alchemy部署和测试指南
- 更新主README中的Alchemy部分
- 重点分析EIP-7702智能EOA特性

## v0.5.0 (Coinbase & Biconomy评估)
- 克隆Coinbase的paymaster-bundler-examples仓库
- 克隆Biconomy的biconomy-paymasters仓库
- 分析两个解决方案的主要产品和核心能力
- 研究Coinbase Verifying Paymaster和Bundler API
- 研究Biconomy的Modular Smart Account和MEE
- 创建Coinbase和Biconomy评估文档
- 创建部署和测试指南
- 更新主README中的Coinbase和Biconomy部分
- 对比分析两个方案的特点和适用场景

## v0.6.0 (Particle
更新了对Particle Network的评估，增加了两个主要文件：
- `evaluations/particle/README.md`：详细介绍了Particle Network的产品组件、关键能力和优势
- `evaluations/particle/deploy.md`：提供了部署和测试Particle Network解决方案的详细指南

主要评估内容包括:
- Smart Wallet-as-a-Service (WaaS) 产品组件
- Omnichain Paymaster 跨链Gas赞助服务
- Particle Bundler 开源交易处理服务
- BTC Connect 比特币账户抽象解决方案
- Universal Accounts 跨链统一账户服务（即将推出）

评估发现Particle Network在社交登录入驻、多链支持和开发工具方面表现突出，其创新的跨链功能和比特币账户抽象解决方案使其在所有评估的AA解决方案中脱颖而出。

## ## v0.7.0 (Stackup

更新了对Stackup的评估，增加了两个主要文件：
- `evaluations/stackup/README.md`：详细介绍了Stackup的产品组件、关键能力和优势
- `evaluations/stackup/deploy.md`：提供了部署和测试Stackup解决方案的详细指南

Stackup是一个专注于企业级账户抽象解决方案的提供商，主要评估内容包括：
- 企业级智能钱包：基于角色的访问控制、Passkey认证和自动化支付功能
- Stackup Bundler：Go语言实现的高性能ERC-4337 Bundler
- Paymaster服务：支持零Gas费交易和使用ERC-20代币支付费用
- 开发者API：用于创建和管理智能合约账户的工具集

评估发现Stackup在企业级应用场景下表现出色，特别是在多链支持、协作功能和自定义支付选项方面。但其Bundler项目已被存档，可能表明公司战略方向的变化。

## v0.8.0 (SuperPaymaster/AAStar
TODO

## v0.9.0 (账户抽象解决方案综合评估)
添加了对所有评估过的账户抽象解决方案的综合对比分析：
- 添加了详细的综合分析，涵盖了可用性、开发复杂度、跨链能力、ERC20 Gas支付等多个维度
- 创建了中英文对比表格，直观展示各方案的特点和差异
- 提供了面向不同应用场景和需求的选择建议

分析显示，各解决方案各有优势：ZeroDev和Particle Network在用户体验方面领先；Biconomy在跨链操作上表现突出；Alchemy提供最完整的企业级工具链；Pimlico在基础设施性能方面优势明显；Coinbase与其Base生态系统紧密集成；Stackup为企业级应用提供特殊功能。

随着EIP-7702和RIP-7560等新标准的发展，账户抽象领域将继续演进，各方案也将不断适应和创新。

version: 0.11.24