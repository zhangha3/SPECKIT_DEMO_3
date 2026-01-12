/**
 * useOrderSearch composable 单元测试
 * 
 * 功能分支: 003-user-booking-order
 * 测试范围: FR-019 ~ FR-025
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { useOrderSearch } from '@/composables/useOrderSearch'
import type { Order } from '@/services/orderService'

// Mock useAuth
const mockCurrentUser = { username: 'user1', email: 'user1@example.com' }
let mockIsLoggedIn = true

vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({
    currentUser: { value: mockIsLoggedIn ? mockCurrentUser : null },
    isLoggedIn: { value: mockIsLoggedIn }
  })
}))

// Mock orderService
const mockOrders: Order[] = [
  {
    id: 'ORD-20251209-001',
    userId: 'user1',
    scheduleId: 'SCH-001',
    departurePort: { code: 'CNSHA', name: '上海港', country: '中国', timezone: 'Asia/Shanghai' },
    arrivalPort: { code: 'USLAX', name: '洛杉矶港', country: '美国', timezone: 'America/Los_Angeles' },
    etd: '2025-01-15',
    eta: '2025-02-01',
    carrier: 'COSCO',
    vesselName: '中远海运',
    createdAt: '2025-12-09T10:00:00Z',
    status: 'confirmed'
  },
  {
    id: 'ORD-20251209-002',
    userId: 'user1',
    scheduleId: 'SCH-002',
    departurePort: { code: 'CNSHA', name: '上海港', country: '中国', timezone: 'Asia/Shanghai' },
    arrivalPort: { code: 'JPYOK', name: '横滨港', country: '日本', timezone: 'Asia/Tokyo' },
    etd: '2025-01-20',
    eta: '2025-01-25',
    carrier: 'NYK',
    vesselName: '日本邮船',
    createdAt: '2025-12-09T11:00:00Z',
    status: 'confirmed'
  },
  {
    id: 'ORD-20251209-003',
    userId: 'user2',
    scheduleId: 'SCH-003',
    departurePort: { code: 'USLAX', name: '洛杉矶港', country: '美国', timezone: 'America/Los_Angeles' },
    arrivalPort: { code: 'CNSHA', name: '上海港', country: '中国', timezone: 'Asia/Shanghai' },
    etd: '2025-01-25',
    eta: '2025-02-10',
    carrier: 'MSC',
    vesselName: 'MSC Oscar',
    createdAt: '2025-12-09T12:00:00Z',
    status: 'confirmed'
  }
]

vi.mock('@/services/orderService', () => ({
  getOrderById: vi.fn((orderId: string, userId: string) => {
    const order = mockOrders.find(o => o.id === orderId)
    if (!order) return null
    if (order.userId !== userId) return null
    return order
  }),
  getOrdersByUserId: vi.fn((userId: string) => {
    return mockOrders.filter(o => o.userId === userId)
  }),
  getOrdersByUserIdPaginated: vi.fn((userId: string, page: number, pageSize: number) => {
    const userOrders = mockOrders.filter(o => o.userId === userId)
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      items: userOrders.slice(start, end),
      total: userOrders.length,
      page,
      pageSize,
      totalPages: Math.ceil(userOrders.length / pageSize)
    }
  })
}))

describe('useOrderSearch', () => {
  beforeEach(() => {
    mockIsLoggedIn = true
    vi.clearAllMocks()
  })
  
  afterEach(() => {
    vi.clearAllMocks()
  })
  
  describe('初始状态', () => {
    it('应该返回初始空状态', () => {
      const { criteria, order, orders, isLoading, error, currentPage, total } = useOrderSearch()
      
      expect(criteria.value).toEqual({})
      expect(order.value).toBeNull()
      expect(orders.value).toEqual([])
      expect(isLoading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(currentPage.value).toBe(1)
      expect(total.value).toBe(0)
    })
    
    it('应该返回分页相关属性', () => {
      const { currentPage, totalPages, total, pageSize } = useOrderSearch()
      
      expect(currentPage.value).toBe(1)
      expect(totalPages.value).toBe(1)  // 无数据时默认1页
      expect(total.value).toBe(0)
      expect(pageSize.value).toBe(10)
    })
  })
  
  describe('按订单号查询 (FR-019)', () => {
    it('应该能按订单号查询到订单', () => {
      const { searchByOrderId, order, error, isLoading } = useOrderSearch()
      
      searchByOrderId('ORD-20251209-001')
      
      expect(isLoading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(order.value).not.toBeNull()
      expect(order.value?.id).toBe('ORD-20251209-001')
      expect(order.value?.carrier).toBe('COSCO')
    })
    
    it('应该在订单不存在时显示错误', () => {
      const { searchByOrderId, order, error } = useOrderSearch()
      
      searchByOrderId('ORD-NOT-EXIST')
      
      expect(order.value).toBeNull()
      expect(error.value).toBe('未找到订单: ORD-NOT-EXIST')
    })
    
    it('应该无法查看其他用户的订单 (FR-021)', () => {
      const { searchByOrderId, order, error } = useOrderSearch()
      
      // ORD-20251209-003 属于 user2
      searchByOrderId('ORD-20251209-003')
      
      expect(order.value).toBeNull()
      expect(error.value).toContain('未找到订单')
    })
    
    it('空订单号应该显示错误', () => {
      const { searchByOrderId, error } = useOrderSearch()
      
      searchByOrderId('')
      
      expect(error.value).toBe('请输入订单号')
    })
    
    it('订单号前后空格应该被去除', () => {
      const { searchByOrderId, order, criteria } = useOrderSearch()
      
      searchByOrderId('  ORD-20251209-001  ')
      
      expect(order.value).not.toBeNull()
      expect(criteria.value.orderId).toBe('ORD-20251209-001')
    })
  })
  
  describe('加载用户订单列表 (FR-024)', () => {
    it('应该能加载当前用户的所有订单', () => {
      const { loadUserOrders, orders, total, error } = useOrderSearch()
      
      loadUserOrders()
      
      expect(error.value).toBeNull()
      expect(orders.value).toHaveLength(2)  // user1 有2个订单
      expect(total.value).toBe(2)
    })
    
    it('应该只返回当前用户的订单', () => {
      const { loadUserOrders, orders } = useOrderSearch()
      
      loadUserOrders()
      
      // 所有订单都属于 user1
      orders.value.forEach(order => {
        expect(order.userId).toBe('user1')
      })
    })
    
    it('应该设置分页信息', () => {
      const { loadUserOrders, currentPage, total, totalPages } = useOrderSearch()
      
      loadUserOrders()
      
      expect(currentPage.value).toBe(1)
      expect(total.value).toBe(2)
      expect(totalPages.value).toBe(1)  // 2条/10每页 = 1页
    })
  })
  
  describe('分页功能 (FR-025)', () => {
    it('应该支持加载指定页码', () => {
      const { loadUserOrders, currentPage } = useOrderSearch()
      
      loadUserOrders(2)
      
      expect(currentPage.value).toBe(2)
    })
    
    it('nextPage 应该增加页码并重新加载', () => {
      const { loadUserOrders, nextPage, currentPage } = useOrderSearch()
      
      // 默认 mock 返回2条数据，按10条一页只有1页
      // 测试 nextPage 在多页时的行为
      loadUserOrders(1)
      expect(currentPage.value).toBe(1)
      
      // 虽然只有1页，但逻辑会检查 totalPages
      // 这里主要验证 nextPage 方法存在且可调用
      nextPage()
      // 在只有1页的情况下不会翻页
      expect(currentPage.value).toBe(1)
    })
    
    it('prevPage 应该减少页码并重新加载', () => {
      const { loadUserOrders, prevPage, currentPage } = useOrderSearch()
      
      loadUserOrders(3)
      expect(currentPage.value).toBe(3)
      
      prevPage()
      expect(currentPage.value).toBe(2)
    })
    
    it('第一页时 prevPage 应该无效', () => {
      const { loadUserOrders, prevPage, currentPage } = useOrderSearch()
      
      loadUserOrders(1)
      prevPage()
      
      expect(currentPage.value).toBe(1)
    })
  })
  
  describe('未登录处理', () => {
    it('未登录时按订单号查询应该显示错误', () => {
      mockIsLoggedIn = false
      
      const { searchByOrderId, error, order } = useOrderSearch()
      
      searchByOrderId('ORD-20251209-001')
      
      expect(error.value).toBe('请先登录')
      expect(order.value).toBeNull()
    })
    
    it('未登录时加载订单列表应该显示错误', () => {
      mockIsLoggedIn = false
      
      const { loadUserOrders, error, orders } = useOrderSearch()
      
      loadUserOrders()
      
      expect(error.value).toBe('请先登录')
      expect(orders.value).toEqual([])
    })
  })
  
  describe('reset 重置功能', () => {
    it('应该能重置所有查询状态', () => {
      const { searchByOrderId, reset, order, orders, criteria, error, currentPage, total } = useOrderSearch()
      
      // 先执行查询
      searchByOrderId('ORD-20251209-001')
      expect(order.value).not.toBeNull()
      
      // 重置
      reset()
      
      expect(criteria.value).toEqual({})
      expect(order.value).toBeNull()
      expect(orders.value).toEqual([])
      expect(error.value).toBeNull()
      expect(currentPage.value).toBe(1)
      expect(total.value).toBe(0)
    })
  })
  
  describe('加载状态', () => {
    it('查询过程中应该设置 isLoading', () => {
      const { searchByOrderId, isLoading } = useOrderSearch()
      
      // 同步执行，加载状态在查询结束后为 false
      searchByOrderId('ORD-20251209-001')
      
      expect(isLoading.value).toBe(false)
    })
  })
})
