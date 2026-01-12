/**
 * 船期实体类型定义
 * 
 * 功能分支: 002-shipping-schedule, 003-user-booking-order
 * 来源: data-model.md, contracts/schedule-service.ts
 */

import type { Port } from './port'

// ============================================================================
// 船期核心类型
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
  
  /** 库存数量 (003-user-booking-order 新增) */
  stock?: number
}

// ============================================================================
// 查询相关类型
// ============================================================================

/**
 * 船期查询条件
 * 所有条件均为可选，多个条件为 AND 关系
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

// ============================================================================
// UI 展示类型
// ============================================================================

/**
 * 船期展示视图模型
 * 用于 UI 展示，包含港口详情和格式化文本
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

// ============================================================================
// 承运公司类型
// ============================================================================

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

/**
 * 承运公司数据映射
 * 使用代码作为键，快速查找公司信息
 */
export const CARRIERS: Record<string, Carrier> = {
  MSC: { code: 'MSC', nameEn: 'Mediterranean Shipping Company', nameCn: '地中海航运', country: 'Switzerland' },
  MAERSK: { code: 'MAERSK', nameEn: 'Maersk', nameCn: '马士基', country: 'Denmark' },
  CMACGM: { code: 'CMACGM', nameEn: 'CMA CGM', nameCn: '达飞轮船', country: 'France' },
  COSCO: { code: 'COSCO', nameEn: 'COSCO Shipping', nameCn: '中远海运', country: 'China' },
  HPL: { code: 'HPL', nameEn: 'Hapag-Lloyd', nameCn: '赫伯罗特', country: 'Germany' },
  EMC: { code: 'EMC', nameEn: 'Evergreen', nameCn: '长荣海运', country: 'Taiwan' },
  ONE: { code: 'ONE', nameEn: 'Ocean Network Express', nameCn: '海洋网联', country: 'Japan' },
  YML: { code: 'YML', nameEn: 'Yang Ming', nameCn: '阳明海运', country: 'Taiwan' },
  HMM: { code: 'HMM', nameEn: 'Hyundai Merchant Marine', nameCn: '现代商船', country: 'South Korea' },
  ZIM: { code: 'ZIM', nameEn: 'ZIM', nameCn: '以星航运', country: 'Israel' }
}
