<script setup lang="ts">
/**
 * 港口搜索输入组件
 * 
 * 功能分支: 001-port-query
 * 提供搜索输入框和搜索按钮
 */
import { ref, computed } from 'vue'

const emit = defineEmits<{
  search: [query: string]
}>()

const inputValue = ref('')
const validationError = ref('')

// 最大输入长度
const MAX_INPUT_LENGTH = 100

// 计算当前输入长度
const inputLength = computed(() => inputValue.value.length)
const isNearLimit = computed(() => inputLength.value >= MAX_INPUT_LENGTH - 10)

/**
 * 安全处理输入 - 防止 XSS
 * 移除潜在的危险字符和脚本标签
 */
function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // 移除 HTML 标签
    .replace(/[<>]/g, '')    // 移除尖括号
    .trim()
}

function handleSearch() {
  // 清除之前的错误
  validationError.value = ''
  
  // 验证输入
  if (!inputValue.value || inputValue.value.trim() === '') {
    validationError.value = '请输入查询条件'
    return
  }

  // 检查输入长度
  if (inputValue.value.length > MAX_INPUT_LENGTH) {
    validationError.value = `输入内容过长，请限制在 ${MAX_INPUT_LENGTH} 字符以内`
    return
  }
  
  // 安全处理并触发搜索事件
  const sanitizedQuery = sanitizeInput(inputValue.value)
  
  if (!sanitizedQuery) {
    validationError.value = '请输入有效的查询条件'
    return
  }
  
  emit('search', sanitizedQuery)
}

function clearInput() {
  inputValue.value = ''
  validationError.value = ''
}
</script>

<template>
  <div class="port-search">
    <div class="search-container">
      <input
        v-model="inputValue"
        type="text"
        class="search-input"
        placeholder="输入港口代码（如 CNSHA）或港口名称"
        maxlength="100"
        @keyup.enter="handleSearch"
      />
      <button 
        type="button" 
        class="search-button"
        @click="handleSearch"
      >
        搜索
      </button>
      <button 
        v-if="inputValue"
        type="button" 
        class="clear-button"
        @click="clearInput"
      >
        清除
      </button>
    </div>
    <p v-if="validationError" class="validation-error">
      {{ validationError }}
    </p>
    <div class="search-meta">
      <p class="search-hint">
        提示：输入5位字母代码进行精确查询，输入其他内容进行名称模糊查询
      </p>
      <span v-if="isNearLimit" class="char-count" :class="{ warning: inputLength >= MAX_INPUT_LENGTH }">
        {{ inputLength }}/{{ MAX_INPUT_LENGTH }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.port-search {
  margin-bottom: 20px;
}

.search-container {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #42b983;
}

.search-button {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background-color: #42b983;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-button:hover {
  background-color: #369970;
}

.clear-button {
  padding: 12px 16px;
  font-size: 14px;
  color: #666;
  background-color: #f0f0f0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-button:hover {
  background-color: #e0e0e0;
}

.validation-error {
  margin-top: 8px;
  color: #e74c3c;
  font-size: 14px;
}

.search-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.search-hint {
  margin: 0;
  color: #888;
  font-size: 13px;
}

.char-count {
  font-size: 12px;
  color: #888;
}

.char-count.warning {
  color: #e74c3c;
  font-weight: 600;
}
</style>
