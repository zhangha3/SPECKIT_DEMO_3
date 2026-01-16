/**
 * Toast 通知组合式函数
 * 
 * 功能分支: 004-fund-stats-enhancement
 * 
 * 提供全局 Toast 通知功能
 */

import { ref, readonly } from 'vue'

// ============================================================================
// 类型定义
// ============================================================================

/**
 * Toast 类型
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/**
 * Toast 消息
 */
export interface ToastMessage {
  /** 消息ID */
  id: number
  
  /** 消息类型 */
  type: ToastType
  
  /** 消息内容 */
  message: string
  
  /** 显示时长（毫秒） */
  duration: number
}

// ============================================================================
// 状态
// ============================================================================

/** 消息队列 */
const toasts = ref<ToastMessage[]>([])

/** 消息ID计数器 */
let messageId = 0

// ============================================================================
// 函数
// ============================================================================

/**
 * 添加 Toast 消息
 * @param type 消息类型
 * @param message 消息内容
 * @param duration 显示时长（毫秒），默认 3000
 */
function addToast(type: ToastType, message: string, duration: number = 3000): void {
  const id = ++messageId
  
  toasts.value.push({
    id,
    type,
    message,
    duration
  })
  
  // 自动移除
  setTimeout(() => {
    removeToast(id)
  }, duration)
}

/**
 * 移除 Toast 消息
 * @param id 消息ID
 */
function removeToast(id: number): void {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

/**
 * 显示成功消息
 * @param message 消息内容
 * @param duration 显示时长
 */
function success(message: string, duration?: number): void {
  addToast('success', message, duration)
}

/**
 * 显示错误消息
 * @param message 消息内容
 * @param duration 显示时长
 */
function error(message: string, duration?: number): void {
  addToast('error', message, duration ?? 5000) // 错误消息默认显示更久
}

/**
 * 显示警告消息
 * @param message 消息内容
 * @param duration 显示时长
 */
function warning(message: string, duration?: number): void {
  addToast('warning', message, duration)
}

/**
 * 显示信息消息
 * @param message 消息内容
 * @param duration 显示时长
 */
function info(message: string, duration?: number): void {
  addToast('info', message, duration)
}

/**
 * 清除所有消息
 */
function clearAll(): void {
  toasts.value = []
}

// ============================================================================
// 导出
// ============================================================================

/**
 * 使用 Toast 通知
 */
export function useToast() {
  return {
    /** 消息队列（只读） */
    toasts: readonly(toasts),
    
    /** 添加消息 */
    addToast,
    
    /** 移除消息 */
    removeToast,
    
    /** 显示成功消息 */
    success,
    
    /** 显示错误消息 */
    error,
    
    /** 显示警告消息 */
    warning,
    
    /** 显示信息消息 */
    info,
    
    /** 清除所有消息 */
    clearAll
  }
}
