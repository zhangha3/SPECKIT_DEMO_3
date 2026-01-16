<script setup lang="ts">
/**
 * 资金账户卡片组件
 * 
 * 功能分支: 004-fund-stats-enhancement
 * 任务: T021
 * 
 * 显示用户账户余额和操作按钮
 */

import { onMounted } from 'vue'
import { useFund } from '@/composables/useFund'

// ============================================================================
// Props & Emits
// ============================================================================

interface Props {
  /** 用户名 */
  username: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** 点击充值按钮 */
  deposit: []
  /** 点击提现按钮 */
  withdraw: []
}>()

// ============================================================================
// 组合式函数
// ============================================================================

const { balance, balanceFormatted, isLoading, loadBalance, refreshBalance } = useFund()

// ============================================================================
// 生命周期
// ============================================================================

onMounted(() => {
  loadBalance(props.username)
})

// ============================================================================
// 方法
// ============================================================================

function handleDeposit(): void {
  emit('deposit')
}

function handleWithdraw(): void {
  emit('withdraw')
}

// 暴露刷新方法供父组件调用
defineExpose({
  refreshBalance
})
</script>

<template>
  <div class="fund-account-card">
    <div class="card-header">
      <h3 class="card-title">
        <span class="title-icon">💰</span>
        账户余额
      </h3>
    </div>
    
    <div class="card-body">
      <div class="balance-display" :class="{ loading: isLoading }">
        <span class="currency-symbol">¥</span>
        <span class="balance-amount">{{ (balance ?? 0).toFixed(2) }}</span>
        <span class="currency-code">CNY</span>
      </div>
      
      <div class="balance-hint">
        可用于购买舱位
      </div>
    </div>
    
    <div class="card-actions">
      <button 
        class="action-btn deposit-btn" 
        @click="handleDeposit"
        :disabled="isLoading"
      >
        <span class="btn-icon">➕</span>
        充值
      </button>
      <button 
        class="action-btn withdraw-btn" 
        @click="handleWithdraw"
        :disabled="isLoading || balance <= 0"
      >
        <span class="btn-icon">➖</span>
        提现
      </button>
    </div>
  </div>
</template>

<style scoped>
.fund-account-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
  min-width: 320px;
}

.card-header {
  margin-bottom: 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  opacity: 0.9;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 20px;
}

.card-body {
  margin-bottom: 24px;
}

.balance-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.balance-display.loading {
  opacity: 0.6;
}

.currency-symbol {
  font-size: 28px;
  font-weight: 300;
}

.balance-amount {
  font-size: 48px;
  font-weight: 600;
  letter-spacing: -2px;
}

.currency-code {
  font-size: 14px;
  opacity: 0.7;
  margin-left: 8px;
}

.balance-hint {
  font-size: 13px;
  opacity: 0.7;
}

.card-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.deposit-btn {
  background: rgba(255, 255, 255, 0.25);
  color: white;
}

.deposit-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px);
}

.withdraw-btn {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

.withdraw-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 14px;
}
</style>
