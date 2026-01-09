/**
 * 港口自动补全 Composable
 * 
 * 功能分支: 002-shipping-schedule
 * 提供港口搜索建议和键盘导航功能
 */
import { ref, watch, computed } from 'vue'
import type { Port } from '@/types/port'
import { fuzzySearchPorts } from '@/services/portService'
import { useDebouncedRef } from './useDebounce'

export function usePortAutocomplete(ports: Port[]) {
  // 状态
  const query = ref('')
  const debouncedQuery = useDebouncedRef(query, 300)
  const suggestions = ref<Port[]>([])
  const selectedPort = ref<Port | null>(null)
  const selectedIndex = ref(-1)
  const isOpen = ref(false)

  // 监听防抖后的查询值进行搜索
  watch(debouncedQuery, (newQuery) => {
    if (!newQuery || newQuery.trim() === '') {
      suggestions.value = []
      isOpen.value = false
      selectedIndex.value = -1
      return
    }

    const results = fuzzySearchPorts(newQuery, ports, 10)
    suggestions.value = results
    isOpen.value = results.length > 0
    selectedIndex.value = -1
  })

  // 向下移动选择
  function moveDown() {
    if (suggestions.value.length === 0) return
    
    if (selectedIndex.value < suggestions.value.length - 1) {
      selectedIndex.value++
    } else {
      selectedIndex.value = 0 // 循环到开头
    }
  }

  // 向上移动选择
  function moveUp() {
    if (suggestions.value.length === 0) return
    
    if (selectedIndex.value > 0) {
      selectedIndex.value--
    } else {
      selectedIndex.value = suggestions.value.length - 1 // 循环到末尾
    }
  }

  // 选择港口
  function select(port: Port) {
    selectedPort.value = port
    query.value = port.code
    isOpen.value = false
    selectedIndex.value = -1
  }

  // 确认当前选择
  function confirmSelection() {
    if (selectedIndex.value >= 0 && selectedIndex.value < suggestions.value.length) {
      select(suggestions.value[selectedIndex.value])
    }
  }

  // 关闭下拉列表
  function close() {
    isOpen.value = false
    selectedIndex.value = -1
  }

  // 清空选择
  function clear() {
    query.value = ''
    selectedPort.value = null
    suggestions.value = []
    isOpen.value = false
    selectedIndex.value = -1
  }

  return {
    query,
    suggestions,
    selectedPort,
    selectedIndex,
    isOpen,
    moveDown,
    moveUp,
    select,
    confirmSelection,
    close,
    clear
  }
}
