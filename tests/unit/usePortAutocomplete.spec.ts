/**
 * usePortAutocomplete Composable 测试
 * 
 * 功能分支: 002-shipping-schedule
 * TDD: 先写测试，确保失败后再实现
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'

// 模拟港口数据
const mockPorts = [
  { code: 'CNSHA', name: 'Shanghai', nameCN: '上海', country: 'China', countryCode: 'CN', timezone: 'Asia/Shanghai' },
  { code: 'CNNGB', name: 'Ningbo', nameCN: '宁波', country: 'China', countryCode: 'CN', timezone: 'Asia/Shanghai' },
  { code: 'CNSHE', name: 'Shenyang', nameCN: '沈阳', country: 'China', countryCode: 'CN', timezone: 'Asia/Shanghai' },
  { code: 'DEHAM', name: 'Hamburg', nameCN: '汉堡', country: 'Germany', countryCode: 'DE', timezone: 'Europe/Berlin' },
  { code: 'NLRTM', name: 'Rotterdam', nameCN: '鹿特丹', country: 'Netherlands', countryCode: 'NL', timezone: 'Europe/Amsterdam' },
  { code: 'SGSIN', name: 'Singapore', nameCN: '新加坡', country: 'Singapore', countryCode: 'SG', timezone: 'Asia/Singapore' }
]

vi.mock('@/services/portService', () => ({
  loadPorts: vi.fn(() => Promise.resolve(mockPorts)),
  fuzzySearchPorts: vi.fn((keyword, ports, limit = 10) => {
    if (!keyword || keyword.trim() === '') return []
    const k = keyword.toLowerCase()
    return ports.filter((p: any) => 
      p.code.toLowerCase().includes(k) ||
      p.name.toLowerCase().includes(k) ||
      p.nameCN.includes(keyword)
    ).slice(0, limit)
  })
}))

describe('usePortAutocomplete', () => {
  let usePortAutocomplete: typeof import('@/composables/usePortAutocomplete').usePortAutocomplete

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    const module = await import('@/composables/usePortAutocomplete')
    usePortAutocomplete = module.usePortAutocomplete
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('初始状态', () => {
    it('应返回初始空状态', () => {
      const { query, suggestions, isOpen, selectedIndex } = usePortAutocomplete(mockPorts)
      
      expect(query.value).toBe('')
      expect(suggestions.value).toEqual([])
      expect(isOpen.value).toBe(false)
      expect(selectedIndex.value).toBe(-1)
    })
  })

  describe('搜索功能', () => {
    it('应在输入后 300ms 触发搜索', async () => {
      const { query, suggestions } = usePortAutocomplete(mockPorts)
      
      query.value = 'sha'
      await nextTick()
      
      // 300ms 前不应有结果
      expect(suggestions.value).toEqual([])
      
      // 快进 300ms
      vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(suggestions.value.length).toBeGreaterThan(0)
    })

    it('应按关键词模糊匹配港口', async () => {
      const { query, suggestions } = usePortAutocomplete(mockPorts)
      
      query.value = 'CN'
      await nextTick()
      vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(suggestions.value.every(p => p.code.includes('CN'))).toBe(true)
    })

    it('应支持中文搜索', async () => {
      const { query, suggestions } = usePortAutocomplete(mockPorts)
      
      query.value = '上海'
      await nextTick()
      vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(suggestions.value.some(p => p.nameCN === '上海')).toBe(true)
    })

    it('应在输入为空时清空建议', async () => {
      const { query, suggestions } = usePortAutocomplete(mockPorts)
      
      // 先搜索
      query.value = 'sha'
      await nextTick()
      vi.advanceTimersByTime(300)
      await nextTick()
      expect(suggestions.value.length).toBeGreaterThan(0)
      
      // 清空
      query.value = ''
      await nextTick()
      vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(suggestions.value).toEqual([])
    })
  })

  describe('下拉列表状态', () => {
    it('应在有建议时打开下拉列表', async () => {
      const { query, isOpen } = usePortAutocomplete(mockPorts)
      
      query.value = 'sha'
      await nextTick()
      vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(isOpen.value).toBe(true)
    })

    it('应在无建议时关闭下拉列表', async () => {
      const { query, isOpen } = usePortAutocomplete(mockPorts)
      
      query.value = 'zzzzz'
      await nextTick()
      vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(isOpen.value).toBe(false)
    })

    it('应支持手动关闭下拉列表', async () => {
      const { query, isOpen, close } = usePortAutocomplete(mockPorts)
      
      query.value = 'sha'
      await nextTick()
      vi.advanceTimersByTime(300)
      await nextTick()
      expect(isOpen.value).toBe(true)
      
      close()
      expect(isOpen.value).toBe(false)
    })
  })

  describe('键盘导航', () => {
    it('应支持向下键选择', async () => {
      const { query, selectedIndex, moveDown } = usePortAutocomplete(mockPorts)
      
      query.value = 'CN'
      await nextTick()
      vi.advanceTimersByTime(300)
      await nextTick()
      
      expect(selectedIndex.value).toBe(-1)
      
      moveDown()
      expect(selectedIndex.value).toBe(0)
      
      moveDown()
      expect(selectedIndex.value).toBe(1)
    })

    it('应支持向上键选择', async () => {
      const { query, selectedIndex, moveDown, moveUp } = usePortAutocomplete(mockPorts)
      
      query.value = 'CN'
      await nextTick()
      vi.advanceTimersByTime(300)
      await nextTick()
      
      moveDown()
      moveDown()
      expect(selectedIndex.value).toBe(1)
      
      moveUp()
      expect(selectedIndex.value).toBe(0)
    })

    it('向上到顶部时应循环到最后', async () => {
      const { query, selectedIndex, suggestions, moveUp } = usePortAutocomplete(mockPorts)
      
      query.value = 'CN'
      await nextTick()
      vi.advanceTimersByTime(300)
      await nextTick()
      
      moveUp()
      expect(selectedIndex.value).toBe(suggestions.value.length - 1)
    })
  })

  describe('选择功能', () => {
    it('应支持选择港口', async () => {
      const { query, suggestions, select, selectedPort } = usePortAutocomplete(mockPorts)
      
      query.value = 'sha'
      await nextTick()
      vi.advanceTimersByTime(300)
      await nextTick()
      
      select(suggestions.value[0])
      
      expect(selectedPort.value).toEqual(suggestions.value[0])
      expect(query.value).toBe(suggestions.value[0].code)
    })

    it('选择后应关闭下拉列表', async () => {
      const { query, suggestions, select, isOpen } = usePortAutocomplete(mockPorts)
      
      query.value = 'sha'
      await nextTick()
      vi.advanceTimersByTime(300)
      await nextTick()
      
      select(suggestions.value[0])
      
      expect(isOpen.value).toBe(false)
    })

    it('应支持通过 Enter 键确认选择', async () => {
      const { query, selectedIndex, moveDown, confirmSelection, selectedPort } = usePortAutocomplete(mockPorts)
      
      query.value = 'CN'
      await nextTick()
      vi.advanceTimersByTime(300)
      await nextTick()
      
      moveDown() // 选中第一项
      confirmSelection()
      
      expect(selectedPort.value).toBeTruthy()
    })
  })

  describe('清空功能', () => {
    it('应支持清空选择', async () => {
      const { query, suggestions, select, clear, selectedPort } = usePortAutocomplete(mockPorts)
      
      query.value = 'sha'
      await nextTick()
      vi.advanceTimersByTime(300)
      await nextTick()
      
      select(suggestions.value[0])
      expect(selectedPort.value).toBeTruthy()
      
      clear()
      
      expect(selectedPort.value).toBeNull()
      expect(query.value).toBe('')
    })
  })
})
