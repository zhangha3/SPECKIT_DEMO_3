/**
 * 统计服务
 * 
 * 功能分支: 004-fund-stats-enhancement
 * 来源: contracts/statistics-service.ts
 * 
 * 提供订单统计分析功能：时间维度、港口维度、用户维度、热门船期
 */

import type {
  TimeGranularity,
  TimeStatistics,
  TimeStatDataPoint,
  PortStatType,
  PortStatistics,
  PortStatDataPoint,
  UserStatistics,
  UserStatDataPoint,
  HotScheduleStatistics,
  HotRouteDataPoint
} from '@/types/statistics'
import { getAllOrders } from '@/services/orderService'
import { getPortByCode } from '@/services/portService'
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  subDays,
  format,
  getISOWeek,
  getYear,
  parseISO,
  isWithinInterval
} from 'date-fns'

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 时间统计查询参数
 */
export interface TimeStatQuery {
  /** 统计维度（周/月） */
  granularity: TimeGranularity
  
  /** 起始日期（可选，默认为最早订单日期） */
  startDate?: string
  
  /** 结束日期（可选，默认为当天） */
  endDate?: string
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
  /** 当前登录用户名（用于标记） */
  currentUsername: string
  
  /** 返回结果数量限制（默认10） */
  limit?: number
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 生成周标签
 * @param date 日期
 * @returns 周标签（如 "2026-W02"）
 */
function getWeekLabel(date: Date): string {
  const year = getYear(date)
  const week = getISOWeek(date)
  return `${year}-W${week.toString().padStart(2, '0')}`
}

/**
 * 生成月标签
 * @param date 日期
 * @returns 月标签（如 "2026-01"）
 */
function getMonthLabel(date: Date): string {
  return format(date, 'yyyy-MM')
}

// ============================================================================
// 时间维度统计
// ============================================================================

/**
 * 获取时间维度统计
 * @param query 查询参数
 * @returns 时间统计结果
 */
export function getTimeStatistics(query: TimeStatQuery): TimeStatistics {
  const orders = getAllOrders()
  const now = new Date()
  
  // 确定时间范围
  const endDate = query.endDate ? parseISO(query.endDate) : now
  const startDate = query.startDate 
    ? parseISO(query.startDate) 
    : subMonths(endDate, 6) // 默认6个月
  
  // 过滤时间范围内的订单
  const filteredOrders = orders.filter(order => {
    const orderDate = parseISO(order.orderTime)
    return isWithinInterval(orderDate, { start: startDate, end: endDate })
  })
  
  // 按时间分组统计
  const dataMap = new Map<string, TimeStatDataPoint>()
  
  for (const order of filteredOrders) {
    const orderDate = parseISO(order.orderTime)
    const label = query.granularity === 'week' 
      ? getWeekLabel(orderDate) 
      : getMonthLabel(orderDate)
    
    const existing = dataMap.get(label)
    if (existing) {
      existing.orderCount += 1
      existing.totalAmount += order.amount || 0
    } else {
      dataMap.set(label, {
        label,
        orderCount: 1,
        totalAmount: order.amount || 0
      })
    }
  }
  
  // 转换为数组并排序
  const data = Array.from(dataMap.values())
    .sort((a, b) => a.label.localeCompare(b.label))
  
  return {
    granularity: query.granularity,
    data,
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd')
  }
}

// ============================================================================
// 港口维度统计
// ============================================================================

/**
 * 获取港口维度统计
 * @param query 查询参数
 * @returns 港口统计结果
 */
export function getPortStatistics(query: PortStatQuery): PortStatistics {
  const orders = getAllOrders()
  const limit = query.limit ?? 10
  
  // 按港口分组统计
  const portMap = new Map<string, { orderCount: number; totalAmount: number }>()
  let totalOrders = 0
  let totalAmount = 0
  
  for (const order of orders) {
    const port = query.type === 'departure' 
      ? order.departurePort 
      : order.arrivalPort
    
    const portCode = port.code
    const existing = portMap.get(portCode)
    const amount = order.amount || 0
    
    totalOrders += 1
    totalAmount += amount
    
    if (existing) {
      existing.orderCount += 1
      existing.totalAmount += amount
    } else {
      portMap.set(portCode, {
        orderCount: 1,
        totalAmount: amount
      })
    }
  }
  
  // 转换为数组、计算占比、排序、截取
  const data: PortStatDataPoint[] = Array.from(portMap.entries())
    .map(([portCode, stats]) => {
      const portInfo = getPortByCode(portCode)
      return {
        portCode,
        portName: portInfo?.name || portCode,
        orderCount: stats.orderCount,
        totalAmount: stats.totalAmount,
        percentage: totalAmount > 0 
          ? Math.round(stats.totalAmount / totalAmount * 10000) / 100 
          : 0
      }
    })
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit)
  
  return {
    type: query.type,
    data,
    totalOrders,
    totalAmount
  }
}

// ============================================================================
// 用户维度统计
// ============================================================================

/**
 * 获取用户维度统计
 * @param query 查询参数
 * @returns 用户统计结果
 */
