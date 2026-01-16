/**
 * 船期数据服务
 * 
 * 功能分支: 002-shipping-schedule, 003-user-booking-order
 * 来源: contracts/schedule-service.ts
 * 
 * 新增: 库存管理功能 (FR-008 ~ FR-011, FR-018)
 */
import type { Port } from '@/types/port'
import type { 
  ShippingSchedule, 
  ScheduleSearchCriteria, 
  ScheduleSearchResult,
  ScheduleDisplayItem 
} from '@/types/schedule'
import { CARRIERS } from '@/types/schedule'
import schedulesData from '@/assets/data/schedules.json'

// ============================================================================
// 常量
// ============================================================================

/** localStorage 键名 */
const SCHEDULES_STORAGE_KEY = 'schedules'

/** 默认库存值 */
const DEFAULT_STOCK = 99

// ============================================================================
// 库存管理 (003-user-booking-order)
// ============================================================================

/**
 * 获取运行时船期数据（包含库存）
 * 优先从 localStorage 读取，否则从静态数据初始化
 * 
 * @returns ShippingSchedule[] 船期数据（含库存）
 */
export function getSchedulesWithStock(): ShippingSchedule[] {
  try {
    const stored = localStorage.getItem(SCHEDULES_STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored) as ShippingSchedule[]
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    }
  } catch (error) {
    console.error('读取库存数据失败:', error)
  }
  
  // 初始化：从静态数据加载并确保每条记录有 stock 字段
  const initialData = (schedulesData as ShippingSchedule[]).map(s => ({
    ...s,
    stock: s.stock ?? DEFAULT_STOCK
  }))
  
  // 保存到 localStorage
  saveSchedulesToStorage(initialData)
  
  return initialData
}

/**
 * 保存船期数据到 localStorage
 * 
 * @param schedules 船期数据
 */
export function saveSchedulesToStorage(schedules: ShippingSchedule[]): void {
  try {
    localStorage.setItem(SCHEDULES_STORAGE_KEY, JSON.stringify(schedules))
  } catch (error) {
    console.error('保存库存数据失败:', error)
  }
}

/**
 * 获取指定船期的库存
 * 
 * @param scheduleId 船期编号
 * @returns number 库存数量，未找到返回 0
 */
export function getStock(scheduleId: string): number {
  const schedules = getSchedulesWithStock()
  const schedule = schedules.find(s => s.id === scheduleId)
  return schedule?.stock ?? 0
}

/**
 * 扣减库存
 * 
 * @param scheduleId 船期编号
 * @param amount 扣减数量（默认 1）
 * @returns boolean 是否成功
 */
export function decreaseStock(scheduleId: string, amount: number = 1): boolean {
  const schedules = getSchedulesWithStock()
  const index = schedules.findIndex(s => s.id === scheduleId)
  
  if (index === -1) {
    console.error('船期不存在:', scheduleId)
    return false
  }
  
  const schedule = schedules[index]
  const currentStock = schedule.stock ?? 0
  
  if (currentStock < amount) {
    console.error('库存不足:', scheduleId, '当前库存:', currentStock, '需要:', amount)
    return false
  }
  
  // 扣减库存
  schedules[index] = {
    ...schedule,
    stock: currentStock - amount
  }
  
  // 保存到 localStorage
  saveSchedulesToStorage(schedules)
  
  return true
}

/**
 * 根据ID获取船期（包含库存）
 * 
 * @param scheduleId 船期编号
 * @returns ShippingSchedule | undefined 船期对象
 */
export function getScheduleById(scheduleId: string): ShippingSchedule | undefined {
  const schedules = getSchedulesWithStock()
  return schedules.find(s => s.id === scheduleId)
}

/**
 * 加载船期数据
 * 
 * @returns Promise<ShippingSchedule[]> 所有船期数据
 * @throws Error 当数据格式无效时
 */
export async function loadSchedules(): Promise<ShippingSchedule[]> {
  try {
    // 数据已通过 import 静态加载
    const data = schedulesData as ShippingSchedule[]
    
    // 验证数据格式
    if (!Array.isArray(data)) {
      throw new Error('船期数据格式无效：期望数组类型')
    }
    
    // 验证每个船期对象的必要字段
    for (const schedule of data) {
      if (!schedule.id || !schedule.departurePort || !schedule.arrivalPort || 
          !schedule.etd || !schedule.carrier || schedule.transitDays === undefined) {
        throw new Error('船期数据格式无效：缺少必要字段')
      }
    }
    
    return data
  } catch (error) {
    console.error('加载船期数据失败:', error)
    throw new Error('船期数据加载失败，请刷新页面重试')
  }
}

/**
 * 搜索船期（组合条件筛选）
 * 
 * @param criteria 查询条件 (所有条件为 AND 关系)
 * @param schedules 船期数据列表
 * @returns ScheduleSearchResult 查询结果
 */
export function searchSchedules(
  criteria: ScheduleSearchCriteria,
  schedules: ShippingSchedule[]
): ScheduleSearchResult {
  let filtered = [...schedules]
  
  // 按起运港筛选
  if (criteria.departurePort) {
    filtered = filterByDeparturePort(criteria.departurePort, filtered)
  }
  
  // 按目的港筛选
  if (criteria.arrivalPort) {
    filtered = filterByArrivalPort(criteria.arrivalPort, filtered)
  }
  
  // 按ETD日期范围筛选
  if (criteria.etdStart || criteria.etdEnd) {
    filtered = filterByEtdRange(criteria.etdStart, criteria.etdEnd, filtered)
  }
  
  // 按ETD升序排序
  filtered = sortByEtdAsc(filtered)
  
  return {
    schedules: filtered,
    total: filtered.length,
    criteria
  }
}

