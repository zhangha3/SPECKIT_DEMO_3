/**
 * 订单数据服务
 * 
 * 功能分支: 003-user-booking-order
 * 来源: contracts/order-service.ts
 * 
 * 提供订单创建、查询、持久化功能
 */
import type { Order, PaginatedOrderResult, PurchaseResult } from '@/types/order'
import { getScheduleById, decreaseStock, getSchedulePrice } from '@/services/scheduleService'
import { getPortByCode } from '@/services/portService'

// ============================================================================
// 常量
// ============================================================================

/** localStorage 键名 */
const ORDERS_STORAGE_KEY = 'orders'

/** 每页默认数量 */
const DEFAULT_PAGE_SIZE = 10

// ============================================================================
// 内部函数
// ============================================================================

/**
 * 生成订单号
 * 格式: ORD-YYYYMMDD-XXX
 * 
 * @returns string 新订单号
 */
export function generateOrderId(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  
  // 获取当日已有订单数量
  const orders = getAllOrders()
  const todayOrders = orders.filter(o => o.id.includes(`ORD-${dateStr}`))
  const sequence = (todayOrders.length + 1).toString().padStart(3, '0')
  
  return `ORD-${dateStr}-${sequence}`
}

/**
 * 从 localStorage 加载订单数据
 */
function loadOrdersFromStorage(): Order[] {
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored) as Order[]
      if (Array.isArray(data)) {
        return data
      }
    }
  } catch (error) {
    console.error('加载订单数据失败:', error)
  }
  return []
}

/**
 * 保存订单数据到 localStorage
 */
function saveOrdersToStorage(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders))
  } catch (error) {
    console.error('保存订单数据失败:', error)
  }
}

// ============================================================================
// 服务函数
// ============================================================================

/**
 * 获取所有订单
 * 
 * @returns Order[] 订单列表
 */
export function getAllOrders(): Order[] {
  return loadOrdersFromStorage()
}

/**
 * 根据用户名获取订单
 * 
 * @param userId 用户名
 * @returns Order[] 该用户的订单列表（按下单时间倒序）
 */
export function getOrdersByUserId(userId: string): Order[] {
  const orders = getAllOrders()
  return orders
    .filter(o => o.userId === userId)
    .sort((a, b) => new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime())
}

/**
 * 根据订单号获取订单
 * 
 * @param orderId 订单号
 * @param userId 当前用户（用于权限验证）
 * @returns Order | undefined 订单对象，未找到或无权限返回 undefined
 */
export function getOrderById(orderId: string, userId: string): Order | undefined {
  const orders = getAllOrders()
  const order = orders.find(o => o.id === orderId)
  
  // 验证权限：只能查看自己的订单 (FR-021)
  if (order && order.userId !== userId) {
    return undefined
  }
  
  return order
}

/**
 * 分页查询用户订单
 * 
 * @param userId 用户名
 * @param page 页码（从1开始）
 * @param pageSize 每页数量
 * @returns PaginatedOrderResult 分页结果
 */
export function getOrdersByUserIdPaginated(
  userId: string, 
  page: number = 1, 
  pageSize: number = DEFAULT_PAGE_SIZE
): PaginatedOrderResult {
  const allOrders = getOrdersByUserId(userId)
  const total = allOrders.length
  const totalPages = Math.ceil(total / pageSize)
  
  // 确保页码有效
  const validPage = Math.max(1, Math.min(page, totalPages || 1))
  
  // 计算分页
  const startIndex = (validPage - 1) * pageSize
  const orders = allOrders.slice(startIndex, startIndex + pageSize)
  
  return {
    orders,
    total,
    page: validPage,
    pageSize,
    totalPages
  }
}

/**
 * 创建订单
 * 
 * @param scheduleId 船期编号
 * @param userId 用户名
 * @returns PurchaseResult 创建结果
 */
export function createOrder(scheduleId: string, userId: string): PurchaseResult {
  // 获取船期信息
  const schedule = getScheduleById(scheduleId)
  
  if (!schedule) {
    return {
      success: false,
      error: '船期不存在'
    }
  }
  
  // 检查库存
  if ((schedule.stock ?? 0) <= 0) {
    return {
      success: false,
      error: '库存不足，购买失败'
    }
  }
  
  // 扣减库存
  const stockResult = decreaseStock(scheduleId, 1)
  if (!stockResult) {
    return {
      success: false,
      error: '库存扣减失败，请重试'
    }
  }
  
  // 生成订单号
  const orderId = generateOrderId()
  
  // 获取港口完整信息
  const departurePortInfo = getPortByCode(schedule.departurePort)
  const arrivalPortInfo = getPortByCode(schedule.arrivalPort)
  
  // 计算 ETA
  const etdDate = new Date(schedule.etd)
  const etaDate = new Date(etdDate.getTime() + schedule.transitDays * 24 * 60 * 60 * 1000)
  const eta = etaDate.toISOString().slice(0, 10)
  
  // 创建订单（存储完整港口信息）
  const order: Order = {
    id: orderId,
    userId,
    orderTime: new Date().toISOString(),
    scheduleId: schedule.id,
    departurePort: departurePortInfo || { 
      code: schedule.departurePort, 
      name: schedule.departurePort,
      nameCN: schedule.departurePort,
      country: '',
      countryCode: '',
      timezone: ''
    },
    arrivalPort: arrivalPortInfo || { 
      code: schedule.arrivalPort, 
      name: schedule.arrivalPort,
      nameCN: schedule.arrivalPort,
      country: '',
      countryCode: '',
      timezone: ''
    },
    etd: schedule.etd,
    eta,
    transitDays: schedule.transitDays,
    carrier: schedule.carrier,
    vesselName: schedule.vesselName || schedule.carrier,
    status: 'confirmed',
    amount: getSchedulePrice(schedule.id)
  }
  
  // 保存订单
  const orders = getAllOrders()
  orders.push(order)
  saveOrdersToStorage(orders)
  
  return {
    success: true,
    orderId
  }
}

/**
 * 清除所有订单（仅用于测试）
 */
export function clearAllOrders(): void {
  localStorage.removeItem(ORDERS_STORAGE_KEY)
}
