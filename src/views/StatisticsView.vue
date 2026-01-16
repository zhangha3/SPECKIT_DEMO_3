<script setup lang="ts">
/**
 * 统计分析页面视图
 * 
 * 功能分支: 004-fund-stats-enhancement
 * 来源: tasks.md T045
 * 
 * 整合时间、港口、用户三个维度的统计图表
 */
import { onMounted } from 'vue'
import TimeStatChart from '@/components/TimeStatChart.vue'
import PortStatChart from '@/components/PortStatChart.vue'
import UserStatChart from '@/components/UserStatChart.vue'
import { useStatistics } from '@/composables/useStatistics'
import { useAuth } from '@/composables/useAuth'
import type { TimeGranularity, PortStatType } from '@/types/statistics'

// ============================================================================
// Props
// ============================================================================

defineProps<{
  /** 当前用户名（由 App.vue 传递） */
  username?: string
}>()

// ============================================================================
// 组合式函数
// ============================================================================

const { currentUser } = useAuth()

const {
  // 时间维度
  timeGranularity,
  timeStats,
  timeLoading,
  timeError,
  setTimeGranularity,
  
  // 港口维度
  portStatType,
  portStats,
  portLoading,
  portError,
  setPortStatType,
  
  // 用户维度
  userStats,
  userLoading,
  userError,
  
  // 初始化
  initializeAll
} = useStatistics()

// ============================================================================
// 生命周期
// ============================================================================

onMounted(() => {
  if (currentUser.value?.username) {
    initializeAll(currentUser.value.username)
  }
})

// ============================================================================
// 事件处理
// ============================================================================

function handleGranularityChange(granularity: TimeGranularity) {
  setTimeGranularity(granularity)
}

function handlePortTypeChange(type: PortStatType) {
  setPortStatType(type)
}
</script>

<template>
  <div class="statistics-view">
    <header class="page-header">
      <h1>统计分析</h1>
      <p class="subtitle">查看订单统计数据，了解业务趋势</p>
    </header>

    <main class="main-content">
      <!-- 时间维度统计 -->
      <section class="chart-section">
        <TimeStatChart
          :data="timeStats"
          :granularity="timeGranularity"
          :loading="timeLoading"
          :error="timeError"
          @granularity-change="handleGranularityChange"
        />
      </section>

      <!-- 港口和用户统计并排 -->
      <div class="chart-row">
        <!-- 港口维度统计 -->
        <section class="chart-section half">
          <PortStatChart
            :data="portStats"
            :type="portStatType"
            :loading="portLoading"
            :error="portError"
            @type-change="handlePortTypeChange"
          />
        </section>

        <!-- 用户维度统计 -->
        <section class="chart-section half">
          <UserStatChart
            :data="userStats"
            :current-username="currentUser?.username || ''"
            :loading="userLoading"
            :error="userError"
          />
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.statistics-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 28px;
  color: #333;
}

.subtitle {
  margin: 0;
  color: #666;
  font-size: 15px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 图表区域 */
.chart-section {
  width: 100%;
}

.chart-row {
  display: flex;
  gap: 24px;
}

.chart-section.half {
  flex: 1;
  min-width: 0;
}

/* 响应式布局 */
@media (max-width: 1024px) {
  .chart-row {
    flex-direction: column;
  }
  
  .chart-section.half {
    width: 100%;
  }
}
</style>
