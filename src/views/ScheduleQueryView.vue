<script setup lang="ts">
/**
 * 船期查询主页面视图
 * 
 * 功能分支: 002-shipping-schedule, 003-user-booking-order
 * 集成船期搜索、列表和分页组件
 * 新增: 购买舱位功能 (FR-010 ~ FR-016)
 */
import { ref, onMounted, computed } from 'vue'
import ScheduleSearch from '@/components/ScheduleSearch.vue'
import ScheduleList from '@/components/ScheduleList.vue'
import Pagination from '@/components/Pagination.vue'
import PurchaseDialog from '@/components/PurchaseDialog.vue'
import { useScheduleSearch } from '@/composables/useScheduleSearch'
import { usePagination } from '@/composables/usePagination'
import { useAuth } from '@/composables/useAuth'
import { createOrder } from '@/services/orderService'
import type { ScheduleDisplayItem } from '@/types/schedule'

const { 
  displayItems, 
  ports,
  total, 
  isLoading, 
  error,
  criteria,
  initialize,
  performSearch,
  reset
} = useScheduleSearch()

const { isLoggedIn, currentUser } = useAuth()

// 分页
const { 
  currentPage, 
  totalPages, 
  paginatedItems, 
  nextPage, 
  prevPage,
  resetPage
} = usePagination(displayItems, 10)

// 计算属性：是否需要分页
const needsPagination = computed(() => total.value > 10)

// ============================================================================
// 购买功能状态 (003-user-booking-order)
// ============================================================================

/** 是否显示购买确认弹窗 */
const showPurchaseDialog = ref(false)

/** 当前选择的船期 */
const selectedSchedule = ref<ScheduleDisplayItem | null>(null)

/** 购买处理中 */
const isPurchasing = ref(false)

/** 购买成功提示 */
const purchaseSuccess = ref<{ show: boolean; orderId: string }>({ show: false, orderId: '' })

onMounted(() => {
  initialize()
})

function handleSearch(searchCriteria: { departurePort: string; arrivalPort: string; etdStart: string; etdEnd: string }) {
  criteria.value.departurePort = searchCriteria.departurePort || undefined
  criteria.value.arrivalPort = searchCriteria.arrivalPort || undefined
  criteria.value.etdStart = searchCriteria.etdStart || undefined
  criteria.value.etdEnd = searchCriteria.etdEnd || undefined
  performSearch()
  resetPage()
}

function handleReset() {
  reset()
  performSearch()
  resetPage()
}

function handleSelectSchedule(item: ScheduleDisplayItem) {
  // 未来可扩展：显示船期详情
  console.log('选中船期:', item.schedule.id)
}

// ============================================================================
// 购买功能处理 (003-user-booking-order)
// ============================================================================

/**
 * 处理购买按钮点击 - 显示确认弹窗 (FR-017)
 */
function handlePurchase(item: ScheduleDisplayItem) {
  selectedSchedule.value = item
  showPurchaseDialog.value = true
}

/**
 * 确认购买 (FR-012, FR-016)
 */
async function handleConfirmPurchase() {
  if (!selectedSchedule.value || !currentUser.value) return
  
  isPurchasing.value = true
  
  try {
    const result = createOrder(selectedSchedule.value.schedule.id, currentUser.value.username)
    
    if (result.success) {
      // 购买成功，显示成功提示 (FR-016)
      purchaseSuccess.value = { show: true, orderId: result.orderId! }
      showPurchaseDialog.value = false
      
      // 刷新列表以显示更新后的库存
      performSearch()
      
      // 3秒后自动隐藏成功提示
      setTimeout(() => {
        purchaseSuccess.value = { show: false, orderId: '' }
      }, 5000)
    } else {
      // 购买失败，显示错误
      alert(result.error || '购买失败，请重试')
    }
  } finally {
    isPurchasing.value = false
    selectedSchedule.value = null
  }
}

/**
 * 取消购买
 */
function handleCancelPurchase() {
  showPurchaseDialog.value = false
  selectedSchedule.value = null
}

/**
 * 关闭成功提示
 */
function closePurchaseSuccess() {
  purchaseSuccess.value = { show: false, orderId: '' }
}
</script>

<template>
  <div class="schedule-query-view">
    <header class="page-header">
      <h1>船期查询</h1>
      <p class="subtitle">查看航运船期信息，了解航线和预计发运时间</p>
    </header>

    <main class="main-content">
      <!-- 购买成功提示 (FR-016) -->
      <div 
        v-if="purchaseSuccess.show" 
        class="purchase-success-toast"
        role="alert"
        aria-live="polite"
      >
        <span class="success-icon">✓</span>
        <span class="success-message">
          购买成功！订单号: <strong>{{ purchaseSuccess.orderId }}</strong>
        </span>
        <button 
          class="close-btn"
          type="button"
          aria-label="关闭提示"
          @click="closePurchaseSuccess"
        >×</button>
      </div>

      <!-- 搜索条件（带港口自动补全） -->
      <ScheduleSearch 
        :ports="ports"
        @search="handleSearch"
        @reset="handleReset"
      />

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <span class="spinner"></span>
        正在加载数据...
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-state">
        {{ error }}
      </div>

      <!-- 结果统计 -->
      <div v-if="!isLoading && !error" class="result-stats">
        共 <strong>{{ total }}</strong> 条船期
      </div>

      <!-- 船期列表 (启用购买功能) -->
      <ScheduleList 
        v-if="!isLoading && !error"
        :schedules="paginatedItems"
        :loading="isLoading"
        :show-purchase="isLoggedIn"
        @select="handleSelectSchedule"
        @purchase="handlePurchase"
      />

      <!-- 分页控件 -->
      <Pagination 
        v-if="needsPagination && !isLoading && !error"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="total"
        @prev="prevPage"
        @next="nextPage"
      />
    </main>

    <!-- 购买确认弹窗 (FR-017) -->
    <PurchaseDialog
      :visible="showPurchaseDialog"
      :schedule="selectedSchedule"
      :loading="isPurchasing"
      @confirm="handleConfirmPurchase"
      @cancel="handleCancelPurchase"
    />
  </div>
</template>

<style scoped>
.schedule-query-view {
  max-width: 1200px;
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

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #666;
}

.spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  border: 2px solid #ddd;
  border-top-color: #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

/* 购买成功提示样式 (003-user-booking-order) */
.purchase-success-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #4caf50 0%, #43a047 100%);
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon {
  font-size: 24px;
  font-weight: bold;
}

.success-message {
  flex: 1;
  font-size: 15px;
}

.success-message strong {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.purchase-success-toast .close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.purchase-success-toast .close-btn:hover {
  opacity: 1;
}
</style>
