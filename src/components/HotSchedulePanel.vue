<script setup lang="ts">
/**
 * 热门船期面板组件
 * 
 * 功能分支: 004-fund-stats-enhancement
 * 来源: tasks.md T056
 * 
 * 显示最近7天成交最多的航线
 */
import { onMounted } from 'vue'
import { useStatistics } from '@/composables/useStatistics'

// ============================================================================
// Emits
// ============================================================================

const emit = defineEmits<{
  /** 点击热门航线，自动填充查询条件 */
  selectRoute: [departurePort: string, arrivalPort: string]
}>()

// ============================================================================
// 组合式函数
// ============================================================================

const { hotSchedules, hotLoading, hotError, loadHotSchedules } = useStatistics()

// ============================================================================
// 生命周期
// ============================================================================

onMounted(() => {
  loadHotSchedules()
})

// ============================================================================
// 事件处理
// ============================================================================

function handleRouteClick(departurePort: string, arrivalPort: string) {
  emit('selectRoute', departurePort, arrivalPort)
}
</script>

<template>
  <div class="hot-schedule-panel">
    <div class="panel-header">
      <h3 class="panel-title">🔥 热门航线</h3>
      <span class="panel-subtitle">近7天热门</span>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="hotLoading" class="panel-loading">
      <span class="spinner"></span>
      加载中...
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="hotError" class="panel-error">
      {{ hotError }}
    </div>
    
    <!-- 无数据 -->
    <div v-else-if="!hotSchedules || hotSchedules.routes.length === 0" class="panel-empty">
      暂无热门航线数据
    </div>
    
    <!-- 热门航线列表 -->
    <div v-else class="hot-routes">
      <div 
        v-for="(route, index) in hotSchedules.routes" 
        :key="`${route.departurePortCode}-${route.arrivalPortCode}`"
        class="route-item"
        @click="handleRouteClick(route.departurePortCode, route.arrivalPortCode)"
      >
        <div class="route-rank" :class="{ top: index < 3 }">
          {{ index + 1 }}
        </div>
        <div class="route-info">
          <div class="route-name">
            {{ route.departurePortName }} → {{ route.arrivalPortName }}
          </div>
          <div class="route-stats">
            <span class="stat-badge orders">{{ route.orderCount }} 单</span>
          </div>
        </div>
        <div class="route-arrow">›</div>
      </div>
    </div>
    
    <!-- 面板底部 -->
    <div v-if="hotSchedules" class="panel-footer">
      统计时间: {{ hotSchedules.startDate }} ~ {{ hotSchedules.endDate }}
    </div>
  </div>
</template>

<style scoped>
.hot-schedule-panel {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.panel-subtitle {
  font-size: 12px;
  color: #999;
}

.panel-loading,
.panel-error,
.panel-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: #999;
  font-size: 14px;
}

.panel-error {
  color: #ff4d4f;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.hot-routes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.route-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.route-item:hover {
  background: #f0f7ff;
  transform: translateX(4px);
}

.route-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8e8e8;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 600;
  color: #666;
}

.route-rank.top {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%);
  color: white;
}

.route-info {
  flex: 1;
  min-width: 0;
}

.route-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.route-stats {
  display: flex;
  gap: 8px;
}

.stat-badge {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}

.stat-badge.orders {
  background: #e6f7ff;
  color: #1890ff;
}

.stat-badge.amount {
  background: #fff7e6;
  color: #fa8c16;
}

.route-arrow {
  font-size: 18px;
  color: #bbb;
  transition: all 0.2s;
}

.route-item:hover .route-arrow {
  color: #1890ff;
  transform: translateX(4px);
}

.panel-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  text-align: center;
  font-size: 11px;
  color: #bbb;
}
</style>
