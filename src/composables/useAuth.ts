/**
 * 认证状态管理 Composable
 * 
 * 功能分支: 003-user-booking-order
 * 来源: contracts/auth-service.ts
 * 
 * 提供用户登录、登出、会话管理功能
 */
import { ref, computed, readonly } from 'vue'
import type { UserInfo, LoginResult, AuthState } from '@/types/user'
import { validateCredentials } from '@/services/userService'

// ============================================================================
// 常量
// ============================================================================

/** sessionStorage 键名 */
const SESSION_KEY = 'currentUser'

// ============================================================================
// 响应式状态（模块级别单例）
// ============================================================================

/** 当前用户信息 */
const currentUser = ref<UserInfo | null>(null)

/** 是否已登录 */
const isLoggedIn = computed(() => currentUser.value !== null)

// ============================================================================
// 内部函数
// ============================================================================

/**
 * 从 sessionStorage 恢复会话
 */
function restoreFromStorage(): boolean {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) {
      const user = JSON.parse(stored) as UserInfo
      if (user && user.username) {
        currentUser.value = user
        return true
      }
    }
  } catch (error) {
    console.error('恢复会话失败:', error)
    sessionStorage.removeItem(SESSION_KEY)
  }
  return false
}

/**
 * 保存会话到 sessionStorage
 */
function saveToStorage(user: UserInfo): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } catch (error) {
    console.error('保存会话失败:', error)
  }
}

/**
 * 清除 sessionStorage 中的会话
 */
function clearStorage(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

// ============================================================================
// Composable 导出
// ============================================================================

/**
 * 认证状态管理 Composable
 * 
 * @example
 * ```ts
 * const { currentUser, isLoggedIn, login, logout } = useAuth()
 * 
 * // 登录
 * const result = login('zhangsan', '123456')
 * if (result.success) {
 *   console.log('登录成功', result.user)
 * }
 * 
 * // 登出
 * logout()
 * ```
 */
export function useAuth() {
  /**
   * 用户登录
   * @param username 用户名
   * @param password 密码
   * @returns 登录结果
   */
  function login(username: string, password: string): LoginResult {
    // 验证输入
    if (!username || !password) {
      return {
        success: false,
        error: '用户名和密码不能为空'
      }
    }
    
    // 验证凭据
    const userInfo = validateCredentials(username, password)
    
    if (!userInfo) {
      return {
        success: false,
        error: '用户名或密码错误'
      }
    }
    
    // 设置登录状态
    currentUser.value = userInfo
    saveToStorage(userInfo)
    
    return {
      success: true,
      user: userInfo
    }
  }
  
  /**
   * 用户登出
   */
  function logout(): void {
    currentUser.value = null
    clearStorage()
  }
  
  /**
   * 获取当前认证状态
   */
  function getAuthState(): AuthState {
    return {
      isLoggedIn: isLoggedIn.value,
      currentUser: currentUser.value
    }
  }
  
  /**
   * 恢复会话（从 sessionStorage）
   * @returns 是否成功恢复
   */
  function restoreSession(): boolean {
    return restoreFromStorage()
  }
  
  /**
   * 获取当前用户
   * @returns 当前用户信息，未登录返回 null
   */
  function getCurrentUser(): UserInfo | null {
    return currentUser.value
  }
  
  return {
    // 响应式状态
    currentUser: readonly(currentUser),
    isLoggedIn,
    
    // 方法
    login,
    logout,
    getAuthState,
    restoreSession,
    getCurrentUser
  }
}

// 导出类型
export type UseAuthReturn = ReturnType<typeof useAuth>
