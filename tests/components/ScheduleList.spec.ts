/**
 * ScheduleList 组件测试
 * 
 * 功能分支: 002-shipping-schedule
 * TDD: 先写测试，确保失败后再实现
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ScheduleList from '@/components/ScheduleList.vue'
import type { ScheduleDisplayItem } from '@/types/schedule'
import type { ShippingSchedule } from '@/types/schedule'

// 模拟船期展示数据
const mockSchedules: ScheduleDisplayItem[] = [
  {
    schedule: {
      id: 'SCH-20260115-001',
      departurePort: 'CNSHA',
      arrivalPort: 'DEHAM',
      etd: '2026-01-15',
      transitDays: 28,
      carrier: 'COSCO',
      vesselName: 'COSCO Pride',
      voyageNumber: 'V2601W'
    },
    departurePortInfo: {
      code: 'CNSHA',
      name: 'Shanghai',
      nameCN: '上海',
      country: 'China',
      countryCode: 'CN',
      timezone: 'Asia/Shanghai'
    },
    arrivalPortInfo: {
      code: 'DEHAM',
      name: 'Hamburg',
      nameCN: '汉堡',
      country: 'Germany',
      countryCode: 'DE',
      timezone: 'Europe/Berlin'
    },
    carrierName: '中远海运',
    transitDaysFormatted: '28天',
    etdFormatted: '2026年1月15日'
  },
  {
    schedule: {
      id: 'SCH-20260118-002',
      departurePort: 'CNNGB',
      arrivalPort: 'NLRTM',
      etd: '2026-01-18',
      transitDays: 25,
      carrier: 'MAERSK'
    },
    departurePortInfo: {
      code: 'CNNGB',
      name: 'Ningbo',
      nameCN: '宁波',
      country: 'China',
      countryCode: 'CN',
      timezone: 'Asia/Shanghai'
    },
    arrivalPortInfo: {
      code: 'NLRTM',
      name: 'Rotterdam',
      nameCN: '鹿特丹',
      country: 'Netherlands',
      countryCode: 'NL',
      timezone: 'Europe/Amsterdam'
    },
    carrierName: '马士基',
    transitDaysFormatted: '25天',
    etdFormatted: '2026年1月18日'
  },
  {
    schedule: {
      id: 'SCH-20260120-003',
      departurePort: 'SGSIN',
      arrivalPort: 'USLAX',
      etd: '2026-01-20',
      transitDays: 21,
      carrier: 'MSC'
    },
    departurePortInfo: {
      code: 'SGSIN',
      name: 'Singapore',
      nameCN: '新加坡',
      country: 'Singapore',
      countryCode: 'SG',
      timezone: 'Asia/Singapore'
    },
    arrivalPortInfo: {
      code: 'USLAX',
      name: 'Los Angeles',
      nameCN: '洛杉矶',
      country: 'United States',
      countryCode: 'US',
      timezone: 'America/Los_Angeles'
    },
    carrierName: '地中海航运',
    transitDaysFormatted: '21天',
    etdFormatted: '2026年1月20日'
  }
]

describe('ScheduleList', () => {
  
  // T011: ScheduleList 组件测试（列表展示）
  describe('列表展示', () => {
    it('应渲染船期列表', () => {
      const wrapper = mount(ScheduleList, {
        props: { schedules: mockSchedules }
      })
      
      expect(wrapper.findAll('.schedule-item').length).toBe(3)
    })

    it('应显示起运港信息', () => {
      const wrapper = mount(ScheduleList, {
        props: { schedules: mockSchedules }
      })
      
      const firstItem = wrapper.find('.schedule-item')
      expect(firstItem.text()).toContain('上海')
      expect(firstItem.text()).toContain('CNSHA')
    })

    it('应显示目的港信息', () => {
      const wrapper = mount(ScheduleList, {
        props: { schedules: mockSchedules }
      })
      
      const firstItem = wrapper.find('.schedule-item')
      expect(firstItem.text()).toContain('汉堡')
      expect(firstItem.text()).toContain('DEHAM')
    })

    it('应显示ETD日期', () => {
      const wrapper = mount(ScheduleList, {
        props: { schedules: mockSchedules }
      })
      
      const firstItem = wrapper.find('.schedule-item')
      expect(firstItem.text()).toContain('2026年1月15日')
    })

    it('应显示运输耗时', () => {
      const wrapper = mount(ScheduleList, {
        props: { schedules: mockSchedules }
      })
      
      const firstItem = wrapper.find('.schedule-item')
      expect(firstItem.text()).toContain('28天')
    })

    it('应显示承运公司', () => {
      const wrapper = mount(ScheduleList, {
        props: { schedules: mockSchedules }
      })
      
      const firstItem = wrapper.find('.schedule-item')
      expect(firstItem.text()).toContain('中远海运')
    })

    it('应显示船名和航次号（如果存在）', () => {
      const wrapper = mount(ScheduleList, {
        props: { schedules: mockSchedules }
      })
      
      const firstItem = wrapper.find('.schedule-item')
      expect(firstItem.text()).toContain('COSCO Pride')
      expect(firstItem.text()).toContain('V2601W')
    })
  })

  describe('空状态', () => {
    it('应在列表为空时显示空状态提示', () => {
      const wrapper = mount(ScheduleList, {
        props: { schedules: [] }
      })
      
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.text()).toContain('暂无船期数据')
    })

    it('列表为空时不应渲染船期项', () => {
      const wrapper = mount(ScheduleList, {
        props: { schedules: [] }
      })
      
      expect(wrapper.findAll('.schedule-item').length).toBe(0)
    })
  })

  describe('加载状态', () => {
    it('应在加载中时显示加载提示', () => {
      const wrapper = mount(ScheduleList, {
        props: { 
          schedules: [],
          loading: true
        }
      })
      
      expect(wrapper.find('.loading-state').exists()).toBe(true)
      expect(wrapper.text()).toContain('加载中')
    })

    it('加载时不应显示空状态', () => {
      const wrapper = mount(ScheduleList, {
        props: { 
          schedules: [],
          loading: true
        }
      })
      
      expect(wrapper.find('.empty-state').exists()).toBe(false)
    })
  })

  describe('港口信息缺失处理', () => {
    it('应在港口信息缺失时显示港口代码', () => {
      const scheduleWithMissingPort: ScheduleDisplayItem[] = [{
        schedule: {
          id: 'SCH-20260101-001',
          departurePort: 'UNKN1',
          arrivalPort: 'UNKN2',
          etd: '2026-01-01',
          transitDays: 10,
          carrier: 'COSCO'
        },
        departurePortInfo: null,
        arrivalPortInfo: null,
        carrierName: '中远海运',
        transitDaysFormatted: '10天',
        etdFormatted: '2026年1月1日'
      }]

      const wrapper = mount(ScheduleList, {
        props: { schedules: scheduleWithMissingPort }
      })
      
      const item = wrapper.find('.schedule-item')
      expect(item.text()).toContain('UNKN1')
      expect(item.text()).toContain('UNKN2')
    })
  })

  describe('行选中交互', () => {
    it('应在点击船期项时触发 select 事件', async () => {
      const wrapper = mount(ScheduleList, {
        props: { schedules: mockSchedules }
      })
      
      await wrapper.find('.schedule-item').trigger('click')
      
      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')![0][0]).toEqual(mockSchedules[0])
    })

    it('应支持通过 selectedId 标记选中项', () => {
      const wrapper = mount(ScheduleList, {
        props: { 
          schedules: mockSchedules,
          selectedId: 'SCH-20260118-002'
        }
      })
      
      const selectedItem = wrapper.findAll('.schedule-item')[1]
      expect(selectedItem.classes()).toContain('selected')
    })
  })

  describe('可访问性', () => {
    it('应为船期列表添加正确的 ARIA 角色', () => {
      const wrapper = mount(ScheduleList, {
        props: { schedules: mockSchedules }
      })
      
      expect(wrapper.find('.schedule-list').attributes('role')).toBe('list')
    })

    it('应为船期项添加正确的 ARIA 角色', () => {
      const wrapper = mount(ScheduleList, {
        props: { schedules: mockSchedules }
      })
      
      const items = wrapper.findAll('.schedule-item')
      items.forEach(item => {
        expect(item.attributes('role')).toBe('listitem')
      })
    })
  })
})
