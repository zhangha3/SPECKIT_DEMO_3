/**
 * 订单实体类型定义
 * 
 * 功能分支: 003-user-booking-order
 * 来源: data-model.md, contracts/order-service.ts
 */

import type { Port } from '@/types/port'

// ============================================================================
// 订单核心类型
// ============================================================================

/**
 * 订单状态
 */
export type OrderStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'

/**
 * 订单实体
 * 表示用户购买舱位的订单记录
 */
export interface Order {
  /** 订单号 (格式: ORD-YYYYMMDD-XXX) */
  id: string
  
  /** 下单用户的用户名 */
  userId: string
  
  /** 下单时间 (ISO 8601 格式) */
  orderTime: string
  
  /** 关联的船期编号 */
  scheduleId: string
  
  /** 起运港 (完整港口信息) */
  departurePort: Port
  
  /** 目的港 (完整港口信息) */
  arrivalPort: Port
  
  /** 预计发运时间 */
  etd: string
  
  /** 预计到港时间 */
  eta: string
  
  /** 运输耗时 (天数) */
  transitDays: number
  
  /** 承运公司 */
  carrier: string
  
  /** 船名 */
  vesselName: string
  
  /** 订单状态 */
  status: OrderStatus
  
  /** 订单金额（CNY）(004-fund-stats-enhancement 新增) */
  amount: number
}

// ============================================================================
// 订单查询相关类型
// ============================================================================

/**
 * 订单查询条件
 */
export interface OrderQuery {
  /** 订单号（精确匹配） */
  orderId?: string
  
  /** 用户名（精确匹配） */
  userId?: string
}

/**
 * 订单查询结果
 */
export interface OrderQueryResult {
  /** 匹配的订单列表 */
  orders: Order[]
  
  /** 结果总数 */
  total: number
}

/**
 * 分页订单查询结果
 */
export interface PaginatedOrderResult {
  /** 当前页订单列表 */
  orders: Order[]
  
  /** 结果总数 */
  total: number
  
  /** 当前页码 */
  page: number
  
  /** 每页数量 */
  pageSize: number
  
  /** 总页数 */
  totalPages: number
}

// ============================================================================
// 购买相关类型
// ============================================================================

/**
 * 购买结果
 */
export interface PurchaseResult {
  /** 是否成功 */
  success: boolean
  
  /** 订单号（成功时） */
  orderId?: string
  
  /** 错误信息（失败时） */
  error?: string
}
