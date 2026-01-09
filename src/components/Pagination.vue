<script setup lang="ts">
/**
 * 分页控件组件
 * 
 * 功能分支: 001-port-query
 * 提供分页导航功能
 */
defineProps<{
  currentPage: number
  totalPages: number
  total: number
}>()

const emit = defineEmits<{
  prev: []
  next: []
  'go-to': [page: number]
}>()

function handlePrev() {
  emit('prev')
}

function handleNext() {
  emit('next')
}
</script>

<template>
  <div class="pagination">
    <div class="result-info">
      共 <strong>{{ total }}</strong> 条结果
    </div>

    <!-- 只有一页时隐藏分页控件 -->
    <div v-if="totalPages > 1" class="pagination-controls">
      <button 
        class="prev-button"
        :disabled="currentPage <= 1"
        @click="handlePrev"
      >
        上一页
      </button>
      
      <span class="page-info">
        第 <strong>{{ currentPage }}</strong> / <strong>{{ totalPages }}</strong> 页
      </span>
      
      <button 
        class="next-button"
        :disabled="currentPage >= totalPages"
        @click="handleNext"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 16px;
}

.result-info {
  color: #666;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.prev-button,
.next-button {
  padding: 8px 16px;
  font-size: 14px;
  color: #42b983;
  background: white;
  border: 1px solid #42b983;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.prev-button:hover:not(:disabled),
.next-button:hover:not(:disabled) {
  background: #42b983;
  color: white;
}

.prev-button:disabled,
.next-button:disabled {
  color: #ccc;
  border-color: #ccc;
  cursor: not-allowed;
}

.page-info {
  color: #666;
  font-size: 14px;
}
</style>
