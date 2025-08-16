# MySQL面试系统 - 项目结构

## 📁 核心文件夹

```
mysql-interview-system/
├── backend/                    # 后端服务器代码 (Railway部署)
│   └── mysql-server.js       # 主服务器文件
├── frontend/                   # 前端源代码
│   ├── mysql-api.js          # API客户端
│   ├── script.js             # 主要JavaScript逻辑
│   └── mock-api.js           # 本地存储备选方案
├── github-pages-deploy/        # Netlify部署目录
│   ├── index.html            # 主页面
│   └── frontend/             # 前端文件副本
└── node_modules/              # Node.js依赖包
```

## 📄 核心文件

### 主要页面
- `index.html` - 系统主页面

### 部署配置
- `package.json` - Node.js项目配置
- `netlify.toml` - Netlify部署配置
- `railway.json` - Railway部署配置
- `railway.toml` - Railway服务配置
- `Procfile` - Railway启动配置

### 部署脚本
- `deploy-updates.ps1` - 主要部署脚本
- `deploy-updates-english.ps1` - 英文版部署脚本
- `update-frontend.ps1` - 前端更新脚本
- `check-deployment.ps1` - 部署状态检查

### 管理工具
- `clear-user-data.js` - 清除用户数据
- `update-admin-account.js` - 更新管理员账户

### 调试工具
- `debug-live-connection.html` - 实时连接调试页面

### 文档
- `README.md` - 项目说明
- `DEPLOYMENT_GUIDE.md` - 部署指南
- `PROJECT_STRUCTURE.md` - 项目结构说明

## 🌐 部署地址

- **前端 (Netlify)**: https://remarkable-conkies-39365e.netlify.app
- **后端 (Railway)**: https://web-production-19806.up.railway.app
- **API健康检查**: https://web-production-19806.up.railway.app/api/health

## 🔧 主要功能

1. **用户管理**: 注册、登录、角色管理
2. **面试申请**: 表单提交、状态跟踪
3. **管理员审核**: 申请审核、反馈管理
4. **跨设备同步**: 云端数据库支持
5. **离线备份**: 本地存储回退机制

## 📱 使用方法

1. 访问前端地址
2. 注册新用户或使用管理员账户登录 (admin/admin123)
3. 填写面试申请或进行管理员审核
4. 数据自动在云端同步，支持多设备访问