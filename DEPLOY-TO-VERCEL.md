# Vercel部署教程

本教程详细介绍如何将您的UniApp项目及其后端代理服务部署到Vercel平台。

## 准备工作

### 1. 创建GitHub/GitLab/Bitbucket仓库

首先，将您的项目代码托管到代码仓库中：

1. 在GitHub/GitLab/Bitbucket上创建一个新的仓库
2. 将本地项目推送到远程仓库：

```bash
git init
git add .
git commit -m "初始提交"
git remote add origin 您的仓库URL
git push -u origin master
```

### 2. 准备Vercel账户

1. 访问 [Vercel官网](https://vercel.com)
2. 注册/登录您的Vercel账户
3. 连接您的代码仓库账户（GitHub/GitLab/Bitbucket）

## 后端服务部署配置

### 1. 修改后端服务文件

首先，我们需要对后端服务进行一些调整，以适应Vercel的部署环境：

1. 创建 `vercel.json` 配置文件：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/backend.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/auth/(.*)",
      "dest": "server/backend.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

2. 更新 `server/backend.js` 文件，使其能够读取Vercel环境变量：

```javascript
// 在文件顶部添加
if (process.env.NODE_ENV === 'production') {
  // 生产环境配置
  const SUPABASE_CONFIG = {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY
  };
}
```

### 2. 修改 `server/package.json`

确保您的 `server/package.json` 包含正确的启动脚本：

```json
{
  "name": "backend-proxy",
  "version": "1.0.0",
  "main": "backend.js",
  "scripts": {
    "start": "node backend.js"
  },
  "dependencies": {
    "dotenv": "^16.4.5"
  }
}
```

## 前端应用配置调整

### 1. 更新 `services/userService.js`

修改前端服务层，使其能够根据环境自动切换API地址：

```javascript
class UserService {
  constructor() {
    // 根据环境判断API地址
    // 生产环境使用Vercel提供的域名
    // 开发环境使用本地地址
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? '/api/auth' 
      : 'http://localhost:3000/api/auth';
  }
  
  // 其他代码保持不变...
}
```

### 2. 创建 `.gitignore` 文件

确保不会将敏感文件提交到仓库：

```
# 依赖
node_modules/
.pnpm-store/

# 环境变量文件
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 日志文件
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# IDE相关文件
.idea/
.vscode/
*.swp
*.swo
*~

# 构建输出
/dist
/unpackage/
build/

# 操作系统文件
.DS_Store
Thumbs.db

# 缓存文件
.cache/
.parcel-cache/
.next/
out/
```

## 部署步骤

### 1. 导入项目到Vercel

1. 登录Vercel账户
2. 点击右上角的 **New Project**
3. 选择您的项目仓库
4. 点击 **Import**

### 2. 配置部署设置

在配置页面中：

1. **FRAMEWORK PRESET**: 选择 **Other** (因为UniApp不是Vercel原生支持的框架)
2. **BUILD COMMAND**: 留空或根据您的构建流程设置
3. **OUTPUT DIRECTORY**: 留空或设置为 `/unpackage/dist/build/h5` (如果您有H5构建输出)
4. **INSTALL COMMAND**: 留空或设置为 `npm install`

### 3. 设置环境变量

1. 滚动到 **Environment Variables** 部分
2. 添加以下环境变量：

   - `SUPABASE_URL`: 您的Supabase项目URL
   - `SUPABASE_KEY`: 您的Supabase API密钥
   - `NODE_ENV`: production

3. 确保环境变量被正确设置，这些将用于后端服务

### 4. 部署项目

1. 点击 **Deploy** 按钮开始部署过程
2. Vercel将开始构建和部署您的项目
3. 部署完成后，您将获得一个唯一的预览URL

## 配置域名（可选）

如果您有自定义域名，可以按照以下步骤设置：

1. 在Vercel项目的 **Settings** 选项卡中，选择 **Domains**
2. 输入您的自定义域名
3. 按照提示在您的DNS提供商处添加相应的DNS记录
4. 等待DNS传播完成（通常需要几分钟到几小时）

## 验证部署

部署完成后，验证您的应用是否正常工作：

1. 访问您的Vercel部署URL
2. 尝试注册功能和连接测试功能
3. 检查网络请求是否正确指向您的Vercel API端点

## 常见问题排查

### 1. 环境变量未生效

- 确认在Vercel项目设置中正确配置了所有必需的环境变量
- 重新部署项目以应用新的环境变量

### 2. API路由未正确配置

- 检查 `vercel.json` 文件中的路由配置
- 确保路由路径与您的API端点匹配

### 3. 构建失败

- 检查构建日志以获取详细错误信息
- 确保您的项目依赖正确安装
- 验证Node.js版本兼容性

### 4. CORS问题

- 确保后端服务中正确设置了CORS头
- 检查是否允许您的前端域名访问API

## 生产环境安全建议

1. **API密钥保护**：确保所有敏感信息都通过环境变量配置，不硬编码在代码中
2. **HTTPS**：Vercel默认提供HTTPS，确保所有通信都是加密的
3. **请求限制**：考虑在生产环境中添加API请求频率限制
4. **日志记录**：实现适当的日志记录，便于问题排查
5. **监控**：设置性能和可用性监控

## 更新部署

每当您向仓库推送新的代码更改时，Vercel会自动触发新的部署。您也可以手动触发部署：

1. 进入Vercel项目页面
2. 点击 **Deploy** 按钮
3. 选择 **Redeploy** 或从特定分支部署

---

恭喜！您的项目现在已成功部署到Vercel平台。如果您遇到任何问题，请参考Vercel的官方文档或联系Vercel支持团队。