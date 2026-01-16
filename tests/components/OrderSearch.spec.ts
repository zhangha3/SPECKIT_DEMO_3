/**
 * OrderSearch 组件测试
 * 
 * 功能分支: 003-user-booking-order
 * 测试范围: FR-019, FR-020
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderSearch from '@/components/OrderSearch.vue'

describe('OrderSearch', () => {
  describe('渲染', () => {
    it('应该正确渲染搜索组件', () => {
      const wrapper = mount(OrderSearch)
      
      expect(wrapper.find('.order-search').exists()).toBe(true)
      expect(wrapper.find('.order-id-input').exists()).toBe(true)
      expect(wrapper.find('.search-btn').exists()).toBe(true)
      expect(wrapper.find('.reset-btn').exists()).toBe(true)
    })
    
    it('应该显示订单号输入框标签', () => {
      const wrapper = mount(OrderSearch)
      
      expect(wrapper.find('.input-label').text()).toBe('订单号')
    })
    
    it('应该显示输入提示占位符', () => {
      const wrapper = mount(OrderSearch)
      
      const input = wrapper.find('.order-id-input')
      expect(input.attributes('placeholder')).toContain('ORD-20251209-001')
    })
    
    it('应该显示格式提示信息', () => {
      const wrapper = mount(OrderSearch)
      
      expect(wrapper.find('.search-hint').text()).toContain('ORD-YYYYMMDD-XXX')
    })
  })
  
  describe('初始状态', () => {
    it('初始时搜索按钮应该启用（支持查询全部订单）', () => {
      const wrapper = mount(OrderSearch)
      
      const searchBtn = wrapper.find('.search-btn')
      expect(searchBtn.attributes('disabled')).toBeUndefined()
    })
    
    it('应该支持初始订单号 prop', () => {
      const wrapper = mount(OrderSearch, {
        props: {
          initialOrderId: 'ORD-20251209-001'
        }
      })
      
      const input = wrapper.find<HTMLInputElement>('.order-id-input')
      expect(input.element.value).toBe('ORD-20251209-001')
    })
    
    it('有初始订单号时搜索按钮应该启用', () => {
      const wrapper = mount(OrderSearch, {
        props: {
          initialOrderId: 'ORD-20251209-001'
        }
      })
      
      const searchBtn = wrapper.find('.search-btn')
      expect(searchBtn.attributes('disabled')).toBeUndefined()
    })
  })
  
  describe('输入交互', () => {
    it('输入订单号后搜索按钮应该启用', async () => {
      const wrapper = mount(OrderSearch)
      
      const input = wrapper.find('.order-id-input')
      await input.setValue('ORD-20251209-001')
      
      const searchBtn = wrapper.find('.search-btn')
      expect(searchBtn.attributes('disabled')).toBeUndefined()
    })
    
    it('只输入空格时搜索按钮应该启用（支持查询全部订单）', async () => {
      const wrapper = mount(OrderSearch)
      
      const input = wrapper.find('.order-id-input')
      await input.setValue('   ')
      
      const searchBtn = wrapper.find('.search-btn')
      expect(searchBtn.attributes('disabled')).toBeUndefined()
    })
  })
  
  describe('搜索功能', () => {
    it('点击搜索按钮应该触发 search 事件', async () => {
      const wrapper = mount(OrderSearch)
      
      const input = wrapper.find('.order-id-input')
      await input.setValue('ORD-20251209-001')
      
      await wrapper.find('.search-btn').trigger('click')
      
      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')![0]).toEqual(['ORD-20251209-001'])
    })
    
    it('搜索时应该去除订单号前后空格', async () => {
      const wrapper = mount(OrderSearch)
      
      const input = wrapper.find('.order-id-input')
      await input.setValue('  ORD-20251209-001  ')
      
      await wrapper.find('.search-btn').trigger('click')
      
      expect(wrapper.emitted('search')![0]).toEqual(['ORD-20251209-001'])
    })
    
    it('按 Enter 键应该触发搜索', async () => {
      const wrapper = mount(OrderSearch)
      
      const input = wrapper.find('.order-id-input')
      await input.setValue('ORD-20251209-001')
      await input.trigger('keydown', { key: 'Enter' })
      
      expect(wrapper.emitted('search')).toBeTruthy()
    })
    
    it('输入为空时按 Enter 不应该触发搜索', async () => {
      const wrapper = mount(OrderSearch)
      
      const input = wrapper.find('.order-id-input')
      await input.trigger('keydown.enter')
      
      expect(wrapper.emitted('search')).toBeFalsy()
    })
  })
  
  describe('重置功能', () => {
    it('点击重置按钮应该触发 reset 事件', async () => {
      const wrapper = mount(OrderSearch)
      
      await wrapper.find('.reset-btn').trigger('click')
      
      expect(wrapper.emitted('reset')).toBeTruthy()
    })
    
    it('重置应该清空输入框', async () => {
      const wrapper = mount(OrderSearch, {
        props: {
          initialOrderId: 'ORD-20251209-001'
        }
      })
      
      await wrapper.find('.reset-btn').trigger('click')
      
      const input = wrapper.find<HTMLInputElement>('.order-id-input')
      expect(input.element.value).toBe('')
    })
  })
  
  describe('加载状态', () => {
    it('加载时应该禁用搜索按钮', () => {
      const wrapper = mount(OrderSearch, {
        props: {
          loading: true,
          initialOrderId: 'ORD-20251209-001'
        }
      })
      
      const searchBtn = wrapper.find('.search-btn')
      expect(searchBtn.attributes('disabled')).toBeDefined()
    })
    
    it('加载时应该显示加载文本', () => {
      const wrapper = mount(OrderSearch, {
        props: {
          loading: true
        }
      })
      
      expect(wrapper.find('.search-btn').text()).toContain('查询中')
    })
    
    it('加载时应该显示 spinner', () => {
      const wrapper = mount(OrderSearch, {
        props: {
          loading: true
        }
      })
      
      expect(wrapper.find('.spinner').exists()).toBe(true)
    })
    
    it('加载时应该禁用输入框', () => {
      const wrapper = mount(OrderSearch, {
        props: {
          loading: true
        }
      })
      
      const input = wrapper.find('.order-id-input')
      expect(input.attributes('disabled')).toBeDefined()
    })
    
    it('加载时应该禁用重置按钮', () => {
      const wrapper = mount(OrderSearch, {
        props: {
          loading: true
        }
      })
      
      const resetBtn = wrapper.find('.reset-btn')
      expect(resetBtn.attributes('disabled')).toBeDefined()
    })
  })
  
  describe('无障碍性', () => {
    it('输入框应该有 aria-label', () => {
      const wrapper = mount(OrderSearch)
      
      const input = wrapper.find('.order-id-input')
      expect(input.attributes('aria-label')).toBe('订单号')
    })
    
    it('输入框应该有关联的 label', () => {
      const wrapper = mount(OrderSearch)
      
      const label = wrapper.find('label')
      const input = wrapper.find('.order-id-input')
      
      expect(label.attributes('for')).toBe('order-id-input')
      expect(input.attributes('id')).toBe('order-id-input')
    })
  })
})
