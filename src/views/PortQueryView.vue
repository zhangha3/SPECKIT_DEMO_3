<script setup lang="ts">
/**
 * 港口查询主页面视图
 * 
 * 功能分支: 001-port-query
 * 集成搜索、列表、分页和详情组件
 */
import { onMounted, ref, computed } from 'vue'
import PortSearch from '@/components/PortSearch.vue'
import PortDetail from '@/components/PortDetail.vue'
import PortList from '@/components/PortList.vue'
import Pagination from '@/components/Pagination.vue'
import { usePortSearch } from '@/composables/usePortSearch'
import { usePagination } from '@/composables/usePagination'
import type { Port } from '@/types/port'

const { 
  results, 
  total, 
  searchMode, 
  isLoading, 
  error, 
  noResults,
  initialize, 
  performSearch 
} = usePortSearch()

// 分页
const { 
  currentPage, 
  totalPages, 
  paginatedItems, 
  nextPage, 
  prevPage,
  resetPage 
} = usePagination(results, 10)

const selectedPort = ref<Port | null>(null)

// 计算属性：是否需要分页
const needsPagination = computed(() => total.value > 10)

onMounted(() => {
  initialize()
})

function handleSearch(query: string) {
  selectedPort.value = null
  resetPage()
  performSearch(query)
  
  // 如果是精确查询且有结果，自动选中
  if (results.value.length === 1) {
    selectedPort.value = results.value[0]
  }
}

function selectPort(port: Port) {
  selectedPort.value = port
}
</script>

<template>
  <div class="port-query-view">
    <header class="page-header">
      <h1>全球航运港口查询</h1>
      <p class="subtitle">支持按港口代码精确查询或按名称模糊搜索</p>
    </header>

    <main class="main-content">
      <!-- 搜索组件 -->
      <PortSearch @search="handleSearch" />

      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading">
        <span class="spinner"></span>
        正在加载数据...
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- 搜索结果统计 -->
      <div v-if="total > 0" class="result-stats">
        <span v-if="searchMode === 'exact'">
          精确匹配到 <strong>{{ total }}</strong> 个港口
        </span>
        <span v-else>
          模糊搜索到 <strong>{{ total }}</strong> 个港口
        </span>
      </div>

      <!-- 无结果提示 -->
      <div v-if="noResults" class="no-results">
        未找到匹配的港口
      </div>

      <!-- 结果列表（多个结果时显示） -->
      <PortList 
        v-if="results.length > 1" 
        :ports="paginatedItems"
        :selected-code="selectedPort?.code"
        @select="selectPort"
      />

      <!-- 分页控件 -->
      <Pagination 
        v-if="needsPagination"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total="total"
        @prev="prevPage"
        @next="nextPage"
      />

      <!-- 港口详情 -->
      <PortDetail v-if="selectedPort" :port="selectedPort" />
    </main>
  </div>
</template>

<style scoped>
.port-query-view {
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.page-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 32px;
}

.subtitle {
  margin: 10px 0 0 0;
  color: #888;
  font-size: 16px;
}

.main-content {
  max-width: 800px;
  margin: 0 auto;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px;
  color: #666;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  padding: 16px;
  background: #fef0f0;
  color: #e74c3c;
  border-radius: 8px;
  margin: 20px 0;
}

.result-stats {
  padding: 12px 16px;
  background: #e8f5e9;
  color: #2e7d32;
  border-radius: 8px;
  margin: 20px 0;
}

.no-results {
  padding: 40px;
  text-align: center;
  color: #888;
  font-size: 18px;
}

.results-list {
  margin: 20px 0;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background-color: #f5f5f5;
}

.result-item.active {
  background-color: #e8f5e9;
}

.port-code {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #42b983;
  min-width: 70px;
}

.port-names {
  flex: 1;
  color: #2c3e50;
}

.port-country {
  color: #888;
  font-size: 14px;
}
</style>
