/**
 * 防抖工具函数 Composable
 * 
 * 功能分支: 002-shipping-schedule
 * 来源: research.md - 防抖机制章节
 */
import { ref, watch, onUnmounted, type Ref } from 'vue'

/**
 * 创建防抖响应式引用
 * 
 * @param value 源响应式引用
 * @param delay 防抖延迟时间（毫秒），默认300ms
 * @returns 防抖后的响应式引用
 */
export function useDebouncedRef<T>(value: Ref<T>, delay: number = 300): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | null = null
  
  watch(value, (newValue) => {
    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer)
    }
    
    // 设置新的定时器
    timer = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })
  
  // 组件卸载时清理定时器
  onUnmounted(() => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  })
  
  return debouncedValue
}

/**
 * 创建防抖函数
 * 
 * @param fn 需要防抖的函数
 * @param delay 防抖延迟时间（毫秒），默认300ms
 * @returns 防抖后的函数
 */
export function useDebounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  
  const debouncedFn = (...args: Parameters<T>) => {
    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer)
    }
    
    // 设置新的定时器
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
  
  // 返回带清理功能的函数
  return debouncedFn
}

/**
 * 创建可取消的防抖函数（带 cancel 方法）
 * 
 * @param fn 需要防抖的函数
 * @param delay 防抖延迟时间（毫秒），默认300ms
 * @returns 防抖函数对象，包含 execute 和 cancel 方法
 */
export function useDebounceFn<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number = 300
): {
  execute: (...args: Parameters<T>) => void
  cancel: () => void
  flush: (...args: Parameters<T>) => void
} {
  let timer: ReturnType<typeof setTimeout> | null = null
  let pendingArgs: Parameters<T> | null = null
  
  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    pendingArgs = null
  }
  
  const execute = (...args: Parameters<T>) => {
    pendingArgs = args
    
    // 清除之前的定时器
    if (timer) {
      clearTimeout(timer)
    }
    
    // 设置新的定时器
    timer = setTimeout(() => {
      fn(...args)
      pendingArgs = null
    }, delay)
  }
  
  const flush = (...args: Parameters<T>) => {
    cancel()
    fn(...args)
  }
  
  // 在组件卸载时自动清理
  onUnmounted(cancel)
  
  return {
    execute,
    cancel,
    flush
  }
}
