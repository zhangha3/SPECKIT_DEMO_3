/**
 * orderService 单元测试
 * 
 * 功能分支: 003-user-booking-order
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  getAllOrders,
  getOrdersByUserId,
  getOrderById,
  getOrdersByUserIdPaginated,
  createOrder,
  generateOrderId,
  clearAllOrders
} from '@/services/orderService'

// Mock portService
const mockPorts: Record<string, any> = {
  'CNSHA': { code: 'CNSHA', name: 'Shanghai', nameCN: '上海', country: 'China', timezone: 'Asia/Shanghai' },
  'DEHAM': { code: 'DEHAM', name: 'Hamburg', nameCN: '汉堡', country: 'Germany', timezone: 'Europe/Berlin' }
}

vi.mock('@/services/portService', () => ({
  getPortByCode: vi.fn((code: string) => mockPorts[code] || null)
}))

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('orderService', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    vi.clearAllMocks()
  })
  
  describe('generateOrderId', () => {
    it('应该生成正确格式的订单号 (ORD-YYYYMMDD-XXX)', () => {
      const orderId = generateOrderId()
      
      expect(orderId).toMatch(/^ORD-\d{8}-\d{3}$/)
    })
    
    it('第一个订单应该是 001', () => {
      const orderId = generateOrderId()
      
      expect(orderId).toMatch(/-001$/)
    })
  })
  
  describe('getAllOrders', () => {
    it('初始时应该返回空数组', () => {
      const orders = getAllOrders()
      expect(orders).toEqual([])
    })
  })
  
  describe('createOrder', () => {
    it('应该成功创建订单', () => {
      // 先初始化船期数据
      const schedulesData = [
        {
          id: 'SCH-20260115-001',
          departurePort: 'CNSHA',
          arrivalPort: 'DEHAM',
          etd: '2026-01-15',
          transitDays: 28,
          carrier: 'COSCO',
          stock: 99
        }
      ]
      mockLocalStorage.setItem('schedules', JSON.stringify(schedulesData))
      
      const result = createOrder('SCH-20260115-001', 'zhangsan')
      
      expect(result.success).toBe(true)
      expect(result.orderId).toBeDefined()
      expect(result.orderId).toMatch(/^ORD-\d{8}-\d{3}$/)
    })
    
    it('船期不存在时应该返回失败', () => {
      const result = createOrder('NON-EXISTENT', 'zhangsan')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('船期不存在')
    })
    
    it('库存为0时应该返回失败', () => {
      const schedulesData = [
        {
          id: 'SCH-NOSTOCK',
          departurePort: 'CNSHA',
          arrivalPort: 'DEHAM',
          etd: '2026-01-15',
          transitDays: 28,
          carrier: 'COSCO',
          stock: 0
        }
      ]
      mockLocalStorage.setItem('schedules', JSON.stringify(schedulesData))
      
      const result = createOrder('SCH-NOSTOCK', 'zhangsan')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('库存不足，购买失败')
    })
    
    it('创建订单后应该扣减库存', () => {
      const schedulesData = [
        {
          id: 'SCH-TEST',
          departurePort: 'CNSHA',
          arrivalPort: 'DEHAM',
          etd: '2026-01-15',
          transitDays: 28,
          carrier: 'COSCO',
          stock: 5
        }
      ]
      mockLocalStorage.setItem('schedules', JSON.stringify(schedulesData))
      
      createOrder('SCH-TEST', 'zhangsan')
      
      // 检查库存是否扣减
      const updatedSchedules = JSON.parse(mockLocalStorage.getItem('schedules') || '[]')
      expect(updatedSchedules[0].stock).toBe(4)
    })
    
    it('订单应该包含冗余的船期信息', () => {
      const schedulesData = [
        {
          id: 'SCH-REDUNDANT',
          departurePort: 'CNSHA',
          arrivalPort: 'DEHAM',
          etd: '2026-01-15',
          transitDays: 28,
          carrier: 'COSCO',
          stock: 99
        }
      ]
      mockLocalStorage.setItem('schedules', JSON.stringify(schedulesData))
      
      createOrder('SCH-REDUNDANT', 'zhangsan')
      
      const orders = getAllOrders()
      expect(orders[0].departurePort.code).toBe('CNSHA')
      expect(orders[0].arrivalPort.code).toBe('DEHAM')
      expect(orders[0].etd).toBe('2026-01-15')
      expect(orders[0].transitDays).toBe(28)
      expect(orders[0].carrier).toBe('COSCO')
    })
  })
  
  describe('getOrdersByUserId', () => {
    beforeEach(() => {
      const orders = [
        { id: 'ORD-001', userId: 'zhangsan', orderTime: '2026-01-10T10:00:00Z', scheduleId: 'S1', departurePort: 'A', arrivalPort: 'B', etd: '2026-01-15', transitDays: 10, carrier: 'C' },
        { id: 'ORD-002', userId: 'john', orderTime: '2026-01-11T10:00:00Z', scheduleId: 'S2', departurePort: 'A', arrivalPort: 'B', etd: '2026-01-16', transitDays: 10, carrier: 'C' },
        { id: 'ORD-003', userId: 'zhangsan', orderTime: '2026-01-12T10:00:00Z', scheduleId: 'S3', departurePort: 'A', arrivalPort: 'B', etd: '2026-01-17', transitDays: 10, carrier: 'C' }
      ]
      mockLocalStorage.setItem('orders', JSON.stringify(orders))
    })
    
    it('应该只返回指定用户的订单', () => {
      const orders = getOrdersByUserId('zhangsan')
      
      expect(orders.length).toBe(2)
      orders.forEach(o => expect(o.userId).toBe('zhangsan'))
    })
    
    it('应该按下单时间倒序排列 (FR-024)', () => {
      const orders = getOrdersByUserId('zhangsan')
      
      expect(orders[0].id).toBe('ORD-003') // 最新的在前
      expect(orders[1].id).toBe('ORD-001')
    })
    
    it('用户没有订单时应该返回空数组', () => {
      const orders = getOrdersByUserId('nonexistent')
      
      expect(orders).toEqual([])
    })
  })
  
  describe('getOrderById', () => {
    beforeEach(() => {
      const orders = [
        { id: 'ORD-001', userId: 'zhangsan', orderTime: '2026-01-10T10:00:00Z', scheduleId: 'S1', departurePort: 'A', arrivalPort: 'B', etd: '2026-01-15', transitDays: 10, carrier: 'C' },
        { id: 'ORD-002', userId: 'john', orderTime: '2026-01-11T10:00:00Z', scheduleId: 'S2', departurePort: 'A', arrivalPort: 'B', etd: '2026-01-16', transitDays: 10, carrier: 'C' }
      ]
      mockLocalStorage.setItem('orders', JSON.stringify(orders))
    })
    
    it('应该返回指定订单号的订单', () => {
      const order = getOrderById('ORD-001', 'zhangsan')
      
      expect(order).toBeDefined()
      expect(order?.id).toBe('ORD-001')
    })
    
    it('订单不存在时应该返回 undefined', () => {
      const order = getOrderById('NON-EXISTENT', 'zhangsan')
      
      expect(order).toBeUndefined()
    })
    
    it('查询其他用户的订单应该返回 undefined (FR-021)', () => {
      const order = getOrderById('ORD-002', 'zhangsan') // john 的订单
      
      expect(order).toBeUndefined()
    })
  })
  
  describe('getOrdersByUserIdPaginated', () => {
    beforeEach(() => {
      // 创建 25 个订单用于分页测试
      const orders = Array.from({ length: 25 }, (_, i) => ({
        id: `ORD-${String(i + 1).padStart(3, '0')}`,
        userId: 'zhangsan',
        orderTime: new Date(2026, 0, 1 + i).toISOString(),
        scheduleId: `S${i}`,
        departurePort: 'A',
        arrivalPort: 'B',
        etd: '2026-01-15',
        transitDays: 10,
        carrier: 'C'
      }))
      mockLocalStorage.setItem('orders', JSON.stringify(orders))
    })
    
    it('默认每页10条 (FR-025)', () => {
      const result = getOrdersByUserIdPaginated('zhangsan', 1)
      
      expect(result.orders.length).toBe(10)
      expect(result.pageSize).toBe(10)
    })
    
    it('应该返回正确的总数和总页数', () => {
      const result = getOrdersByUserIdPaginated('zhangsan', 1)
      
      expect(result.total).toBe(25)
      expect(result.totalPages).toBe(3)
    })
    
    it('应该返回正确的分页数据', () => {
      const page1 = getOrdersByUserIdPaginated('zhangsan', 1)
      const page2 = getOrdersByUserIdPaginated('zhangsan', 2)
      const page3 = getOrdersByUserIdPaginated('zhangsan', 3)
      
      expect(page1.orders.length).toBe(10)
      expect(page2.orders.length).toBe(10)
      expect(page3.orders.length).toBe(5)
    })
    
    it('页码超出范围时应该返回最后一页', () => {
      const result = getOrdersByUserIdPaginated('zhangsan', 100)
      
      expect(result.page).toBe(3)
      expect(result.orders.length).toBe(5)
    })
  })
  
  describe('clearAllOrders', () => {
    it('应该清除所有订单', () => {
      mockLocalStorage.setItem('orders', JSON.stringify([{ id: 'test' }]))
      
      clearAllOrders()
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('orders')
    })
  })
})
