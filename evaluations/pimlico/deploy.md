# 部署和测试指南

## Pimlico示例

### 环境准备

1. 安装Node.js和npm

```bash
# 检查Node.js版本
node -v  # 建议使用v16或更高版本
npm -v
```

2. 克隆项目

```bash
git clone https://github.com/pimlicolabs/tutorial-template.git pimlico-tutorial
cd pimlico-tutorial
```

3. 安装依赖

```bash
npm install
```

4. 配置环境变量

创建`.env`文件并添加Pimlico API密钥：

```
PIMLICO_API_KEY=YOUR_API_KEY_HERE
```

> 注意：请从[Pimlico仪表板](https://dashboard.pimlico.io/)获取API密钥

### 运行示例

1. 执行示例脚本

```bash
npm start
```

2. 验证输出

成功执行后，你将看到类似以下输出：

```
Smart account address: https://sepolia.etherscan.io/address/0x...
User operation included: https://sepolia.etherscan.io/tx/0x...
```

你可以在[Sepolia区块浏览器](https://sepolia.etherscan.io/)上查看交易详情。

### 故障排除

1. API密钥错误

如果看到API密钥相关错误，请确保：
- 你已在Pimlico仪表板创建了有效的API密钥
- 正确复制API密钥到`.env`文件
- 不要包含引号或额外空格

2. 网络连接问题

如果遇到网络连接问题，请确保：
- 你的互联网连接正常
- 没有防火墙或代理阻止对Pimlico API的访问
- Sepolia测试网络运行正常

3. Gas费用问题

如果交易因Gas相关原因失败，请检查：
- 你使用的测试网络是否正确
- Pimlico Paymaster是否有足够余额
- API密钥是否有足够的使用配额 