# 🚄 Railway部署指南

## 为什么选择Railway？
- ✅ 支持更多国家和地区
- ✅ 免费额度充足（每月500小时）
- ✅ 部署简单快速
- ✅ 自动HTTPS
- ✅ 支持自定义域名

## 部署步骤

### 1. 注册Railway账户
- 访问 [railway.app](https://railway.app)
- 使用GitHub账户登录（推荐）
- 或使用邮箱注册

### 2. 准备代码（两种方式）

#### 方式A：通过GitHub（推荐）
1. 将代码推送到GitHub
2. 在Railway连接GitHub仓库

#### 方式B：直接上传
1. 压缩项目文件夹
2. 直接在Railway上传

### 3. 部署应用
1. 在Railway Dashboard点击 "New Project"
2. 选择 "Deploy from GitHub repo" 或 "Deploy from template"
3. 选择你的仓库
4. Railway会自动检测Node.js项目并部署

### 4. 配置环境变量（可选）
- 在项目设置中添加环境变量
- `JWT_SECRET`: 你的JWT密钥

### 5. 获取访问链接
- 部署完成后，Railway会提供一个访问链接
- 格式类似：`https://your-app-name.up.railway.app`

## 优势
- 🚀 部署速度快
- 🌍 全球CDN加速
- 📊 实时日志监控
- 🔄 自动重新部署
- 💰 免费额度充足