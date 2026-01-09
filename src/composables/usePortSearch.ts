/**
 * 港口搜索 Composable
 * 
 * 功能分支: 001-port-query
 * 封装港口搜索业务逻辑
 */
import { ref, computed } from 'vue'
import type { Port, SearchResult, SearchMode } from '@/types/port'
import { loadPorts, search, determineSearchMode } from '@/services/portService'

export function usePortSearch() {
  // 状态
  const query = ref('')
  const ports = ref<Port[]>([])
  const searchResult = ref<SearchResult | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const hasSearched = ref(false)

  // 计算属性
  const results = computed(() => searchResult.value?.ports || [])
  const total = computed(() => searchResult.value?.total || 0)
  const searchMode = computed<SearchMode | null>(() => searchResult.value?.mode || null)
  const noResults = computed(() => hasSearched.value && total.value === 0)

  // 初始化：加载港口数据
  async function initialize() {
    try {
      isLoading.value = true
      error.value = null
      ports.value = await loadPorts()
    } catch (e) {
      error.value = '数据加载失败，请刷新页面重试'
      console.error('Failed to load ports:', e)
    } finally {
      isLoading.value = false
    }
  }

  // 执行搜索
  function performSearch(searchQuery: string) {
    if (!searchQuery || searchQuery.trim() === '') {
      error.value = '请输入查询条件'
      return
    }

    error.value = null
    hasSearched.value = true
    searchResult.value = search(searchQuery.trim(), ports.value)
    query.value = searchQuery.trim()
  }

  // 重置搜索
  function reset() {
    query.value = ''
    searchResult.value = null
    error.value = null
    hasSearched.value = false
  }

  // 获取当前查询模式（用于预览）
  function getSearchMode(input: string): SearchMode {
    return determineSearchMode(input)
  }

  return {
    // 状态
    query,
    results,
    total,
    searchMode,
    isLoading,
    error,
    hasSearched,
    noResults,
    
    // 方法
    initialize,
    performSearch,
    reset,
    getSearchMode
  }
}