/**
 * 按起运港筛选
 * 
 * @param portCode 起运港代码
 * @param schedules 船期数据列表
 * @returns ShippingSchedule[] 匹配的船期
 */
export function filterByDeparturePort(
  portCode: string,
  schedules: ShippingSchedule[]
): ShippingSchedule[] {
  if (!portCode) return schedules
  const normalizedCode = portCode.toUpperCase()
  return schedules.filter(s => s.departurePort.toUpperCase() === normalizedCode)
}

/**
 * 按目的港筛选
 * 
 * @param portCode 目的港代码
 * @param schedules 船期数据列表
 * @returns ShippingSchedule[] 匹配的船期
 */
export function filterByArrivalPort(
  portCode: string,
  schedules: ShippingSchedule[]
): ShippingSchedule[] {
  if (!portCode) return schedules
  const normalizedCode = portCode.toUpperCase()
  return schedules.filter(s => s.arrivalPort.toUpperCase() === normalizedCode)
}

/**
 * 按ETD日期范围筛选
 * 
 * @param startDate ETD 起始日期 (含, ISO 8601 格式)
 * @param endDate ETD 结束日期 (含, ISO 8601 格式)
 * @param schedules 船期数据列表
 * @returns ShippingSchedule[] 匹配的船期
 */
export function filterByEtdRange(
  startDate: string | undefined,
  endDate: string | undefined,
  schedules: ShippingSchedule[]
): ShippingSchedule[] {
  return schedules.filter(schedule => {
    const etd = schedule.etd
    
    // 起始日期筛选
    if (startDate && etd < startDate) {
      return false
    }
    
    // 结束日期筛选
    if (endDate && etd > endDate) {
      return false
    }
    
    return true
  })
}

/**
 * 按ETD升序排序
 * 
 * @param schedules 船期数据列表
 * @returns ShippingSchedule[] 排序后的船期 (不修改原数组)
 */
export function sortByEtdAsc(
  schedules: ShippingSchedule[]
): ShippingSchedule[] {
  return [...schedules].sort((a, b) => a.etd.localeCompare(b.etd))
}

/**
 * 获取承运公司中文名称
 * 
 * @param carrierCode 承运公司代码
 * @returns string 中文名称，未找到返回代码本身
 */
export function getCarrierName(carrierCode: string): string {
  const carrier = CARRIERS[carrierCode]
  return carrier ? carrier.nameCn : carrierCode
}

/**
 * 格式化运输耗时
 * 
 * @param days 天数
 * @returns string 格式化文本 (如 "25天")
 */
export function formatTransitDays(days: number): string {
  return `${days}天`
}

/**
 * 格式化ETD日期
 * 
 * @param etd ETD 日期字符串 (ISO 8601)
 * @returns string 中文格式日期 (如 "2026年1月15日")
 */
export function formatEtd(etd: string): string {
  try {
    const date = new Date(etd)
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return etd
    }
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}年${month}月${day}日`
  } catch {
    return etd
  }
}

/**
 * 构建展示视图模型
 * 
 * @param schedule 船期数据
 * @param ports 港口数据列表
 * @returns ScheduleDisplayItem 展示视图模型
 */
export function buildDisplayItem(
  schedule: ShippingSchedule,
  ports: Port[]
): ScheduleDisplayItem {
  const departurePortInfo = ports.find(p => p.code === schedule.departurePort) || null
  const arrivalPortInfo = ports.find(p => p.code === schedule.arrivalPort) || null
  
  return {
    schedule,
    departurePortInfo,
    arrivalPortInfo,
    carrierName: getCarrierName(schedule.carrier),
    transitDaysFormatted: formatTransitDays(schedule.transitDays),
    etdFormatted: formatEtd(schedule.etd)
  }
}

/**
 * 构建多个展示视图模型
 * 
 * @param schedules 船期数据列表
 * @param ports 港口数据列表
 * @returns ScheduleDisplayItem[] 展示视图模型列表
 */
export function buildDisplayItems(
  schedules: ShippingSchedule[],
  ports: Port[]
): ScheduleDisplayItem[] {
  return schedules.map(schedule => buildDisplayItem(schedule, ports))
}

// ============================================================================
// 价格相关 (004-fund-stats-enhancement 新增)
// ============================================================================

/**
 * 获取船期价格
 * 
 * @param scheduleId 船期编号
 * @returns number 价格（CNY），未找到返回 0
 */
export function getSchedulePrice(scheduleId: string): number {
  const schedule = getScheduleById(scheduleId)
  if (!schedule) {
    return 0
  }
  // 如果有 price 字段则使用，否则根据公式计算
  return schedule.price ?? (schedule.transitDays * 5)
}

/**
 * 获取船期列表（按成交量排序）
 * 用于热门船期展示
 * 
 * @param limit 返回数量限制
 * @returns ShippingSchedule[] 船期列表
 */
export function getTopSchedules(limit: number = 10): ShippingSchedule[] {
  const schedules = getSchedulesWithStock()
  // 按价格降序（高价值船期优先）
  return [...schedules]
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    .slice(0, limit)
}
