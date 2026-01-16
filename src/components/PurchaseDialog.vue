<script setup lang="ts">
/**
 * 购买确认弹窗组件
 * 
 * 功能分支: 003-user-booking-order, 004-fund-stats-enhancement
 * 来源: spec.md FR-016, FR-017
 * 
 * 显示购买确认对话框，用户确认后才执行购买操作
 * 新增: 价格显示、余额检查 (004-fund-stats-enhancement)
 */
import { computed, watch } from 'vue'
import type { ScheduleDisplayItem } from '@/types/schedule'
import { useFund } from '@/composables/useFund'

// ============================================================================
// Props & Emits
// ============================================================================

const props = defineProps<{
  /** 是否显示弹窗 */
  visible: boolean
  /** 要购买的船期信息 */
  schedule: ScheduleDisplayItem | null
  /** 是否正在处理 */
  loading?: boolean
  /** 当前用户名 (004-fund-stats-enhancement) */
  username?: string
}>()

const emit = defineEmits<{
  /** 确认购买 */
  confirm: []
  /** 取消购买 */
  cancel: []
  /** 跳转到充值页面 */
  goToRecharge: []
}>()

// ============================================================================
// 组合式函数
// ============================================================================

const { loadBalance, balance } = useFund()

// ============================================================================
// 计算属性
// ============================================================================

/** 起运港显示名称 */
const departurePortName = computed(() => {
  if (!props.schedule) return ''
  return props.schedule.departurePortInfo?.nameCN || props.schedule.schedule.departurePort
})

/** 目的港显示名称 */
const arrivalPortName = computed(() => {
  if (!props.schedule) return ''
  return props.schedule.arrivalPortInfo?.nameCN || props.schedule.schedule.arrivalPort
})

/** 船期价格 */
const price = computed(() => {
  return props.schedule?.schedule.price ?? 0
})

/** 余额是否充足 */
const hasSufficientBalance = computed(() => {
  return balance.value >= price.value
})

/** 购买后剩余余额 */
const remainingBalance = computed(() => {
  return Math.max(0, balance.value - price.value)
})

// ============================================================================
// 侦听器
// ============================================================================

// 弹窗打开时加载余额
watch(() => props.visible, (visible) => {
  if (visible && props.username) {
    loadBalance(props.username)
  }
})

// ============================================================================
// 事件处理
// ============================================================================

function handleConfirm() {
  if (!hasSufficientBalance.value) {
    return
  }
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}

/**
 * 跳转到充值页面
 */
function handleGoToRecharge() {
  emit('goToRecharge')
}

/**
 * 点击遮罩层关闭弹窗
 */
