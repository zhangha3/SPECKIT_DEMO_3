/**
 * 统计相关类型定义
 * 
 * 功能分支: 004-fund-stats-enhancement
 * 来源: data-model.md, contracts/statistics-service.ts
 */

// ============================================================================
// 时间维度统计
// ============================================================================

/**
 * 时间统计粒度
 * - week: 按周统计
 * - month: 按月统计
 */
export type TimeGranularity = 'week' | 'month'

/**
 * 时间统计数据点
 */
export interface TimeStatDataPoint {
  /** 时间标签（如 "2026-01" 或 "2026-W02"） */
  label: string
  
  /** 订单数量 */
  orderCount: number
  
  /** 订单金额总计（CNY） */
  totalAmount: number
}

/**
 * 时间维度统计结果
 */
export interface TimeStatistics {
  /** 统计粒度 */
  granularity: TimeGranularity
  
  /** 数据点列表 */
  data: TimeStatDataPoint[]
  
  /** 统计开始日期 */
  startDate: string
  
  /** 统计结束日期 */
  endDate: string
}

// ============================================================================
// 港口维度统计
// ============================================================================

/**
 * 港口统计类型
 * - departure: 按起始港统计
 * - arrival: 按目的港统计
 */
export type PortStatType = 'departure' | 'arrival'

/**
 * 港口统计数据点
 */
export interface PortStatDataPoint {
  /** 港口代码 */
  portCode: string
  
  /** 港口名称 */
  portName: string
  
  /** 订单数量 */
  orderCount: number
  
  /** 订单金额总计（CNY） */
  totalAmount: number
  
  /** 占比（百分比，0-100） */
  percentage: number
}

/**
 * 港口维度统计结果
 */
export interface PortStatistics {
  /** 统计类型 */
  type: PortStatType
  
  /** 数据点列表（按金额降序） */
  data: PortStatDataPoint[]
  
  /** 订单总数 */
  totalOrders: number
  
  /** 金额总计 */
  totalAmount: number
}

// ============================================================================
// 用户维度统计
// ============================================================================

/**
 * 用户统计数据点
 */
export interface UserStatDataPoint {
  /** 用户名 */
  username: string
  
  /** 订单数量 */
  orderCount: number
  
  /** 订单金额总计（CNY） */
  totalAmount: number
  
  /** 是否为当前登录用户 */
  isCurrentUser: boolean
}

/**
 * 用户维度统计结果
 */
export interface UserStatistics {
  /** 数据点列表（按金额降序） */
  data: UserStatDataPoint[]
  
  /** 当前登录用户名 */
  currentUsername: string
  
  /** 活跃用户数 */
  totalUsers: number
  
  /** 订单总数 */
  totalOrders: number
  
  /** 金额总计 */
  totalAmount: number
}

// ============================================================================
// 热门船期统计
// ============================================================================

/**
 * 热门航线数据点
 */
export interface HotRouteDataPoint {
  /** 起始港代码 */
  departurePortCode: string
  
  /** 起始港名称 */
  departurePortName: string
  
  /** 目的港代码 */
  arrivalPortCode: string
  
  /** 目的港名称 */
  arrivalPortName: string
  
  /** 成交订单数 */
  orderCount: number
}

/**
 * 热门船期统计结果
 */
export interface HotScheduleStatistics {
  /** 热门航线列表（按成交数降序，最多3条） */
  routes: HotRouteDataPoint[]
  
  /** 统计开始日期（7天前） */
  startDate: string
  
  /** 统计结束日期（今天） */
  endDate: string
  
  /** 是否有数据 */
  hasData: boolean
}

// ============================================================================
// 统计查询参数
// ============================================================================

/**
 * 时间统计查询参数
 */
export interface TimeStatQuery {
  /** 统计维度（周/月） */
  granularity: TimeGranularity
  
  /** 时间范围（月数）：1, 3, 6 */
  monthsRange: 1 | 3 | 6
}

/**
 * 港口统计查询参数
 */
export interface PortStatQuery {
  /** 统计类型（起始港/目的港） */
  type: PortStatType
  
  /** 返回结果数量限制（默认10） */
  limit?: number
}

/**
 * 用户统计查询参数
 */
export interface UserStatQuery {
  /** 当前登录用户名（用于标记高亮） */
  currentUsername: string
  
  /** 返回结果数量限制（默认10） */
  limit?: number
}
