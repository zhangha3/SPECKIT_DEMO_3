/**
 * 统计服务契约
 * 功能分支: 004-fund-stats-enhancement
 * 
 * 提供订单统计分析功能，包括：
 * - 按时间维度统计（周/月）
 * - 按港口维度统计（起始港/目的港）
 * - 按用户维度统计
 * - 热门船期统计
 */

import type {
  TimeGranularity,
  TimeStatistics,
  PortStatType,
  PortStatistics,
  UserStatistics,
  HotScheduleStatistics
} from '@/types/statistics'

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

/**
 * 统计服务接口
 */
export interface IStatisticsService {
  /**
   * 获取时间维度统计
   * @param query 查询参数
   * @returns 时间统计结果
   * 
   * 业务规则:
   * - 周统计: 按ISO周（周一开始）分组
   * - 月统计: 按自然月分组
   * - 每个数据点包含订单数量和金额总计
   */
  getTimeStatistics(query: TimeStatQuery): TimeStatistics
  
  /**
   * 获取港口维度统计
   * @param query 查询参数
   * @returns 港口统计结果
   * 
   * 业务规则:
   * - 按订单金额降序排列
   * - 自动计算占比（百分比）
   * - 默认返回前10名
   */
  getPortStatistics(query: PortStatQuery): PortStatistics
  
  /**
   * 获取用户维度统计
   * @param query 查询参数
   * @returns 用户统计结果
   * 
   * 业务规则:
   * - 按订单金额降序排列
   * - 标记当前登录用户
   * - 默认返回前10名
   */
  getUserStatistics(query: UserStatQuery): UserStatistics
  
  /**
   * 获取热门船期统计
   * @returns 热门船期统计结果
   * 
   * 业务规则:
   * - 统计最近7天的订单数据
   * - 按成交单数统计热门航线
   * - 返回前3名
   */
  getHotSchedules(): HotScheduleStatistics
  
  /**
   * 获取快速选择日期范围
   * @param type 快速选择类型
   * @returns { startDate, endDate }
   * 
   * 支持类型:
   * - 'thisWeek': 本周
   * - 'thisMonth': 本月
   * - 'lastMonth': 上月
   * - 'last3Months': 近3个月
   */
  getQuickDateRange(type: 'thisWeek' | 'thisMonth' | 'lastMonth' | 'last3Months'): {
    startDate: string
    endDate: string
  }
}

/**
 * 图表数据格式转换器接口
 */
export interface IChartDataFormatter {
  /**
   * 格式化时间统计数据为ECharts柱状图配置
   */
  formatTimeStatToBarChart(data: TimeStatistics): {
    xAxis: string[]
    series: { orderCount: number[], totalAmount: number[] }
  }
  
  /**
   * 格式化港口统计数据为ECharts饼图配置
   */
  formatPortStatToPieChart(data: PortStatistics): {
    data: Array<{ name: string, value: number }>
  }
  
  /**
   * 格式化用户统计数据为ECharts柱状图配置
   */
  formatUserStatToBarChart(data: UserStatistics): {
    xAxis: string[]
    series: { orderCount: number[], totalAmount: number[] }
    currentUserIndex: number
  }
}
