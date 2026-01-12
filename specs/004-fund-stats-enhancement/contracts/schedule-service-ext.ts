/**
 * 船期服务契约（扩展）
 * 功能分支: 004-fund-stats-enhancement
 * 
 * 在原有船期服务基础上增加：
 * - 价格字段支持
 * - 库存扣减
 * - 热门船期查询
 */

import type { ShippingSchedule } from '@/types/schedule'
import type { HotRoute } from '@/types/statistics'

/**
 * 购买结果
 */
export interface PurchaseResult {
  /** 是否成功 */
  success: boolean
  
  /** 错误信息 */
  error?: string
  
  /** 生成的订单ID */
  orderId?: string
}

/**
 * 船期服务扩展接口
 */
export interface IScheduleServiceExtension {
  /**
   * 获取船期价格
   * @param scheduleId 船期ID
   * @returns 价格（CNY），如未找到返回0
   * 
   * 业务规则:
   * - price = transitDays * 5
   * - 如果数据源无price字段，实时计算
   */
  getPrice(scheduleId: string): number
  
  /**
   * 检查库存是否充足
   * @param scheduleId 船期ID
   * @returns 是否有库存
   */
  hasStock(scheduleId: string): boolean
  
  /**
   * 扣减库存
   * @param scheduleId 船期ID
   * @returns 是否成功
   * 
   * 业务规则:
   * - 库存 > 0 时才能扣减
   * - 扣减数量固定为1
   */
  decreaseStock(scheduleId: string): boolean
  
  /**
   * 获取热门航线的船期
   * @param routes 热门航线列表
   * @returns 每条航线对应的船期（最近发船的一条）
   */
  getSchedulesByHotRoutes(routes: HotRoute[]): Array<{
    route: HotRoute
    schedule: ShippingSchedule | null
  }>
  
  /**
   * 根据价格范围筛选船期
   * @param minPrice 最低价格
   * @param maxPrice 最高价格
   * @returns 符合条件的船期列表
   */
  filterByPriceRange(minPrice: number, maxPrice: number): ShippingSchedule[]
}

/**
 * 船期服务错误码
 */
export const ScheduleErrorCodes = {
  SCHEDULE_NOT_FOUND: '船期不存在',
  OUT_OF_STOCK: '库存不足'
} as const
