/**
 * 用户服务契约
 * 
 * 功能分支: 003-user-booking-order
 * 创建日期: 2026年1月9日
 * 
 * 提供用户数据查询功能
 */

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 用户实体
 */
export interface User {
  /** 用户名（唯一标识） */
  username: string
  
  /** 密码 */
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
// 服务接口
// ============================================================================

/**
 * 用户服务接口
 */
export interface UserService {
  /**
   * 获取所有用户
   * @returns 用户列表
   */
  getAllUsers(): User[]
  
  /**
   * 根据用户名查找用户
   * @param username 用户名
   * @returns 用户对象，未找到返回 undefined
   */
  getUserByUsername(username: string): User | undefined
  
  /**
   * 验证用户凭据
   * @param username 用户名
   * @param password 密码
   * @returns 验证成功返回用户信息，失败返回 null
   */
  validateCredentials(username: string, password: string): UserInfo | null
}

// ============================================================================
// 默认实现签名
// ============================================================================

/**
 * 获取所有用户
 */
export function getAllUsers(): User[] {
  throw new Error('Not implemented')
}

/**
 * 根据用户名查找用户
 */
export function getUserByUsername(username: string): User | undefined {
  throw new Error('Not implemented')
}

/**
 * 验证用户凭据
 */
export function validateCredentials(username: string, password: string): UserInfo | null {
  throw new Error('Not implemented')
}
