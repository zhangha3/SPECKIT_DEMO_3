/**
 * 订单查询 composable
 * 
 * 功能分支: 003-user-booking-order
 * 相关需求: FR-019 ~ FR-025
 * 
 * 提供订单查询功能：
 * - 按订单号精确查询 (FR-019)
 * - 获取当前用户所有订单列表 (FR-024)
 * - 分页支持 (FR-025)
 */
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import { useAuth } from './useAuth'
import { 
  getOrderById, 
  getOrdersByUserId, 
  getOrdersByUserIdPaginated
} from '@/services/orderService'
import type { Order } from '@/types/order'

/**
 * 订单查询条件
 */
export interface OrderSearchCriteria {
  /** 订单号 (精确匹配) */
  orderId?: string
}

/**
 * useOrderSearch 返回类型
 */
export interface UseOrderSearchReturn {
  /** 查询条件 */
  criteria: Ref<OrderSearchCriteria>
  
  /** 查询到的订单 (单个订单查询结果) */
  order: Ref<Order | null>
  
  /** 订单列表 (列表查询结果) */
  orders: Ref<Order[]>
  
  /** 加载状态 */
  isLoading: Ref<boolean>
  
  /** 错误信息 */
  error: Ref<string | null>
  
  /** 分页 - 当前页码 */
  currentPage: Ref<number>
  
  /** 分页 - 总页数 */
  totalPages: ComputedRef<number>
  
  /** 分页 - 总记录数 */
  total: Ref<number>
  
  /** 分页 - 每页条数 */
  pageSize: Ref<number>
  
  /** 按订单号查询单个订单 */
  searchByOrderId: (orderId: string) => void
  
  /** 获取当前用户的所有订单 (分页) */
  loadUserOrders: (page?: number) => void
  
  /** 前往下一页 */
  nextPage: () => void
  
  /** 前往上一页 */
  prevPage: () => void
  
  /** 重置查询 */
  reset: () => void
}

/**
 * 订单查询 composable
 * 
 * 使用方式:
 * ```ts
 * const { 
 *   criteria, 
 *   order, 
 *   orders, 
 *   isLoading, 
 *   error,
 *   searchByOrderId,
 *   loadUserOrders 
 * } = useOrderSearch()
 * 
 * // 按订单号查询
 * searchByOrderId('ORD-20251209-001')
 * 
 * // 获取用户所有订单
 * loadUserOrders()
 * ```
 */
export function useOrderSearch(): UseOrderSearchReturn {
  const { currentUser, isLoggedIn } = useAuth()
  
  // 状态
  const criteria = ref<OrderSearchCriteria>({})
  const order = ref<Order | null>(null)
  const orders = ref<Order[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // 分页状态
  const currentPage = ref(1)
  const total = ref(0)
  const pageSize = ref(10)
  
  // 计算总页数
  const totalPages = computed(() => {
    if (total.value === 0) return 1
    return Math.ceil(total.value / pageSize.value)
  })
  
  /**
   * 按订单号查询单个订单 (FR-019)
   */
  function searchByOrderId(orderId: string): void {
    // 清空之前的结果
    order.value = null
    orders.value = []
    error.value = null
    
    // 校验登录状态
    if (!isLoggedIn.value || !currentUser.value) {
      error.value = '请先登录'
      return
    }
    
    // 校验订单号
    if (!orderId || !orderId.trim()) {
      error.value = '请输入订单号'
      return
    }
    
    const trimmedOrderId = orderId.trim()
    criteria.value.orderId = trimmedOrderId
    
    isLoading.value = true
    
    try {
      const result = getOrderById(trimmedOrderId, currentUser.value.username)
      
      if (result) {
        order.value = result
        error.value = null
      } else {
        order.value = null
        error.value = `未找到订单: ${trimmedOrderId}`
      }
    } catch (e) {
      error.value = '查询订单失败'
      console.error('查询订单失败:', e)
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 获取当前用户的所有订单 (FR-024, FR-025)
   */
  function loadUserOrders(page: number = 1): void {
    // 清空之前的结果
    order.value = null
    error.value = null
    
    // 校验登录状态
    if (!isLoggedIn.value || !currentUser.value) {
      error.value = '请先登录'
      orders.value = []
      total.value = 0
      return
    }
    
    isLoading.value = true
    currentPage.value = page
    
    try {
      const result = getOrdersByUserIdPaginated(
        currentUser.value.username, 
        page, 
        pageSize.value
      )
      
      orders.value = result.items
      total.value = result.total
      error.value = null
    } catch (e) {
      error.value = '加载订单列表失败'
      orders.value = []
      total.value = 0
      console.error('加载订单列表失败:', e)
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 前往下一页
   */
  function nextPage(): void {
    if (currentPage.value < totalPages.value) {
      loadUserOrders(currentPage.value + 1)
    }
  }
  
  /**
   * 前往上一页
   */
  function prevPage(): void {
    if (currentPage.value > 1) {
      loadUserOrders(currentPage.value - 1)
    }
  }
  
  /**
   * 重置查询
   */
  function reset(): void {
    criteria.value = {}
    order.value = null
    orders.value = []
    error.value = null
    currentPage.value = 1
    total.value = 0
  }
  
  return {
    criteria,
    order,
    orders,
    isLoading,
    error,
    currentPage,
    totalPages,
    total,
    pageSize,
    searchByOrderId,
    loadUserOrders,
    nextPage,
    prevPage,
    reset
  }
}
