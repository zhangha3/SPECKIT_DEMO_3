/**
 * 用户数据服务
 * 
 * 功能分支: 003-user-booking-order
 * 来源: contracts/user-service.ts
 * 
 * 提供用户数据查询和凭据验证功能
 */
import type { User, UserInfo } from '@/types/user'
import usersData from '@/assets/data/users.json'

// ============================================================================
// 私有变量
// ============================================================================

/** 用户数据缓存 */
let usersCache: User[] | null = null

// ============================================================================
// 服务函数
// ============================================================================

/**
 * 获取所有用户
 * @returns 用户列表
 */
export function getAllUsers(): User[] {
  if (!usersCache) {
    usersCache = usersData as User[]
  }
  return usersCache
}

/**
 * 根据用户名查找用户
 * @param username 用户名
 * @returns 用户对象，未找到返回 undefined
 */
export function getUserByUsername(username: string): User | undefined {
  const users = getAllUsers()
  return users.find(u => u.username === username)
}

/**
 * 验证用户凭据
 * @param username 用户名
 * @param password 密码
 * @returns 验证成功返回用户信息（不含密码），失败返回 null
 */
export function validateCredentials(username: string, password: string): UserInfo | null {
  const user = getUserByUsername(username)
  
  if (!user) {
    return null
  }
  
  if (user.password !== password) {
    return null
  }
  
  // 返回用户信息（不含密码）
  return {
    username: user.username,
    email: user.email,
    country: user.country
  }
}

/**
 * 将 User 转换为 UserInfo（移除密码）
 * @param user 用户对象
 * @returns 用户信息（不含密码）
 */
export function toUserInfo(user: User): UserInfo {
  return {
    username: user.username,
    email: user.email,
    country: user.country
  }
}
