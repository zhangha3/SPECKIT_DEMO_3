/**
 * PortList 组件测试
 * 
 * 功能分支: 001-port-query
 * TDD: 先写测试，确保失败后再实现
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PortList from '@/components/PortList.vue'
import type { Port } from '@/types/port'

const mockPorts: Port[] = [
  {
    code: 'CNSHA',
    name: 'Shanghai',
    nameCN: '上海',
    country: 'China',
    countryCode: 'CN',
    timezone: 'Asia/Shanghai'
  },
  {
    code: 'CNNGB',
    name: 'Ningbo',
    nameCN: '宁波',
    country: 'China',
    countryCode: 'CN',
    timezone: 'Asia/Shanghai'
  },
  {
    code: 'SGSIN',
    name: 'Singapore',
    nameCN: '新加坡',
    country: 'Singapore',
    countryCode: 'SG',
    timezone: 'Asia/Singapore'
  }
]

describe('PortList', () => {
  
  // T025: PortList 组件测试（列表展示）
  describe('列表展示', () => {
    it('应渲染港口列表', () => {
      const wrapper = mount(PortList, {
        props: { ports: mockPorts }
      })
      
      expect(wrapper.findAll('.port-item').length).toBe(3)
    })

    it('应显示港口代码和名称', () => {
      const wrapper = mount(PortList, {
        props: { ports: mockPorts }
      })
      
      const firstItem = wrapper.find('.port-item')
      expect(firstItem.text()).toContain('CNSHA')
      expect(firstItem.text()).toContain('上海')
      expect(firstItem.text()).toContain('Shanghai')
    })

    it('应在点击港口时触发 select 事件', async () => {
      const wrapper = mount(PortList, {
        props: { ports: mockPorts }
      })
      
      await wrapper.find('.port-item').trigger('click')
      
      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')![0]).toEqual([mockPorts[0]])
    })

    it('应在无港口时显示空状态', () => {
      const wrapper = mount(PortList, {
        props: { ports: [] }
      })
      
      expect(wrapper.find('.empty-state').exists()).toBe(true)
    })

    it('应高亮选中的港口', async () => {
      const wrapper = mount(PortList, {
        props: { 
          ports: mockPorts,
          selectedCode: 'CNSHA'
        }
      })
      
      const firstItem = wrapper.find('.port-item')
      expect(firstItem.classes()).toContain('selected')
    })
  })
})
