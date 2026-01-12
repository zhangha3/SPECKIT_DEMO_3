<script setup lang="ts">
/**
 * 登录页面视图
 * 
 * 功能分支: 003-user-booking-order
 * 来源: spec.md US1, FR-001, FR-026
 */
import LoginForm from '@/components/LoginForm.vue'

// ============================================================================
// Props & Emits
// ============================================================================

const emit = defineEmits<{
  loginSuccess: [username: string]
}>()

// ============================================================================
// 事件处理
// ============================================================================

function handleLoginSuccess(username: string) {
  emit('loginSuccess', username)
}
</script>

<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-header">
        <h1 class="app-title">航运信息平台</h1>
        <p class="app-subtitle">请登录以访问系统功能</p>
      </div>
      
      <LoginForm @success="handleLoginSuccess" />
      
      <div class="login-footer">
        <p class="demo-hint">
          演示账号: zhangsan / 123456
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
  color: white;
}

.app-title {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
}

.app-subtitle {
  margin: 8px 0 0;
  font-size: 16px;
  opacity: 0.9;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
}

.demo-hint {
  margin: 0;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}
</style>
