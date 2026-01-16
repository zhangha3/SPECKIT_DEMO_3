/**
 * 资金相关类型定义
 * 
 * 功能分支: 004-fund-stats-enhancement
 * 来源: data-model.md, contracts/fund-service.ts
 */

// ============================================================================
// 资金操作类型
// ============================================================================

/**
 * 资金操作类型
 * - deposit: 充值
 * - withdraw: 退款
 * - purchase: 消费（购买舱位）
 */
export type FundTransactionType = 'deposit' | 'withdraw' | 'purchase'

/**
 * 资金操作日志实体
 * 记录用户的每一笔资金变动
 */
export interface FundTransaction {
  /** 交易ID（格式: TXN-YYYYMMDD-XXX） */
  id: string
  
  /** 用户名 */
  userId: string
  
  /** 操作类型 */
  type: FundTransactionType
  
  /** 操作金额（正数，单位: CNY） */
  amount: number
  
  /** 操作前余额 */
  balanceBefore: number
  
  /** 操作后余额 */
  balanceAfter: number
  
  /** 操作描述
   * - 充值: "充值"
   * - 退款: "退款"
   * - 消费: "购买 [起始港名]-[目的港名] 航线"
   */
  description: string
  
  /** 关联订单号（仅消费类型） */
  relatedOrderId?: string
  
  /** 创建时间（ISO 8601 格式） */
  createdAt: string
}

// ============================================================================
// 资金查询相关类型
// ============================================================================

/**
 * 资金操作日志查询条件
 */
export interface FundTransactionQuery {
  /** 用户名 */
  userId: string
  
  /** 操作类型筛选（可选） */
  type?: FundTransactionType
  
  /** 时间范围 - 开始（可选，ISO 8601） */
  startDate?: string
  
  /** 时间范围 - 结束（可选，ISO 8601） */
  endDate?: string
}

/**
 * 资金操作日志分页结果
 */
export interface PaginatedTransactionResult {
  /** 交易记录列表 */
  transactions: FundTransaction[]
  
  /** 总记录数 */
  total: number
  
  /** 当前页码（从1开始） */
  page: number
  
  /** 每页数量 */
  pageSize: number
  
  /** 总页数 */
  totalPages: number
}

// ============================================================================
// 资金操作结果类型
// ============================================================================

/**
 * 资金操作结果
 */
export interface FundOperationResult {
  /** 操作是否成功 */
  success: boolean
  
  /** 错误信息（失败时） */
  error?: string
  
  /** 操作后余额（成功时） */
  newBalance?: number
  
  /** 生成的交易记录（成功时） */
  transaction?: FundTransaction
}

/**
 * 资金密码验证结果
 */
export interface FundPasswordValidation {
  /** 验证是否通过 */
  valid: boolean
  
  /** 错误信息（失败时） */
  error?: string
}

// ============================================================================
// 资金错误码
// ============================================================================

/**
 * 资金服务错误码
 */
export const FundErrorCodes = {
  INVALID_AMOUNT: '金额必须大于0',
  AMOUNT_TOO_SMALL: '最小金额为1元',
  AMOUNT_TOO_LARGE: '单笔充值不能超过100,000元',
  INVALID_PASSWORD: '资金密码错误',
  INSUFFICIENT_BALANCE: '余额不足',
  USER_NOT_FOUND: '用户不存在'
} as const

export type FundErrorCode = keyof typeof FundErrorCodes
