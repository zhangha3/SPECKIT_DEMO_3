<script setup lang="ts">
/**
 * 港口列表组件
 * 
 * 功能分支: 001-port-query
 * 展示港口搜索结果列表
 */
import type { Port } from '@/types/port'

defineProps<{
  ports: Port[]
  selectedCode?: string
}>()

const emit = defineEmits<{
  select: [port: Port]
}>()

function handleSelect(port: Port) {
  emit('select', port)
}
</script>

<template>
  <div class="port-list">
    <!-- 空状态 -->
    <div v-if="ports.length === 0" class="empty-state">
      暂无港口数据
    </div>

    <!-- 港口列表 -->
    <div 
      v-for="port in ports" 
      :key="port.code"
      class="port-item"
      :class="{ selected: selectedCode === port.code }"
      @click="handleSelect(port)"
    >
      <span class="port-code">{{ port.code }}</span>
      <div class="port-names">
        <span class="name-cn">{{ port.nameCN }}</span>
        <span class="name-en">{{ port.name }}</span>
      </div>
      <span class="port-country">{{ port.country }}</span>
    </div>
  </div>
</template>

<style scoped>
.port-list {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #888;
}

.port-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.port-item:last-child {
  border-bottom: none;
}

.port-item:hover {
  background-color: #f5f5f5;
}

.port-item.selected {
  background-color: #e8f5e9;
  border-left: 4px solid #42b983;
}

.port-code {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: #42b983;
  min-width: 70px;
}

.port-names {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name-cn {
  font-weight: 600;
  color: #2c3e50;
}

.name-en {
  font-size: 13px;
  color: #888;
}

.port-country {
  color: #888;
  font-size: 14px;
  min-width: 100px;
  text-align: right;
}
</style>
