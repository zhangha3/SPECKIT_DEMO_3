<script setup lang="ts">
/**
 * 时间维度统计图表组件
 * 
 * 功能分支: 004-fund-stats-enhancement
 * 来源: tasks.md T044
 * 
 * 使用 ECharts 展示按月/周的订单统计柱状图
 */
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import type { TimeGranularity, TimeStatistics } from '@/types/statistics'

// ============================================================================
// Props
// ============================================================================

const props = defineProps<{
  /** 统计数据 */
  data: TimeStatistics | null
  
  /** 当前粒度 */
  granularity: TimeGranularity
  
  /** 加载状态 */
  loading?: boolean
  
  /** 错误信息 */
  error?: string | null
}>()

// ============================================================================
// Emits
// ============================================================================

const emit = defineEmits<{
  /** 粒度变更 */
  granularityChange: [granularity: TimeGranularity]
}>()

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
  
  const labels = props.data.data.map(d => d.label)
  const orderCounts = props.data.data.map(d => d.orderCount)
  const totalAmounts = props.data.data.map(d => d.totalAmount)
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: unknown) => {
        const items = params as Array<{ name: string; value: number; seriesName: string; marker: string }>
        if (!items || items.length === 0) return ''
        
        let result = `<strong>${items[0].name}</strong><br/>`
        items.forEach(item => {
          if (item.seriesName === '订单金额') {
            result += `${item.marker} ${item.seriesName}: ¥${item.value.toFixed(2)}<br/>`
          } else {
            result += `${item.marker} ${item.seriesName}: ${item.value}<br/>`
          }
        })
        return result
      }
    },
    legend: {
      data: ['订单数量', '订单金额'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLabel: {
        rotate: labels.length > 6 ? 45 : 0
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '订单数量',
        position: 'left',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#5470c6'
          }
        }
      },
      {
        type: 'value',
        name: '订单金额 (¥)',
        position: 'right',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#91cc75'
          }
        }
      }
    ],
    series: [
      {
        name: '订单数量',
        type: 'bar',
        data: orderCounts,
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '订单金额',
        type: 'bar',
        yAxisIndex: 1,
        data: totalAmounts,
        itemStyle: {
          color: '#91cc75'
        }
      }
    ]
  }
})

// ============================================================================
// 事件处理
// ============================================================================

function handleGranularityChange(granularity: TimeGranularity) {
  emit('granularityChange', granularity)
}
</script>

<template>
  <div class="time-stat-chart">
    <!-- 标题和控件 -->
    <div class="chart-header">
      <h3 class="chart-title">📊 时间维度统计</h3>
      <div class="chart-controls">
        <button 
          class="granularity-btn"
          :class="{ active: granularity === 'week' }"
          @click="handleGranularityChange('week')"
        >
          最近6周
        </button>
        <button 
          class="granularity-btn"
          :class="{ active: granularity === 'month' }"
          @click="handleGranularityChange('month')"
        >
          最近6个月
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
    
    <!-- 时间范围提示 -->
    <div v-if="data" class="chart-footer">
      统计范围: {{ data.startDate }} ~ {{ data.endDate }}
    </div>
  </div>
</template>

<style scoped>
.time-stat-chart {
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

.granularity-btn {
  padding: 6px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.granularity-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.granularity-btn.active {
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
  text-align: center;
  margin-top: 12px;
  font-size: 12px;
  color: #999;
}
</style>
