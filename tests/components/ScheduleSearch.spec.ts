/**
 * ScheduleSearch 组件测试
 * 
 * 功能分支: 002-shipping-schedule
 * TDD: 先写测试，确保失败后再实现
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ScheduleSearch from '@/components/ScheduleSearch.vue'

describe('ScheduleSearch', () => {
  
  describe('渲染', () => {
    it('应渲染起运港输入框', () => {
      const wrapper = mount(ScheduleSearch)
      
      expect(wrapper.find('[data-testid="departure-port-input"]').exists() || 
             wrapper.find('input[placeholder*="起运港"]').exists()).toBe(true)
    })

    it('应渲染目的港输入框', () => {
      const wrapper = mount(ScheduleSearch)
      
      expect(wrapper.find('[data-testid="arrival-port-input"]').exists() || 
             wrapper.find('input[placeholder*="目的港"]').exists()).toBe(true)
    })

    it('应渲染查询按钮', () => {
      const wrapper = mount(ScheduleSearch)
      
      const searchButton = wrapper.find('[data-testid="search-button"]') || 
                          wrapper.find('button').filter((b) => b.text().includes('查询'))
      expect(searchButton.exists()).toBe(true)
    })

    it('应渲染重置按钮', () => {
      const wrapper = mount(ScheduleSearch)
      
      const resetButton = wrapper.find('[data-testid="reset-button"]') || 
                         wrapper.find('button').filter((b) => b.text().includes('重置'))
      expect(resetButton.exists()).toBe(true)
    })
  })

  describe('输入交互', () => {
    it('应更新起运港输入值', async () => {
      const wrapper = mount(ScheduleSearch)
      
      const input = wrapper.find('[data-testid="departure-port-input"]').exists() 
        ? wrapper.find('[data-testid="departure-port-input"]')
        : wrapper.find('input[placeholder*="起运港"]')
      
      await input.setValue('CNSHA')
      
      expect((input.element as HTMLInputElement).value).toBe('CNSHA')
    })

    it('应更新目的港输入值', async () => {
      const wrapper = mount(ScheduleSearch)
      
      const input = wrapper.find('[data-testid="arrival-port-input"]').exists() 
        ? wrapper.find('[data-testid="arrival-port-input"]')
        : wrapper.find('input[placeholder*="目的港"]')
      
      await input.setValue('DEHAM')
      
      expect((input.element as HTMLInputElement).value).toBe('DEHAM')
    })
  })

  describe('查询事件', () => {
    it('应在点击查询按钮时触发 search 事件', async () => {
      const wrapper = mount(ScheduleSearch)
      
      // 填入搜索条件
      const departureInput = wrapper.find('[data-testid="departure-port-input"]').exists() 
        ? wrapper.find('[data-testid="departure-port-input"]')
        : wrapper.find('input[placeholder*="起运港"]')
      await departureInput.setValue('CNSHA')
      
      // 点击查询
      const searchButton = wrapper.findAll('button').find(b => b.text().includes('查询'))
      await searchButton!.trigger('click')
      
      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')![0][0]).toEqual({
        departurePort: 'CNSHA',
        arrivalPort: '',
        etdStart: '',
        etdEnd: ''
      })
    })

    it('应在查询事件中包含两个港口条件', async () => {
      const wrapper = mount(ScheduleSearch)
      
      // 填入两个条件
      const departureInput = wrapper.find('[data-testid="departure-port-input"]').exists() 
        ? wrapper.find('[data-testid="departure-port-input"]')
        : wrapper.find('input[placeholder*="起运港"]')
      const arrivalInput = wrapper.find('[data-testid="arrival-port-input"]').exists() 
        ? wrapper.find('[data-testid="arrival-port-input"]')
        : wrapper.find('input[placeholder*="目的港"]')
      
      await departureInput.setValue('CNSHA')
      await arrivalInput.setValue('DEHAM')
      
      // 点击查询
      const searchButton = wrapper.findAll('button').find(b => b.text().includes('查询'))
      await searchButton!.trigger('click')
      
      expect(wrapper.emitted('search')![0][0]).toEqual({
        departurePort: 'CNSHA',
        arrivalPort: 'DEHAM',
        etdStart: '',
        etdEnd: ''
      })
    })

    it('应支持按 Enter 键触发查询', async () => {
      const wrapper = mount(ScheduleSearch)
      
      const departureInput = wrapper.find('[data-testid="departure-port-input"]').exists() 
        ? wrapper.find('[data-testid="departure-port-input"]')
        : wrapper.find('input[placeholder*="起运港"]')
      
      await departureInput.setValue('CNSHA')
      await departureInput.trigger('keyup.enter')
      
      expect(wrapper.emitted('search')).toBeTruthy()
    })
  })

  describe('重置事件', () => {
    it('应在点击重置按钮时清空输入', async () => {
      const wrapper = mount(ScheduleSearch)
      
      // 先填入条件
      const departureInput = wrapper.find('[data-testid="departure-port-input"]').exists() 
        ? wrapper.find('[data-testid="departure-port-input"]')
        : wrapper.find('input[placeholder*="起运港"]')
      const arrivalInput = wrapper.find('[data-testid="arrival-port-input"]').exists() 
        ? wrapper.find('[data-testid="arrival-port-input"]')
        : wrapper.find('input[placeholder*="目的港"]')
      
      await departureInput.setValue('CNSHA')
      await arrivalInput.setValue('DEHAM')
      
      // 点击重置
      const resetButton = wrapper.findAll('button').find(b => b.text().includes('重置'))
      await resetButton!.trigger('click')
      
      expect((departureInput.element as HTMLInputElement).value).toBe('')
      expect((arrivalInput.element as HTMLInputElement).value).toBe('')
    })

    it('应在点击重置按钮时触发 reset 事件', async () => {
      const wrapper = mount(ScheduleSearch)
      
      const resetButton = wrapper.findAll('button').find(b => b.text().includes('重置'))
      await resetButton!.trigger('click')
      
      expect(wrapper.emitted('reset')).toBeTruthy()
    })
  })

  describe('初始值', () => {
    it('应支持通过 props 设置初始值', async () => {
      const wrapper = mount(ScheduleSearch, {
        props: {
          initialDeparturePort: 'CNSHA',
          initialArrivalPort: 'DEHAM'
        }
      })
      
      const departureInput = wrapper.find('[data-testid="departure-port-input"]').exists() 
        ? wrapper.find('[data-testid="departure-port-input"]')
        : wrapper.find('input[placeholder*="起运港"]')
      const arrivalInput = wrapper.find('[data-testid="arrival-port-input"]').exists() 
        ? wrapper.find('[data-testid="arrival-port-input"]')
        : wrapper.find('input[placeholder*="目的港"]')
      
      expect((departureInput.element as HTMLInputElement).value).toBe('CNSHA')
      expect((arrivalInput.element as HTMLInputElement).value).toBe('DEHAM')
    })
  })

  describe('ETD 日期范围', () => {
    it('应渲染 ETD 起始日期输入框', () => {
      const wrapper = mount(ScheduleSearch)
      
      expect(wrapper.find('[data-testid="etd-start-input"]').exists()).toBe(true)
    })

    it('应渲染 ETD 结束日期输入框', () => {
      const wrapper = mount(ScheduleSearch)
      
      expect(wrapper.find('[data-testid="etd-end-input"]').exists()).toBe(true)
    })

    it('应在查询时包含 ETD 日期范围', async () => {
      const wrapper = mount(ScheduleSearch)
      
      await wrapper.find('[data-testid="etd-start-input"]').setValue('2026-01-15')
      await wrapper.find('[data-testid="etd-end-input"]').setValue('2026-01-31')
      
      const searchButton = wrapper.findAll('button').find(b => b.text().includes('查询'))
      await searchButton!.trigger('click')
      
      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')![0][0]).toEqual({
        departurePort: '',
        arrivalPort: '',
        etdStart: '2026-01-15',
        etdEnd: '2026-01-31'
      })
    })

    it('应验证起始日期不能晚于结束日期', async () => {
      const wrapper = mount(ScheduleSearch)
      
      await wrapper.find('[data-testid="etd-start-input"]').setValue('2026-01-31')
      await wrapper.find('[data-testid="etd-end-input"]').setValue('2026-01-15')
      
      const searchButton = wrapper.findAll('button').find(b => b.text().includes('查询'))
      await searchButton!.trigger('click')
      
      // 应该不触发 search 事件
      expect(wrapper.emitted('search')).toBeFalsy()
      // 应该显示错误信息
      expect(wrapper.find('.date-error').exists()).toBe(true)
      expect(wrapper.text()).toContain('起始日期不能晚于结束日期')
    })

    it('应在重置时清空日期', async () => {
      const wrapper = mount(ScheduleSearch)
      
      await wrapper.find('[data-testid="etd-start-input"]').setValue('2026-01-15')
      await wrapper.find('[data-testid="etd-end-input"]').setValue('2026-01-31')
      
      const resetButton = wrapper.findAll('button').find(b => b.text().includes('重置'))
      await resetButton!.trigger('click')
      
      expect((wrapper.find('[data-testid="etd-start-input"]').element as HTMLInputElement).value).toBe('')
      expect((wrapper.find('[data-testid="etd-end-input"]').element as HTMLInputElement).value).toBe('')
    })
  })
})
