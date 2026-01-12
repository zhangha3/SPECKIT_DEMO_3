<script setup lang="ts">
/**
 * 订单查询主页面视图
 * 
 * 功能分支: 003-user-booking-order
 * 相关需求: FR-019 ~ FR-025
 * 
 * 集成订单搜索和订单列表组件，提供：
 * - 按订单号精确查询 (FR-019)
 * - 查看订单详情 (FR-022)
 * - 查看我的所有订单 (FR-024)
 * - 分页展示 (FR-025)
 */
import { ref, onMounted, computed } from 'vue'
import OrderSearch from '@/components/OrderSearch.vue'
import OrderList from '@/components/OrderList.vue'
import Pagination from '@/components/Pagination.vue'
import { useOrderSearch } from '@/composables/useOrderSearch'
import { useAuth } from '@/composables/useAuth'
import type { Order } from '@/types/order'

const { isLoggedIn, currentUser } = useAuth()

const {
  criteria,
  order,
  orders,
  isLoading,
  error,
  currentPage,
  totalPages,
  total,
  searchByOrderId,
  loadUserOrders,
  nextPage,
  prevPage,
  reset
} = useOrderSearch()

// 视图模式: 'list' - 订单列表 | 'search' - 搜索结果 | 'detail' - 订单详情
const viewMode = ref<'list' | 'search' | 'detail'>('list')

// 当前选中的订单（用于详情展示）
const selectedOrder = ref<Order | null>(null)

// 计算属性：是否需要分页
const needsPagination = computed(() => total.value > 10)

// 计算属性：当前显示的订单列表
const displayOrders = computed(() => {
  if (viewMode.value === 'search' && order.value) {
    return [order.value]
  }
  return orders.value
})

/**
 * 初始化加载用户订单
 */
onMounted(() => {
  if (isLoggedIn.value) {
    loadUserOrders()
  }
})

/**
 * 处理订单号搜索
 */
function handleSearch(orderId: string) {
  viewMode.value = 'search'
  searchByOrderId(orderId)
}

/**
 * 处理重置
 */
function handleReset() {
  reset()
  viewMode.value = 'list'
  loadUserOrders()
}

/**
 * 处理订单选择（查看详情）
 */
function handleSelectOrder(orderItem: Order) {
  selectedOrder.value = orderItem
  viewMode.value = 'detail'
}

/**
 * 返回列表视图
 */
function backToList() {
  viewMode.value = 'list'
  selectedOrder.value = null
  if (orders.value.length === 0) {
    loadUserOrders()
  }
}

/**
 * 格式化日期
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * 格式化时间
 */
function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

/**
 * 获取状态文本
 */
function getStatusText(status: string): string {
  const map: Record<string, string> = {
    'confirmed': '已确认',
    'pending': '待确认',
    'cancelled': '已取消',
    'completed': '已完成'
  }
  return map[status] || status
}
</script>

