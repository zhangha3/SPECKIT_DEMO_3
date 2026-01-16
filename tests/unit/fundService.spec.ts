/**
 * fundService 单元测试
 * 
 * 功能分支: 004-fund-stats-enhancement
 * 任务: T018
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getBalance,
  validateFundPassword,
  hasSufficientBalance,
  deposit,
  withdraw,
  purchase,
  getTransactionHistory,
  FundErrorCodes
} from '@/services/fundService'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} }
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock userService
vi.mock('@/services/userService', () => {
  const userBalances: Record<string, number> = {}
  const users = [
    { username: 'testuser', password: '123456', email: 'test@example.com', country: '中国', balance: 100, fundPassword: 'fund123' },
    { username: 'zhangsan', password: '123456', email: 'zhangsan@example.com', country: '中国', balance: 0, fundPassword: 'fund123' }
  ]
  
  return {
    getUserByUsername: (username: string) => users.find(u => u.username === username),
    updateUserBalance: (username: string, newBalance: number) => {
      userBalances[username] = newBalance
      const user = users.find(u => u.username === username)
      if (user) user.balance = newBalance
    },
    getUserBalance: (username: string) => {
      if (username in userBalances) return userBalances[username]
      const user = users.find(u => u.username === username)
      return user?.balance ?? 0
    }
  }
})

describe('fundService', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('getBalance', () => {
    it('应返回用户余额', () => {
      const balance = getBalance('testuser')
      expect(balance).toBe(100)
    })

    it('用户不存在时应返回0', () => {
      const balance = getBalance('nonexistent')
      expect(balance).toBe(0)
    })
  })

  describe('validateFundPassword', () => {
    it('正确密码应验证通过', () => {
      const result = validateFundPassword('testuser', 'fund123')
      expect(result.valid).toBe(true)
    })

    it('错误密码应验证失败', () => {
      const result = validateFundPassword('testuser', 'wrongpassword')
      expect(result.valid).toBe(false)
      expect(result.error).toBe(FundErrorCodes.INVALID_PASSWORD)
    })

    it('用户不存在应验证失败', () => {
      const result = validateFundPassword('nonexistent', 'fund123')
      expect(result.valid).toBe(false)
      expect(result.error).toBe(FundErrorCodes.USER_NOT_FOUND)
    })
  })

  describe('hasSufficientBalance', () => {
    it('余额充足时应返回true', () => {
      const result = hasSufficientBalance('testuser', 50)
      expect(result).toBe(true)
    })

    it('余额不足时应返回false', () => {
      const result = hasSufficientBalance('testuser', 200)
      expect(result).toBe(false)
    })
  })

  describe('deposit', () => {
    it('应成功充值并增加余额', () => {
      const result = deposit('testuser', 50, 'fund123')
      expect(result.success).toBe(true)
      expect(result.newBalance).toBe(150)
      expect(result.transaction).toBeDefined()
      expect(result.transaction?.type).toBe('deposit')
      expect(result.transaction?.amount).toBe(50)
    })

    it('金额为0或负数应失败', () => {
      const result = deposit('testuser', 0, 'fund123')
      expect(result.success).toBe(false)
      expect(result.error).toBe(FundErrorCodes.INVALID_AMOUNT)
    })

    it('密码错误应失败', () => {
      const result = deposit('testuser', 50, 'wrongpassword')
      expect(result.success).toBe(false)
      expect(result.error).toBe(FundErrorCodes.INVALID_PASSWORD)
    })
  })

  describe('withdraw', () => {
    it('应成功提现并减少余额', () => {
      // 先充值确保有足够余额
      deposit('zhangsan', 200, 'fund123')
      
      const result = withdraw('zhangsan', 50, 'fund123')
      expect(result.success).toBe(true)
      expect(result.newBalance).toBe(150)
      expect(result.transaction?.type).toBe('withdraw')
    })

    it('余额不足应失败', () => {
      const result = withdraw('zhangsan', 500, 'fund123')
      expect(result.success).toBe(false)
      expect(result.error).toBe(FundErrorCodes.INSUFFICIENT_BALANCE)
    })

    it('密码错误应失败', () => {
      const result = withdraw('zhangsan', 50, 'wrongpassword')
      expect(result.success).toBe(false)
      expect(result.error).toBe(FundErrorCodes.INVALID_PASSWORD)
    })
  })

  describe('purchase', () => {
    it('应成功扣款', () => {
      // 先充值
      deposit('testuser', 100, 'fund123')
      
      const result = purchase('testuser', 50, 'ORD-20260101-001', '购买 上海-鹿特丹 航线')
      expect(result.success).toBe(true)
      expect(result.transaction?.type).toBe('purchase')
      expect(result.transaction?.relatedOrderId).toBe('ORD-20260101-001')
    })

    it('余额不足应失败', () => {
      const result = purchase('zhangsan', 9999, 'ORD-20260101-002', '购买航线')
      expect(result.success).toBe(false)
      expect(result.error).toBe(FundErrorCodes.INSUFFICIENT_BALANCE)
    })
  })

  describe('getTransactionHistory', () => {
    it('应返回用户的交易记录', () => {
      // 执行一些交易
      deposit('testuser', 100, 'fund123')
      
      const result = getTransactionHistory({ userId: 'testuser' })
      expect(result.transactions.length).toBeGreaterThan(0)
      expect(result.transactions[0].userId).toBe('testuser')
    })

    it('应支持分页', () => {
      const result = getTransactionHistory({ userId: 'testuser' }, 1, 5)
      expect(result.page).toBe(1)
      expect(result.pageSize).toBe(5)
    })

    it('应按时间倒序排列', () => {
      deposit('testuser', 10, 'fund123')
      deposit('testuser', 20, 'fund123')
      
      const result = getTransactionHistory({ userId: 'testuser' })
      if (result.transactions.length >= 2) {
        const firstTime = new Date(result.transactions[0].createdAt).getTime()
        const secondTime = new Date(result.transactions[1].createdAt).getTime()
        expect(firstTime).toBeGreaterThanOrEqual(secondTime)
      }
    })
  })
})
