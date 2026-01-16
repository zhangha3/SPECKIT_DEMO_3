<script setup lang="ts">
/**
 * Toast 通知组件
 * 
 * 功能分支: 004-fund-stats-enhancement
 * 
 * 显示全局 Toast 通知消息
 */

import { useToast, type ToastMessage, type ToastType } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

/**
 * 获取 Toast 样式类
 */
function getToastClass(type: ToastType): string {
  const baseClass = 'toast-item'
  switch (type) {
    case 'success':
      return `${baseClass} toast-success`
    case 'error':
      return `${baseClass} toast-error`
    case 'warning':
      return `${baseClass} toast-warning`
    case 'info':
      return `${baseClass} toast-info`
    default:
      return baseClass
  }
}

/**
 * 获取 Toast 图标
 */
function getToastIcon(type: ToastType): string {
  switch (type) {
    case 'success':
      return '✓'
    case 'error':
      return '✕'
    case 'warning':
      return '⚠'
    case 'info':
      return 'ℹ'
    default:
      return ''
  }
}

/**
 * 关闭 Toast
 */
function handleClose(toast: ToastMessage): void {
  removeToast(toast.id)
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="getToastClass(toast.type)"
          @click="handleClose(toast)"
        >
          <span class="toast-icon">{{ getToastIcon(toast.type) }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" @click.stop="handleClose(toast)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 360px;
}

.toast-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  min-width: 280px;
}

.toast-item:hover {
  transform: translateX(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.toast-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.toast-error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.toast-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.toast-info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.toast-icon {
  font-size: 18px;
  margin-right: 10px;
  font-weight: bold;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  margin-left: 10px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

/* 过渡动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
