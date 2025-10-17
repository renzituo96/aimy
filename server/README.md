# 后端代理服务方案

本项目实现了一个Node.js后端代理服务，用于安全地与Supabase交互，避免在前端应用中暴露敏感信息。

## 方案概述

通过实现以下组件，我们成功解决了敏感信息硬编码的安全问题：

1. **后端代理服务**：在服务器端安全存储Supabase凭证，处理所有与Supabase的交互
2. **前端服务层**：封装与后端API的通信，提供简洁的接口供页面调用
3. **环境变量管理**：支持通过环境变量配置敏感信息，避免硬编码

## 文件结构

```
server/
├── backend.js       # 后端代理服务主文件
├── package.json     # 项目依赖和脚本配置
├── .env.example     # 环境变量示例文件
└── README.md        # 使用说明文档

services/
└── userService.js   # 前端服务层，封装API调用
```

## 配置与运行

### 1. 配置环境变量

1. 复制环境变量示例文件：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填写真实的Supabase配置：
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-api-key
   ```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动后端服务

```bash
npm start
```

服务器将在配置的端口（默认3000）启动，监听来自前端的API请求。

## API端点

### 1. 测试连接

- **URL**: `/api/auth/test-connection`
- **方法**: `GET`
- **描述**: 测试与Supabase的连接状态
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "连接成功！Supabase API 可访问",
    "timestamp": "2024-04-12T12:00:00Z"
  }
  ```

### 2. 用户注册

- **URL**: `/api/auth/register`
- **方法**: `POST`
- **描述**: 注册新用户
- **请求体**:
  ```json
  {
    "username": "用户名",
    "email": "邮箱@example.com",
    "password": "密码"
  }
  ```
- **响应示例**:
  ```json
  {
    "success": true,
    "message": "注册成功！用户信息已保存",
    "user": { ... }
  }
  ```

## 前端集成

前端通过导入的 `userService` 模块与后端API交互，无需直接处理Supabase凭证：

```javascript
// 导入用户服务
import userService from '../../services/userService.js';

// 测试连接
userService.testConnection().then(result => {
  // 处理成功结果
}).catch(error => {
  // 处理错误
});

// 用户注册
userService.register(userData).then(result => {
  // 处理成功结果
}).catch(error => {
  // 处理错误
});
```

## 安全建议

1. **生产环境注意事项**:
   - 确保 `.env` 文件不会被提交到版本控制系统（添加到 `.gitignore`）
   - 使用HTTPS协议传输数据
   - 考虑添加请求限流和身份验证机制
   - 定期更新API密钥

2. **扩展功能**:
   - 可以添加请求日志记录
   - 实现更复杂的错误处理
   - 添加更多的API端点以支持其他功能

## 故障排除

- 如果连接测试失败，请检查Supabase URL和API密钥是否正确
- 确保后端服务正在运行且端口没有被占用
- 检查网络连接和防火墙设置

## 许可证

ISC License