/**
 * 资金账户服务
 * 
 * 功能分支: 004-fund-stats-enhancement
 * 来源: contracts/fund-service.ts
 * 
 * 提供用户资金账户管理功能：余额查询、充值、提现、消费扣款
 */

import type { 
  FundTransaction, 
  FundTransactionType, 
  FundTransactionQuery, 
  PaginatedTransactionResult 
} from '@/types/fund'
import { getUserByUsername, updateUserBalance, getUserBalance as getUserBalanceFromService } from '@/services/userService'

// ============================================================================
// 常量
// ============================================================================

/** localStorage 存储键 */
const TRANSACTIONS_STORAGE_KEY = 'fundTransactions'

/** 资金服务错误码 */
export const FundErrorCodes = {
  INVALID_AMOUNT: '金额必须大于0',
  INVALID_PASSWORD: '资金密码错误',
  INSUFFICIENT_BALANCE: '余额不足',
  USER_NOT_FOUND: '用户不存在'
} as const

// ============================================================================
// 类型定义
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
// 私有函数
// ============================================================================

/**
 * 从 localStorage 获取所有交易记录
 */
function loadTransactions(): FundTransaction[] {
  const stored = localStorage.getItem(TRANSACTIONS_STORAGE_KEY)
  if (!stored) {
    return []
  }
  try {
    return JSON.parse(stored) as FundTransaction[]
  } catch {
    return []
  }
}

/**
 * 保存交易记录到 localStorage
 */
function saveTransactions(transactions: FundTransaction[]): void {
  localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions))
}

/**
 * 生成交易ID
 * 格式: TXN-YYYYMMDD-XXX
 */
function generateTransactionId(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const transactions = loadTransactions()
  
  // 获取今天的交易数量
  const todayPrefix = `TXN-${dateStr}-`
  const todayTransactions = transactions.filter(t => t.id.startsWith(todayPrefix))
  const sequence = (todayTransactions.length + 1).toString().padStart(3, '0')
  
  return `${todayPrefix}${sequence}`
}

/**
 * 创建交易记录
 */
function createTransaction(
  userId: string,
  type: FundTransactionType,
  amount: number,
  balanceBefore: number,
  balanceAfter: number,
  description: string,
  relatedOrderId?: string
): FundTransaction {
  return {
    id: generateTransactionId(),
    userId,
    type,
    amount,
    balanceBefore,
    balanceAfter,
    description,
    relatedOrderId,
    createdAt: new Date().toISOString()
  }
}

/**
 * 添加交易记录
 */
function addTransaction(transaction: FundTransaction): void {
  const transactions = loadTransactions()
  transactions.push(transaction)
  saveTransactions(transactions)
}

// ============================================================================
// 公开服务函数
// ============================================================================

/**
 * 获取用户当前余额
 * @param username 用户名
 * @returns 余额（CNY），用户不存在返回 0
 */
export function getBalance(username: string): number {
  return getUserBalanceFromService(username)
}

/**
 * 验证资金密码
 * @param username 用户名
 * @param password 资金密码
 * @returns 验证结果
 */
export function validateFundPassword(username: string, password: string): FundPasswordValidation {
  const user = getUserByUsername(username)
  
  if (!user) {
    return { valid: false, error: FundErrorCodes.USER_NOT_FOUND }
  }
  
  if (user.fundPassword !== password) {
    return { valid: false, error: FundErrorCodes.INVALID_PASSWORD }
  }
  
  return { valid: true }
}

/**
 * 检查余额是否充足
 * @param username 用户名
 * @param amount 需要的金额
 * @returns 是否充足
 */
export function hasSufficientBalance(username: string, amount: number): boolean {
  const balance = getBalance(username)
  return balance >= amount
}

/**
 * 充值
 * @param username 用户名
 * @param amount 金额（CNY，必须 > 0）
 * @param fundPassword 资金密码
 * @returns 操作结果
 */
export function deposit(username: string, amount: number, fundPassword: string): FundOperationResult {
  // 验证金额
  if (amount <= 0) {
    return { success: false, error: FundErrorCodes.INVALID_AMOUNT }
  }
  
  // 验证用户
  const user = getUserByUsername(username)
  if (!user) {
    return { success: false, error: FundErrorCodes.USER_NOT_FOUND }
  }
  
  // 验证密码
  const passwordValidation = validateFundPassword(username, fundPassword)
  if (!passwordValidation.valid) {
    return { success: false, error: passwordValidation.error }
  }
  
  // 执行充值
  const balanceBefore = getBalance(username)
  const balanceAfter = balanceBefore + amount
  
  // 更新用户余额
  updateUserBalance(username, balanceAfter)
  
  // 创建交易记录
  const transaction = createTransaction(
    username,
    'deposit',
    amount,
    balanceBefore,
    balanceAfter,
    `账户充值 ¥${amount.toFixed(2)}`
  )
  addTransaction(transaction)
  
  return {
    success: true,
    newBalance: balanceAfter,
    transaction
  }
}

