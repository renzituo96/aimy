<template>
	<view class="content">
		<image class="logo" src="/static/logo.png"></image>
		<view class="register-form">
			<view class="form-title">用户注册</view>
			
			<view class="input-group">
				<text class="label">用户名</text>
				<input class="input" v-model="form.username" placeholder="请输入用户名" />
			</view>
			
			<view class="input-group">
				<text class="label">邮箱</text>
				<input class="input" v-model="form.email" type="email" placeholder="请输入邮箱" />
			</view>
			
			<view class="input-group">
				<text class="label">密码</text>
				<input class="input" v-model="form.password" type="password" placeholder="请输入密码" password="true" />
			</view>
			
			<button class="register-btn" @click="handleRegister" :disabled="isLoading">{{ isLoading ? '注册中...' : '注册' }}</button>
				<button class="test-btn" @click="testConnection" :disabled="isLoading">测试连接</button>
				
				<view v-if="message" class="message" :class="{'success': isSuccess, 'error': !isSuccess}">
					{{ message }}
				</view>
		</view>
	</view>
</template>

<script>
	// 导入用户服务，通过后端API与Supabase交互
	import userService from '../../services/userService.js';
	export default {
		data() {
			return {
				form: {
					username: '',
					email: '',
					password: ''
				},
				isLoading: false,
				message: '',
				isSuccess: false
				// 已移除硬编码的Supabase凭证，敏感信息现在存储在后端服务中
			}
		},
		onLoad() {
			// 页面加载时的初始化逻辑
		},
		methods: {
			// 验证表单
			validateForm() {
				if (!this.form.username.trim()) {
					this.showMessage('请输入用户名', false)
					return false
				}
				if (!this.form.email.trim()) {
					this.showMessage('请输入邮箱', false)
					return false
				}
				// 简单的邮箱格式验证
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
				if (!emailRegex.test(this.form.email)) {
					this.showMessage('请输入有效的邮箱地址', false)
					return false
				}
				if (!this.form.password) {
					this.showMessage('请输入密码', false)
					return false
				}
				if (this.form.password.length < 6) {
					this.showMessage('密码长度不能少于6位', false)
					return false
				}
				return true
			},
			
			// 显示消息
			showMessage(message, isSuccess) {
				this.message = message
				this.isSuccess = isSuccess
				// 3秒后自动清除消息
				setTimeout(() => {
					this.message = ''
				}, 3000)
			},
			
			// 测试连接 - 现在通过后端API进行连接测试
		testConnection() {
			try {
				this.isLoading = true;
				this.showMessage('正在测试连接...', false);
				
				// 使用用户服务进行连接测试，不再直接暴露Supabase凭证
				userService.testConnection().then(result => {
					this.showMessage(result.message, true);
				}).catch(error => {
					this.showMessage(error.message || '连接测试失败', false);
				}).finally(() => {
					this.isLoading = false;
				});
			} catch (error) {
				console.error('连接测试异常:', error);
				this.showMessage('程序错误: ' + (error.message || '未知错误'), false);
				this.isLoading = false;
			}
		},
			
			// 处理注册 - 现在通过后端API进行注册
		handleRegister() {
			try {
				// 使用已有的表单验证方法
				if (!this.validateForm()) {
					return;
				}
				
				this.isLoading = true;
				this.showMessage('正在提交注册信息...', false);
				
				// 使用用户服务进行注册，不再直接暴露Supabase凭证
				userService.register(this.form).then(result => {
					this.showMessage(result.message, true);
					// 清空表单
					this.form = {
						username: '',
						email: '',
						password: ''
					};
				}).catch(error => {
					this.showMessage(error.message || '注册失败，请稍后再试', false);
				}).finally(() => {
					this.isLoading = false;
				});
			} catch (error) {
				console.error('注册过程异常:', error);
				this.showMessage('程序错误: ' + (error.message || '未知错误'), false);
				this.isLoading = false;
			}
		}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 40rpx;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 100rpx;
		margin-bottom: 50rpx;
	}

	.register-form {
		width: 100%;
		max-width: 600rpx;
		padding: 40rpx;
		background-color: #f8f8f8;
		border-radius: 20rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
	}

	.form-title {
		font-size: 36rpx;
		font-weight: bold;
		text-align: center;
		margin-bottom: 40rpx;
		color: #333;
	}

	.input-group {
		margin-bottom: 30rpx;
	}

	.label {
		display: block;
		font-size: 28rpx;
		color: #666;
		margin-bottom: 10rpx;
	}

	.input {
		width: 100%;
		height: 80rpx;
		padding: 0 20rpx;
		border: 1rpx solid #ddd;
		border-radius: 10rpx;
		font-size: 28rpx;
		background-color: #fff;
	}

	.register-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background-color: #007aff;
		color: #fff;
		font-size: 32rpx;
		border-radius: 10rpx;
		margin-top: 20rpx;
	}

	.register-btn:disabled {
			background-color: #ccc;
		}

		.test-btn {
			width: 100%;
			height: 88rpx;
			line-height: 88rpx;
			background-color: #5856d6;
			color: #fff;
			font-size: 32rpx;
			border-radius: 10rpx;
			margin-top: 20rpx;
		}

		.test-btn:disabled {
			background-color: #ccc;
		}

	.message {
		margin-top: 30rpx;
		padding: 20rpx;
		border-radius: 10rpx;
		font-size: 28rpx;
		text-align: center;
	}

	.message.success {
		background-color: #e8f5e8;
		color: #4caf50;
	}

	.message.error {
		background-color: #ffebee;
		color: #f44336;
	}
</style>
