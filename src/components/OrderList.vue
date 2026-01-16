<script setup lang="ts">
/**
 * 订单列表组件
 * 
 * 功能分支: 003-user-booking-order
 * 相关需求: FR-022, FR-023, FR-024, FR-025
 * 
 * 展示用户的订单列表，支持：
 * - 订单信息展示（订单号、航线、船公司等）
 * - 订单状态显示
 * - 空状态提示
 */
import type { Order } from '@/types/order'

// Props
interface Props {
  /** 订单列表 */
  orders: Order[]
  /** 是否加载中 */
  loading?: boolean
  /** 是否显示空状态 */
  showEmpty?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showEmpty: true
})

// Emits
interface Emits {
  /** 选择订单事件 */
  (e: 'select', order: Order): void
}

const emit = defineEmits<Emits>()

/**
 * 格式化日期显示
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
 * 格式化订单创建时间
 */
function formatCreatedAt(dateStr: string): string {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 获取订单状态标签
 */
function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    'confirmed': '已确认',
    'pending': '待确认',
    'cancelled': '已取消',
    'completed': '已完成'
  }
  return statusMap[status] || status
}

/**
 * 获取订单状态样式类
 */
function getStatusClass(status: string): string {
  const classMap: Record<string, string> = {
    'confirmed': 'status-confirmed',
    'pending': 'status-pending',
    'cancelled': 'status-cancelled',
    'completed': 'status-completed'
  }
  return classMap[status] || ''
}

/**
 * 处理订单点击
 */
function handleOrderClick(order: Order) {
  emit('select', order)
}
</script>

<template>
  <div class="order-list">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <span class="spinner"></span>
      正在加载订单...
    </div>
    
    <!-- 订单列表 -->
    <div v-else-if="orders.length > 0" class="orders">
      <div 
        v-for="order in orders" 
        :key="order.id"
        class="order-card"
        role="button"
        tabindex="0"
        @click="handleOrderClick(order)"
        @keydown.enter="handleOrderClick(order)"
      >
        <!-- 订单头部 -->
        <div class="order-header">
          <span class="order-id">{{ order.id }}</span>
          <span :class="['order-status', getStatusClass(order.status)]">
            {{ getStatusLabel(order.status) }}
          </span>
        </div>
        
        <!-- 航线信息 -->
        <div class="order-route">
          <div class="port departure">
            <span class="port-code">{{ order.departurePort.code }}</span>
            <span class="port-name">{{ order.departurePort.name }}</span>
          </div>
          <div class="route-arrow">→</div>
          <div class="port arrival">
            <span class="port-code">{{ order.arrivalPort.code }}</span>
            <span class="port-name">{{ order.arrivalPort.name }}</span>
          </div>
        </div>
        
        <!-- 订单详情 -->
        <div class="order-details">
          <div class="detail-item">
            <span class="detail-label">船公司</span>
            <span class="detail-value">{{ order.carrier }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">船名</span>
            <span class="detail-value">{{ order.vesselName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">ETD</span>
            <span class="detail-value">{{ formatDate(order.etd) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">ETA</span>
            <span class="detail-value">{{ formatDate(order.eta) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">转运天数</span>
            <span class="detail-value">{{ order.transitDays }}天</span>
          </div>
          <div class="detail-item amount-item">
            <span class="detail-label">订单金额</span>
            <span class="detail-value amount-value">¥{{ (order.amount ?? 0).toFixed(2) }}</span>
          </div>
        </div>
        
        <!-- 订单时间 -->
        <div class="order-footer">
          <span class="created-at">下单时间: {{ formatCreatedAt(order.orderTime) }}</span>
        </div>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="showEmpty" class="empty-state">
      <div class="empty-icon">📋</div>
      <p class="empty-title">暂无订单</p>
      <p class="empty-desc">您还没有购买任何舱位，快去船期查询页面选购吧！</p>
    </div>
  </div>
</template>

<style scoped>
.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 加载状态 */
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

/* 订单卡片 */
.order-card {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.order-card:hover {
  border-color: #1976d2;
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.15);
}

.order-card:focus {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.order-id {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  font-family: 'Consolas', 'Monaco', monospace;
}

.order-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-confirmed {
  background-color: #e3f2fd;
  color: #1565c0;
}

.status-pending {
  background-color: #fff3e0;
  color: #ef6c00;
}

.status-cancelled {
  background-color: #ffebee;
  color: #c62828;
}

.status-completed {
  background-color: #e8f5e9;
  color: #2e7d32;
}

/* 航线信息 */
.order-route {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
}

.port {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.port-code {
  font-size: 18px;
  font-weight: 700;
  color: #1976d2;
}

.port-name {
  font-size: 12px;
  color: #666;
}

.route-arrow {
  font-size: 24px;
  color: #999;
  flex-shrink: 0;
}

/* 订单详情 */
.order-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-item.amount-item {
  background: linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%);
  padding: 8px 12px;
  border-radius: 8px;
  margin: -4px;
}

.detail-label {
  font-size: 12px;
  color: #999;
}

.detail-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.detail-value.amount-value {
  font-size: 16px;
  font-weight: 700;
  color: #fa8c16;
}

/* 订单底部 */
.order-footer {
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.created-at {
  font-size: 12px;
  color: #999;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background-color: #fafafa;
  border-radius: 12px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #666;
}

/* 响应式 */
@media (max-width: 600px) {
  .order-route {
    flex-direction: column;
    gap: 12px;
  }
  
  .route-arrow {
    transform: rotate(90deg);
  }
  
  .order-details {
    grid-template-columns: 1fr;
  }
}
</style>
