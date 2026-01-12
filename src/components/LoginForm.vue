<script setup lang="ts">
/**
 * 登录表单组件
 * 
 * 功能分支: 003-user-booking-order
 * 来源: spec.md FR-001, FR-002, FR-028
 */
import { ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'

// ============================================================================
// Props & Emits
// ============================================================================

const emit = defineEmits<{
  success: [username: string]
}>()

// ============================================================================
// 状态
// ============================================================================

const { login } = useAuth()

/** 用户名 */
const username = ref('')

/** 密码 */
const password = ref('')

/** 错误信息 */
const errorMessage = ref('')

/** 是否正在提交 */
const isSubmitting = ref(false)

// ============================================================================
// 逻辑
// ============================================================================

/** 最大输入长度 (FR-001) */
const MAX_INPUT_LENGTH = 30

/**
 * 清除错误信息（当用户修改输入时）
 * FR-028: 登录失败的错误提示必须持续显示，直到用户修改了用户名或密码
 */
watch([username, password], () => {
  if (errorMessage.value) {
    errorMessage.value = ''
  }
})

/**
 * 处理登录表单提交
 */
function handleSubmit() {
  // 清除之前的错误
  errorMessage.value = ''
  
  // 验证必填字段
  if (!username.value.trim()) {
    errorMessage.value = '请输入用户名'
    return
  }
  
  if (!password.value) {
    errorMessage.value = '请输入密码'
    return
  }
  
  isSubmitting.value = true
  
  try {
    const result = login(username.value.trim(), password.value)
    
    if (result.success) {
      emit('success', result.user!.username)
    } else {
      errorMessage.value = result.error || '用户名或密码错误'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="login-form" @submit.prevent="handleSubmit">
    <h2 class="login-title">用户登录</h2>
    
    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message" role="alert">
      {{ errorMessage }}
    </div>
    
    <!-- 用户名输入 -->
    <div class="form-group">
      <label for="username" class="form-label">用户名</label>
      <input
        id="username"
        v-model="username"
        type="text"
        class="form-input"
        placeholder="请输入用户名"
        :maxlength="MAX_INPUT_LENGTH"
        autocomplete="username"
        :disabled="isSubmitting"
      />
    </div>
    
    <!-- 密码输入 -->
    <div class="form-group">
      <label for="password" class="form-label">密码</label>
      <input
        id="password"
        v-model="password"
        type="password"
        class="form-input"
        placeholder="请输入密码"
        :maxlength="MAX_INPUT_LENGTH"
        autocomplete="current-password"
        :disabled="isSubmitting"
      />
    </div>
    
    <!-- 登录按钮 -->
    <button
      type="submit"
      class="submit-button"
      :disabled="isSubmitting"
    >
      {{ isSubmitting ? '登录中...' : '登录' }}
    </button>
  </form>
</template>

<style scoped>
.login-form {
  max-width: 360px;
  margin: 0 auto;
  padding: 32px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.login-title {
  margin: 0 0 24px;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.error-message {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  color: #ff4d4f;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.submit-button {
  width: 100%;
  padding: 12px;
  background-color: #1976d2;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: #1565c0;
}

.submit-button:disabled {
  background-color: #bdbdbd;
  cursor: not-allowed;
}
</style>
