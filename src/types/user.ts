/**
 * 用户实体类型定义
 * 
 * 功能分支: 003-user-booking-order
 * 来源: data-model.md, contracts/user-service.ts
 */

// ============================================================================
// 用户核心类型
// ============================================================================

/**
 * 用户实体
 * 表示系统用户，用于登录认证
 */
export interface User {
  /** 用户名（唯一标识），用于登录 */
  username: string
  
  /** 密码，明文存储（仅演示用途） */
  password: string
  
  /** 邮箱地址 */
  email: string
  
  /** 所在国家 */
  country: string
}

/**
 * 用户信息（不含密码，用于展示）
 */
export interface UserInfo {
  /** 用户名 */
  username: string
  
  /** 邮箱地址 */
  email: string
  
  /** 所在国家 */
  country: string
}

// ============================================================================
// 认证相关类型
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
