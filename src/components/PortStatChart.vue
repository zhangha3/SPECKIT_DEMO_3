<script setup lang="ts">
/**
 * 港口维度统计图表组件
 * 
 * 功能分支: 004-fund-stats-enhancement
 * 来源: tasks.md T049
 * 
 * 使用 ECharts 展示按港口的订单统计饼图
 */
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import type { PortStatType, PortStatistics } from '@/types/statistics'

// ============================================================================
// Props
// ============================================================================

const props = defineProps<{
  /** 统计数据 */
  data: PortStatistics | null
  
  /** 当前统计类型 */
  type: PortStatType
  
  /** 加载状态 */
  loading?: boolean
  
  /** 错误信息 */
  error?: string | null
}>()

// ============================================================================
// Emits
// ============================================================================

const emit = defineEmits<{
  /** 类型变更 */
  typeChange: [type: PortStatType]
}>()

// ============================================================================
// 计算属性
// ============================================================================

const typeLabel = computed(() => props.type === 'departure' ? '起始港' : '目的港')

// ============================================================================
// 图表配置
// ============================================================================

const chartOption = computed<EChartsOption>(() => {
  if (!props.data || props.data.data.length === 0) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#999',
          fontSize: 14
        }
      }
    }
  }
  
  const pieData = props.data.data.map(d => ({
    name: d.portName,
    value: d.orderCount
  }))
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const item = params as { name: string; value: number; percent: number; marker: string }
        return `${item.marker} ${item.name}<br/>订单数: ${item.value}<br/>占比: ${item.percent.toFixed(1)}%`
      }
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      type: 'scroll',
      pageIconColor: '#1890ff',
      pageIconInactiveColor: '#aaa'
    },
    series: [
      {
        name: typeLabel.value,
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: pieData
      }
    ]
  }
})

// ============================================================================
// 事件处理
// ============================================================================

function handleTypeChange(type: PortStatType) {
  emit('typeChange', type)
}
</script>

<template>
  <div class="port-stat-chart">
    <!-- 标题和控件 -->
    <div class="chart-header">
      <h3 class="chart-title">🚢 港口维度统计</h3>
      <div class="chart-controls">
        <button 
          class="type-btn"
          :class="{ active: type === 'departure' }"
          @click="handleTypeChange('departure')"
        >
          起始港
        </button>
        <button 
          class="type-btn"
          :class="{ active: type === 'arrival' }"
          @click="handleTypeChange('arrival')"
        >
          目的港
        </button>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="chart-loading">
      <span class="spinner"></span>
      加载中...
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="chart-error">
      {{ error }}
    </div>
    
    <!-- 图表 -->
    <div v-else class="chart-container">
      <VChart 
        :option="chartOption" 
        autoresize 
        style="height: 350px; width: 100%;"
      />
    </div>
    
    <!-- 汇总信息 -->
    <div v-if="data" class="chart-footer">
      <span class="stat-item">
        总订单: <strong>{{ data.totalOrders }}</strong>
      </span>
      <span class="stat-item">
        总金额: <strong>¥{{ data.totalAmount.toFixed(2) }}</strong>
      </span>
    </div>
  </div>
</template>

<style scoped>
.port-stat-chart {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.type-btn {
  padding: 6px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.type-btn.active {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}

.chart-loading,
.chart-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 350px;
  color: #999;
}

.chart-error {
  color: #ff4d4f;
}

.spinner {
  width: 20px;
  height: 20px;
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

.chart-container {
  width: 100%;
}

.chart-footer {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  font-size: 13px;
  color: #666;
}

.stat-item strong {
  color: #333;
}
</style>
