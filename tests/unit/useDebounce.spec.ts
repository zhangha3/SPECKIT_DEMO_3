/**
 * 防抖工具函数单元测试
 * 
 * 功能分支: 002-shipping-schedule
 * 测试 useDebounce.ts 中的所有函数
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useDebouncedRef, useDebounce, useDebounceFn } from '@/composables/useDebounce'

// Mock onUnmounted 钩子
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onUnmounted: vi.fn()
  }
})

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('useDebouncedRef', () => {
    it('应该在延迟后更新值', async () => {
      const source = ref('initial')
      const debounced = useDebouncedRef(source, 300)
      
      expect(debounced.value).toBe('initial')
      
      // 更新源值
      source.value = 'updated'
      await nextTick()
      
      // 立即检查，应该还是原值
      expect(debounced.value).toBe('initial')
      
      // 快进300ms
      vi.advanceTimersByTime(300)
      await nextTick()
      
      // 现在应该更新了
      expect(debounced.value).toBe('updated')
    })

    it('应该在快速连续更新时只保留最后一个值', async () => {
      const source = ref('initial')
      const debounced = useDebouncedRef(source, 300)
      
      // 快速连续更新
      source.value = 'first'
      await nextTick()
      vi.advanceTimersByTime(100)
      
      source.value = 'second'
      await nextTick()
      vi.advanceTimersByTime(100)
      
      source.value = 'third'
      await nextTick()
      
      // 还没到300ms，应该还是原值
      expect(debounced.value).toBe('initial')
      
      // 快进300ms
      vi.advanceTimersByTime(300)
      await nextTick()
      
      // 应该是最后一个值
      expect(debounced.value).toBe('third')
    })

    it('应该使用默认300ms延迟', async () => {
      const source = ref('initial')
      const debounced = useDebouncedRef(source)
      
      source.value = 'updated'
      await nextTick()
      
      // 299ms 后还是原值
      vi.advanceTimersByTime(299)
      await nextTick()
      expect(debounced.value).toBe('initial')
      
      // 1ms 后更新
      vi.advanceTimersByTime(1)
      await nextTick()
      expect(debounced.value).toBe('updated')
    })

    it('应该支持自定义延迟时间', async () => {
      const source = ref('initial')
      const debounced = useDebouncedRef(source, 500)
      
      source.value = 'updated'
      await nextTick()
      
      // 300ms 后还是原值
      vi.advanceTimersByTime(300)
      await nextTick()
      expect(debounced.value).toBe('initial')
      
      // 200ms 后更新
      vi.advanceTimersByTime(200)
      await nextTick()
      expect(debounced.value).toBe('updated')
    })
  })

  describe('useDebounce', () => {
    it('应该在延迟后执行函数', () => {
      const fn = vi.fn()
      const debouncedFn = useDebounce(fn, 300)
      
      debouncedFn('arg1', 'arg2')
      
      // 立即检查，不应该被调用
      expect(fn).not.toHaveBeenCalled()
      
      // 快进300ms
      vi.advanceTimersByTime(300)
      
      // 现在应该被调用了
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('应该在快速连续调用时只执行最后一次', () => {
      const fn = vi.fn()
      const debouncedFn = useDebounce(fn, 300)
      
      // 快速连续调用
      debouncedFn('first')
      vi.advanceTimersByTime(100)
      
      debouncedFn('second')
      vi.advanceTimersByTime(100)
      
      debouncedFn('third')
      
      // 快进300ms
      vi.advanceTimersByTime(300)
      
      // 应该只被调用一次，参数是最后一次的
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('third')
    })
  })

  describe('useDebounceFn', () => {
    it('应该在延迟后执行函数', () => {
      const fn = vi.fn()
      const { execute } = useDebounceFn(fn, 300)
      
      execute('arg1')
      
      // 立即检查，不应该被调用
      expect(fn).not.toHaveBeenCalled()
      
      // 快进300ms
      vi.advanceTimersByTime(300)
      
      // 现在应该被调用了
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('arg1')
    })

    it('cancel 应该取消待执行的调用', () => {
      const fn = vi.fn()
      const { execute, cancel } = useDebounceFn(fn, 300)
      
      execute('arg1')
      vi.advanceTimersByTime(100)
      
      // 取消
      cancel()
      
      // 快进剩余时间
      vi.advanceTimersByTime(200)
      
      // 不应该被调用
      expect(fn).not.toHaveBeenCalled()
    })

    it('flush 应该立即执行函数', () => {
      const fn = vi.fn()
      const { execute, flush } = useDebounceFn(fn, 300)
      
      execute('pending')
      
      // 立即执行新调用
      flush('immediate')
      
      // 应该立即被调用
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('immediate')
      
      // 快进时间，确保没有重复调用
      vi.advanceTimersByTime(300)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('快速连续调用时只保留最后一次', () => {
      const fn = vi.fn()
      const { execute } = useDebounceFn(fn, 300)
      
      execute('first')
      vi.advanceTimersByTime(100)
      
      execute('second')
      vi.advanceTimersByTime(100)
      
      execute('third')
      
      // 快进300ms
      vi.advanceTimersByTime(300)
      
      // 应该只被调用一次
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('third')
    })
  })
})
