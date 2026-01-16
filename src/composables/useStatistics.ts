/**
 * 统计分析组合式函数
 * 
 * 功能分支: 004-fund-stats-enhancement
 * 来源: tasks.md T043
 * 
 * 提供统计分析页面所需的数据获取和状态管理
 */

import { ref, computed } from 'vue'
import type {
  TimeGranularity,
  TimeStatistics,
  PortStatType,
  PortStatistics,
  UserStatistics,
  HotScheduleStatistics
} from '@/types/statistics'
import {
  getTimeStatistics,
  getPortStatistics,
  getUserStatistics,
  getHotSchedules,
  getQuickDateRange,
  type TimeStatQuery,
  type PortStatQuery,
  type UserStatQuery
} from '@/services/statisticsService'

/**
 * 统计分析组合式函数
 */
export function useStatistics() {
  // ============================================================================
  // 时间维度状态
  // ============================================================================
  
  /** 时间统计粒度 */
  const timeGranularity = ref<TimeGranularity>('month')
  
  /** 时间范围快捷选项 */
  const timeQuickRange = ref<'thisWeek' | 'thisMonth' | 'lastMonth' | 'last3Months'>('last3Months')
  
  /** 时间统计数据 */
  const timeStats = ref<TimeStatistics | null>(null)
  
  /** 时间统计加载状态 */
  const timeLoading = ref(false)
  
  /** 时间统计错误 */
  const timeError = ref<string | null>(null)
  
  // ============================================================================
  // 港口维度状态
  // ============================================================================
  
  /** 港口统计类型 */
  const portStatType = ref<PortStatType>('departure')
  
  /** 港口统计数据 */
  const portStats = ref<PortStatistics | null>(null)
  
  /** 港口统计加载状态 */
  const portLoading = ref(false)
  
  /** 港口统计错误 */
  const portError = ref<string | null>(null)
  
  // ============================================================================
  // 用户维度状态
  // ============================================================================
  
  /** 用户统计数据 */
  const userStats = ref<UserStatistics | null>(null)
  
  /** 用户统计加载状态 */
  const userLoading = ref(false)
  
  /** 用户统计错误 */
  const userError = ref<string | null>(null)
  
  // ============================================================================
  // 热门船期状态
  // ============================================================================
  
  /** 热门船期数据 */
  const hotSchedules = ref<HotScheduleStatistics | null>(null)
  
  /** 热门船期加载状态 */
  const hotLoading = ref(false)
  
  /** 热门船期错误 */
  const hotError = ref<string | null>(null)
  
  // ============================================================================
  // 计算属性
  // ============================================================================
  
  /** 时间统计图表数据 */
  const timeChartData = computed(() => {
    if (!timeStats.value) return null
    return {
      labels: timeStats.value.data.map(d => d.label),
      orderCounts: timeStats.value.data.map(d => d.orderCount),
      totalAmounts: timeStats.value.data.map(d => d.totalAmount)
    }
  })
  
  /** 港口统计图表数据 */
  const portChartData = computed(() => {
    if (!portStats.value) return null
    return portStats.value.data.map(d => ({
      name: d.portName,
      value: d.orderCount,
      percentage: d.percentage
    }))
  })
  
  /** 用户统计图表数据 */
  const userChartData = computed(() => {
    if (!userStats.value) return null
    return {
      labels: userStats.value.data.map(d => d.username),
      orderCounts: userStats.value.data.map(d => d.orderCount),
      totalAmounts: userStats.value.data.map(d => d.totalAmount),
      isCurrentUser: userStats.value.data.map(d => d.isCurrentUser)
    }
  })
  
  // ============================================================================
  // 时间统计方法
  // ============================================================================
  
  /**
   * 加载时间维度统计
   */
  function loadTimeStats() {
    timeLoading.value = true
    timeError.value = null
    
    try {
      const range = getQuickDateRange(timeQuickRange.value)
      const query: TimeStatQuery = {
        granularity: timeGranularity.value,
        startDate: range.startDate,
        endDate: range.endDate
      }
      
      timeStats.value = getTimeStatistics(query)
    } catch (e) {
      timeError.value = e instanceof Error ? e.message : '加载时间统计失败'
    } finally {
      timeLoading.value = false
    }
  }
  
  /**
   * 切换时间粒度
   */
  function setTimeGranularity(granularity: TimeGranularity) {
    timeGranularity.value = granularity
    loadTimeStats()
  }
  
  /**
   * 切换时间范围
   */
  function setTimeQuickRange(range: 'thisWeek' | 'thisMonth' | 'lastMonth' | 'last3Months') {
    timeQuickRange.value = range
    loadTimeStats()
  }
  
  // ============================================================================
  // 港口统计方法
  // ============================================================================
  
  /**
   * 加载港口维度统计
   */
  function loadPortStats() {
    portLoading.value = true
    portError.value = null
    
    try {
      const query: PortStatQuery = {
        type: portStatType.value,
        limit: 10
      }
      
      portStats.value = getPortStatistics(query)
    } catch (e) {
      portError.value = e instanceof Error ? e.message : '加载港口统计失败'
    } finally {
      portLoading.value = false
    }
  }
  
  /**
   * 切换港口统计类型
   */
  function setPortStatType(type: PortStatType) {
    portStatType.value = type
    loadPortStats()
  }
  
  // ============================================================================
  // 用户统计方法
  // ============================================================================
  
  /**
   * 加载用户维度统计
   */
  function loadUserStats(currentUsername: string) {
    userLoading.value = true
    userError.value = null
    
    try {
      const query: UserStatQuery = {
        currentUsername,
        limit: 10
      }
      
      userStats.value = getUserStatistics(query)
    } catch (e) {
      userError.value = e instanceof Error ? e.message : '加载用户统计失败'
    } finally {
      userLoading.value = false
    }
  }
  
  // ============================================================================
  // 热门船期方法
  // ============================================================================
  
  /**
   * 加载热门船期
   */
  function loadHotSchedules() {
    hotLoading.value = true
    hotError.value = null
    
    try {
      hotSchedules.value = getHotSchedules()
    } catch (e) {
      hotError.value = e instanceof Error ? e.message : '加载热门船期失败'
    } finally {
      hotLoading.value = false
    }
  }
  
  /**
   * 初始化所有统计数据
   */
  function initializeAll(currentUsername: string) {
    loadTimeStats()
    loadPortStats()
    loadUserStats(currentUsername)
    loadHotSchedules()
  }
  
  return {
    // 时间维度
    timeGranularity,
    timeQuickRange,
    timeStats,
    timeLoading,
    timeError,
    timeChartData,
    loadTimeStats,
    setTimeGranularity,
    setTimeQuickRange,
    
    // 港口维度
    portStatType,
    portStats,
    portLoading,
    portError,
    portChartData,
    loadPortStats,
    setPortStatType,
    
    // 用户维度
    userStats,
    userLoading,
    userError,
    userChartData,
    loadUserStats,
    
    // 热门船期
    hotSchedules,
    hotLoading,
    hotError,
    loadHotSchedules,
    
    // 初始化
    initializeAll
  }
}
