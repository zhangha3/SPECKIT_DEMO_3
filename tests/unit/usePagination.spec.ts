/**
 * usePagination Composable 单元测试
 * 
 * 功能分支: 001-port-query
 * TDD: 先写测试，确保失败后再实现
 */
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { usePagination } from '@/composables/usePagination'

describe('usePagination', () => {
  
  // T024: usePagination Composable 单元测试
  describe('基本分页功能', () => {
    it('应正确计算总页数', () => {
      const items = ref(Array.from({ length: 25 }, (_, i) => i))
      const { totalPages } = usePagination(items, 10)
      
      expect(totalPages.value).toBe(3)
    })

    it('应返回当前页的数据', () => {
      const items = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      const { paginatedItems, currentPage } = usePagination(items, 5)
      
      expect(currentPage.value).toBe(1)
      expect(paginatedItems.value).toEqual([1, 2, 3, 4, 5])
    })

    it('应支持切换到下一页', () => {
      const items = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      const { paginatedItems, currentPage, nextPage } = usePagination(items, 5)
      
      nextPage()
      
      expect(currentPage.value).toBe(2)
      expect(paginatedItems.value).toEqual([6, 7, 8, 9, 10])
    })

    it('应支持切换到上一页', () => {
      const items = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
      const { currentPage, nextPage, prevPage } = usePagination(items, 5)
      
      nextPage()
      nextPage()
      prevPage()
      
      expect(currentPage.value).toBe(2)
    })

    it('应不允许超出页码范围', () => {
      const items = ref([1, 2, 3, 4, 5])
      const { currentPage, nextPage, prevPage } = usePagination(items, 10)
      
      prevPage() // 尝试低于第1页
      expect(currentPage.value).toBe(1)
      
      nextPage() // 尝试超过最后一页
      expect(currentPage.value).toBe(1) // 只有1页
    })

    it('应支持跳转到指定页', () => {
      const items = ref(Array.from({ length: 50 }, (_, i) => i))
      const { currentPage, goToPage } = usePagination(items, 10)
      
      goToPage(3)
      expect(currentPage.value).toBe(3)
    })

    it('应正确处理空数据', () => {
      const items = ref<number[]>([])
      const { totalPages, paginatedItems } = usePagination(items, 10)
      
      expect(totalPages.value).toBe(0)
      expect(paginatedItems.value).toEqual([])
    })

    it('应在数据变化时重置到第一页', () => {
      const items = ref([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
      const { currentPage, nextPage, resetPage } = usePagination(items, 5)
      
      nextPage()
      expect(currentPage.value).toBe(2)
      
      resetPage()
      expect(currentPage.value).toBe(1)
    })
  })

  describe('默认每页条数', () => {
    it('应使用默认的每页10条', () => {
      const items = ref(Array.from({ length: 25 }, (_, i) => i))
      const { pageSize } = usePagination(items)
      
      expect(pageSize.value).toBe(10)
    })
  })
})
