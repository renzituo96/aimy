# Vercel部署教程

本文档详细介绍了如何将您的项目部署到Vercel平台，包括必要的配置和步骤。

## 准备工作

1. **确保您的项目已完成以下配置**：
   - 已创建`vercel.json`配置文件
   - 已修改`server/backend.js`以支持环境变量和Vercel平台
   - 已修改`services/userService.js`使用相对路径
   - 已创建`.gitignore`文件以排除敏感信息

2. **准备账号**：
   - GitHub账号（用于代码托管）
   - Vercel账号（用于部署）

3. **准备环境变量**：
   - Supabase项目URL
   - Supabase API密钥

## 项目配置检查

在部署前，请确保以下文件配置正确：

### 1. `vercel.json`

确保已包含正确的构建规则和路由配置：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/backend.js",
      "use": "@vercel/node"
    },
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/auth/(.*)",
      "dest": "server/backend.js"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/.*",
      "dest": "index.html"
    }
  ]
}
```

### 2. `server/backend.js`

确保已修改为从环境变量读取配置，并支持Vercel平台：

```javascript
// 尝试加载dotenv（仅在开发环境中）
try {
  require('dotenv').config();
} catch (e) {
  console.log('未找到dotenv模块，将使用环境变量');
}

// 从环境变量获取Supabase配置
const SUPABASE_CONFIG = {
  url: process.env.SUPABASE_URL || 'https://bomcaovuvfnoystxrrqf.supabase.co',
  key: process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWNhb3Z1dmZub3lzdHhycnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MjY2MDksImV4cCI6MjA3NjAwMjYwOX0.-L13h5RR9fFZV4H9Bj3bGf9e3S5N_isWa8kuzqjlhHs'
};

// 在Vercel环境中，导出服务器请求处理函数
if (process.env.NODE_ENV === 'production') {
  module.exports = (req, res) => {
    server.emit('request', req, res);
  };
} else {
  // 本地开发环境：启动HTTP服务器
  server.listen(PORT, HOST, () => {
    // 服务器启动代码...
  });
}
```

### 3. `services/userService.js`

确保已修改API基础URL为相对路径：

```javascript
constructor() {
  // 使用相对路径，这样在部署到Vercel后会自动使用当前域名
  this.baseUrl = '/api/auth';
}
```

## GitHub仓库准备

1. **初始化Git仓库**（如果尚未初始化）：
   ```bash
   git init
   git add .
   git commit -m "初始化项目"
   ```

2. **创建GitHub仓库**并将代码推送到远程：
   ```bash
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   git push -u origin master
   ```

## Vercel部署步骤

### 步骤1：登录Vercel

访问 [Vercel官网](https://vercel.com/) 并使用您的GitHub账号登录。

### 步骤2：导入项目

1. 在Vercel仪表盘中，点击 **"New Project"**
2. 点击 **"Import"** 或 **"Import from Git Repository"**
3. 选择您的GitHub仓库
4. 点击 **"Import"** 按钮

### 步骤3：配置项目

1. **项目名称**：输入您的项目名称（可选，默认为仓库名称）

2. **环境变量**：在"Environment Variables"部分添加以下环境变量：
   - `SUPABASE_URL`: 您的Supabase项目URL
   - `SUPABASE_KEY`: 您的Supabase API密钥
   - `NODE_ENV`: production

3. **构建和输出设置**：
   - 构建命令：留空（Vercel会自动检测）
   - 输出目录：留空（Vercel会自动检测）
   - 开发命令：留空

4. 点击 **"Deploy"** 按钮开始部署过程

### 步骤4：等待部署完成

Vercel将自动开始构建和部署您的项目。部署过程完成后，您将看到成功消息和项目URL。

## 配置自定义域名（可选）

如果您有自定义域名，可以按照以下步骤配置：

1. 在Vercel项目页面，点击 **"Settings"**
2. 选择 **"Domains"**
3. 输入您的自定义域名
4. 按照Vercel提供的DNS记录配置说明，在您的域名注册商处添加相应的DNS记录
5. 等待DNS记录生效（通常需要几分钟到几小时）

## 测试部署

部署完成后，访问Vercel提供的URL（例如：`https://your-project.vercel.app`）测试您的应用。

### 验证API功能

测试以下API端点是否正常工作：

1. **连接测试**：访问 `/api/auth/test-connection`
2. **用户注册**：向 `/api/auth/register` 发送POST请求

## 问题排查

### 常见问题

1. **环境变量未正确配置**
   - 检查Vercel项目设置中的环境变量
   - 确保变量名称正确且值已正确设置

2. **CORS错误**
   - 确保`server/backend.js`中的CORS配置正确
   - 检查Supabase项目是否允许来自您的域名的请求

3. **API端点无法访问**
   - 检查`vercel.json`中的路由配置
   - 确认`server/backend.js`已正确导出请求处理函数

4. **构建失败**
   - 检查构建日志以获取具体错误信息
   - 确保所有依赖项都已在`package.json`中声明

## 安全注意事项

1. **环境变量保护**：确保敏感信息仅通过环境变量配置，不在代码中硬编码
2. **Supabase安全**：在Supabase仪表盘中配置适当的访问控制和行级安全策略
3. **HTTPS**：Vercel自动提供HTTPS，确保所有请求都通过HTTPS进行
4. **API密钥轮换**：定期轮换Supabase API密钥以提高安全性

## 后续维护

1. **自动部署**：每次向GitHub仓库推送代码时，Vercel将自动重新部署您的项目
2. **环境变量管理**：通过Vercel项目设置管理环境变量
3. **监控和日志**：使用Vercel提供的日志和监控功能查看应用性能和错误

## 联系支持

如果在部署过程中遇到问题：
- 查阅 [Vercel文档](https://vercel.com/docs)
- 访问 [Vercel社区](https://vercel.com/community)
- 联系Vercel支持团队

---

祝您部署顺利！