export function getUserStatistics(query: UserStatQuery): UserStatistics {
  const orders = getAllOrders()
  const limit = query.limit ?? 10
  
  // 按用户分组统计
  const userMap = new Map<string, { orderCount: number; totalAmount: number }>()
  let totalOrders = 0
  let totalAmount = 0
  
  for (const order of orders) {
    const username = order.userId
    const existing = userMap.get(username)
    const amount = order.amount || 0
    
    totalOrders += 1
    totalAmount += amount
    
    if (existing) {
      existing.orderCount += 1
      existing.totalAmount += amount
    } else {
      userMap.set(username, {
        orderCount: 1,
        totalAmount: amount
      })
    }
  }
  
  // 转换为数组、排序、截取
  const data: UserStatDataPoint[] = Array.from(userMap.entries())
    .map(([username, stats]) => ({
      username,
      orderCount: stats.orderCount,
      totalAmount: stats.totalAmount,
      isCurrentUser: username === query.currentUsername
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, limit)
  
  return {
    data,
    currentUsername: query.currentUsername,
    totalUsers: userMap.size,
    totalOrders,
    totalAmount
  }
}

// ============================================================================
// 热门船期统计
// ============================================================================

/**
 * 获取热门船期统计
 * @returns 热门船期统计结果
 */
export function getHotSchedules(): HotScheduleStatistics {
  const orders = getAllOrders()
  const now = new Date()
  
  // 计算最近7天的时间范围
  const startDate = subDays(now, 7)
  const endDate = now
  
  // 过滤最近7天的订单
  const recentOrders = orders.filter(order => {
    const orderDate = parseISO(order.orderTime)
    return isWithinInterval(orderDate, { start: startDate, end: endDate })
  })
  
  // 按航线分组统计
  const routeMap = new Map<string, HotRouteDataPoint>()
  
  for (const order of recentOrders) {
    const routeKey = `${order.departurePort.code}-${order.arrivalPort.code}`
    const existing = routeMap.get(routeKey)
    
    if (existing) {
      existing.orderCount += 1
    } else {
      routeMap.set(routeKey, {
        departurePortCode: order.departurePort.code,
        departurePortName: order.departurePort.name,
        arrivalPortCode: order.arrivalPort.code,
        arrivalPortName: order.arrivalPort.name,
        orderCount: 1
      })
    }
  }
  
  // 排序并取前3名
  const routes = Array.from(routeMap.values())
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 3)
  
  return {
    routes,
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
    hasData: routes.length > 0
  }
}

// ============================================================================
// 快速日期范围
// ============================================================================

/**
 * 获取快速选择日期范围
 * @param type 快速选择类型
 * @returns 日期范围
 */
export function getQuickDateRange(type: 'thisWeek' | 'thisMonth' | 'lastMonth' | 'last3Months'): {
  startDate: string
  endDate: string
} {
  const now = new Date()
  
  switch (type) {
    case 'thisWeek':
      return {
        startDate: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        endDate: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
      }
    case 'thisMonth':
      return {
        startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(now), 'yyyy-MM-dd')
      }
    case 'lastMonth': {
      const lastMonth = subMonths(now, 1)
      return {
        startDate: format(startOfMonth(lastMonth), 'yyyy-MM-dd'),
        endDate: format(endOfMonth(lastMonth), 'yyyy-MM-dd')
      }
    }
    case 'last3Months':
      return {
        startDate: format(subMonths(now, 3), 'yyyy-MM-dd'),
        endDate: format(now, 'yyyy-MM-dd')
      }
    default:
      return {
        startDate: format(subMonths(now, 1), 'yyyy-MM-dd'),
        endDate: format(now, 'yyyy-MM-dd')
      }
  }
}

// ============================================================================
// 图表数据格式化
// ============================================================================

/**
 * 格式化时间统计数据为ECharts柱状图配置
 */
export function formatTimeStatToBarChart(data: TimeStatistics): {
  xAxis: string[]
  series: { orderCount: number[]; totalAmount: number[] }
} {
  return {
    xAxis: data.data.map(d => d.label),
    series: {
      orderCount: data.data.map(d => d.orderCount),
      totalAmount: data.data.map(d => d.totalAmount)
    }
  }
}

/**
 * 格式化港口统计数据为ECharts饼图配置
 */
export function formatPortStatToPieChart(data: PortStatistics): {
  data: Array<{ name: string; value: number }>
} {
  return {
    data: data.data.map(d => ({
      name: d.portName,
      value: d.totalAmount
    }))
  }
}

/**
 * 格式化用户统计数据为ECharts柱状图配置
 */
export function formatUserStatToBarChart(data: UserStatistics): {
  xAxis: string[]
  series: { orderCount: number[]; totalAmount: number[] }
  currentUserIndex: number
} {
  const currentUserIndex = data.data.findIndex(d => d.isCurrentUser)
  
  return {
    xAxis: data.data.map(d => d.username),
    series: {
      orderCount: data.data.map(d => d.orderCount),
      totalAmount: data.data.map(d => d.totalAmount)
    },
    currentUserIndex
  }
}
