# 🚀 Heroku部署指南

## 准备工作

### 1. 注册Heroku账户
- 访问 [heroku.com](https://heroku.com)
- 点击 "Sign up" 注册免费账户
- 验证邮箱

### 2. 安装Heroku CLI
**Windows用户：**
- 下载：https://devcenter.heroku.com/articles/heroku-cli#install-the-heroku-cli
- 或使用命令：`winget install Heroku.CLI`

**验证安装：**
```bash
heroku --version
```

## 部署步骤

### 1. 登录Heroku
```bash
heroku login
```
这会打开浏览器进行登录验证。

### 2. 初始化Git仓库（如果还没有）
```bash
git init
git add .
git commit -m "Initial commit for Heroku deployment"
```

### 3. 创建Heroku应用
```bash
heroku create your-interview-system
```
注意：应用名称必须是全球唯一的，如果被占用请换个名字。

### 4. 设置环境变量（可选但推荐）
```bash
heroku config:set JWT_SECRET=your-super-secret-jwt-key-here
```

### 5. 部署到Heroku
```bash
git push heroku main
```

### 6. 打开应用
```bash
heroku open
```

## 部署后访问

- **应用网址**: `https://your-app-name.herokuapp.com`
- **管理员账户**: 用户名 `admin`，密码 `admin123`

## 常见问题解决

### 问题1: 应用名称已被占用
```bash
heroku create your-interview-system-2024
# 或让Heroku自动生成名称
heroku create
```

### 问题2: 查看应用日志
```bash
heroku logs --tail
```

### 问题3: 重新部署
```bash
git add .
git commit -m "Update application"
git push heroku main
```

### 问题4: 设置自定义域名
```bash
heroku domains:add www.yourdomain.com
```

## 重要提醒

⚠️ **数据存储说明**：
- 当前版本使用内存存储
- Heroku每24小时会重启应用，数据会丢失
- 生产环境建议使用数据库（如Heroku Postgres）

## 升级到数据库版本

如需持久化数据存储，可以：
1. 添加Heroku Postgres插件
2. 修改代码使用数据库
3. 重新部署

```bash
heroku addons:create heroku-postgresql:mini
```

## 监控和管理

- **查看应用状态**: `heroku ps`
- **重启应用**: `heroku restart`
- **查看配置**: `heroku config`
- **删除应用**: `heroku apps:destroy your-app-name`