/**
 * 船期服务单元测试
 * 
 * 功能分支: 002-shipping-schedule
 * 测试 scheduleService.ts 中的所有函数
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  loadSchedules,
  searchSchedules,
  filterByDeparturePort,
  filterByArrivalPort,
  filterByEtdRange,
  sortByEtdAsc,
  getCarrierName,
  formatTransitDays,
  formatEtd,
  buildDisplayItem,
  buildDisplayItems
} from '@/services/scheduleService'
import type { ShippingSchedule, ScheduleSearchCriteria } from '@/types/schedule'
import type { Port } from '@/types/port'

// 测试用船期数据
const mockSchedules: ShippingSchedule[] = [
  {
    id: 'SCH-20260115-001',
    departurePort: 'CNSHA',
    arrivalPort: 'NLRTM',
    etd: '2026-01-15',
    transitDays: 28,
    carrier: 'COSCO',
    vesselName: 'Test Vessel 1',
    voyageNumber: '001E'
  },
  {
    id: 'SCH-20260118-001',
    departurePort: 'CNSHA',
    arrivalPort: 'USLAX',
    etd: '2026-01-18',
    transitDays: 14,
    carrier: 'MAERSK',
    vesselName: 'Test Vessel 2',
    voyageNumber: '002W'
  },
  {
    id: 'SCH-20260120-001',
    departurePort: 'SGSIN',
    arrivalPort: 'NLRTM',
    etd: '2026-01-20',
    transitDays: 22,
    carrier: 'MSC',
    vesselName: 'Test Vessel 3',
    voyageNumber: '003E'
  },
  {
    id: 'SCH-20260110-001',
    departurePort: 'HKHKG',
    arrivalPort: 'DEHAM',
    etd: '2026-01-10',
    transitDays: 30,
    carrier: 'CMACGM',
    vesselName: 'Test Vessel 4',
    voyageNumber: '004E'
  }
]

// 测试用港口数据
const mockPorts: Port[] = [
  { code: 'CNSHA', name: 'Shanghai', nameCN: '上海', country: 'China', countryCode: 'CN', timezone: 'Asia/Shanghai' },
  { code: 'NLRTM', name: 'Rotterdam', nameCN: '鹿特丹', country: 'Netherlands', countryCode: 'NL', timezone: 'Europe/Amsterdam' },
  { code: 'USLAX', name: 'Los Angeles', nameCN: '洛杉矶', country: 'United States', countryCode: 'US', timezone: 'America/Los_Angeles' },
  { code: 'SGSIN', name: 'Singapore', nameCN: '新加坡', country: 'Singapore', countryCode: 'SG', timezone: 'Asia/Singapore' }
]

describe('scheduleService', () => {
  describe('loadSchedules', () => {
    it('应该成功加载船期数据', async () => {
      const schedules = await loadSchedules()
      expect(Array.isArray(schedules)).toBe(true)
      expect(schedules.length).toBeGreaterThan(0)
    })

    it('每条船期数据应包含必要字段', async () => {
      const schedules = await loadSchedules()
      const schedule = schedules[0]
      
      expect(schedule.id).toBeDefined()
      expect(schedule.departurePort).toBeDefined()
      expect(schedule.arrivalPort).toBeDefined()
      expect(schedule.etd).toBeDefined()
      expect(schedule.transitDays).toBeDefined()
      expect(schedule.carrier).toBeDefined()
    })
  })

  describe('filterByDeparturePort', () => {
    it('应该按起运港代码筛选船期', () => {
      const result = filterByDeparturePort('CNSHA', mockSchedules)
      expect(result.length).toBe(2)
      expect(result.every(s => s.departurePort === 'CNSHA')).toBe(true)
    })

    it('应该不区分大小写', () => {
      const result = filterByDeparturePort('cnsha', mockSchedules)
      expect(result.length).toBe(2)
    })

    it('如果港口代码为空，应返回全部数据', () => {
      const result = filterByDeparturePort('', mockSchedules)
      expect(result.length).toBe(mockSchedules.length)
    })

    it('如果无匹配结果，应返回空数组', () => {
      const result = filterByDeparturePort('XXXXX', mockSchedules)
      expect(result.length).toBe(0)
    })
  })

  describe('filterByArrivalPort', () => {
    it('应该按目的港代码筛选船期', () => {
      const result = filterByArrivalPort('NLRTM', mockSchedules)
      expect(result.length).toBe(2)
      expect(result.every(s => s.arrivalPort === 'NLRTM')).toBe(true)
    })

    it('应该不区分大小写', () => {
      const result = filterByArrivalPort('nlrtm', mockSchedules)
      expect(result.length).toBe(2)
    })

    it('如果港口代码为空，应返回全部数据', () => {
      const result = filterByArrivalPort('', mockSchedules)
      expect(result.length).toBe(mockSchedules.length)
    })
  })

  describe('filterByEtdRange', () => {
    it('应该按起始日期筛选 (>=)', () => {
      const result = filterByEtdRange('2026-01-15', undefined, mockSchedules)
      expect(result.length).toBe(3)
      expect(result.every(s => s.etd >= '2026-01-15')).toBe(true)
    })

    it('应该按结束日期筛选 (<=)', () => {
      const result = filterByEtdRange(undefined, '2026-01-15', mockSchedules)
      expect(result.length).toBe(2)
      expect(result.every(s => s.etd <= '2026-01-15')).toBe(true)
    })

    it('应该按日期范围筛选', () => {
      const result = filterByEtdRange('2026-01-15', '2026-01-18', mockSchedules)
      expect(result.length).toBe(2)
      expect(result.every(s => s.etd >= '2026-01-15' && s.etd <= '2026-01-18')).toBe(true)
    })

    it('如果日期范围为空，应返回全部数据', () => {
      const result = filterByEtdRange(undefined, undefined, mockSchedules)
      expect(result.length).toBe(mockSchedules.length)
    })
  })

  describe('sortByEtdAsc', () => {
    it('应该按 ETD 升序排序', () => {
      const result = sortByEtdAsc(mockSchedules)
      expect(result[0].etd).toBe('2026-01-10')
      expect(result[1].etd).toBe('2026-01-15')
      expect(result[2].etd).toBe('2026-01-18')
      expect(result[3].etd).toBe('2026-01-20')
    })

    it('不应修改原数组', () => {
      const original = [...mockSchedules]
      sortByEtdAsc(mockSchedules)
      expect(mockSchedules).toEqual(original)
    })
  })

  describe('searchSchedules', () => {
    it('无条件时应返回全部数据并排序', () => {
      const criteria: ScheduleSearchCriteria = {}
      const result = searchSchedules(criteria, mockSchedules)
      
      expect(result.total).toBe(4)
      expect(result.schedules.length).toBe(4)
      // 验证已排序
      expect(result.schedules[0].etd).toBe('2026-01-10')
    })

    it('应该支持组合条件查询（起运港 + 目的港）', () => {
      const criteria: ScheduleSearchCriteria = {
        departurePort: 'CNSHA',
        arrivalPort: 'NLRTM'
      }
      const result = searchSchedules(criteria, mockSchedules)
      
      expect(result.total).toBe(1)
      expect(result.schedules[0].departurePort).toBe('CNSHA')
      expect(result.schedules[0].arrivalPort).toBe('NLRTM')
    })

    it('应该支持组合条件查询（港口 + ETD范围）', () => {
      const criteria: ScheduleSearchCriteria = {
        departurePort: 'CNSHA',
        etdStart: '2026-01-01',
        etdEnd: '2026-01-16'
      }
      const result = searchSchedules(criteria, mockSchedules)
      
      expect(result.total).toBe(1)
      expect(result.schedules[0].id).toBe('SCH-20260115-001')
    })

    it('应该返回正确的查询条件', () => {
      const criteria: ScheduleSearchCriteria = {
        departurePort: 'CNSHA'
      }
      const result = searchSchedules(criteria, mockSchedules)
      
      expect(result.criteria).toEqual(criteria)
    })
  })

  describe('getCarrierName', () => {
    it('应该返回承运公司中文名称', () => {
      expect(getCarrierName('COSCO')).toBe('中远海运')
      expect(getCarrierName('MAERSK')).toBe('马士基')
      expect(getCarrierName('MSC')).toBe('地中海航运')
    })

    it('未知代码应返回代码本身', () => {
      expect(getCarrierName('UNKNOWN')).toBe('UNKNOWN')
    })
  })

  describe('formatTransitDays', () => {
    it('应该格式化为 "X天" 格式', () => {
      expect(formatTransitDays(28)).toBe('28天')
      expect(formatTransitDays(1)).toBe('1天')
      expect(formatTransitDays(100)).toBe('100天')
    })
  })

  describe('formatEtd', () => {
    it('应该格式化为中文日期格式', () => {
      expect(formatEtd('2026-01-15')).toBe('2026年1月15日')
      expect(formatEtd('2026-12-31')).toBe('2026年12月31日')
    })

    it('无效日期应返回原字符串', () => {
      expect(formatEtd('invalid')).toBe('invalid')
    })
  })

  describe('buildDisplayItem', () => {
    it('应该构建完整的展示视图模型', () => {
      const schedule = mockSchedules[0]
      const result = buildDisplayItem(schedule, mockPorts)
      
      expect(result.schedule).toBe(schedule)
      expect(result.departurePortInfo?.nameCN).toBe('上海')
      expect(result.arrivalPortInfo?.nameCN).toBe('鹿特丹')
      expect(result.carrierName).toBe('中远海运')
      expect(result.transitDaysFormatted).toBe('28天')
      expect(result.etdFormatted).toBe('2026年1月15日')
    })

    it('找不到港口时应返回 null', () => {
      const schedule: ShippingSchedule = {
        ...mockSchedules[0],
        departurePort: 'XXXXX',
        arrivalPort: 'YYYYY'
      }
      const result = buildDisplayItem(schedule, mockPorts)
      
      expect(result.departurePortInfo).toBeNull()
      expect(result.arrivalPortInfo).toBeNull()
    })
  })

  describe('buildDisplayItems', () => {
    it('应该构建多个展示视图模型', () => {
      const result = buildDisplayItems(mockSchedules, mockPorts)
      
      expect(result.length).toBe(mockSchedules.length)
      expect(result[0].schedule).toBe(mockSchedules[0])
    })
  })
})
