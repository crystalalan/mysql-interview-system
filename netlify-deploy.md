# 🌐 Netlify部署指南（纯前端版本）

## 为什么选择Netlify？
- ✅ 全球可用，无地区限制
- ✅ 拖拽部署，超级简单
- ✅ 自动HTTPS
- ✅ 免费自定义域名
- ✅ 表单处理功能

## 部署步骤

### 1. 准备纯前端版本
我们的系统已经包含了纯前端版本（使用localStorage存储）

### 2. 注册Netlify
- 访问 [netlify.com](https://netlify.com)
- 注册免费账户

### 3. 部署方式

#### 方式A：拖拽部署（最简单）
1. 创建一个文件夹，包含：
   - `index.html`
   - `frontend/` 文件夹
2. 将文件夹拖拽到Netlify的部署区域
3. 立即获得访问链接

#### 方式B：GitHub集成
1. 将代码推送到GitHub
2. 在Netlify连接GitHub仓库
3. 自动部署

### 4. 配置
- 构建命令：留空
- 发布目录：`./`（根目录）

### 5. 访问应用
- 获得类似 `https://amazing-name-123456.netlify.app` 的链接
- 可以自定义域名

## 注意事项
- 使用localStorage存储数据
- 每个用户的数据独立存储
- 适合演示和小规模使用