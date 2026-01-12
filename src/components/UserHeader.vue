<script setup lang="ts">
/**
 * 用户头部组件
 * 
 * 功能分支: 003-user-booking-order
 * 来源: spec.md FR-003, FR-004, US2
 * 
 * 在所有功能页面的顶部区域显示当前登录用户名和"登出"按钮
 */
import { useAuth } from '@/composables/useAuth'

// ============================================================================
// Props & Emits
// ============================================================================

const emit = defineEmits<{
  logout: []
}>()

// ============================================================================
// 状态
// ============================================================================

const { currentUser, logout } = useAuth()

// ============================================================================
// 事件处理
// ============================================================================

/**
 * 处理登出点击
 * FR-004: 用户点击"登出"按钮后，系统必须清除会话状态
 */
function handleLogout() {
  logout()
  emit('logout')
}
</script>

<template>
  <div class="user-header">
    <!-- 用户信息 -->
    <div class="user-info">
      <span class="user-icon">👤</span>
      <span class="username">{{ currentUser?.username }}</span>
      <span class="user-country">({{ currentUser?.country }})</span>
    </div>
    
    <!-- 登出按钮 -->
    <button 
      class="logout-button"
      @click="handleLogout"
    >
      登出
    </button>
  </div>
</template>

<style scoped>
.user-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.user-icon {
  font-size: 16px;
}

.username {
  font-weight: 500;
}

.user-country {
  opacity: 0.8;
  font-size: 13px;
}

.logout-button {
  padding: 6px 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}
</style>
