/**
 * 船期服务契约
 * 
 * 功能分支: 002-shipping-schedule
 * 定义船期查询服务的类型和接口
 */

import type { Port } from '@/types/port'

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 船期实体
 * 表示一条航运船期信息
 */
export interface ShippingSchedule {
  /** 唯一标识符 (格式: SCH-YYYYMMDD-XXX) */
  id: string
  
  /** 起运港代码 (关联 Port.code) */
  departurePort: string
  
  /** 目的港代码 (关联 Port.code) */
  arrivalPort: string
  
  /** 预计发运时间 (ISO 8601 日期格式, 如 2026-01-15) */
  etd: string
  
  /** 运输耗时 (天数) */
  transitDays: number
  
  /** 承运公司代码 */
  carrier: string
  
  /** 船名 (可选) */
  vesselName?: string
  
  /** 航次号 (可选) */
  voyageNumber?: string
}

/**
 * 船期查询条件
 */
export interface ScheduleSearchCriteria {
  /** 起运港代码 (可选) */
  departurePort?: string
  
  /** 目的港代码 (可选) */
  arrivalPort?: string
  
  /** ETD 起始日期 (含, ISO 8601 格式) */
  etdStart?: string
  
  /** ETD 结束日期 (含, ISO 8601 格式) */
  etdEnd?: string
}

/**
 * 船期查询结果
 */
export interface ScheduleSearchResult {
  /** 匹配的船期列表 */
  schedules: ShippingSchedule[]
  
  /** 结果总数 */
  total: number
  
  /** 查询条件 */
  criteria: ScheduleSearchCriteria
}

/**
 * 船期展示视图模型
 * 用于 UI 展示，包含港口详情
 */
export interface ScheduleDisplayItem {
  /** 船期数据 */
  schedule: ShippingSchedule
  
  /** 起运港详情 */
  departurePortInfo: Port | null
  
  /** 目的港详情 */
  arrivalPortInfo: Port | null
  
  /** 承运公司中文名称 */
  carrierName: string
  
  /** 运输耗时格式化文本 (如 "25天") */
  transitDaysFormatted: string
  
  /** ETD 格式化文本 (如 "2026年1月15日") */
  etdFormatted: string
}

/**
 * 承运公司
 */
export interface Carrier {
  /** 公司代码 */
  code: string
  
  /** 英文名称 */
  nameEn: string
  
  /** 中文名称 */
  nameCn: string
  
  /** 国家 */
  country: string
}

// ============================================================================
// 服务接口
// ============================================================================

/**
 * 加载船期数据
 * 
 * @returns Promise<ShippingSchedule[]> 所有船期数据
 * @throws Error 当数据格式无效时
 */
export function loadSchedules(): Promise<ShippingSchedule[]>

/**
 * 搜索船期
 * 
 * @param criteria 查询条件 (所有条件为 AND 关系)
 * @param schedules 船期数据列表
 * @returns ScheduleSearchResult 查询结果
 */
export function searchSchedules(
  criteria: ScheduleSearchCriteria,
  schedules: ShippingSchedule[]
): ScheduleSearchResult

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
): ShippingSchedule[]

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
): ShippingSchedule[]

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
): ShippingSchedule[]

/**
 * 按ETD升序排序
 * 
 * @param schedules 船期数据列表
 * @returns ShippingSchedule[] 排序后的船期 (不修改原数组)
 */
export function sortByEtdAsc(
  schedules: ShippingSchedule[]
): ShippingSchedule[]

/**
 * 获取承运公司中文名称
 * 
 * @param carrierCode 承运公司代码
 * @returns string 中文名称，未找到返回代码本身
 */
export function getCarrierName(carrierCode: string): string

/**
 * 格式化运输耗时
 * 
 * @param days 天数
 * @returns string 格式化文本 (如 "25天")
 */
export function formatTransitDays(days: number): string

/**
 * 格式化ETD日期
 * 
 * @param etd ETD 日期字符串 (ISO 8601)
 * @returns string 中文格式日期 (如 "2026年1月15日")
 */
export function formatEtd(etd: string): string

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
): ScheduleDisplayItem