/**
 * 提现
 * @param username 用户名
 * @param amount 金额（CNY，必须 > 0）
 * @param fundPassword 资金密码
 * @returns 操作结果
 */
export function withdraw(username: string, amount: number, fundPassword: string): FundOperationResult {
  // 验证金额
  if (amount <= 0) {
    return { success: false, error: FundErrorCodes.INVALID_AMOUNT }
  }
  
  // 验证用户
  const user = getUserByUsername(username)
  if (!user) {
    return { success: false, error: FundErrorCodes.USER_NOT_FOUND }
  }
  
  // 验证密码
  const passwordValidation = validateFundPassword(username, fundPassword)
  if (!passwordValidation.valid) {
    return { success: false, error: passwordValidation.error }
  }
  
  // 检查余额
  const currentBalance = getBalance(username)
  if (currentBalance < amount) {
    return { success: false, error: FundErrorCodes.INSUFFICIENT_BALANCE }
  }
  
  // 执行提现
  const balanceBefore = currentBalance
  const balanceAfter = balanceBefore - amount
  
  // 更新用户余额
  updateUserBalance(username, balanceAfter)
  
  // 创建交易记录
  const transaction = createTransaction(
    username,
    'withdraw',
    amount,
    balanceBefore,
    balanceAfter,
    `账户提现 ¥${amount.toFixed(2)}`
  )
  addTransaction(transaction)
  
  return {
    success: true,
    newBalance: balanceAfter,
    transaction
  }
}

/**
 * 消费（购买舱位时扣款）
 * @param username 用户名
 * @param amount 金额（CNY）
 * @param orderId 关联订单号
 * @param description 描述
 * @returns 操作结果
 */
export function purchase(
  username: string, 
  amount: number, 
  orderId: string, 
  description: string
): FundOperationResult {
  // 验证金额
  if (amount <= 0) {
    return { success: false, error: FundErrorCodes.INVALID_AMOUNT }
  }
  
  // 验证用户
  const user = getUserByUsername(username)
  if (!user) {
    return { success: false, error: FundErrorCodes.USER_NOT_FOUND }
  }
  
  // 检查余额
  const currentBalance = getBalance(username)
  if (currentBalance < amount) {
    return { success: false, error: FundErrorCodes.INSUFFICIENT_BALANCE }
  }
  
  // 执行扣款
  const balanceBefore = currentBalance
  const balanceAfter = balanceBefore - amount
  
  // 更新用户余额
  updateUserBalance(username, balanceAfter)
  
  // 创建交易记录
  const transaction = createTransaction(
    username,
    'purchase',
    amount,
    balanceBefore,
    balanceAfter,
    description,
    orderId
  )
  addTransaction(transaction)
  
  return {
    success: true,
    newBalance: balanceAfter,
    transaction
  }
}

/**
 * 获取用户资金操作日志
 * @param query 查询条件
 * @param page 页码（从1开始，默认1）
 * @param pageSize 每页数量（默认10）
 * @returns 分页结果
 */
export function getTransactionHistory(
  query: FundTransactionQuery,
  page: number = 1,
  pageSize: number = 10
): PaginatedTransactionResult {
  let transactions = loadTransactions()
  
  // 过滤条件
  if (query.userId) {
    transactions = transactions.filter(t => t.userId === query.userId)
  }
  
  if (query.type) {
    transactions = transactions.filter(t => t.type === query.type)
  }
  
  if (query.startDate) {
    // 将 startDate (YYYY-MM-DD) 转换为当天开始的时间戳
    // 使用本地时区的00:00:00作为开始时间
    const [year, month, day] = query.startDate.split('-').map(Number)
    const startDate = new Date(year, month - 1, day, 0, 0, 0, 0)
    transactions = transactions.filter(t => {
      const txDate = new Date(t.createdAt)
      return txDate >= startDate
    })
  }
  
  if (query.endDate) {
    // 结束日期需要包含整天（本地时区的23:59:59）
    const [year, month, day] = query.endDate.split('-').map(Number)
    const endDate = new Date(year, month - 1, day, 23, 59, 59, 999)
    transactions = transactions.filter(t => {
      const txDate = new Date(t.createdAt)
      return txDate <= endDate
    })
  }
  
  // 按时间倒序排列
  transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  // 分页
  const total = transactions.length
  const totalPages = Math.ceil(total / pageSize)
  const startIndex = (page - 1) * pageSize
  const paginatedTransactions = transactions.slice(startIndex, startIndex + pageSize)
  
  return {
    transactions: paginatedTransactions,
    total,
    page,
    pageSize,
    totalPages
  }
}

/**
 * 获取用户所有交易记录（不分页）
 * @param username 用户名
 * @returns 交易记录列表（按时间倒序）
 */
export function getAllTransactionsByUser(username: string): FundTransaction[] {
  const transactions = loadTransactions()
  return transactions
    .filter(t => t.userId === username)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
