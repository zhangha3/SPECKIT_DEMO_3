/**
 * PortAutocomplete 组件测试
 * 
 * 功能分支: 002-shipping-schedule
 * TDD: 先写测试，确保失败后再实现
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import PortAutocomplete from '@/components/PortAutocomplete.vue'
import type { Port } from '@/types/port'

// 模拟港口数据
const mockPorts: Port[] = [
  { code: 'CNSHA', name: 'Shanghai', nameCN: '上海', country: 'China', countryCode: 'CN', timezone: 'Asia/Shanghai' },
  { code: 'CNNGB', name: 'Ningbo', nameCN: '宁波', country: 'China', countryCode: 'CN', timezone: 'Asia/Shanghai' },
  { code: 'CNSHE', name: 'Shenyang', nameCN: '沈阳', country: 'China', countryCode: 'CN', timezone: 'Asia/Shanghai' },
  { code: 'DEHAM', name: 'Hamburg', nameCN: '汉堡', country: 'Germany', countryCode: 'DE', timezone: 'Europe/Berlin' }
]

describe('PortAutocomplete', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('渲染', () => {
    it('应渲染输入框', () => {
      const wrapper = mount(PortAutocomplete, {
        props: { ports: mockPorts, placeholder: '请选择港口' }
      })
      
      expect(wrapper.find('input').exists()).toBe(true)
    })

    it('应显示占位符', () => {
      const wrapper = mount(PortAutocomplete, {
        props: { ports: mockPorts, placeholder: '请选择港口' }
      })
      
      expect(wrapper.find('input').attributes('placeholder')).toBe('请选择港口')
    })

    it('应支持自定义 label', () => {
      const wrapper = mount(PortAutocomplete, {
        props: { ports: mockPorts, label: '起运港' }
      })
      
      expect(wrapper.text()).toContain('起运港')
    })
  })

  describe('下拉列表', () => {
    it('初始不应显示下拉列表', () => {
      const wrapper = mount(PortAutocomplete, {
        props: { ports: mockPorts }
      })
      
      expect(wrapper.find('.autocomplete-dropdown').exists()).toBe(false)
    })

    it('应在输入后显示匹配的港口列表', async () => {
      const wrapper = mount(PortAutocomplete, {
        props: { ports: mockPorts }
      })
      
      await wrapper.find('input').setValue('CN')
      vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(wrapper.find('.autocomplete-dropdown').exists()).toBe(true)
      expect(wrapper.findAll('.autocomplete-item').length).toBeGreaterThan(0)
    })

    it('应显示港口代码和名称', async () => {
      const wrapper = mount(PortAutocomplete, {
        props: { ports: mockPorts }
      })
      
      await wrapper.find('input').setValue('上海')
      vi.advanceTimersByTime(300)
      await nextTick()
      
      const item = wrapper.find('.autocomplete-item')
      expect(item.text()).toContain('CNSHA')
      expect(item.text()).toContain('上海')
    })

    it('无匹配结果时不应显示下拉列表', async () => {
      const wrapper = mount(PortAutocomplete, {
        props: { ports: mockPorts }
      })
      
      await wrapper.find('input').setValue('ZZZZZ')
      vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(wrapper.find('.autocomplete-dropdown').exists()).toBe(false)
    })
  })

  describe('选择交互', () => {
    it('应在点击选项时选中港口', async () => {
      const wrapper = mount(PortAutocomplete, {
        props: { ports: mockPorts }
      })
      
      await wrapper.find('input').setValue('CN')
      vi.advanceTimersByTime(300)
      await nextTick()
      
      await wrapper.find('.autocomplete-item').trigger('mousedown')
      await nextTick()
      
      expect(wrapper.emitted('select')).toBeTruthy()
    })

    it('选中后应更新输入框值', async () => {
      const wrapper = mount(PortAutocomplete, {
        props: { ports: mockPorts }
      })
      
      await wrapper.find('input').setValue('上海')
      vi.advanceTimersByTime(300)
      await nextTick()
      
      await wrapper.find('.autocomplete-item').trigger('mousedown')
      await nextTick()
      
      expect((wrapper.find('input').element as HTMLInputElement).value).toBe('CNSHA')
    })

    it('选中后应关闭下拉列表', async () => {
      const wrapper = mount(PortAutocomplete, {
        props: { ports: mockPorts }
      })
      
      await wrapper.find('input').setValue('CN')
      vi.advanceTimersByTime(300)
      await nextTick()
      
      await wrapper.find('.autocomplete-item').trigger('mousedown')
      await nextTick()
      
      expect(wrapper.find('.autocomplete-dropdown').exists()).toBe(false)
    })
  })

  describe('键盘导航', () => {
    it('应支持向下键选择', async () => {
      const wrapper = mount(PortAutocomplete, {
        props: { ports: mockPorts }
      })
      
      await wrapper.find('input').setValue('CN')
      vi.advanceTimersByTime(300)
      await nextTick()
      
      await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' })
      await nextTick()
      
      expect(wrapper.find('.autocomplete-item.highlighted').exists()).toBe(true)
    })

    it('应支持 Enter 键确认选择', async () => {
      const wrapper = mount(PortAutocomplete, {
        props: { ports: mockPorts }
      })
      
      await wrapper.find('input').setValue('CN')
      vi.advanceTimersByTime(300)
      await nextTick()
      
      await wrapper.find('input').trigger('keydown', { key: 'ArrowDown' })
      await wrapper.find('input').trigger('keydown', { key: 'Enter' })
      
      expect(wrapper.emitted('select')).toBeTruthy()
    })

    it('应支持 Escape 键关闭下拉列表', async () => {
      const wrapper = mount(PortAutocomplete, {
        props: { ports: mockPorts }
      })
      
      await wrapper.find('input').setValue('CN')
      vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(wrapper.find('.autocomplete-dropdown').exists()).toBe(true)
      
      await wrapper.find('input').trigger('keydown', { key: 'Escape' })
      await nextTick()
      
      expect(wrapper.find('.autocomplete-dropdown').exists()).toBe(false)
    })
  })

  describe('初始值和 v-model', () => {
    it('应支持通过 modelValue 设置初始选中', async () => {
      const wrapper = mount(PortAutocomplete, {
        props: { 
          ports: mockPorts, 
          modelValue: 'CNSHA' 
        }
      })
      
      expect((wrapper.find('input').element as HTMLInputElement).value).toBe('CNSHA')
    })

    it('应在选中后更新 modelValue', async () => {
      const wrapper = mount(PortAutocomplete, {
        props: { ports: mockPorts, modelValue: '' }
      })
      
      await wrapper.find('input').setValue('上海')
      vi.advanceTimersByTime(300)
      await nextTick()
      
      await wrapper.find('.autocomplete-item').trigger('mousedown')
      await nextTick()
      
      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      // 最后一个 update:modelValue 应该是选中后的港口代码
      const emittedValues = wrapper.emitted('update:modelValue')!
      expect(emittedValues[emittedValues.length - 1][0]).toBe('CNSHA')
    })
  })

  describe('清空按钮', () => {
    it('应在有值时显示清空按钮', async () => {
      const wrapper = mount(PortAutocomplete, {
        props: { ports: mockPorts, modelValue: 'CNSHA' }
      })
      
      expect(wrapper.find('.clear-button').exists()).toBe(true)
    })

    it('点击清空按钮应清空值', async () => {
      const wrapper = mount(PortAutocomplete, {
        props: { ports: mockPorts, modelValue: 'CNSHA' }
      })
      
      await wrapper.find('.clear-button').trigger('click')
      
      expect(wrapper.emitted('update:modelValue')![0][0]).toBe('')
      expect(wrapper.emitted('clear')).toBeTruthy()
    })
  })
})
