/**
 * PurchaseDialog 组件测试
 * 
 * 功能分支: 003-user-booking-order
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PurchaseDialog from '@/components/PurchaseDialog.vue'
import type { ScheduleDisplayItem } from '@/types/schedule'

// 模拟船期数据
const mockSchedule: ScheduleDisplayItem = {
  schedule: {
    id: 'SCH-20260115-001',
    departurePort: 'CNSHA',
    arrivalPort: 'DEHAM',
    etd: '2026-01-15',
    transitDays: 28,
    carrier: 'COSCO',
    vesselName: 'COSCO Pride',
    voyageNumber: 'V2601W',
    stock: 50
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
}

describe('PurchaseDialog', () => {
  describe('显示/隐藏', () => {
    it('visible=false 时不应显示弹窗', () => {
      const wrapper = mount(PurchaseDialog, {
        props: { visible: false, schedule: null }
      })
      
      expect(wrapper.find('.dialog-overlay').exists()).toBe(false)
    })
    
    it('visible=true 时应显示弹窗 (FR-017)', () => {
      const wrapper = mount(PurchaseDialog, {
        props: { visible: true, schedule: mockSchedule },
        global: {
          stubs: { Teleport: true }
        }
      })
      
      expect(wrapper.find('.dialog-overlay').exists()).toBe(true)
    })
  })
  
  describe('弹窗内容', () => {
    it('应显示确认提示信息', () => {
      const wrapper = mount(PurchaseDialog, {
        props: { visible: true, schedule: mockSchedule },
        global: { stubs: { Teleport: true } }
      })
      
      expect(wrapper.text()).toContain('确认购买')
      expect(wrapper.text()).toContain('您确定要购买以下船期舱位吗')
    })
    
    it('应显示航线信息', () => {
      const wrapper = mount(PurchaseDialog, {
        props: { visible: true, schedule: mockSchedule },
        global: { stubs: { Teleport: true } }
      })
      
      expect(wrapper.text()).toContain('上海')
      expect(wrapper.text()).toContain('汉堡')
    })
    
    it('应显示ETD日期', () => {
      const wrapper = mount(PurchaseDialog, {
        props: { visible: true, schedule: mockSchedule },
        global: { stubs: { Teleport: true } }
      })
      
      expect(wrapper.text()).toContain('2026年1月15日')
    })
    
    it('应显示运输耗时', () => {
      const wrapper = mount(PurchaseDialog, {
        props: { visible: true, schedule: mockSchedule },
        global: { stubs: { Teleport: true } }
      })
      
      expect(wrapper.text()).toContain('28天')
    })
    
    it('应显示承运公司', () => {
      const wrapper = mount(PurchaseDialog, {
        props: { visible: true, schedule: mockSchedule },
        global: { stubs: { Teleport: true } }
      })
      
      expect(wrapper.text()).toContain('中远海运')
    })
    
    it('应显示船名和航次号', () => {
      const wrapper = mount(PurchaseDialog, {
        props: { visible: true, schedule: mockSchedule },
        global: { stubs: { Teleport: true } }
      })
      
      expect(wrapper.text()).toContain('COSCO Pride')
      expect(wrapper.text()).toContain('V2601W')
    })
  })
  
  describe('按钮交互', () => {
    it('应显示取消和确认按钮', () => {
      const wrapper = mount(PurchaseDialog, {
        props: { visible: true, schedule: mockSchedule },
        global: { stubs: { Teleport: true } }
      })
      
      expect(wrapper.find('.cancel-button').exists()).toBe(true)
      expect(wrapper.find('.confirm-button').exists()).toBe(true)
    })
    
    it('点击确认按钮应触发 confirm 事件', async () => {
      const wrapper = mount(PurchaseDialog, {
        props: { visible: true, schedule: mockSchedule },
        global: { stubs: { Teleport: true } }
      })
      
      await wrapper.find('.confirm-button').trigger('click')
      
      expect(wrapper.emitted('confirm')).toBeTruthy()
    })
    
    it('点击取消按钮应触发 cancel 事件', async () => {
      const wrapper = mount(PurchaseDialog, {
        props: { visible: true, schedule: mockSchedule },
        global: { stubs: { Teleport: true } }
      })
      
      await wrapper.find('.cancel-button').trigger('click')
      
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })
    
    it('点击关闭按钮应触发 cancel 事件', async () => {
      const wrapper = mount(PurchaseDialog, {
        props: { visible: true, schedule: mockSchedule },
        global: { stubs: { Teleport: true } }
      })
      
      await wrapper.find('.close-button').trigger('click')
      
      expect(wrapper.emitted('cancel')).toBeTruthy()
    })
  })
  
  describe('加载状态', () => {
    it('loading=true 时确认按钮应显示"处理中..."', () => {
      const wrapper = mount(PurchaseDialog, {
        props: { visible: true, schedule: mockSchedule, loading: true },
        global: { stubs: { Teleport: true } }
      })
      
      expect(wrapper.find('.confirm-button').text()).toBe('处理中...')
    })
    
    it('loading=true 时按钮应被禁用', () => {
      const wrapper = mount(PurchaseDialog, {
        props: { visible: true, schedule: mockSchedule, loading: true },
        global: { stubs: { Teleport: true } }
      })
      
      expect(wrapper.find('.confirm-button').attributes('disabled')).toBeDefined()
      expect(wrapper.find('.cancel-button').attributes('disabled')).toBeDefined()
    })
  })
  
  describe('无港口详情时的显示', () => {
    it('港口信息缺失时应显示港口代码', () => {
      const scheduleWithoutPortInfo: ScheduleDisplayItem = {
        ...mockSchedule,
        departurePortInfo: null,
        arrivalPortInfo: null
      }
      
      const wrapper = mount(PurchaseDialog, {
        props: { visible: true, schedule: scheduleWithoutPortInfo },
        global: { stubs: { Teleport: true } }
      })
      
      expect(wrapper.text()).toContain('CNSHA')
      expect(wrapper.text()).toContain('DEHAM')
    })
  })
  
  describe('可访问性', () => {
    it('弹窗应有正确的 ARIA 属性', () => {
      const wrapper = mount(PurchaseDialog, {
        props: { visible: true, schedule: mockSchedule },
        global: { stubs: { Teleport: true } }
      })
      
      const dialog = wrapper.find('.dialog-container')
      expect(dialog.attributes('role')).toBe('dialog')
      expect(dialog.attributes('aria-modal')).toBe('true')
    })
  })
})
