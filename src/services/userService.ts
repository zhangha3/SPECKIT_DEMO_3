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

// ============================================================================
// 资金相关服务 (004-fund-stats-enhancement 新增)
// ============================================================================

/** localStorage 存储键（用于持久化用户余额变更） */
const USER_BALANCE_STORAGE_KEY = 'userBalances'

/**
 * 从 localStorage 获取用户余额缓存
 */
function loadUserBalances(): Record<string, number> {
  const stored = localStorage.getItem(USER_BALANCE_STORAGE_KEY)
  if (!stored) {
    return {}
  }
  try {
    return JSON.parse(stored) as Record<string, number>
  } catch {
    return {}
  }
}

/**
 * 保存用户余额到 localStorage
 */
function saveUserBalances(balances: Record<string, number>): void {
  localStorage.setItem(USER_BALANCE_STORAGE_KEY, JSON.stringify(balances))
}

/**
 * 获取用户实际余额（优先从 localStorage 读取）
 * @param username 用户名
 * @returns 余额
 */
export function getUserBalance(username: string): number {
  const balances = loadUserBalances()
  if (username in balances) {
    return balances[username]
  }
  
  // 从原始数据获取
  const user = getUserByUsername(username)
  return user?.balance ?? 0
}

/**
 * 更新用户余额
 * @param username 用户名
 * @param newBalance 新余额
 */
export function updateUserBalance(username: string, newBalance: number): void {
  const balances = loadUserBalances()
  balances[username] = newBalance
  saveUserBalances(balances)
  
  // 更新内存缓存
  if (usersCache) {
    const user = usersCache.find(u => u.username === username)
    if (user) {
      user.balance = newBalance
    }
  }
}

/**
 * 验证资金密码
 * @param username 用户名
 * @param fundPassword 资金密码
 * @returns 验证是否通过
 */
export function validateFundPassword(username: string, fundPassword: string): boolean {
  const user = getUserByUsername(username)
  if (!user) {
    return false
  }
  return user.fundPassword === fundPassword
}
