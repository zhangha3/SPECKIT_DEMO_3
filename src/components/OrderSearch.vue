<script setup lang="ts">
/**
 * 订单搜索组件
 * 
 * 功能分支: 003-user-booking-order
 * 相关需求: FR-019, FR-020
 * 
 * 提供订单号输入框和搜索按钮，支持按订单号精确查询
 */
import { ref, computed } from 'vue'

// Props
interface Props {
  /** 是否处于加载状态 */
  loading?: boolean
  /** 初始订单号 */
  initialOrderId?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  initialOrderId: ''
})

// Emits
interface Emits {
  /** 搜索事件 */
  (e: 'search', orderId: string): void
  /** 重置事件 */
  (e: 'reset'): void
}

const emit = defineEmits<Emits>()

// 本地状态
const orderId = ref(props.initialOrderId)

// 计算属性
const isSearchDisabled = computed(() => props.loading)

/**
 * 执行搜索
 */
function handleSearch() {
  if (props.loading) return
  emit('search', orderId.value.trim())
}

/**
 * 重置搜索
 */
function handleReset() {
  orderId.value = ''
  emit('reset')
}

/**
 * 处理键盘事件
 */
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !props.loading) {
    handleSearch()
  }
}
</script>

<template>
  <div class="order-search">
    <div class="search-form">
      <div class="input-group">
        <label for="order-id-input" class="input-label">订单号</label>
        <input
          id="order-id-input"
          v-model="orderId"
          type="text"
          class="order-id-input"
          placeholder="请输入订单号，如 ORD-20251209-001"
          :disabled="loading"
          aria-label="订单号"
          @keydown="handleKeydown"
        />
      </div>
      
      <div class="button-group">
        <button 
          type="button"
          class="search-btn"
          :disabled="isSearchDisabled"
          @click="handleSearch"
        >
          <span v-if="loading" class="spinner"></span>
          {{ loading ? '查询中...' : '查询' }}
        </button>
        
        <button 
          type="button"
          class="reset-btn"
          :disabled="loading"
          @click="handleReset"
        >
          重置
        </button>
      </div>
    </div>
    
    <!-- 提示信息 -->
    <p class="search-hint">
      输入完整订单号进行精确查询，订单号格式：ORD-YYYYMMDD-XXX
    </p>
  </div>
</template>

<style scoped>
.order-search {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-form {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.input-group {
  flex: 1;
  min-width: 280px;
}

.input-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.order-id-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.order-id-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.15);
}

.order-id-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.order-id-input::placeholder {
  color: #999;
}

.button-group {
  display: flex;
  gap: 8px;
}

.search-btn,
.reset-btn {
  height: 40px;
  padding: 0 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.search-btn {
  background-color: #1976d2;
  color: white;
  border: none;
}

.search-btn:hover:not(:disabled) {
  background-color: #1565c0;
}

.search-btn:disabled {
  background-color: #bdbdbd;
  cursor: not-allowed;
}

.reset-btn {
  background-color: #fff;
  color: #666;
  border: 1px solid #ddd;
}

.reset-btn:hover:not(:disabled) {
  background-color: #f5f5f5;
  border-color: #ccc;
}

.reset-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.search-hint {
  margin-top: 12px;
  font-size: 12px;
  color: #999;
}

/* 响应式布局 */
@media (max-width: 600px) {
  .search-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .input-group {
    min-width: 100%;
  }
  
  .button-group {
    justify-content: stretch;
  }
  
  .search-btn,
  .reset-btn {
    flex: 1;
  }
}
</style>
