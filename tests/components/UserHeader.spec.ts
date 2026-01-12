/**
 * UserHeader 组件测试
 * 
 * 功能分支: 003-user-booking-order
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import UserHeader from '@/components/UserHeader.vue'
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

describe('UserHeader', () => {
  beforeEach(() => {
    mockSessionStorage.clear()
    vi.clearAllMocks()
    // 先登出再登录，确保状态干净
    const { logout, login } = useAuth()
    logout()
    login('zhangsan', '123456')
  })
  
  afterEach(() => {
    const { logout } = useAuth()
    logout()
  })
  
  it('应该显示当前登录用户名 (FR-003)', () => {
    const wrapper = mount(UserHeader)
    
    expect(wrapper.find('.username').text()).toBe('zhangsan')
  })
  
  it('应该显示用户所在国家', () => {
    const wrapper = mount(UserHeader)
    
    expect(wrapper.find('.user-country').text()).toBe('(中国)')
  })
  
  it('应该显示登出按钮 (FR-003)', () => {
    const wrapper = mount(UserHeader)
    
    const logoutButton = wrapper.find('.logout-button')
    expect(logoutButton.exists()).toBe(true)
    expect(logoutButton.text()).toBe('登出')
  })
  
  it('点击登出按钮应该触发 logout 事件 (FR-004)', async () => {
    const wrapper = mount(UserHeader)
    
    await wrapper.find('.logout-button').trigger('click')
    
    const emitted = wrapper.emitted('logout')
    expect(emitted).toBeTruthy()
    expect(emitted).toHaveLength(1)
  })
  
  it('点击登出按钮应该清除登录状态 (FR-004)', async () => {
    const wrapper = mount(UserHeader)
    const { isLoggedIn } = useAuth()
    
    expect(isLoggedIn.value).toBe(true)
    
    await wrapper.find('.logout-button').trigger('click')
    
    expect(isLoggedIn.value).toBe(false)
  })
  
  it('点击登出按钮应该清除 sessionStorage (FR-004)', async () => {
    const wrapper = mount(UserHeader)
    
    await wrapper.find('.logout-button').trigger('click')
    
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('currentUser')
  })
  
  describe('不同用户显示', () => {
    const users = [
      { username: 'john', country: '美国' },
      { username: 'hans', country: '德国' },
      { username: 'lim', country: '新加坡' },
      { username: 'tanaka', country: '日本' }
    ]
    
    users.forEach(user => {
      it(`应该正确显示 ${user.username} 的信息`, () => {
        const { logout, login } = useAuth()
        logout()
        login(user.username, '123456')
        
        const wrapper = mount(UserHeader)
        
        expect(wrapper.find('.username').text()).toBe(user.username)
        expect(wrapper.find('.user-country').text()).toBe(`(${user.country})`)
      })
    })
  })
})
