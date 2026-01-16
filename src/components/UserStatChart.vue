<script setup lang="ts">
/**
 * 用户维度统计图表组件
 * 
 * 功能分支: 004-fund-stats-enhancement
 * 来源: tasks.md T053
 * 
 * 使用 ECharts 展示按用户的订单统计柱状图，当前用户高亮
 */
import { computed } from 'vue'
import VChart from 'vue-echarts'
import type { EChartsOption } from 'echarts'
import type { UserStatistics } from '@/types/statistics'

// ============================================================================
// Props
// ============================================================================

const props = defineProps<{
  /** 统计数据 */
  data: UserStatistics | null
  
  /** 当前用户名 */
  currentUsername: string
  
  /** 加载状态 */
  loading?: boolean
  
  /** 错误信息 */
  error?: string | null
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
  
  const labels = props.data.data.map(d => d.username)
  const orderCounts = props.data.data.map(d => d.orderCount)
  const totalAmounts = props.data.data.map(d => d.totalAmount)
  const isCurrentUserList = props.data.data.map(d => d.isCurrentUser)
  
  // 为当前用户设置不同的颜色
  const barColors = isCurrentUserList.map(isCurrent => 
    isCurrent ? '#ff7875' : '#5470c6'
  )
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: unknown) => {
        const items = params as Array<{ 
          name: string
          value: number
          seriesName: string
          marker: string
          dataIndex: number 
        }>
        if (!items || items.length === 0) return ''
        
        const dataIndex = items[0].dataIndex
        const isMe = isCurrentUserList[dataIndex]
        const userLabel = isMe ? `${items[0].name} (我)` : items[0].name
        
        let result = `<strong>${userLabel}</strong><br/>`
        items.forEach(item => {
          if (item.seriesName === '消费金额') {
            result += `${item.marker} ${item.seriesName}: ¥${item.value.toFixed(2)}<br/>`
          } else {
            result += `${item.marker} ${item.seriesName}: ${item.value}<br/>`
          }
        })
        return result
      }
    },
    legend: {
      data: ['订单数量', '消费金额'],
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
        formatter: (value: string, index: number) => {
          const isCurrent = isCurrentUserList[index]
          return isCurrent ? `${value} ★` : value
        }
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
        name: '消费金额 (¥)',
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
        data: orderCounts.map((value, index) => ({
          value,
          itemStyle: {
            color: barColors[index]
          }
        }))
      },
      {
        name: '消费金额',
        type: 'bar',
        yAxisIndex: 1,
        data: totalAmounts.map((value, index) => ({
          value,
          itemStyle: {
            color: isCurrentUserList[index] ? '#ffa39e' : '#91cc75'
          }
        }))
      }
    ]
  }
})
</script>

<template>
  <div class="user-stat-chart">
    <!-- 标题 -->
    <div class="chart-header">
      <h3 class="chart-title">👥 用户维度统计</h3>
      <div class="chart-legend">
        <span class="legend-item current">
          <span class="legend-color current"></span>
          当前用户
        </span>
        <span class="legend-item">
          <span class="legend-color other"></span>
          其他用户
        </span>
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
        活跃用户: <strong>{{ data.totalUsers }}</strong>
      </span>
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
.user-stat-chart {
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

.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.current {
  background: #ff7875;
}

.legend-color.other {
  background: #5470c6;
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
