# 🚂 Railway环境变量设置详细指南

## 📍 第一步：进入项目

1. 访问 https://railway.app
2. 登录你的账户
3. 找到项目 `mysql-interview-system`
4. 点击项目卡片进入

## ⚙️ 第二步：找到环境变量设置

在项目页面中，你会看到几个选项：

### 选项A：Variables标签
- 在项目页面顶部找到 **"Variables"** 标签
- 点击进入变量设置页面

### 选项B：Settings菜单
- 点击 **"Settings"** 
- 在左侧菜单找到 **"Environment"** 或 **"Variables"**

### 选项C：侧边栏
- 在左侧侧边栏直接找到 **"Variables"** 选项

## 📝 第三步：添加环境变量

点击 **"New Variable"** 或 **"Add Variable"** 按钮，然后添加以下7个变量：

### 变量1：数据库主机
```
Name: DB_HOST
Value: sql12.freesqldatabase.com
```

### 变量2：数据库用户名
```
Name: DB_USER
Value: sql12795080
```

### 变量3：数据库密码
```
Name: DB_PASSWORD
Value: FJNW2mCfWV
```

### 变量4：数据库名称
```
Name: DB_NAME
Value: sql12795080
```

### 变量5：数据库端口
```
Name: DB_PORT
Value: 3306
```

### 变量6：JWT密钥
```
Name: JWT_SECRET
Value: mysql-interview-system-2024
```

### 变量7：应用端口
```
Name: PORT
Value: 3000
```

## 🔄 第四步：保存并重新部署

1. **保存变量**：添加完所有变量后，确保点击 **"Save"** 或 **"Apply"**
2. **重新部署**：
   - 找到 **"Deployments"** 或 **"Deploy"** 标签
   - 点击 **"Redeploy"** 或 **"Deploy Latest"**
   - 等待部署完成（通常需要1-3分钟）

## ✅ 第五步：验证设置

部署完成后，检查：

1. **部署状态**：确保显示 "Deployed" 或绿色状态
2. **日志检查**：查看部署日志，确保没有错误
3. **测试API**：访问 https://web-production-19806.up.railway.app/api/health

## 🔍 常见问题

### 问题1：找不到Variables选项
- 确保你在正确的项目中
- 刷新页面重试
- 检查是否有权限访问项目设置

### 问题2：变量保存失败
- 检查变量名是否正确（区分大小写）
- 确保变量值没有多余的空格
- 重试保存操作

### 问题3：部署失败
- 检查所有7个变量是否都已添加
- 确认变量值完全正确
- 查看部署日志获取错误信息

## 📞 需要帮助？

如果遇到问题，请告诉我：
1. 你在哪一步遇到困难
2. 看到了什么错误信息
3. Railway界面显示什么状态

我会立即帮你解决！