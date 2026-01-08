/**
 * 港口服务接口契约
 * 
 * 功能分支: 001-port-query
 * 创建日期: 2026-01-08
 * 
 * 本文件定义港口查询服务的接口规范。
 * 实现类必须遵循此接口定义。
 */

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 港口实体
 * 表示一个航运港口的完整信息
 */
export interface Port {
  /** 港口代码 (UN/LOCODE, 5位字母, 如 CNSHA) */
  code: string
  
  /** 港口英文名称 */
  name: string
  
  /** 港口中文名称 */
  nameCN: string
  
  /** 港口所在国家名称 (英文) */
  country: string
  
  /** ISO 3166-1 两字母国家代码 */
  countryCode: string
  
  /** 时区 (IANA 格式, 如 Asia/Shanghai) */
  timezone: string
}

/**
 * 查询模式
 */
export type SearchMode = 'exact' | 'fuzzy'

/**
 * 查询结果
 */
export interface SearchResult {
  /** 匹配的港口列表 */
  ports: Port[]
  
  /** 结果总数 */
  total: number
  
  /** 使用的查询模式 */
  mode: SearchMode
  
  /** 查询关键词 */
  query: string
}

/**
 * 分页结果
 */
export interface PaginatedResult<T> {
  /** 当前页数据 */
  items: T[]
  
  /** 当前页码 (从 1 开始) */
  currentPage: number
  
  /** 每页条数 */
  pageSize: number
  
  /** 总条数 */
  total: number
  
  /** 总页数 */
  totalPages: number
}

// ============================================================================
// 服务接口
// ============================================================================

/**
 * 港口数据服务接口
 * 
 * 提供港口数据的加载和查询功能。
 */
export interface IPortService {
  /**
   * 加载港口数据
   * 
   * @returns Promise<Port[]> 所有港口数据
   * @throws Error 当数据文件不存在或格式错误时
   */
  loadPorts(): Promise<Port[]>
  
  /**
   * 按港口代码精确查询
   * 
   * @param code 港口代码 (5位字母, 大小写不敏感)
   * @returns Port | null 匹配的港口，未找到返回 null
   * 
   * @example
   * const port = service.findByCode('CNSHA')
   * // { code: 'CNSHA', name: 'Shanghai', ... }
   */
  findByCode(code: string): Port | null
  
  /**
   * 按港口名称模糊查询
   * 
   * @param keyword 搜索关键词 (支持中英文)
   * @returns Port[] 匹配的港口列表
   * 
   * @example
   * const ports = service.searchByName('上海')
   * // [{ code: 'CNSHA', name: 'Shanghai', nameCN: '上海', ... }]
   */
  searchByName(keyword: string): Port[]
  
  /**
   * 统一搜索入口
   * 
   * 根据输入格式自动判断查询模式：
   * - 5位纯字母 → 精确查询 (按港口代码)
   * - 其他 → 模糊查询 (按港口名称)
   * 
   * @param query 查询字符串
   * @returns SearchResult 查询结果
   * 
   * @example
   * // 精确查询
   * service.search('CNSHA')
   * // { ports: [...], total: 1, mode: 'exact', query: 'CNSHA' }
   * 
   * // 模糊查询
   * service.search('上海')
   * // { ports: [...], total: 2, mode: 'fuzzy', query: '上海' }
   */
  search(query: string): SearchResult
}

/**
 * 分页服务接口
 * 
 * 提供前端分页功能。
 */
export interface IPaginationService<T> {
  /**
   * 对数据进行分页
   * 
   * @param items 原始数据列表
   * @param page 页码 (从 1 开始)
   * @param pageSize 每页条数 (默认 10)
   * @returns PaginatedResult<T> 分页结果
   */
  paginate(items: T[], page: number, pageSize?: number): PaginatedResult<T>
}

// ============================================================================
// 工具函数接口
// ============================================================================

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