<template>
  <div class="order-query-view">
    <header class="page-header">
      <h1>我的订单</h1>
      <p class="subtitle">查看和管理您的舱位订单</p>
    </header>

    <main class="main-content">
      <!-- 订单搜索 -->
      <OrderSearch 
        :loading="isLoading && viewMode === 'search'"
        @search="handleSearch"
        @reset="handleReset"
      />

      <!-- 错误提示 -->
      <div v-if="error" class="error-state">
        {{ error }}
      </div>

      <!-- 详情视图 -->
      <div v-if="viewMode === 'detail' && selectedOrder" class="order-detail-view">
        <button type="button" class="back-btn" @click="backToList">
          ← 返回列表
        </button>
        
        <div class="detail-card">
          <div class="detail-header">
            <h2 class="detail-order-id">{{ selectedOrder.id }}</h2>
            <span :class="['detail-status', `status-${selectedOrder.status}`]">
              {{ getStatusText(selectedOrder.status) }}
            </span>
          </div>
          
          <div class="detail-section">
            <h3 class="section-title">航线信息</h3>
            <div class="route-display">
              <div class="route-port">
                <span class="port-label">起运港</span>
                <span class="port-code">{{ selectedOrder.departurePort.code }}</span>
                <span class="port-name">{{ selectedOrder.departurePort.name }}</span>
                <span class="port-country">{{ selectedOrder.departurePort.country }}</span>
              </div>
              <div class="route-arrow-large">→</div>
              <div class="route-port">
                <span class="port-label">目的港</span>
                <span class="port-code">{{ selectedOrder.arrivalPort.code }}</span>
                <span class="port-name">{{ selectedOrder.arrivalPort.name }}</span>
                <span class="port-country">{{ selectedOrder.arrivalPort.country }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3 class="section-title">船期信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">船公司</span>
                <span class="info-value">{{ selectedOrder.carrier }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">船名</span>
                <span class="info-value">{{ selectedOrder.vesselName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">预计开船 (ETD)</span>
                <span class="info-value">{{ formatDate(selectedOrder.etd) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">预计到港 (ETA)</span>
                <span class="info-value">{{ formatDate(selectedOrder.eta) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">转运天数</span>
                <span class="info-value">{{ selectedOrder.transitDays }}天</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3 class="section-title">订单信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">下单时间</span>
                <span class="info-value">{{ formatDateTime(selectedOrder.orderTime) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">订单状态</span>
                <span class="info-value">{{ getStatusText(selectedOrder.status) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 列表/搜索结果视图 -->
      <template v-else>
        <!-- 结果统计 -->
        <div v-if="!isLoading && !error && viewMode === 'list'" class="result-stats">
          共 <strong>{{ total }}</strong> 条订单
        </div>
        
        <div v-if="!isLoading && !error && viewMode === 'search' && order" class="result-stats">
          找到 <strong>1</strong> 条订单
        </div>

        <!-- 订单列表 -->
        <OrderList 
          :orders="displayOrders"
          :loading="isLoading"
          @select="handleSelectOrder"
        />

        <!-- 分页控件 -->
        <Pagination 
          v-if="needsPagination && !isLoading && !error && viewMode === 'list'"
          :current-page="currentPage"
          :total-pages="totalPages"
          :total="total"
          @prev="prevPage"
          @next="nextPage"
        />
      </template>
    </main>
  </div>
</template>

<style scoped>
.order-query-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 8px;
}

.subtitle {
  font-size: 14px;
  color: #666;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.error-state {
  padding: 20px;
  background-color: #ffebee;
  border: 1px solid #ef9a9a;
  border-radius: 8px;
  color: #c62828;
  text-align: center;
}

.result-stats {
  padding: 10px 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
}

.result-stats strong {
  color: #1976d2;
}

/* 详情视图 */
.order-detail-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.back-btn {
  align-self: flex-start;
  padding: 8px 16px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background-color: #f5f5f5;
  border-color: #ccc;
}

.detail-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
}

.detail-order-id {
  font-size: 20px;
  font-weight: 600;
  font-family: 'Consolas', 'Monaco', monospace;
}

.detail-status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.detail-status.status-confirmed {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.detail-status.status-pending {
  background-color: #fff3e0;
  color: #ef6c00;
}

.detail-status.status-cancelled {
  background-color: #ffebee;
  color: #c62828;
}

.detail-status.status-completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.detail-section {
  padding: 24px;
  border-bottom: 1px solid #eee;
}

.detail-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.route-display {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.route-port {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

.port-label {
  font-size: 12px;
  color: #999;
}

.port-code {
  font-size: 24px;
  font-weight: 700;
  color: #1976d2;
}

.port-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.port-country {
  font-size: 12px;
  color: #666;
}

.route-arrow-large {
  font-size: 32px;
  color: #ccc;
  flex-shrink: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #999;
}

.info-value {
  font-size: 15px;
  color: #333;
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 600px) {
  .route-display {
    flex-direction: column;
    gap: 16px;
  }
  
  .route-arrow-large {
    transform: rotate(90deg);
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
</style>