function handleOverlayClick(event: Event) {
  if (event.target === event.currentTarget) {
    handleCancel()
  }
}
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="visible" 
      class="dialog-overlay"
      @click="handleOverlayClick"
    >
      <div class="dialog-container" role="dialog" aria-modal="true">
        <!-- 弹窗头部 -->
        <div class="dialog-header">
          <h3 class="dialog-title">确认购买</h3>
          <button 
            class="close-button"
            @click="handleCancel"
            :disabled="loading"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>
        
        <!-- 弹窗内容 -->
        <div class="dialog-body">
          <p class="confirm-message">您确定要购买以下船期舱位吗？</p>
          
          <div v-if="schedule" class="schedule-summary">
            <div class="summary-row">
              <span class="label">航线：</span>
              <span class="value">{{ departurePortName }} → {{ arrivalPortName }}</span>
            </div>
            <div class="summary-row">
              <span class="label">ETD：</span>
              <span class="value">{{ schedule.etdFormatted }}</span>
            </div>
            <div class="summary-row">
              <span class="label">运输耗时：</span>
              <span class="value">{{ schedule.transitDaysFormatted }}</span>
            </div>
            <div class="summary-row">
              <span class="label">承运公司：</span>
              <span class="value">{{ schedule.carrierName }}</span>
            </div>
            <div v-if="schedule.schedule.vesselName" class="summary-row">
              <span class="label">船名/航次：</span>
              <span class="value">
                {{ schedule.schedule.vesselName }}
                <template v-if="schedule.schedule.voyageNumber">
                  / {{ schedule.schedule.voyageNumber }}
                </template>
              </span>
            </div>
          </div>
          
          <!-- 价格和余额信息 (004-fund-stats-enhancement) -->
          <div class="payment-info">
            <div class="price-row">
              <span class="price-label">船期价格</span>
              <span class="price-value">¥{{ price.toFixed(2) }}</span>
            </div>
            <div class="balance-row">
              <span class="balance-label">账户余额</span>
              <span class="balance-value" :class="{ insufficient: !hasSufficientBalance }">
                ¥{{ balance.toFixed(2) }}
              </span>
            </div>
            <div v-if="hasSufficientBalance" class="remaining-row">
              <span class="remaining-label">支付后余额</span>
              <span class="remaining-value">¥{{ remainingBalance.toFixed(2) }}</span>
            </div>
            <div v-else class="insufficient-warning">
              ⚠️ 余额不足，请先充值
            </div>
          </div>
        </div>
        
        <!-- 弹窗底部 -->
        <div class="dialog-footer">
          <button 
            class="cancel-button"
            @click="handleCancel"
            :disabled="loading"
          >
            取消
          </button>
          <button 
            v-if="!hasSufficientBalance"
            class="recharge-button"
            @click="handleGoToRecharge"
            :disabled="loading"
          >
            去充值
          </button>
          <button 
            class="confirm-button"
            @click="handleConfirm"
            :disabled="loading || !hasSufficientBalance"
          >
            {{ loading ? '处理中...' : (hasSufficientBalance ? '确认购买' : '余额不足') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 420px;
  margin: 20px;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.dialog-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-button {
  padding: 4px 8px;
  background: transparent;
  border: none;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-button:hover:not(:disabled) {
  background-color: #f0f0f0;
  color: #333;
}

.close-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.dialog-body {
  padding: 20px;
}

.confirm-message {
  margin: 0 0 16px;
  font-size: 15px;
  color: #333;
}

.schedule-summary {
  background-color: #f9f9f9;
  border-radius: 6px;
  padding: 16px;
}

.summary-row {
  display: flex;
  margin-bottom: 10px;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.label {
  flex-shrink: 0;
  width: 90px;
  color: #666;
  font-size: 14px;
}

.value {
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
}

.cancel-button {
  padding: 10px 20px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover:not(:disabled) {
  background-color: #eee;
  border-color: #ccc;
}

.cancel-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.confirm-button {
  padding: 10px 24px;
  background-color: #4caf50;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-button:hover:not(:disabled) {
  background-color: #43a047;
}

.confirm-button:disabled {
  cursor: not-allowed;
  background-color: #a5d6a7;
}

/* 去充值按钮样式 (004-fund-stats-enhancement) */
.recharge-button {
  padding: 10px 20px;
  background-color: #ff9800;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.recharge-button:hover:not(:disabled) {
  background-color: #f57c00;
}

.recharge-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* 价格和余额信息样式 (004-fund-stats-enhancement) */
.payment-info {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #ddd;
}

.price-label {
  font-size: 14px;
  color: #666;
}

.price-value {
  font-size: 24px;
  font-weight: 600;
  color: #e53935;
}

.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.balance-label {
  font-size: 14px;
  color: #666;
}

.balance-value {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.balance-value.insufficient {
  color: #e53935;
}

.remaining-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remaining-label {
  font-size: 13px;
  color: #999;
}

.remaining-value {
  font-size: 14px;
  color: #666;
}

.insufficient-warning {
  margin-top: 12px;
  padding: 10px;
  background: #fff5f5;
  border: 1px solid #ffebee;
  border-radius: 4px;
  color: #d32f2f;
  font-size: 14px;
  text-align: center;
}
</style>
