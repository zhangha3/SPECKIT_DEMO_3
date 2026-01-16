/**
 * 资金账户组合式函数
 * 
 * 功能分支: 004-fund-stats-enhancement
 * 任务: T020
 * 
 * 提供资金账户的状态管理和操作功能
 */

import { ref, computed, readonly } from 'vue'
import {
  getBalance,
  deposit as depositService,
  withdraw as withdrawService,
  getTransactionHistory,
  type FundOperationResult
} from '@/services/fundService'
import type { PaginatedTransactionResult, FundTransactionQuery, FundTransactionType } from '@/types/fund'

// ============================================================================
// 状态
// ============================================================================

/** 当前用户余额 */
const balance = ref<number>(0)

/** 是否正在加载 */
const isLoading = ref<boolean>(false)

/** 当前用户名 */
const currentUsername = ref<string>('')

// ============================================================================
// 计算属性
// ============================================================================

/**
 * 格式化余额（带货币符号）
 */
const balanceFormatted = computed(() => {
  return `¥${balance.value.toFixed(2)} CNY`
})

// ============================================================================
// 方法
// ============================================================================

/**
 * 加载用户余额
 * @param username 用户名
 */
function loadBalance(username: string): void {
  currentUsername.value = username
  balance.value = getBalance(username)
}

/**
 * 刷新余额
 */
function refreshBalance(): void {
  if (currentUsername.value) {
    balance.value = getBalance(currentUsername.value)
  }
}

/**
 * 充值
 * @param amount 金额
 * @param fundPassword 资金密码
 * @returns 操作结果
 */
function deposit(amount: number, fundPassword: string): FundOperationResult {
  if (!currentUsername.value) {
    return { success: false, error: '用户未登录' }
  }
  
  isLoading.value = true
  try {
    const result = depositService(currentUsername.value, amount, fundPassword)
    if (result.success && result.newBalance !== undefined) {
      balance.value = result.newBalance
    }
    return result
  } finally {
    isLoading.value = false
  }
}

/**
 * 提现
 * @param amount 金额
 * @param fundPassword 资金密码
 * @returns 操作结果
 */
function withdraw(amount: number, fundPassword: string): FundOperationResult {
  if (!currentUsername.value) {
    return { success: false, error: '用户未登录' }
  }
  
  isLoading.value = true
  try {
    const result = withdrawService(currentUsername.value, amount, fundPassword)
    if (result.success && result.newBalance !== undefined) {
      balance.value = result.newBalance
    }
    return result
  } finally {
    isLoading.value = false
  }
}

/**
 * 交易记录筛选条件
 */
export interface TransactionFilterOptions {
  /** 交易类型筛选 */
  type?: FundTransactionType
  /** 时间范围 - 开始 */
  startDate?: string
  /** 时间范围 - 结束 */
  endDate?: string
}

/**
 * 获取交易记录
 * @param page 页码
 * @param pageSize 每页数量
 * @param filters 可选的筛选条件
 * @returns 分页结果
 */
function getTransactions(
  page: number = 1, 
  pageSize: number = 10,
  filters?: TransactionFilterOptions
): PaginatedTransactionResult {
  if (!currentUsername.value) {
    return {
      transactions: [],
      total: 0,
      page: 1,
      pageSize,
      totalPages: 0
    }
  }
  
  const query: FundTransactionQuery = {
    userId: currentUsername.value,
    type: filters?.type,
    startDate: filters?.startDate,
    endDate: filters?.endDate
  }
  
  return getTransactionHistory(query, page, pageSize)
}

// ============================================================================
// 导出
// ============================================================================

/**
 * 使用资金账户
 */
export function useFund() {
  return {
    /** 余额 */
    balance: readonly(balance),
    
    /** 格式化余额 */
    balanceFormatted,
    
    /** 是否正在加载 */
    isLoading: readonly(isLoading),
    
    /** 当前用户名 */
    currentUsername: readonly(currentUsername),
    
    /** 加载余额 */
    loadBalance,
    
    /** 刷新余额 */
    refreshBalance,
    
    /** 充值 */
    deposit,
    
    /** 提现 */
    withdraw,
    
    /** 获取交易记录 */
    getTransactions
  }
}
