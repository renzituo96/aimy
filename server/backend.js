// Node.js后端代理服务
// 用于处理前端请求并安全地与Supabase交互，避免敏感信息暴露在前端

const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

// 加载环境变量
try {
  // 尝试加载.env文件，仅在开发环境中有效
  const dotenv = require('dotenv');
  const result = dotenv.config();
  if (result.error) {
    console.warn('警告: .env文件未找到或无法加载，将使用环境变量');
  }
} catch (error) {
  console.warn('警告: 加载.env文件时出错，将使用环境变量');
}

// 从环境变量获取Supabase配置
// 在Vercel上，这些环境变量需要在项目设置中配置
const SUPABASE_CONFIG = {
  url: process.env.SUPABASE_URL || 'https://bomcaovuvfnoystxrrqf.supabase.co',
  key: process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbWNhb3Z1dmZub3lzdHhycnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MjY2MDksImV4cCI6MjA3NjAwMjYwOX0.-L13h5RR9fFZV4H9Bj3bGf9e3S5N_isWa8kuzqjlhHs'
};

// 检查必要的环境变量
const isVercel = !!process.env.VERCEL;
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('错误: 缺少必要的环境变量:', missingEnvVars.join(', '));
  console.error('请确保在.env文件中设置了这些变量，或在Vercel项目设置中配置了环境变量');
  if (!isVercel) {
    process.exit(1);
  }
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // 解析请求URL
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;
  
  console.log(`收到请求: ${req.method} ${pathname}`);
  
  // 路由处理
  switch (pathname) {
    case '/api/auth/test-connection':
      handleTestConnection(req, res);
      break;
    case '/api/auth/register':
      handleRegister(req, res);
      break;
    default:
      res.writeHead(404);
      res.end(JSON.stringify({ message: '路径不存在' }));
  }
});

// 处理连接测试请求
function handleTestConnection(req, res) {
  if (req.method !== 'GET') {
    res.writeHead(405);
    res.end(JSON.stringify({ message: '方法不允许' }));
    return;
  }
  
  console.log('执行连接测试...');
  
  // 构建Supabase请求选项
  const supabaseOptions = {
    hostname: new URL(SUPABASE_CONFIG.url).hostname,
    path: '/rest/v1/users?limit=0',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
      'apikey': SUPABASE_CONFIG.key,
      'Accept': 'application/json'
    }
  };
  
  // 发送请求到Supabase
  const supabaseReq = https.request(supabaseOptions, (supabaseRes) => {
    let data = '';
    
    supabaseRes.on('data', (chunk) => {
      data += chunk;
    });
    
    supabaseRes.on('end', () => {
      console.log(`Supabase响应状态码: ${supabaseRes.statusCode}`);
      
      if (supabaseRes.statusCode >= 200 && supabaseRes.statusCode < 300) {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          message: '连接成功！Supabase API 可访问',
          timestamp: new Date().toISOString()
        }));
      } else {
        res.writeHead(supabaseRes.statusCode);
        res.end(JSON.stringify({
          success: false,
          message: `连接失败: 状态码 ${supabaseRes.statusCode}`,
          details: parseResponseBody(data)
        }));
      }
    });
  });
  
  supabaseReq.on('error', (error) => {
    console.error('Supabase连接错误:', error);
    res.writeHead(500);
    res.end(JSON.stringify({
      success: false,
      message: '连接错误: ' + error.message
    }));
  });
  
  supabaseReq.end();
}

// 处理用户注册请求
function handleRegister(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405);
    res.end(JSON.stringify({ message: '方法不允许' }));
    return;
  }
  
  let body = '';
  
  // 收集请求体数据
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    try {
      // 解析请求体
      const userData = JSON.parse(body);
      
      // 基本验证
      if (!userData.username || !userData.email || !userData.password) {
        res.writeHead(400);
        res.end(JSON.stringify({ message: '缺少必要的用户信息' }));
        return;
      }
      
      console.log('处理用户注册请求:', userData.username);
      
      // 构建Supabase请求选项
      const supabaseOptions = {
        hostname: new URL(SUPABASE_CONFIG.url).hostname,
        path: '/rest/v1/users',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_CONFIG.key}`,
          'apikey': SUPABASE_CONFIG.key,
          'Accept': 'application/json'
        }
      };
      
      // 发送请求到Supabase
      const supabaseReq = https.request(supabaseOptions, (supabaseRes) => {
        let data = '';
        
        supabaseRes.on('data', (chunk) => {
          data += chunk;
        });
        
        supabaseRes.on('end', () => {
          console.log(`注册请求响应状态码: ${supabaseRes.statusCode}`);
          
          if (supabaseRes.statusCode >= 200 && supabaseRes.statusCode < 300) {
            res.writeHead(201);
            res.end(JSON.stringify({
              success: true,
              message: '注册成功！用户信息已保存',
              user: parseResponseBody(data)
            }));
          } else {
            const errorDetails = parseResponseBody(data);
            let errorMessage = '注册失败';
            
            // 处理特定错误情况
            if (supabaseRes.statusCode === 409) {
              if (errorDetails.message && errorDetails.message.includes('username')) {
                errorMessage = '用户名已存在';
              } else if (errorDetails.message && errorDetails.message.includes('email')) {
                errorMessage = '邮箱已被注册';
              } else {
                errorMessage = '用户名或邮箱已存在';
              }
            }
            
            res.writeHead(supabaseRes.statusCode);
            res.end(JSON.stringify({
              success: false,
              message: errorMessage,
              details: errorDetails
            }));
          }
        });
      });
      
      supabaseReq.on('error', (error) => {
        console.error('注册请求错误:', error);
        res.writeHead(500);
        res.end(JSON.stringify({
          success: false,
          message: '注册过程中发生错误: ' + error.message
        }));
      });
      
      // 发送用户数据到Supabase
      supabaseReq.write(JSON.stringify(userData));
      supabaseReq.end();
      
    } catch (error) {
      console.error('请求处理错误:', error);
      res.writeHead(400);
      res.end(JSON.stringify({
        success: false,
        message: '请求数据格式错误: ' + error.message
      }));
    }
  });
}

// 辅助函数：解析响应体
function parseResponseBody(data) {
  try {
    return JSON.parse(data || '{}');
  } catch (error) {
    return { raw: data };
  }
}

// 在Vercel环境中，我们需要导出服务器请求处理函数
// 在本地开发环境中，我们启动HTTP服务器

if (process.env.NODE_ENV === 'production') {
  // Vercel环境：导出处理函数
  module.exports = (req, res) => {
    server.emit('request', req, res);
  };
} else {
  // 本地开发环境：启动HTTP服务器
  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || 'localhost';
  
  server.listen(PORT, HOST, () => {
    console.log(`后端代理服务器已启动`);
    console.log(`监听地址: http://${HOST}:${PORT}`);
    console.log('可用API端点:');
    console.log('  GET    /api/auth/test-connection - 测试Supabase连接');
    console.log('  POST   /api/auth/register        - 用户注册');
    console.log('\n注意: 这是开发环境服务器，生产环境应使用更安全的配置');
  });
  
  // 错误处理
  server.on('error', (error) => {
    console.error('服务器错误:', error);
  });
}