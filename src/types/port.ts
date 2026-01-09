/**
 * 港口实体类型定义
 * 
 * 功能分支: 001-port-query
 * 来源: data-model.md, contracts/port-service.ts
 */

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
