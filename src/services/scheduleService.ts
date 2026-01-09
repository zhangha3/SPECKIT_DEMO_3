/**
 * 船期数据服务
 * 
 * 功能分支: 002-shipping-schedule
 * 来源: contracts/schedule-service.ts
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
