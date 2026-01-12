/**
 * useAuth Composable 单元测试
 * 
 * 功能分支: 003-user-booking-order
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useAuth } from '@/composables/useAuth'

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} })
  }
})()

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
})

describe('useAuth', () => {
  beforeEach(() => {
    mockSessionStorage.clear()
    vi.clearAllMocks()
    // 重置认证状态
    const { logout } = useAuth()
    logout()
  })
  
  afterEach(() => {
    const { logout } = useAuth()
    logout()
  })
  
  describe('初始状态', () => {
    it('初始时应该未登录', () => {
      const { isLoggedIn, currentUser } = useAuth()
      expect(isLoggedIn.value).toBe(false)
      expect(currentUser.value).toBeNull()
    })
  })
  
  describe('login', () => {
    it('正确的用户名和密码应该登录成功', () => {
      const { login, isLoggedIn, currentUser } = useAuth()
      
      const result = login('zhangsan', '123456')
      
      expect(result.success).toBe(true)
      expect(result.user).toBeDefined()
      expect(result.user?.username).toBe('zhangsan')
      expect(isLoggedIn.value).toBe(true)
      expect(currentUser.value?.username).toBe('zhangsan')
    })
    
    it('登录成功后应该保存到 sessionStorage', () => {
      const { login } = useAuth()
      
      login('zhangsan', '123456')
      
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        'currentUser',
        expect.stringContaining('zhangsan')
      )
    })
    
    it('用户名错误时应该登录失败', () => {
      const { login, isLoggedIn } = useAuth()
      
      const result = login('nonexistent', '123456')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户名或密码错误')
      expect(isLoggedIn.value).toBe(false)
    })
    
    it('密码错误时应该登录失败', () => {
      const { login, isLoggedIn } = useAuth()
      
      const result = login('zhangsan', 'wrongpassword')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户名或密码错误')
      expect(isLoggedIn.value).toBe(false)
    })
    
    it('用户名为空时应该登录失败', () => {
      const { login } = useAuth()
      
      const result = login('', '123456')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户名和密码不能为空')
    })
    
    it('密码为空时应该登录失败', () => {
      const { login } = useAuth()
      
      const result = login('zhangsan', '')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('用户名和密码不能为空')
    })
  })
  
  describe('logout', () => {
    it('登出后应该清除登录状态', () => {
      const { login, logout, isLoggedIn, currentUser } = useAuth()
      
      login('zhangsan', '123456')
      expect(isLoggedIn.value).toBe(true)
      
      logout()
      
      expect(isLoggedIn.value).toBe(false)
      expect(currentUser.value).toBeNull()
    })
    
    it('登出后应该清除 sessionStorage', () => {
      const { login, logout } = useAuth()
      
      login('zhangsan', '123456')
      logout()
      
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('currentUser')
    })
  })
  
  describe('getAuthState', () => {
    it('未登录时应该返回正确的状态', () => {
      const { getAuthState } = useAuth()
      
      const state = getAuthState()
      
      expect(state.isLoggedIn).toBe(false)
      expect(state.currentUser).toBeNull()
    })
    
    it('登录后应该返回正确的状态', () => {
      const { login, getAuthState } = useAuth()
      
      login('zhangsan', '123456')
      const state = getAuthState()
      
      expect(state.isLoggedIn).toBe(true)
      expect(state.currentUser?.username).toBe('zhangsan')
    })
  })
  
  describe('getCurrentUser', () => {
    it('未登录时应该返回 null', () => {
      const { getCurrentUser } = useAuth()
      expect(getCurrentUser()).toBeNull()
    })
    
    it('登录后应该返回当前用户', () => {
      const { login, getCurrentUser } = useAuth()
      
      login('john', '123456')
      
      const user = getCurrentUser()
      expect(user?.username).toBe('john')
      expect(user?.country).toBe('美国')
    })
  })
  
  describe('restoreSession', () => {
    it('有效会话应该成功恢复', () => {
      const userInfo = { username: 'zhangsan', email: 'zhangsan@example.com', country: '中国' }
      mockSessionStorage.getItem.mockReturnValueOnce(JSON.stringify(userInfo))
      
      const { restoreSession, isLoggedIn, currentUser } = useAuth()
      
      const result = restoreSession()
      
      expect(result).toBe(true)
      expect(isLoggedIn.value).toBe(true)
      expect(currentUser.value?.username).toBe('zhangsan')
    })
    
    it('无会话时应该恢复失败', () => {
      mockSessionStorage.getItem.mockReturnValueOnce(null)
      
      const { restoreSession, isLoggedIn } = useAuth()
      
      const result = restoreSession()
      
      expect(result).toBe(false)
      expect(isLoggedIn.value).toBe(false)
    })
    
    it('无效会话数据应该恢复失败', () => {
      mockSessionStorage.getItem.mockReturnValueOnce('invalid json')
      
      const { restoreSession, isLoggedIn } = useAuth()
      
      const result = restoreSession()
      
      expect(result).toBe(false)
      expect(isLoggedIn.value).toBe(false)
    })
  })
  
  describe('状态共享', () => {
    it('多次调用 useAuth 应该共享同一状态', () => {
      const auth1 = useAuth()
      const auth2 = useAuth()
      
      auth1.login('zhangsan', '123456')
      
      expect(auth2.isLoggedIn.value).toBe(true)
      expect(auth2.currentUser.value?.username).toBe('zhangsan')
    })
  })
})
