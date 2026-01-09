/**
 * Pagination 组件测试
 * 
 * 功能分支: 001-port-query
 * TDD: 先写测试，确保失败后再实现
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Pagination from '@/components/Pagination.vue'

describe('Pagination', () => {
  
  // T026: Pagination 组件测试
  describe('分页控件', () => {
    it('应渲染当前页码和总页数', () => {
      const wrapper = mount(Pagination, {
        props: { 
          currentPage: 2,
          totalPages: 5,
          total: 50
        }
      })
      
      expect(wrapper.text()).toContain('2')
      expect(wrapper.text()).toContain('5')
    })

    it('应在第一页时禁用上一页按钮', () => {
      const wrapper = mount(Pagination, {
        props: { 
          currentPage: 1,
          totalPages: 5,
          total: 50
        }
      })
      
      const prevButton = wrapper.find('.prev-button')
      expect(prevButton.attributes('disabled')).toBeDefined()
    })

    it('应在最后一页时禁用下一页按钮', () => {
      const wrapper = mount(Pagination, {
        props: { 
          currentPage: 5,
          totalPages: 5,
          total: 50
        }
      })
      
      const nextButton = wrapper.find('.next-button')
      expect(nextButton.attributes('disabled')).toBeDefined()
    })

    it('应在点击上一页时触发 prev 事件', async () => {
      const wrapper = mount(Pagination, {
        props: { 
          currentPage: 2,
          totalPages: 5,
          total: 50
        }
      })
      
      await wrapper.find('.prev-button').trigger('click')
      
      expect(wrapper.emitted('prev')).toBeTruthy()
    })

    it('应在点击下一页时触发 next 事件', async () => {
      const wrapper = mount(Pagination, {
        props: { 
          currentPage: 2,
          totalPages: 5,
          total: 50
        }
      })
      
      await wrapper.find('.next-button').trigger('click')
      
      expect(wrapper.emitted('next')).toBeTruthy()
    })

    it('应显示结果总数', () => {
      const wrapper = mount(Pagination, {
        props: { 
          currentPage: 1,
          totalPages: 5,
          total: 50
        }
      })
      
      expect(wrapper.text()).toContain('50')
    })

    it('应在只有一页时隐藏分页控件', () => {
      const wrapper = mount(Pagination, {
        props: { 
          currentPage: 1,
          totalPages: 1,
          total: 5
        }
      })
      
      expect(wrapper.find('.pagination-controls').exists()).toBe(false)
    })
  })
})
