/**
 * 用户服务单元测试
 * 
 * 功能分支: 003-user-booking-order
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { 
  getAllUsers, 
  getUserByUsername, 
  validateCredentials,
  toUserInfo
} from '@/services/userService'

describe('userService', () => {
  describe('getAllUsers', () => {
    it('应该返回5个默认用户', () => {
      const users = getAllUsers()
      expect(users).toHaveLength(5)
    })
    
    it('用户应该来自中国、美国、德国、新加坡、日本', () => {
      const users = getAllUsers()
      const countries = users.map(u => u.country)
      expect(countries).toContain('中国')
      expect(countries).toContain('美国')
      expect(countries).toContain('德国')
      expect(countries).toContain('新加坡')
      expect(countries).toContain('日本')
    })
    
    it('每个用户应该有完整的必填字段', () => {
      const users = getAllUsers()
      users.forEach(user => {
        expect(user.username).toBeTruthy()
        expect(user.password).toBeTruthy()
        expect(user.email).toBeTruthy()
        expect(user.country).toBeTruthy()
      })
    })
  })
  
  describe('getUserByUsername', () => {
    it('应该根据用户名找到用户', () => {
      const user = getUserByUsername('zhangsan')
      expect(user).toBeDefined()
      expect(user?.username).toBe('zhangsan')
      expect(user?.country).toBe('中国')
    })
    
    it('用户名不存在时应该返回 undefined', () => {
      const user = getUserByUsername('nonexistent')
      expect(user).toBeUndefined()
    })
    
    it('用户名区分大小写', () => {
      const user = getUserByUsername('ZHANGSAN')
      expect(user).toBeUndefined()
    })
  })
  
  describe('validateCredentials', () => {
    it('正确的用户名和密码应该返回用户信息', () => {
      const result = validateCredentials('zhangsan', '123456')
      expect(result).not.toBeNull()
      expect(result?.username).toBe('zhangsan')
      expect(result?.email).toBe('zhangsan@example.com')
      expect(result?.country).toBe('中国')
    })
    
    it('返回的用户信息不应包含密码', () => {
      const result = validateCredentials('zhangsan', '123456')
      expect(result).not.toBeNull()
      expect(result).not.toHaveProperty('password')
    })
    
    it('用户名不存在时应该返回 null', () => {
      const result = validateCredentials('nonexistent', '123456')
      expect(result).toBeNull()
    })
    
    it('密码错误时应该返回 null', () => {
      const result = validateCredentials('zhangsan', 'wrongpassword')
      expect(result).toBeNull()
    })
    
    it('所有默认用户都应该能用密码 123456 登录', () => {
      const usernames = ['zhangsan', 'john', 'hans', 'lim', 'tanaka']
      usernames.forEach(username => {
        const result = validateCredentials(username, '123456')
        expect(result).not.toBeNull()
        expect(result?.username).toBe(username)
      })
    })
  })
  
  describe('toUserInfo', () => {
    it('应该正确转换用户对象为用户信息', () => {
      const user = {
        username: 'test',
        password: 'secret',
        email: 'test@example.com',
        country: '中国',
        balance: 0,
        fundPassword: 'fund123'
      }
      
      const userInfo = toUserInfo(user)
      
      expect(userInfo.username).toBe('test')
      expect(userInfo.email).toBe('test@example.com')
      expect(userInfo.country).toBe('中国')
      expect(userInfo).not.toHaveProperty('password')
    })
  })
})
