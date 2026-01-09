<script setup lang="ts">
/**
 * 船期查询主页面视图
 * 
 * 功能分支: 002-shipping-schedule
 * 集成船期搜索、列表和分页组件
 */
import { onMounted, computed } from 'vue'
import ScheduleSearch from '@/components/ScheduleSearch.vue'
import ScheduleList from '@/components/ScheduleList.vue'
import Pagination from '@/components/Pagination.vue'
import { useScheduleSearch } from '@/composables/useScheduleSearch'
import { usePagination } from '@/composables/usePagination'
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
</script>

<template>
  <div class="schedule-query-view">
    <header class="page-header">
      <h1>船期查询</h1>
      <p class="subtitle">查看航运船期信息，了解航线和预计发运时间</p>
    </header>

    <main class="main-content">
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

      <!-- 船期列表 -->
      <ScheduleList 
        v-if="!isLoading && !error"
        :schedules="paginatedItems"
        :loading="isLoading"
        @select="handleSelectSchedule"
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
</style>
