/**
 * PortDetail 组件测试
 * 
 * 功能分支: 001-port-query
 * TDD: 先写测试，确保失败后再实现
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PortDetail from '@/components/PortDetail.vue'
import type { Port } from '@/types/port'

const mockPort: Port = {
  code: 'CNSHA',
  name: 'Shanghai',
  nameCN: '上海',
  country: 'China',
  countryCode: 'CN',
  timezone: 'Asia/Shanghai'
}

describe('PortDetail', () => {
  
  // T034: PortDetail 组件测试（完整字段展示）
  describe('完整字段展示', () => {
    it('应渲染港口详情面板', () => {
      const wrapper = mount(PortDetail, {
        props: { port: mockPort }
      })
      
      expect(wrapper.find('.port-detail').exists()).toBe(true)
    })

    it('应显示港口代码', () => {
      const wrapper = mount(PortDetail, {
        props: { port: mockPort }
      })
      
      expect(wrapper.text()).toContain('CNSHA')
    })

    it('应显示港口中英文名称', () => {
      const wrapper = mount(PortDetail, {
        props: { port: mockPort }
      })
      
      expect(wrapper.text()).toContain('上海')
      expect(wrapper.text()).toContain('Shanghai')
    })

    it('应显示所在国家', () => {
      const wrapper = mount(PortDetail, {
        props: { port: mockPort }
      })
      
      expect(wrapper.text()).toContain('China')
      expect(wrapper.text()).toContain('CN')
    })

    it('应显示时区信息', () => {
      const wrapper = mount(PortDetail, {
        props: { port: mockPort }
      })
      
      // 时区应该被格式化为 UTC+X 或类似格式
      const text = wrapper.text()
      expect(text).toMatch(/UTC|GMT|Asia\/Shanghai/)
    })

    it('应以合适的布局展示所有字段', () => {
      const wrapper = mount(PortDetail, {
        props: { port: mockPort }
      })
      
      // 应该有标签和值的配对展示
      expect(wrapper.findAll('.detail-item').length).toBeGreaterThanOrEqual(4)
    })
  })
})
