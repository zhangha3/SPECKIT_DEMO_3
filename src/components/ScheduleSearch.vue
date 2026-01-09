<script setup lang="ts">
/**
 * 船期搜索条件组件
 * 
 * 功能分支: 002-shipping-schedule
 * 提供起运港、目的港自动补全输入和查询/重置按钮
 */
import { ref, watch } from 'vue'
import type { Port } from '@/types/port'
import PortAutocomplete from './PortAutocomplete.vue'

const props = withDefaults(defineProps<{
  ports?: Port[]
  initialDeparturePort?: string
  initialArrivalPort?: string
  initialEtdStart?: string
  initialEtdEnd?: string
}>(), {
  ports: () => [],
  initialDeparturePort: '',
  initialArrivalPort: '',
  initialEtdStart: '',
  initialEtdEnd: ''
})

const emit = defineEmits<{
  search: [criteria: { departurePort: string; arrivalPort: string; etdStart: string; etdEnd: string }]
  reset: []
}>()

const departurePort = ref(props.initialDeparturePort)
const arrivalPort = ref(props.initialArrivalPort)
const etdStart = ref(props.initialEtdStart)
const etdEnd = ref(props.initialEtdEnd)

// 日期验证错误
const dateError = ref('')

// 监听 props 变化更新内部状态
watch(() => props.initialDeparturePort, (val) => {
  departurePort.value = val
})
watch(() => props.initialArrivalPort, (val) => {
  arrivalPort.value = val
})
watch(() => props.initialEtdStart, (val) => {
  etdStart.value = val
})
watch(() => props.initialEtdEnd, (val) => {
  etdEnd.value = val
})

// 验证日期范围
function validateDateRange(): boolean {
  dateError.value = ''
  if (etdStart.value && etdEnd.value) {
    if (etdStart.value > etdEnd.value) {
      dateError.value = '起始日期不能晚于结束日期'
      return false
    }
  }
  return true
}

function handleSearch() {
  if (!validateDateRange()) {
    return
  }
  emit('search', {
    departurePort: departurePort.value.trim(),
    arrivalPort: arrivalPort.value.trim(),
    etdStart: etdStart.value,
    etdEnd: etdEnd.value
  })
}

function handleReset() {
  departurePort.value = ''
  arrivalPort.value = ''
  etdStart.value = ''
  etdEnd.value = ''
  dateError.value = ''
  emit('reset')
}
</script>

<template>
  <div class="schedule-search">
    <div class="search-form">
      <!-- 起运港输入（使用自动补全） -->
      <div class="form-group">
        <PortAutocomplete
          v-if="ports.length > 0"
          v-model="departurePort"
          :ports="ports"
          label="起运港"
          placeholder="输入港口代码或名称"
          data-testid="departure-port-input"
          @keyup.enter="handleSearch"
        />
        <template v-else>
          <label for="departure-port">起运港</label>
          <input
            id="departure-port"
            v-model="departurePort"
            type="text"
            data-testid="departure-port-input"
            placeholder="请输入起运港代码"
            @keyup.enter="handleSearch"
          />
        </template>
      </div>

      <!-- 目的港输入（使用自动补全） -->
      <div class="form-group">
        <PortAutocomplete
          v-if="ports.length > 0"
          v-model="arrivalPort"
          :ports="ports"
          label="目的港"
          placeholder="输入港口代码或名称"
          data-testid="arrival-port-input"
          @keyup.enter="handleSearch"
        />
        <template v-else>
          <label for="arrival-port">目的港</label>
          <input
            id="arrival-port"
            v-model="arrivalPort"
            type="text"
            data-testid="arrival-port-input"
            placeholder="请输入目的港代码"
            @keyup.enter="handleSearch"
          />
        </template>
      </div>

      <!-- ETD 起始日期 -->
      <div class="form-group">
        <label for="etd-start">ETD 起始</label>
        <input
          id="etd-start"
          v-model="etdStart"
          type="date"
          data-testid="etd-start-input"
        />
      </div>

      <!-- ETD 结束日期 -->
      <div class="form-group">
        <label for="etd-end">ETD 结束</label>
        <input
          id="etd-end"
          v-model="etdEnd"
          type="date"
          data-testid="etd-end-input"
        />
      </div>

      <!-- 日期错误提示 -->
      <div v-if="dateError" class="date-error">
        {{ dateError }}
      </div>

      <!-- 按钮组 -->
      <div class="button-group">
        <button 
          type="button"
          class="btn-primary"
          data-testid="search-button"
          @click="handleSearch"
        >
          查询
        </button>
        <button 
          type="button" 
          class="btn-secondary"
          data-testid="reset-button"
          @click="handleReset"
        >
          重置
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.schedule-search {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 180px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.form-group input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.button-group {
  display: flex;
  gap: 10px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-primary {
  background-color: #1976d2;
  color: white;
}

.btn-primary:hover {
  background-color: #1565c0;
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #d0d0d0;
}

.btn-secondary:active {
  transform: scale(0.98);
}

.date-error {
  width: 100%;
  padding: 8px 12px;
  background-color: #ffebee;
  border: 1px solid #ef9a9a;
  border-radius: 6px;
  color: #c62828;
  font-size: 13px;
}

/* 响应式布局 */
@media (max-width: 576px) {
  .search-form {
    flex-direction: column;
  }

  .form-group {
    width: 100%;
  }

  .button-group {
    width: 100%;
    justify-content: stretch;
  }

  .btn-primary,
  .btn-secondary {
    flex: 1;
  }
}
</style>
