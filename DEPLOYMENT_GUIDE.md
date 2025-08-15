# 部署指南 - Railway & Netlify

## 🚀 Railway 部署指南（推荐用于全栈应用）

Railway 是部署 Node.js 全栈应用的最佳选择，支持数据库和后端服务。

### 步骤 1: 准备 Railway 部署

1. 访问 [Railway.app](https://railway.app)
2. 使用 GitHub 账户登录
3. 点击 "New Project" → "Deploy from GitHub repo"
4. 选择你的 `mysql-interview-system` 仓库

### 步骤 2: 配置环境变量

在 Railway 项目设置中添加以下环境变量：

```bash
# 基础配置
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# MySQL 数据库配置（Railway 会自动提供）
MYSQL_HOST=${{MYSQL.MYSQL_HOST}}
MYSQL_PORT=${{MYSQL.MYSQL_PORT}}
MYSQL_USER=${{MYSQL.MYSQL_USER}}
MYSQL_PASSWORD=${{MYSQL.MYSQL_PASSWORD}}
MYSQL_DATABASE=${{MYSQL.MYSQL_DATABASE}}
```

### 步骤 3: 添加 MySQL 数据库

1. 在 Railway 项目中点击 "Add Service"
2. 选择 "Database" → "MySQL"
3. Railway 会自动创建数据库并提供连接信息

### 步骤 4: 部署配置

确保你的 `package.json` 中有正确的启动脚本：

```json
{
  "scripts": {
    "start": "node backend/mysql-server.js",
    "build": "echo 'No build needed'"
  }
}
```

### 步骤 5: 部署

1. Railway 会自动检测到你的 Node.js 项目
2. 点击 "Deploy" 开始部署
3. 部署完成后，你会获得一个公共 URL

---

## 🌐 Netlify 部署指南（仅前端静态部署）

Netlify 适合部署纯前端应用，需要配置外部 API。

### 方案 1: 静态前端 + 外部 API

#### 步骤 1: 准备前端文件

创建一个专门的前端部署目录：

```bash
mkdir netlify-deploy
cp -r frontend/* netlify-deploy/
cp index.html netlify-deploy/
```

#### 步骤 2: 修改 API 配置

在 `netlify-deploy/script.js` 中修改 API 基础 URL：

```javascript
// 将 API_BASE 改为你的 Railway 后端 URL
const API_BASE = 'https://your-railway-app.railway.app/api';
```

#### 步骤 3: 部署到 Netlify

1. 访问 [Netlify.com](https://netlify.com)
2. 登录并点击 "New site from Git"
3. 选择你的 GitHub 仓库
4. 设置构建配置：
   - Build command: `echo "Static site"`
   - Publish directory: `netlify-deploy`

### 方案 2: 使用 Netlify Functions（无服务器后端）

#### 创建 Netlify Functions

```bash
mkdir netlify/functions
```

创建 `netlify/functions/api.js`：

```javascript
const express = require('express');
const serverless = require('serverless-http');

const app = express();
app.use(express.json());

// 导入你的路由
// ... 你的 API 路由代码 ...

module.exports.handler = serverless(app);
```

---

## 📋 部署检查清单

### Railway 部署检查：
- [ ] GitHub 仓库已推送最新代码
- [ ] 环境变量已正确配置
- [ ] MySQL 数据库已添加
- [ ] 启动脚本指向正确的服务器文件
- [ ] 部署成功并可访问

### Netlify 部署检查：
- [ ] 前端文件已准备
- [ ] API URL 已更新为 Railway 后端地址
- [ ] 构建设置已配置
- [ ] 静态文件部署成功

---

## 🔧 故障排除

### 常见问题：

1. **Railway 部署失败**
   - 检查 `package.json` 中的 `start` 脚本
   - 确认 Node.js 版本兼容性
   - 查看部署日志中的错误信息

2. **数据库连接失败**
   - 验证环境变量是否正确设置
   - 确认数据库服务已启动
   - 检查网络连接

3. **前端无法连接后端**
   - 确认 API_BASE URL 正确
   - 检查 CORS 设置
   - 验证后端服务是否运行

---

## 📞 获取帮助

如果遇到部署问题，请检查：
1. Railway/Netlify 的部署日志
2. 浏览器开发者工具的网络和控制台
3. 确认所有环境变量和配置正确

部署成功后，你的面试系统将可以在线访问！