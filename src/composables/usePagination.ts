/**
 * 分页 Composable
 * 
 * 功能分支: 001-port-query
 * 提供前端分页功能
 */
import { ref, computed, type Ref } from 'vue'

export function usePagination<T>(items: Ref<T[]>, defaultPageSize = 10) {
  const currentPage = ref(1)
  const pageSize = ref(defaultPageSize)

  const totalPages = computed(() => {
    if (items.value.length === 0) return 0
    return Math.ceil(items.value.length / pageSize.value)
  })

  const total = computed(() => items.value.length)

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return items.value.slice(start, end)
  })

  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  function nextPage() {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }

  function prevPage() {
    if (hasPrevPage.value) {
      currentPage.value--
    }
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  function resetPage() {
    currentPage.value = 1
  }

  return {
    currentPage,
    pageSize,
    totalPages,
    total,
    paginatedItems,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
    resetPage
  }
}
