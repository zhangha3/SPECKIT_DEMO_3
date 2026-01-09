/**
 * PortSearch 组件测试
 * 
 * 功能分支: 001-port-query
 * TDD: 先写测试，确保失败后再实现
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PortSearch from '@/components/PortSearch.vue'

describe('PortSearch', () => {
  
  // T013: PortSearch 组件测试（精确查询场景）
  describe('精确查询场景', () => {
    it('应渲染搜索输入框和搜索按钮', () => {
      const wrapper = mount(PortSearch)
      
      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
      expect(wrapper.find('button').exists()).toBe(true)
    })

    it('应在点击搜索按钮时触发 search 事件', async () => {
      const wrapper = mount(PortSearch)
      
      const input = wrapper.find('input[type="text"]')
      await input.setValue('CNSHA')
      
      const button = wrapper.find('button')
      await button.trigger('click')
      
      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')![0]).toEqual(['CNSHA'])
    })

    it('应在输入为空时显示验证提示', async () => {
      const wrapper = mount(PortSearch)
      
      const button = wrapper.find('button')
      await button.trigger('click')
      
      expect(wrapper.text()).toContain('请输入查询条件')
    })

    it('应在按下 Enter 键时触发搜索', async () => {
      const wrapper = mount(PortSearch)
      
      const input = wrapper.find('input[type="text"]')
      await input.setValue('CNSHA')
      await input.trigger('keyup.enter')
      
      expect(wrapper.emitted('search')).toBeTruthy()
    })

    it('应正确处理小写输入', async () => {
      const wrapper = mount(PortSearch)
      
      const input = wrapper.find('input[type="text"]')
      await input.setValue('cnsha')
      
      const button = wrapper.find('button')
      await button.trigger('click')
      
      expect(wrapper.emitted('search')![0]).toEqual(['cnsha'])
    })
  })
})
