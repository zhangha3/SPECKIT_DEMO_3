/**
 * 认证服务契约
 * 
 * 功能分支: 003-user-booking-order
 * 创建日期: 2026年1月9日
 * 
 * 提供用户登录、登出、会话管理功能
 */

import type { UserInfo } from './user-service'

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 登录结果
 */
export interface LoginResult {
  /** 是否成功 */
  success: boolean
  
  /** 用户信息（成功时） */
  user?: UserInfo
  
  /** 错误信息（失败时） */
  error?: string
}

/**
 * 认证状态
 */
export interface AuthState {
  /** 是否已登录 */
  isLoggedIn: boolean
  
  /** 当前用户信息 */
  currentUser: UserInfo | null
}

// ============================================================================
// 服务接口
// ============================================================================

/**
 * 认证服务接口
 */
export interface AuthService {
  /**
   * 用户登录
   * @param username 用户名
   * @param password 密码
   * @returns 登录结果
   */
  login(username: string, password: string): LoginResult
  
  /**
   * 用户登出
   */
  logout(): void
  
  /**
   * 获取当前认证状态
   * @returns 认证状态
   */
  getAuthState(): AuthState
  
  /**
   * 恢复会话（从 sessionStorage）
   * @returns 是否成功恢复
   */
  restoreSession(): boolean
  
  /**
   * 检查是否已登录
   * @returns 是否已登录
   */
  isLoggedIn(): boolean
  
  /**
   * 获取当前用户
   * @returns 当前用户信息，未登录返回 null
   */
  getCurrentUser(): UserInfo | null
}

// ============================================================================
// Composable 接口 (Vue 3)
// ============================================================================

/**
 * useAuth Composable 返回类型
 */
export interface UseAuthReturn {
  /** 当前用户（响应式） */
  currentUser: Readonly<import('vue').Ref<UserInfo | null>>
  
  /** 是否已登录（响应式计算属性） */
  isLoggedIn: import('vue').ComputedRef<boolean>
  
  /** 登录 */
  login: (username: string, password: string) => LoginResult
  
  /** 登出 */
  logout: () => void
  
  /** 恢复会话 */
  restoreSession: () => boolean
}

// ============================================================================
// 默认实现签名
// ============================================================================

/**
 * 用户登录
 */
export function login(username: string, password: string): LoginResult {
  throw new Error('Not implemented')
}

/**
 * 用户登出
 */
export function logout(): void {
  throw new Error('Not implemented')
}

/**
 * 恢复会话
 */
export function restoreSession(): boolean {
  throw new Error('Not implemented')
}

/**
 * 检查是否已登录
 */
export function isLoggedIn(): boolean {
  throw new Error('Not implemented')
}

/**
 * 获取当前用户
 */
export function getCurrentUser(): UserInfo | null {
  throw new Error('Not implemented')
}
