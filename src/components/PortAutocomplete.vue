<script setup lang="ts">
/**
 * 港口自动补全组件
 * 
 * 功能分支: 002-shipping-schedule
 * 提供港口搜索下拉列表，支持键盘导航
 */
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import type { Port } from '@/types/port'
import { usePortAutocomplete } from '@/composables/usePortAutocomplete'

const props = withDefaults(defineProps<{
  ports: Port[]
  modelValue?: string
  placeholder?: string
  label?: string
}>(), {
  modelValue: '',
  placeholder: '请输入港口代码或名称',
  label: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'select': [port: Port]
  'clear': []
}>()

const {
  query,
  suggestions,
  selectedIndex,
  isOpen,
  moveDown,
  moveUp,
  select,
  confirmSelection,
  close,
  clear
} = usePortAutocomplete(props.ports)

// 输入框引用
const inputRef = ref<HTMLInputElement | null>(null)

// 同步 modelValue 到 query
watch(() => props.modelValue, (newValue) => {
  if (newValue !== query.value) {
    query.value = newValue
  }
}, { immediate: true })

// 计算属性：是否显示清空按钮
const showClearButton = computed(() => query.value.length > 0)

// 处理选择
function handleSelect(port: Port) {
  select(port)
  emit('update:modelValue', port.code)
  emit('select', port)
}

// 处理键盘事件
function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      moveDown()
      break
    case 'ArrowUp':
      event.preventDefault()
      moveUp()
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0) {
        handleSelect(suggestions.value[selectedIndex.value])
      }
      break
    case 'Escape':
      close()
      break
  }
}

// 处理输入
function handleInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  query.value = value
  emit('update:modelValue', value)
}

// 处理清空
function handleClear() {
  clear()
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

// 处理失去焦点
function handleBlur() {
  // 延迟关闭，让点击事件先执行
  setTimeout(() => {
    close()
  }, 200)
}

// 处理聚焦
function handleFocus() {
  if (suggestions.value.length > 0) {
    isOpen.value = true
  }
}
</script>

<template>
  <div class="port-autocomplete">
    <!-- Label -->
    <label v-if="label" class="autocomplete-label">{{ label }}</label>
    
    <!-- 输入框容器 -->
    <div class="input-container">
      <input
        ref="inputRef"
        type="text"
        :value="query"
        :placeholder="placeholder"
        class="autocomplete-input"
        @input="handleInput"
        @keydown="handleKeydown"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      
      <!-- 清空按钮 -->
      <button
        v-if="showClearButton"
        type="button"
        class="clear-button"
        @click="handleClear"
        tabindex="-1"
      >
        ×
      </button>
    </div>

    <!-- 下拉列表 -->
    <div v-if="isOpen" class="autocomplete-dropdown">
      <div
        v-for="(port, index) in suggestions"
        :key="port.code"
        class="autocomplete-item"
        :class="{ highlighted: index === selectedIndex }"
        @mousedown.prevent="handleSelect(port)"
      >
        <span class="port-code">{{ port.code }}</span>
        <span class="port-name">{{ port.nameCN }} / {{ port.name }}</span>
        <span class="port-country">{{ port.country }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.port-autocomplete {
  position: relative;
  width: 100%;
}

.autocomplete-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.autocomplete-input {
  width: 100%;
  padding: 10px 36px 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.autocomplete-input:focus {
  outline: none;
  border-color: #1976d2;
  box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
}

.clear-button {
  position: absolute;
  right: 8px;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: #e0e0e0;
  border-radius: 50%;
  font-size: 16px;
  line-height: 1;
  color: #666;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-button:hover {
  background: #d0d0d0;
}

.autocomplete-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  max-height: 240px;
  overflow-y: auto;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.autocomplete-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.autocomplete-item:hover,
.autocomplete-item.highlighted {
  background-color: #e3f2fd;
}

.port-code {
  font-family: 'Consolas', 'Monaco', monospace;
  font-weight: 600;
  color: #1976d2;
  min-width: 60px;
}

.port-name {
  flex: 1;
  color: #333;
}

.port-country {
  font-size: 12px;
  color: #888;
}
</style>
