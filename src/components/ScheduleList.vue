<script setup lang="ts">
/**
 * 船期列表组件
 * 
 * 功能分支: 002-shipping-schedule, 003-user-booking-order
 * 展示船期数据列表
 * 新增: 库存展示和购买按钮 (FR-009 ~ FR-011, FR-027)
 */
import type { ScheduleDisplayItem } from '@/types/schedule'

const props = defineProps<{
  schedules: ScheduleDisplayItem[]
  selectedId?: string
  loading?: boolean
  /** 是否显示购买相关功能 (003-user-booking-order) */
  showPurchase?: boolean
}>()

const emit = defineEmits<{
  select: [item: ScheduleDisplayItem]
  /** 购买按钮点击事件 (003-user-booking-order) */
  purchase: [item: ScheduleDisplayItem]
}>()

function handleSelect(item: ScheduleDisplayItem) {
  emit('select', item)
}

/**
 * 处理购买按钮点击
 * FR-010: 当船期库存大于0时，该船期行必须显示"购买"按钮
 */
function handlePurchase(item: ScheduleDisplayItem, event: Event) {
  event.stopPropagation() // 阻止触发 select 事件
  emit('purchase', item)
}

/**
 * 获取港口显示名称
 * 如果港口信息存在则显示中文名，否则显示代码
 */
function getPortDisplayName(item: ScheduleDisplayItem, type: 'departure' | 'arrival'): string {
  if (type === 'departure') {
    return item.departurePortInfo?.nameCN || item.schedule.departurePort
  }
  return item.arrivalPortInfo?.nameCN || item.schedule.arrivalPort
}

/**
 * 获取港口代码
 */
function getPortCode(item: ScheduleDisplayItem, type: 'departure' | 'arrival'): string {
  return type === 'departure' ? item.schedule.departurePort : item.schedule.arrivalPort
}

/**
 * 获取库存数量
 * FR-027: 船期列表中库存数量必须以"库存: X"格式展示
 */
function getStockDisplay(item: ScheduleDisplayItem): string {
  const stock = item.schedule.stock ?? 0
  return `库存: ${stock}`
}

/**
 * 判断是否有库存
 */
function hasStock(item: ScheduleDisplayItem): boolean {
  return (item.schedule.stock ?? 0) > 0
}
</script>

<template>
  <div class="schedule-list" role="list">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <span class="loading-spinner"></span>
      加载中...
    </div>

    <!-- 空状态 -->
    <div v-else-if="schedules.length === 0" class="empty-state">
      暂无船期数据
    </div>

    <!-- 船期列表 -->
    <div
      v-else
      v-for="item in schedules"
      :key="item.schedule.id"
      class="schedule-item"
      :class="{ selected: selectedId === item.schedule.id }"
      role="listitem"
      @click="handleSelect(item)"
    >
      <!-- 起运港 -->
      <div class="port-info departure">
        <span class="port-label">起运港</span>
        <span class="port-name">{{ getPortDisplayName(item, 'departure') }}</span>
        <span class="port-code">{{ getPortCode(item, 'departure') }}</span>
      </div>

      <!-- 航向箭头和运输耗时 -->
      <div class="route-info">
        <span class="route-arrow">→</span>
        <span class="transit-days">{{ item.transitDaysFormatted }}</span>
      </div>

      <!-- 目的港 -->
      <div class="port-info arrival">
        <span class="port-label">目的港</span>
        <span class="port-name">{{ getPortDisplayName(item, 'arrival') }}</span>
        <span class="port-code">{{ getPortCode(item, 'arrival') }}</span>
      </div>

      <!-- ETD日期 -->
      <div class="etd-info">
        <span class="etd-label">ETD</span>
        <span class="etd-date">{{ item.etdFormatted }}</span>
      </div>

      <!-- 承运公司 -->
      <div class="carrier-info">
        <span class="carrier-label">承运公司</span>
        <span class="carrier-name">{{ item.carrierName }}</span>
      </div>

      <!-- 船舶信息（可选） -->
      <div v-if="item.schedule.vesselName" class="vessel-info">
        <span class="vessel-name">{{ item.schedule.vesselName }}</span>
        <span v-if="item.schedule.voyageNumber" class="voyage-number">{{ item.schedule.voyageNumber }}</span>
      </div>
      
      <!-- 库存和购买 (003-user-booking-order) -->
      <div v-if="showPurchase" class="stock-info">
        <span class="stock-label">{{ getStockDisplay(item) }}</span>
        <!-- FR-010: 库存大于0时显示购买按钮 -->
        <button
          v-if="hasStock(item)"
          class="purchase-button"
          @click="handlePurchase(item, $event)"
        >
          购买
        </button>
        <!-- FR-011: 库存等于0时显示"暂无库存"文字 -->
        <span v-else class="no-stock">暂无库存</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-list {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.loading-state,
.empty-state {
  padding: 40px;
  text-align: center;
  color: #888;
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border: 2px solid #ddd;
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.schedule-item {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto auto auto auto;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.schedule-item:last-child {
  border-bottom: none;
}

.schedule-item:hover {
  background-color: #f5f5f5;
}

.schedule-item.selected {
  background-color: #e3f2fd;
  border-left: 3px solid #1976d2;
}

.port-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.port-label {
  font-size: 12px;
  color: #999;
}

.port-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.port-code {
  font-size: 13px;
  color: #666;
  font-family: 'Consolas', 'Monaco', monospace;
}

.route-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
}

.route-arrow {
  font-size: 20px;
  color: #999;
}

.transit-days {
  font-size: 13px;
  color: #666;
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.etd-info,
.carrier-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 100px;
}

.etd-label,
.carrier-label {
  font-size: 12px;
  color: #999;
}

.etd-date {
  font-size: 14px;
  color: #333;
}

.carrier-name {
  font-size: 14px;
  color: #1976d2;
  font-weight: 500;
}

.vessel-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
}

.vessel-name {
  font-size: 14px;
  color: #333;
}

.voyage-number {
  font-size: 12px;
  color: #666;
}

/* 库存和购买 (003-user-booking-order) */
.stock-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 80px;
}

.stock-label {
  font-size: 13px;
  color: #666;
}

.purchase-button {
  padding: 6px 16px;
  background-color: #4caf50;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.purchase-button:hover {
  background-color: #43a047;
}

.no-stock {
  font-size: 13px;
  color: #999;
  font-style: italic;
}

/* 响应式布局 */
@media (max-width: 992px) {
  .schedule-item {
    grid-template-columns: 1fr auto 1fr;
    grid-template-rows: auto auto;
  }

  .etd-info,
  .carrier-info,
  .vessel-info {
    grid-column: span 1;
  }
}

@media (max-width: 576px) {
  .schedule-item {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .route-info {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
