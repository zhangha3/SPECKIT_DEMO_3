/**
 * 港口服务单元测试
 * 
 * 功能分支: 001-port-query
 * TDD: 先写测试，确保失败后再实现
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { 
  determineSearchMode, 
  findByCode, 
  loadPorts,
  isValidPortCode,
  normalizePortCode,
  searchByName,
  search,
  formatTimezone
} from '@/services/portService'
import type { Port } from '@/types/port'

describe('portService', () => {
  
  // T011: determineSearchMode 单元测试
  describe('determineSearchMode', () => {
    it('应将5位纯字母识别为精确查询模式', () => {
      expect(determineSearchMode('CNSHA')).toBe('exact')
      expect(determineSearchMode('cnsha')).toBe('exact')
      expect(determineSearchMode('AbCdE')).toBe('exact')
    })

    it('应将非5位字母字符串识别为模糊查询模式', () => {
      expect(determineSearchMode('Shanghai')).toBe('fuzzy')
      expect(determineSearchMode('上海')).toBe('fuzzy')
      expect(determineSearchMode('CN123')).toBe('fuzzy')
      expect(determineSearchMode('CNSH')).toBe('fuzzy')  // 4位
      expect(determineSearchMode('CNSHAA')).toBe('fuzzy') // 6位
    })

    it('应将空字符串识别为模糊查询模式', () => {
      expect(determineSearchMode('')).toBe('fuzzy')
    })

    it('应将包含数字的5位字符串识别为模糊查询模式', () => {
      expect(determineSearchMode('CN123')).toBe('fuzzy')
      expect(determineSearchMode('12345')).toBe('fuzzy')
    })
  })

  // T012: findByCode 单元测试
  describe('findByCode', () => {
    let ports: Port[]

    beforeEach(async () => {
      ports = await loadPorts()
    })

    it('应根据精确代码返回匹配的港口（大写）', () => {
      const result = findByCode('CNSHA', ports)
      expect(result).not.toBeNull()
      expect(result?.code).toBe('CNSHA')
      expect(result?.name).toBe('Shanghai')
      expect(result?.nameCN).toBe('上海')
    })

    it('应支持大小写不敏感查询', () => {
      const result = findByCode('cnsha', ports)
      expect(result).not.toBeNull()
      expect(result?.code).toBe('CNSHA')
    })

    it('应在未找到匹配时返回 null', () => {
      const result = findByCode('XXXXX', ports)
      expect(result).toBeNull()
    })

    it('应正确处理空字符串输入', () => {
      const result = findByCode('', ports)
      expect(result).toBeNull()
    })
  })

  // 辅助函数测试
  describe('isValidPortCode', () => {
    it('应验证有效的5位字母代码', () => {
      expect(isValidPortCode('CNSHA')).toBe(true)
      expect(isValidPortCode('abcde')).toBe(true)
    })

    it('应拒绝无效的港口代码', () => {
      expect(isValidPortCode('CN123')).toBe(false)
      expect(isValidPortCode('CNSH')).toBe(false)
      expect(isValidPortCode('')).toBe(false)
    })
  })

  describe('normalizePortCode', () => {
    it('应将代码转换为大写', () => {
      expect(normalizePortCode('cnsha')).toBe('CNSHA')
      expect(normalizePortCode('CnShA')).toBe('CNSHA')
    })
  })

  describe('loadPorts', () => {
    it('应成功加载港口数据', async () => {
      const ports = await loadPorts()
      expect(Array.isArray(ports)).toBe(true)
      expect(ports.length).toBeGreaterThanOrEqual(20)
    })

    it('应返回符合 Port 接口的数据', async () => {
      const ports = await loadPorts()
      const port = ports[0]
      expect(port).toHaveProperty('code')
      expect(port).toHaveProperty('name')
      expect(port).toHaveProperty('nameCN')
      expect(port).toHaveProperty('country')
      expect(port).toHaveProperty('countryCode')
      expect(port).toHaveProperty('timezone')
    })
  })

  // T023: searchByName 单元测试（中英文匹配）
  describe('searchByName', () => {
    let ports: Port[]

    beforeEach(async () => {
      ports = await loadPorts()
    })

    it('应按英文名称模糊匹配港口', () => {
      const results = searchByName('Shanghai', ports)
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(p => p.name === 'Shanghai')).toBe(true)
    })

    it('应按中文名称模糊匹配港口', () => {
      const results = searchByName('上海', ports)
      expect(results.length).toBeGreaterThan(0)
      expect(results.some(p => p.nameCN === '上海')).toBe(true)
    })

    it('应支持大小写不敏感的英文匹配', () => {
      const results = searchByName('shanghai', ports)
      expect(results.length).toBeGreaterThan(0)
    })

    it('应返回空数组当没有匹配结果时', () => {
      const results = searchByName('不存在的港口', ports)
      expect(results).toEqual([])
    })

    it('应返回空数组当输入为空时', () => {
      const results = searchByName('', ports)
      expect(results).toEqual([])
    })

    it('应返回多个匹配结果', () => {
      // 搜索包含 "o" 的港口名称，应返回多个结果
      const results = searchByName('o', ports)
      expect(results.length).toBeGreaterThan(1)
    })
  })

  // 统一搜索入口测试
  describe('search', () => {
    let ports: Port[]

    beforeEach(async () => {
      ports = await loadPorts()
    })

    it('应对5位字母执行精确查询', () => {
      const result = search('CNSHA', ports)
      expect(result.mode).toBe('exact')
      expect(result.total).toBe(1)
      expect(result.ports[0].code).toBe('CNSHA')
    })

    it('应对非5位字母执行模糊查询', () => {
      const result = search('Shanghai', ports)
      expect(result.mode).toBe('fuzzy')
      expect(result.total).toBeGreaterThan(0)
    })

    it('应返回正确的查询关键词', () => {
      const result = search('CNSHA', ports)
      expect(result.query).toBe('CNSHA')
    })
  })

  // T035: 时区格式化函数单元测试
  describe('formatTimezone', () => {
    it('应将 IANA 时区转换为 UTC 偏移格式', () => {
      const result = formatTimezone('Asia/Shanghai')
      // 应该返回类似 "GMT+8" 或 "UTC+8" 的格式
      expect(result).toMatch(/GMT\+8|UTC\+8|Asia\/Shanghai/)
    })

    it('应处理无效时区并返回原始值', () => {
      const result = formatTimezone('Invalid/Timezone')
      expect(result).toBe('Invalid/Timezone')
    })

    it('应正确格式化欧洲时区', () => {
      const result = formatTimezone('Europe/London')
      expect(result).toMatch(/GMT|UTC|Europe\/London/)
    })

    it('应正确格式化美洲时区', () => {
      const result = formatTimezone('America/New_York')
      expect(result).toMatch(/GMT|UTC|America\/New_York/)
    })
  })
})
