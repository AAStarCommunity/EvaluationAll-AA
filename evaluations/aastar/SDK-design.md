# SDK desgin

## Core
负责创建账户\账户生命周期维护
需要确定的参数:
1. 工厂合约地址,带着代码
2. 指定EP,目前0.6, 0.7
3. 指定Paymaster,目前我们默认值使用SuperPaymaster稳定版本0.1或者开发版0.2,因为要支持社区代币,其他的都不支持;是否支持其他Paymaster待讨论,默认不;
4. 指定验证方法,默认是Dual Verification:指纹+TEE,未来会新增多签,不同验证方法,不同验证函数和流程,不可更改.

## Relay
### 开发阶段
1. Paymaster relay服务
2. Bundler relay 服务
3. RPC,依赖infra或者Alchemy
4. DVT验证者,主要做签名二次验证
5. Account relay,主要服务账户生命周期
6. 其他Relay(看需要)

###  理想状态
合并1-2
合并4,5,6


## 合约
