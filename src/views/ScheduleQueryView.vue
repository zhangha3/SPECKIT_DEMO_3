<script setup lang="ts">
/**
 * 船期查询主页面视图
 * 
 * 功能分支: 002-shipping-schedule, 003-user-booking-order, 004-fund-stats-enhancement
 * 集成船期搜索、列表和分页组件
 * 新增: 购买舱位功能 (FR-010 ~ FR-016)
 * 新增: 购买扣款和余额检查 (004-fund-stats-enhancement)
 */
import { ref, onMounted, computed, watch } from 'vue'
import ScheduleSearch from '@/components/ScheduleSearch.vue'
import ScheduleList from '@/components/ScheduleList.vue'
import Pagination from '@/components/Pagination.vue'
import PurchaseDialog from '@/components/PurchaseDialog.vue'
import HotSchedulePanel from '@/components/HotSchedulePanel.vue'
import { useScheduleSearch } from '@/composables/useScheduleSearch'
import { usePagination } from '@/composables/usePagination'
import { useAuth } from '@/composables/useAuth'
import { useFund } from '@/composables/useFund'
import { createOrder } from '@/services/orderService'
import { purchase as fundPurchase } from '@/services/fundService'
import { getSchedulePrice } from '@/services/scheduleService'
import type { ScheduleDisplayItem } from '@/types/schedule'

// ============================================================================
// Emits
// ============================================================================

const emit = defineEmits<{
  /** 请求跳转到资金账户页面 */
  navigateTo: [page: string]
}>()

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

// 资金账户 - 获取用户余额
const { balance, loadBalance } = useFund()

// 当用户登录或变更时，加载余额
watch(
  () => currentUser.value?.username,
  (username) => {
    if (username) {
      loadBalance(username)
    }
  },
  { immediate: true }
)

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

/** 预填的起始港（热门航线点击） */
const prefillDeparturePort = ref('')

/** 预填的目的港（热门航线点击） */
const prefillArrivalPort = ref('')

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
 * 确认购买 (FR-012, FR-016, FR-024 扣款)
 */
async function handleConfirmPurchase() {
  if (!selectedSchedule.value || !currentUser.value) return
  
  isPurchasing.value = true
  
  try {
    const scheduleId = selectedSchedule.value.schedule.id
    const username = currentUser.value.username
    const price = getSchedulePrice(scheduleId)
    
    // 先进行扣款操作 (FR-024)
    const purchaseResult = fundPurchase(username, price, scheduleId, `购买船期舱位 ${scheduleId}`)
    
    if (!purchaseResult.success) {
      // 扣款失败
      alert(purchaseResult.error || '扣款失败，请确认余额充足')
      return
    }
    
    // 扣款成功后创建订单，关联交易ID
    const result = createOrder(scheduleId, username)
    
    if (result.success) {
      // 购买成功，刷新余额，显示成功提示 (FR-016)
      loadBalance(username)
      purchaseSuccess.value = { show: true, orderId: result.orderId! }
      showPurchaseDialog.value = false
      
      // 刷新列表以显示更新后的库存
      performSearch()
      
      // 5秒后自动隐藏成功提示
      setTimeout(() => {
        purchaseSuccess.value = { show: false, orderId: '' }
      }, 5000)
    } else {
      // 订单创建失败，但扣款已完成，需要提示用户联系客服
      alert(`订单创建失败: ${result.error || '请联系客服处理'}`)
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
 * 跳转到资金账户页面充值 (T040)
 */
function handleGoToRecharge() {
  showPurchaseDialog.value = false
  selectedSchedule.value = null
  emit('navigateTo', 'fund')
}

/**
 * 处理热门航线点击 (T058)
 * 自动填充查询条件并执行搜索
 */
function handleHotRouteSelect(departurePort: string, arrivalPort: string) {
  prefillDeparturePort.value = departurePort
  prefillArrivalPort.value = arrivalPort
  
  // 更新搜索条件并执行搜索
  criteria.value.departurePort = departurePort
  criteria.value.arrivalPort = arrivalPort
  criteria.value.etdStart = undefined
  criteria.value.etdEnd = undefined
  performSearch()
  resetPage()
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

    <div class="content-layout">
      <!-- 左侧主内容区 -->
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
          :initial-departure-port="prefillDeparturePort"
          :initial-arrival-port="prefillArrivalPort"
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

      <!-- 右侧热门船期面板 (T057) -->
      <aside class="sidebar">
        <HotSchedulePanel 
          @select-route="handleHotRouteSelect"
        />
      </aside>
    </div>

    <!-- 购买确认弹窗 (FR-017) -->
    <PurchaseDialog
      :visible="showPurchaseDialog"
      :schedule="selectedSchedule"
      :loading="isPurchasing"
      :username="currentUser?.username || ''"
      :user-balance="balance"
      @confirm="handleConfirmPurchase"
      @cancel="handleCancelPurchase"
      @go-to-recharge="handleGoToRecharge"
    />
  </div>
</template>

<style scoped>
.schedule-query-view {
  max-width: 1400px;
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

/* 内容布局 - 左右分栏 */
.content-layout {
  display: flex;
  gap: 24px;
}

.main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .content-layout {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    order: -1; /* 在移动端时热门船期显示在上面 */
  }
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
