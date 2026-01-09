<script setup lang="ts">
/**
 * 港口详情展示组件
 * 
 * 功能分支: 001-port-query
 * 展示单个港口的完整信息
 */
import type { Port } from '@/types/port'
import { formatTimezone } from '@/services/portService'

defineProps<{
  port: Port
}>()
</script>

<template>
  <div class="port-detail">
    <h2 class="port-name">
      {{ port.nameCN }} ({{ port.name }})
    </h2>
    
    <div class="detail-grid">
      <div class="detail-item">
        <span class="label">港口代码</span>
        <span class="value code">{{ port.code }}</span>
      </div>
      
      <div class="detail-item">
        <span class="label">英文名称</span>
        <span class="value">{{ port.name }}</span>
      </div>
      
      <div class="detail-item">
        <span class="label">中文名称</span>
        <span class="value">{{ port.nameCN }}</span>
      </div>
      
      <div class="detail-item">
        <span class="label">所在国家</span>
        <span class="value">{{ port.country }} ({{ port.countryCode }})</span>
      </div>
      
      <div class="detail-item">
        <span class="label">时区</span>
        <span class="value">{{ formatTimezone(port.timezone) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.port-detail {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin-top: 20px;
}

.port-name {
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 24px;
  border-bottom: 2px solid #42b983;
  padding-bottom: 12px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.label {
  font-size: 13px;
  color: #888;
  font-weight: 500;
}

.value {
  font-size: 16px;
  color: #2c3e50;
}

.value.code {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #42b983;
  font-size: 18px;
}
</style>
