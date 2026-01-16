<script setup lang="ts">
/**
 * 充值弹窗组件
 * 
 * 功能分支: 004-fund-stats-enhancement
 * 任务: T026
 * 
 * 提供充值金额输入、快捷按钮和资金密码验证
 */

import { ref, computed } from 'vue'
import { useFund } from '@/composables/useFund'
import { useToast } from '@/composables/useToast'

// ============================================================================
// Props & Emits
// ============================================================================

interface Props {
  /** 是否显示弹窗 */
  visible: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** 关闭弹窗 */
  close: []
  /** 充值成功 */
  success: [amount: number]
}>()

// ============================================================================
// 组合式函数
// ============================================================================

const { deposit, isLoading } = useFund()
const toast = useToast()

// ============================================================================
// 状态
// ============================================================================

/** 充值金额 */
const amount = ref<number | null>(null)

/** 资金密码 */
const fundPassword = ref('')

/** 错误消息 */
const errorMessage = ref('')

/** 快捷金额选项 */
const quickAmounts = [100, 200, 500, 1000, 2000, 5000]

// ============================================================================
// 计算属性
// ============================================================================

/** 表单是否有效 */
const isFormValid = computed(() => {
  return amount.value !== null && 
         amount.value > 0 && 
         fundPassword.value.length > 0
})

// ============================================================================
// 方法
// ============================================================================

/**
 * 选择快捷金额
 */
function selectQuickAmount(value: number): void {
  amount.value = value
  errorMessage.value = ''
}

/**
 * 处理金额输入
 */
function handleAmountInput(event: Event): void {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value)
  amount.value = isNaN(value) ? null : value
  errorMessage.value = ''
}

/**
 * 提交充值
 */
function handleSubmit(): void {
  if (!isFormValid.value || amount.value === null) {
    return
  }
  
  errorMessage.value = ''
  
  const result = deposit(amount.value, fundPassword.value)
  
  if (result.success) {
    toast.success(`充值成功！已充值 ¥${amount.value.toFixed(2)}`)
    emit('success', amount.value)
    handleClose()
  } else {
    errorMessage.value = result.error || '充值失败，请重试'
    toast.error(errorMessage.value)
  }
}

/**
 * 关闭弹窗
 */
function handleClose(): void {
  // 重置表单
  amount.value = null
  fundPassword.value = ''
  errorMessage.value = ''
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="dialog-overlay" @click.self="handleClose">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>💰 账户充值</h3>
          <button class="close-btn" @click="handleClose">×</button>
        </div>
        
        <div class="dialog-body">
          <!-- 快捷金额选择 -->
          <div class="quick-amounts">
            <label>快捷金额</label>
            <div class="quick-amount-grid">
              <button
                v-for="value in quickAmounts"
                :key="value"
                class="quick-amount-btn"
                :class="{ selected: amount === value }"
                @click="selectQuickAmount(value)"
              >
                ¥{{ value }}
              </button>
            </div>
          </div>
          
          <!-- 自定义金额输入 -->
          <div class="form-group">
            <label>充值金额（CNY）</label>
            <div class="amount-input-wrapper">
              <span class="currency-prefix">¥</span>
              <input
                type="number"
                :value="amount"
                @input="handleAmountInput"
                placeholder="请输入金额"
                min="0.01"
                step="0.01"
                class="amount-input"
              />
            </div>
          </div>
          
          <!-- 资金密码 -->
          <div class="form-group">
            <label>资金密码</label>
            <input
              v-model="fundPassword"
              type="password"
              placeholder="请输入资金密码"
              class="password-input"
            />
            <p class="hint">默认资金密码: fund123</p>
          </div>
          
          <!-- 错误消息 -->
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </div>
        
        <div class="dialog-footer">
          <button class="cancel-btn" @click="handleClose">取消</button>
          <button 
            class="submit-btn" 
            :disabled="!isFormValid || isLoading"
            @click="handleSubmit"
          >
            {{ isLoading ? '处理中...' : '确认充值' }}
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #666;
}

.dialog-body {
  padding: 24px;
}

.quick-amounts {
  margin-bottom: 20px;
}

.quick-amounts label {
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.quick-amount-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.quick-amount-btn {
  padding: 12px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-amount-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.quick-amount-btn.selected {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.amount-input-wrapper:focus-within {
  border-color: #667eea;
}

.currency-prefix {
  padding: 12px 16px;
  background: #f5f5f5;
  color: #666;
  font-size: 16px;
  font-weight: 500;
}

.amount-input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  font-size: 16px;
  outline: none;
}

.amount-input::placeholder {
  color: #aaa;
}

.password-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.password-input:focus {
  border-color: #667eea;
}

.hint {
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #999;
}

.error-message {
  padding: 12px;
  background: #fff5f5;
  border: 1px solid #ffebee;
  border-radius: 8px;
  color: #d32f2f;
  font-size: 14px;
  margin-top: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #eee;
  background: #fafafa;
  border-radius: 0 0 16px 16px;
}

.cancel-btn {
  padding: 10px 24px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #f5f5f5;
}

.submit-btn {
  padding: 10px 24px;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
