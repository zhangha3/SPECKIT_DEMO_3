/**
 * 船期搜索 Composable
 * 
 * 功能分支: 002-shipping-schedule
 * 封装船期搜索业务逻辑
 */
import { ref, computed } from 'vue'
import type { Port } from '@/types/port'
import type { 
  ShippingSchedule, 
  ScheduleSearchCriteria, 
  ScheduleDisplayItem 
} from '@/types/schedule'
import { 
  getSchedulesWithStock, 
  searchSchedules, 
  buildDisplayItem 
} from '@/services/scheduleService'
import { loadPorts } from '@/services/portService'

export function useScheduleSearch() {
  // 状态
  const schedules = ref<ShippingSchedule[]>([])
  const ports = ref<Port[]>([])
  const criteria = ref<ScheduleSearchCriteria>({})
  const filteredSchedules = ref<ShippingSchedule[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性：展示项列表
  const displayItems = computed<ScheduleDisplayItem[]>(() => {
    return filteredSchedules.value.map(schedule => 
      buildDisplayItem(schedule, ports.value)
    )
  })

  // 计算属性：结果总数
  const total = computed(() => filteredSchedules.value.length)

  // 初始化：加载船期和港口数据
  async function initialize() {
    try {
      isLoading.value = true
      error.value = null
      
      // 加载港口数据
      const portsData = await loadPorts()
      ports.value = portsData
      
      // 从 localStorage 加载船期数据（包含实时库存）
      const schedulesData = getSchedulesWithStock()
      schedules.value = schedulesData
      
      // 初始显示所有船期
      filteredSchedules.value = schedulesData
    } catch (e) {
      error.value = e instanceof Error ? e.message : '数据加载失败，请刷新页面重试'
      console.error('Failed to initialize schedule search:', e)
    } finally {
      isLoading.value = false
    }
  }

  // 执行搜索
  function performSearch() {
    // 重新从 localStorage 读取最新库存数据
    const latestSchedules = getSchedulesWithStock()
    schedules.value = latestSchedules
    
    const result = searchSchedules(criteria.value, latestSchedules)
    filteredSchedules.value = result.schedules
  }

  // 重置搜索条件
  function reset() {
    criteria.value = {}
    filteredSchedules.value = schedules.value
  }

  return {
    // 状态
    schedules,
    ports,
    criteria,
    displayItems,
    total,
    isLoading,
    error,
    
    // 方法
    initialize,
    performSearch,
    reset
  }
}
