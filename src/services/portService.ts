/**
 * 港口数据服务
 * 
 * 功能分支: 001-port-query
 * 来源: contracts/port-service.ts
 */
import type { Port, SearchMode, SearchResult } from '@/types/port'
import portsData from '@/assets/data/ports.json'

/**
 * 判断查询模式
 * 
 * @param query 查询字符串
 * @returns 'exact' | 'fuzzy' 查询模式
 */
export function determineSearchMode(query: string): SearchMode {
  const portCodePattern = /^[A-Za-z]{5}$/
  return portCodePattern.test(query) ? 'exact' : 'fuzzy'
}

/**
 * 验证港口代码格式
 * 
 * @param code 待验证的代码
 * @returns boolean 是否为有效的港口代码格式
 */
export function isValidPortCode(code: string): boolean {
  return /^[A-Za-z]{5}$/.test(code)
}

/**
 * 标准化港口代码
 * 
 * @param code 原始代码
 * @returns string 大写格式的代码
 */
export function normalizePortCode(code: string): string {
  return code.toUpperCase()
}

/**
 * 加载港口数据
 * 
 * @returns Promise<Port[]> 所有港口数据
 * @throws Error 当数据格式无效时
 */
export async function loadPorts(): Promise<Port[]> {
  try {
    // 数据已通过 import 静态加载
    const data = portsData as Port[]
    
    // 验证数据格式
    if (!Array.isArray(data)) {
      throw new Error('港口数据格式无效：期望数组类型')
    }
    
    // 验证每个港口对象的必要字段
    for (const port of data) {
      if (!port.code || !port.name || !port.nameCN) {
        throw new Error('港口数据格式无效：缺少必要字段')
      }
    }
    
    return data
  } catch (error) {
    console.error('加载港口数据失败:', error)
    throw new Error('数据加载失败，请刷新页面重试')
  }
}

/**
 * 按港口代码精确查询
 * 
 * @param code 港口代码 (5位字母, 大小写不敏感)
 * @param ports 港口数据列表
 * @returns Port | null 匹配的港口，未找到返回 null
 */
export function findByCode(code: string, ports: Port[]): Port | null {
  if (!code || code.trim() === '') {
    return null
  }
  
  const normalizedCode = normalizePortCode(code.trim())
  return ports.find(port => port.code === normalizedCode) || null
}

/**
 * 按港口名称模糊查询
 * 
 * @param keyword 搜索关键词 (支持中英文)
 * @param ports 港口数据列表
 * @returns Port[] 匹配的港口列表
 */
export function searchByName(keyword: string, ports: Port[]): Port[] {
  if (!keyword || keyword.trim() === '') {
    return []
  }
  
  const lowerKeyword = keyword.toLowerCase().trim()
  return ports.filter(port => 
    port.name.toLowerCase().includes(lowerKeyword) ||
    port.nameCN.includes(keyword.trim())
  )
}

/**
 * 统一搜索入口
 * 
 * 根据输入格式自动判断查询模式：
 * - 5位纯字母 → 精确查询 (按港口代码)
 * - 其他 → 模糊查询 (按港口名称)
 * 
 * @param query 查询字符串
 * @param ports 港口数据列表
 * @returns SearchResult 查询结果
 */
export function search(query: string, ports: Port[]): SearchResult {
  const mode = determineSearchMode(query)
  
  if (mode === 'exact') {
    const port = findByCode(query, ports)
    return {
      ports: port ? [port] : [],
      total: port ? 1 : 0,
      mode,
      query
    }
  } else {
    const results = searchByName(query, ports)
    return {
      ports: results,
      total: results.length,
      mode,
      query
    }
  }
}

/**
 * 格式化时区显示
 * 将 IANA 时区格式转换为 UTC+X 显示格式
 * 
 * @param timezone IANA 时区标识符 (如 Asia/Shanghai)
 * @returns string UTC 偏移格式 (如 UTC+8)
 */
export function formatTimezone(timezone: string): string {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset'
    })
    const parts = formatter.formatToParts(now)
    const offsetPart = parts.find(part => part.type === 'timeZoneName')
    return offsetPart?.value || timezone
  } catch {
    return timezone
  }
}

/**
 * 港口模糊搜索（用于自动补全）
 * 
 * 支持按港口代码、英文名称、中文名称进行模糊匹配
 * - 不区分大小写
 * - 使用包含匹配（contains）
 * - 最多返回指定数量的结果
 * 
 * @param query 搜索关键词
 * @param ports 港口数据列表
 * @param maxResults 最大返回结果数，默认10
 * @returns Port[] 匹配的港口列表
 */
export function fuzzySearchPorts(
  query: string, 
  ports: Port[], 
  maxResults: number = 10
): Port[] {
  if (!query || query.trim() === '') {
    return []
  }
  
  const lowerQuery = query.toLowerCase().trim()
  
  const results = ports.filter(port => 
    // 匹配港口代码
    port.code.toLowerCase().includes(lowerQuery) ||
    // 匹配英文名称
    port.name.toLowerCase().includes(lowerQuery) ||
    // 匹配中文名称
    port.nameCN.includes(query.trim())
  )
  
  // 限制返回结果数量
  return results.slice(0, maxResults)
}

