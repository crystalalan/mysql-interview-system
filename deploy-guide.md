# 部署指南

## 方案一：GitHub Pages 部署（推荐）

### 步骤：
1. 在 GitHub 上创建新仓库
2. 将项目代码推送到仓库
3. 在仓库设置中启用 GitHub Pages
4. 访问生成的网址

### 详细操作：

#### 1. 创建 GitHub 仓库
- 登录 GitHub
- 点击 "New repository"
- 仓库名：`interview-system`
- 设为 Public
- 点击 "Create repository"

#### 2. 推送代码到 GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/interview-system.git
git push -u origin main
```

#### 3. 启用 GitHub Pages
- 进入仓库页面
- 点击 "Settings" 标签
- 滚动到 "Pages" 部分
- Source 选择 "Deploy from a branch"
- Branch 选择 "main"
- Folder 选择 "/ (root)"
- 点击 "Save"

#### 4. 访问网站
- 等待几分钟部署完成
- 访问：`https://你的用户名.github.io/interview-system/frontend/`

---

## 方案二：Netlify 部署

### 步骤：
1. 访问 [netlify.com](https://netlify.com)
2. 注册/登录账户
3. 拖拽 `frontend` 文件夹到部署区域
4. 获得自动生成的网址

### 优势：
- 自动 HTTPS
- 自定义域名支持
- 表单处理功能

---

## 方案三：Vercel 部署

### 步骤：
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账户登录
3. 导入 GitHub 仓库
4. 设置构建配置（选择 frontend 目录）
5. 部署完成

---

## 方案四：自己的服务器

如果你有自己的服务器或VPS：

### 使用 Nginx：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/interview-system/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

### 使用 Apache：
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/interview-system/frontend
    
    <Directory /path/to/interview-system/frontend>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

---

## 注意事项

### 数据存储限制
当前系统使用 localStorage 存储数据，这意味着：
- 数据只存储在用户的浏览器中
- 不同用户之间无法共享数据
- 清除浏览器数据会丢失所有信息

### 生产环境建议
如果需要真正的多用户系统，建议：
1. 使用真实的后端数据库
2. 实现用户认证系统
3. 添加数据备份机制

### 域名和HTTPS
- GitHub Pages 自动提供 HTTPS
- 可以绑定自定义域名
- 免费 SSL 证书自动配置