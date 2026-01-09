/**
 * useScheduleSearch Composable 测试
 * 
 * 功能分支: 002-shipping-schedule
 * TDD: 先写测试，确保失败后再实现
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'

// 模拟船期数据
const mockSchedules = [
  {
    id: 'SCH-20260115-001',
    departurePort: 'CNSHA',
    arrivalPort: 'DEHAM',
    etd: '2026-01-15',
    transitDays: 28,
    carrier: 'COSCO'
  },
  {
    id: 'SCH-20260118-002',
    departurePort: 'CNNGB',
    arrivalPort: 'NLRTM',
    etd: '2026-01-18',
    transitDays: 25,
    carrier: 'MAERSK'
  },
  {
    id: 'SCH-20260120-003',
    departurePort: 'SGSIN',
    arrivalPort: 'USLAX',
    etd: '2026-01-20',
    transitDays: 21,
    carrier: 'MSC'
  }
]

// 模拟港口数据
const mockPorts = [
  { code: 'CNSHA', name: 'Shanghai', nameCN: '上海', country: 'China', countryCode: 'CN', timezone: 'Asia/Shanghai' },
  { code: 'CNNGB', name: 'Ningbo', nameCN: '宁波', country: 'China', countryCode: 'CN', timezone: 'Asia/Shanghai' },
  { code: 'DEHAM', name: 'Hamburg', nameCN: '汉堡', country: 'Germany', countryCode: 'DE', timezone: 'Europe/Berlin' },
  { code: 'NLRTM', name: 'Rotterdam', nameCN: '鹿特丹', country: 'Netherlands', countryCode: 'NL', timezone: 'Europe/Amsterdam' },
  { code: 'SGSIN', name: 'Singapore', nameCN: '新加坡', country: 'Singapore', countryCode: 'SG', timezone: 'Asia/Singapore' },
  { code: 'USLAX', name: 'Los Angeles', nameCN: '洛杉矶', country: 'United States', countryCode: 'US', timezone: 'America/Los_Angeles' }
]

// 模拟服务
vi.mock('@/services/scheduleService', () => ({
  loadSchedules: vi.fn(() => Promise.resolve(mockSchedules)),
  searchSchedules: vi.fn((criteria, schedules) => ({
    schedules: schedules.filter((s: any) => {
      if (criteria.departurePort && s.departurePort !== criteria.departurePort) return false
      if (criteria.arrivalPort && s.arrivalPort !== criteria.arrivalPort) return false
      return true
    }),
    total: schedules.length,
    criteria
  })),
  buildDisplayItem: vi.fn((schedule, ports) => ({
    schedule,
    departurePortInfo: ports.find((p: any) => p.code === schedule.departurePort) || null,
    arrivalPortInfo: ports.find((p: any) => p.code === schedule.arrivalPort) || null,
    carrierName: '测试承运公司',
    transitDaysFormatted: `${schedule.transitDays}天`,
    etdFormatted: schedule.etd
  }))
}))

vi.mock('@/services/portService', () => ({
  loadPorts: vi.fn(() => Promise.resolve(mockPorts))
}))

describe('useScheduleSearch', () => {
  let useScheduleSearch: typeof import('@/composables/useScheduleSearch').useScheduleSearch

  beforeEach(async () => {
    vi.clearAllMocks()
    // 动态导入以获取最新的模拟
    const module = await import('@/composables/useScheduleSearch')
    useScheduleSearch = module.useScheduleSearch
  })

  describe('初始状态', () => {
    it('应返回初始空状态', () => {
      const { 
        schedules, 
        displayItems, 
        isLoading, 
        error 
      } = useScheduleSearch()
      
      expect(schedules.value).toEqual([])
      expect(displayItems.value).toEqual([])
      expect(isLoading.value).toBe(false)
      expect(error.value).toBeNull()
    })

    it('应提供搜索条件响应式引用', () => {
      const { criteria } = useScheduleSearch()
      
      expect(criteria.value).toBeDefined()
      expect(criteria.value.departurePort).toBeUndefined()
      expect(criteria.value.arrivalPort).toBeUndefined()
    })
  })

  describe('数据初始化', () => {
    it('应通过 initialize 加载船期和港口数据', async () => {
      const { loadSchedules } = await import('@/services/scheduleService')
      const { loadPorts } = await import('@/services/portService')
      
      const { initialize, schedules } = useScheduleSearch()
      
      await initialize()
      
      expect(loadSchedules).toHaveBeenCalled()
      expect(loadPorts).toHaveBeenCalled()
      expect(schedules.value.length).toBe(3)
    })

    it('应在加载过程中设置 isLoading 为 true', async () => {
      const { initialize, isLoading } = useScheduleSearch()
      
      const initPromise = initialize()
      expect(isLoading.value).toBe(true)
      
      await initPromise
      expect(isLoading.value).toBe(false)
    })

    it('应在加载失败时设置错误信息', async () => {
      const { loadSchedules } = await import('@/services/scheduleService')
      vi.mocked(loadSchedules).mockRejectedValueOnce(new Error('加载失败'))
      
      const { initialize, error } = useScheduleSearch()
      
      await initialize()
      
      expect(error.value).toBeTruthy()
    })
  })

  describe('搜索功能', () => {
    it('应根据起运港筛选', async () => {
      const { initialize, performSearch, displayItems, criteria } = useScheduleSearch()
      
      await initialize()
      
      criteria.value.departurePort = 'CNSHA'
      performSearch()
      
      await nextTick()
      
      expect(displayItems.value.length).toBeGreaterThan(0)
      expect(displayItems.value.every(item => 
        item.schedule.departurePort === 'CNSHA'
      )).toBe(true)
    })

    it('应根据目的港筛选', async () => {
      const { initialize, performSearch, displayItems, criteria } = useScheduleSearch()
      
      await initialize()
      
      criteria.value.arrivalPort = 'DEHAM'
      performSearch()
      
      await nextTick()
      
      expect(displayItems.value.length).toBeGreaterThan(0)
      expect(displayItems.value.every(item => 
        item.schedule.arrivalPort === 'DEHAM'
      )).toBe(true)
    })

    it('应支持组合条件查询', async () => {
      const { initialize, performSearch, criteria, displayItems } = useScheduleSearch()
      
      await initialize()
      
      criteria.value.departurePort = 'CNSHA'
      criteria.value.arrivalPort = 'DEHAM'
      performSearch()
      
      await nextTick()
      
      expect(displayItems.value.every(item => 
        item.schedule.departurePort === 'CNSHA' && 
        item.schedule.arrivalPort === 'DEHAM'
      )).toBe(true)
    })
  })

  describe('重置功能', () => {
    it('应重置搜索条件', async () => {
      const { initialize, reset, criteria } = useScheduleSearch()
      
      await initialize()
      
      criteria.value.departurePort = 'CNSHA'
      criteria.value.arrivalPort = 'DEHAM'
      
      reset()
      
      expect(criteria.value.departurePort).toBeUndefined()
      expect(criteria.value.arrivalPort).toBeUndefined()
    })

    it('应重置后显示所有船期', async () => {
      const { initialize, performSearch, reset, displayItems, criteria } = useScheduleSearch()
      
      await initialize()
      
      // 先筛选
      criteria.value.departurePort = 'CNSHA'
      performSearch()
      
      // 再重置
      reset()
      performSearch()
      
      await nextTick()
      
      expect(displayItems.value.length).toBe(3)
    })
  })

  describe('展示数据构建', () => {
    it('应为每个船期构建展示项', async () => {
      const { initialize, displayItems } = useScheduleSearch()
      
      await initialize()
      
      expect(displayItems.value.length).toBe(3)
      expect(displayItems.value[0]).toHaveProperty('schedule')
      expect(displayItems.value[0]).toHaveProperty('departurePortInfo')
      expect(displayItems.value[0]).toHaveProperty('arrivalPortInfo')
      expect(displayItems.value[0]).toHaveProperty('carrierName')
      expect(displayItems.value[0]).toHaveProperty('transitDaysFormatted')
      expect(displayItems.value[0]).toHaveProperty('etdFormatted')
    })
  })

  describe('总数统计', () => {
    it('应返回当前结果总数', async () => {
      const { initialize, total } = useScheduleSearch()
      
      await initialize()
      
      expect(total.value).toBe(3)
    })

    it('应在筛选后更新总数', async () => {
      const { initialize, performSearch, total, criteria } = useScheduleSearch()
      
      await initialize()
      
      criteria.value.departurePort = 'CNSHA'
      performSearch()
      
      await nextTick()
      
      expect(total.value).toBeLessThanOrEqual(3)
    })
  })
})
