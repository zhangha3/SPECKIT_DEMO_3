/**
 * LoginForm 组件测试
 * 
 * 功能分支: 003-user-booking-order
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import LoginForm from '@/components/LoginForm.vue'
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

describe('LoginForm', () => {
  beforeEach(() => {
    mockSessionStorage.clear()
    vi.clearAllMocks()
    const { logout } = useAuth()
    logout()
  })
  
  afterEach(() => {
    const { logout } = useAuth()
    logout()
  })
  
  it('应该渲染登录表单', () => {
    const wrapper = mount(LoginForm)
    
    expect(wrapper.find('.login-title').text()).toBe('用户登录')
    expect(wrapper.find('#username').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })
  
  it('用户名输入框应该有最大长度限制', () => {
    const wrapper = mount(LoginForm)
    
    const usernameInput = wrapper.find('#username')
    expect(usernameInput.attributes('maxlength')).toBe('30')
  })
  
  it('密码输入框应该有最大长度限制', () => {
    const wrapper = mount(LoginForm)
    
    const passwordInput = wrapper.find('#password')
    expect(passwordInput.attributes('maxlength')).toBe('30')
  })
  
  it('密码输入框应该是密码类型', () => {
    const wrapper = mount(LoginForm)
    
    const passwordInput = wrapper.find('#password')
    expect(passwordInput.attributes('type')).toBe('password')
  })
  
  describe('表单验证', () => {
    it('用户名为空时应该显示错误提示', async () => {
      const wrapper = mount(LoginForm)
      
      await wrapper.find('form').trigger('submit')
      
      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.find('.error-message').text()).toBe('请输入用户名')
    })
    
    it('密码为空时应该显示错误提示', async () => {
      const wrapper = mount(LoginForm)
      
      await wrapper.find('#username').setValue('zhangsan')
      await wrapper.find('form').trigger('submit')
      
      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.find('.error-message').text()).toBe('请输入密码')
    })
  })
  
  describe('登录功能', () => {
    it('正确的用户名和密码应该登录成功并触发 success 事件', async () => {
      const wrapper = mount(LoginForm)
      
      await wrapper.find('#username').setValue('zhangsan')
      await wrapper.find('#password').setValue('123456')
      await wrapper.find('form').trigger('submit')
      
      const emitted = wrapper.emitted('success')
      expect(emitted).toBeTruthy()
      expect(emitted![0]).toEqual(['zhangsan'])
    })
    
    it('错误的用户名或密码应该显示错误提示', async () => {
      const wrapper = mount(LoginForm)
      
      await wrapper.find('#username').setValue('zhangsan')
      await wrapper.find('#password').setValue('wrongpassword')
      await wrapper.find('form').trigger('submit')
      
      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.find('.error-message').text()).toBe('用户名或密码错误')
      expect(wrapper.emitted('success')).toBeFalsy()
    })
    
    it('不存在的用户名应该显示错误提示', async () => {
      const wrapper = mount(LoginForm)
      
      await wrapper.find('#username').setValue('nonexistent')
      await wrapper.find('#password').setValue('123456')
      await wrapper.find('form').trigger('submit')
      
      expect(wrapper.find('.error-message').exists()).toBe(true)
      expect(wrapper.find('.error-message').text()).toBe('用户名或密码错误')
    })
  })
  
  describe('错误提示清除', () => {
    it('修改用户名时应该清除错误提示 (FR-028)', async () => {
      const wrapper = mount(LoginForm)
      
      // 触发错误
      await wrapper.find('form').trigger('submit')
      expect(wrapper.find('.error-message').exists()).toBe(true)
      
      // 修改用户名
      await wrapper.find('#username').setValue('z')
      
      expect(wrapper.find('.error-message').exists()).toBe(false)
    })
    
    it('修改密码时应该清除错误提示 (FR-028)', async () => {
      const wrapper = mount(LoginForm)
      
      // 触发错误
      await wrapper.find('#username').setValue('zhangsan')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.find('.error-message').exists()).toBe(true)
      
      // 修改密码
      await wrapper.find('#password').setValue('1')
      
      expect(wrapper.find('.error-message').exists()).toBe(false)
    })
  })
  
  describe('所有默认用户登录', () => {
    const defaultUsers = [
      { username: 'zhangsan', country: '中国' },
      { username: 'john', country: '美国' },
      { username: 'hans', country: '德国' },
      { username: 'lim', country: '新加坡' },
      { username: 'tanaka', country: '日本' }
    ]
    
    defaultUsers.forEach(user => {
      it(`${user.username} (${user.country}) 应该能够登录成功`, async () => {
        const { logout } = useAuth()
        logout()
        
        const wrapper = mount(LoginForm)
        
        await wrapper.find('#username').setValue(user.username)
        await wrapper.find('#password').setValue('123456')
        await wrapper.find('form').trigger('submit')
        
        const emitted = wrapper.emitted('success')
        expect(emitted).toBeTruthy()
        expect(emitted![0]).toEqual([user.username])
      })
    })
  })
})
