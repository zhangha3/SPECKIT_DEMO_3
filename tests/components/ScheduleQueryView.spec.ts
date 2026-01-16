/**
 * ScheduleQueryView 组件测试
 * 
 * 功能分支: 002-shipping-schedule
 * TDD: 先写测试，确保失败后再实现
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import ScheduleQueryView from '@/views/ScheduleQueryView.vue'
import type { ShippingSchedule } from '@/types/schedule'

// 模拟船期数据
const mockSchedules: ShippingSchedule[] = [
  {
    id: 'SCH-20260115-001',
    departurePort: 'CNSHA',
    arrivalPort: 'DEHAM',
    etd: '2026-01-15',
    transitDays: 28,
    carrier: 'COSCO',
    price: 140
  },
  {
    id: 'SCH-20260118-002',
    departurePort: 'CNNGB',
    arrivalPort: 'NLRTM',
    etd: '2026-01-18',
    transitDays: 25,
    carrier: 'MAERSK',
    price: 125
  },
  {
    id: 'SCH-20260120-003',
    departurePort: 'SGSIN',
    arrivalPort: 'USLAX',
    etd: '2026-01-20',
    transitDays: 21,
    carrier: 'MSC',
    price: 105
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
  getSchedulesWithStock: vi.fn(() => mockSchedules),
  searchSchedules: vi.fn((criteria, schedules) => ({
    schedules: schedules,
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

describe('ScheduleQueryView', () => {
  
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化和数据加载', () => {
    it('应在组件挂载时加载船期数据', async () => {
      const { getSchedulesWithStock } = await import('@/services/scheduleService')
      
      mount(ScheduleQueryView)
      await flushPromises()
      
      expect(getSchedulesWithStock).toHaveBeenCalled()
    })

    it('应在组件挂载时加载港口数据', async () => {
      const { loadPorts } = await import('@/services/portService')
      
      mount(ScheduleQueryView)
      await flushPromises()
      
      expect(loadPorts).toHaveBeenCalled()
    })

    it('应在加载中时显示加载状态', async () => {
      // 模拟延迟加载（使用 Promise 保持 pending 状态）- loadPorts 是异步的
      let resolveLoading: (value: typeof mockPorts) => void
      const { loadPorts } = await import('@/services/portService')
      vi.mocked(loadPorts).mockImplementationOnce(() => 
        new Promise(resolve => { resolveLoading = resolve })
      )
      
      const wrapper = mount(ScheduleQueryView)
      await nextTick()
      
      // 数据加载前应显示加载状态
      expect(wrapper.find('.loading-state').exists() || wrapper.text().includes('加载')).toBe(true)
      
      // 完成加载
      resolveLoading!(mockPorts)
      await flushPromises()
    })

    it('应在数据加载完成后显示船期列表', async () => {
      const wrapper = mount(ScheduleQueryView)
      await flushPromises()
      
      expect(wrapper.findComponent({ name: 'ScheduleList' }).exists()).toBe(true)
    })
  })

  describe('页面结构', () => {
    it('应包含页面标题', async () => {
      const wrapper = mount(ScheduleQueryView)
      await flushPromises()
      
      expect(wrapper.text()).toContain('船期查询')
    })

    it('应在数据超过10条时包含分页组件', async () => {
      // 创建超过10条的数据以触发分页
      const manySchedules = Array.from({ length: 15 }, (_, i) => ({
        id: `SCH-2026010${i}-00${i}`,
        departurePort: 'CNSHA',
        arrivalPort: 'DEHAM',
        etd: '2026-01-15',
        transitDays: 28,
        carrier: 'COSCO',
        price: 140
      }))
      
      const { getSchedulesWithStock } = await import('@/services/scheduleService')
      vi.mocked(getSchedulesWithStock).mockReturnValueOnce(manySchedules)
      
      const wrapper = mount(ScheduleQueryView)
      await flushPromises()
      
      expect(wrapper.findComponent({ name: 'Pagination' }).exists()).toBe(true)
    })
  })

  describe('错误处理', () => {
    it('应在数据加载失败时显示错误信息', async () => {
      const { loadPorts } = await import('@/services/portService')
      vi.mocked(loadPorts).mockRejectedValueOnce(new Error('加载失败'))
      
      const wrapper = mount(ScheduleQueryView)
      await flushPromises()
      
      expect(wrapper.find('.error-state').exists() || wrapper.text().includes('加载失败')).toBe(true)
    })
  })

  describe('分页功能', () => {
    it('应根据数据量显示分页', async () => {
      // 创建超过10条的数据以触发分页
      const manySchedules = Array.from({ length: 15 }, (_, i) => ({
        id: `SCH-2026010${i}-00${i}`,
        departurePort: 'CNSHA',
        arrivalPort: 'DEHAM',
        etd: '2026-01-15',
        transitDays: 28,
        carrier: 'COSCO',
        price: 140
      }))
      
      const { getSchedulesWithStock } = await import('@/services/scheduleService')
      vi.mocked(getSchedulesWithStock).mockReturnValueOnce(manySchedules)
      
      const wrapper = mount(ScheduleQueryView)
      await flushPromises()
      
      const pagination = wrapper.findComponent({ name: 'Pagination' })
      expect(pagination.exists()).toBe(true)
    })

    it('应每页显示10条数据', async () => {
      const manySchedules = Array.from({ length: 25 }, (_, i) => ({
        id: `SCH-2026010${i}-00${i}`,
        departurePort: 'CNSHA',
        arrivalPort: 'DEHAM',
        etd: '2026-01-15',
        transitDays: 28,
        carrier: 'COSCO',
        price: 140
      }))
      
      const { getSchedulesWithStock } = await import('@/services/scheduleService')
      vi.mocked(getSchedulesWithStock).mockReturnValueOnce(manySchedules)
      
      const wrapper = mount(ScheduleQueryView)
      await flushPromises()
      
      // 第一页应只显示10条
      const scheduleList = wrapper.findComponent({ name: 'ScheduleList' })
      expect(scheduleList.props('schedules').length).toBeLessThanOrEqual(10)
    })
  })

  describe('数据统计显示', () => {
    it('应显示船期总数', async () => {
      const wrapper = mount(ScheduleQueryView)
      await flushPromises()
      
      expect(wrapper.text()).toMatch(/共\s*\d+\s*条/)
    })
  })
})
