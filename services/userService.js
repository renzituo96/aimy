// 用户服务层
// 封装与后端API的交互逻辑，避免直接在页面中暴露API调用细节

/**
 * 用户服务类
 * 提供用户相关的API调用方法
 */
class UserService {
  constructor() {
    // 使用相对路径，这样在部署到Vercel后会自动使用当前域名
    // 在本地开发时，需要确保前端和后端在相同的域名下或者配置了正确的代理
    this.baseUrl = '/api/auth';
  }

  /**
   * 测试与后端的连接
   * @returns {Promise<Object>} 连接测试结果
   */
  async testConnection() {
    try {
      const response = await this.request('/test-connection', 'GET');
      return response;
    } catch (error) {
      console.error('连接测试失败:', error);
      throw new Error(error.message || '连接测试失败，请检查网络或服务器状态');
    }
  }

  /**
   * 用户注册
   * @param {Object} userData - 用户注册信息
   * @param {string} userData.username - 用户名
   * @param {string} userData.email - 邮箱
   * @param {string} userData.password - 密码
   * @returns {Promise<Object>} 注册结果
   */
  async register(userData) {
    // 前端基本验证
    this.validateUserData(userData);
    
    try {
      const response = await this.request('/register', 'POST', userData);
      return response;
    } catch (error) {
      console.error('注册失败:', error);
      throw new Error(error.message || '注册失败，请稍后再试');
    }
  }

  /**
   * 验证用户数据
   * @param {Object} userData - 用户数据
   * @throws {Error} 当数据验证失败时抛出错误
   */
  validateUserData(userData) {
    if (!userData || typeof userData !== 'object') {
      throw new Error('用户数据格式错误');
    }

    if (!userData.username || userData.username.trim().length === 0) {
      throw new Error('用户名不能为空');
    }

    if (!userData.email || userData.email.trim().length === 0) {
      throw new Error('邮箱不能为空');
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('邮箱格式不正确');
    }

    if (!userData.password || userData.password.length < 6) {
      throw new Error('密码长度至少为6位');
    }
  }

  /**
   * 发送HTTP请求
   * @param {string} endpoint - API端点
   * @param {string} method - HTTP方法
   * @param {Object} [data] - 请求数据
   * @returns {Promise<Object>} 请求结果
   */
  async request(endpoint, method, data = null) {
    return new Promise((resolve, reject) => {
      // 构建请求URL
      const url = `${this.baseUrl}${endpoint}`;
      
      // 构建请求参数
      const requestOptions = {
        url,
        method,
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          try {
            // 处理成功响应
            if (res.statusCode >= 200 && res.statusCode < 300) {
              // 尝试解析响应数据
              const responseData = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
              resolve(responseData);
            } else {
              // 处理错误响应
              const errorData = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
              reject({
                statusCode: res.statusCode,
                message: errorData.message || `请求失败: ${res.statusCode}`
              });
            }
          } catch (error) {
            // 处理解析错误
            reject({
              message: '响应数据解析错误'
            });
          }
        },
        fail: (err) => {
          // 处理请求失败
          reject({
            message: `网络请求失败: ${err.errMsg || '未知错误'}`
          });
        },
        complete: () => {
          // 无论成功失败都会执行，可以在这里添加清理逻辑
          console.log(`请求完成: ${method} ${url}`);
        }
      };
      
      // 如果有请求数据，添加到请求参数中
      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        requestOptions.data = JSON.stringify(data);
      }
      
      // 发送请求
      console.log(`发送请求: ${method} ${url}`, data ? '有数据' : '无数据');
      uni.request(requestOptions);
    });
  }
}

// 创建单例实例
const userService = new UserService();

// 导出服务实例
export default userService;