/**
 * 资金服务契约
 * 功能分支: 004-fund-stats-enhancement
 * 
 * 提供用户资金账户的管理功能，包括：
 * - 余额查询
 * - 充值
 * - 退款
 * - 验证资金密码
 */

import type { User } from '@/types/user'
import type { FundTransaction, FundTransactionQuery, PaginatedTransactionResult } from '@/types/fund'

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

/**
 * 资金服务接口
 */
export interface IFundService {
  /**
   * 获取用户当前余额
   * @param username 用户名
   * @returns 余额（CNY）
   */
  getBalance(username: string): number
  
  /**
   * 验证资金密码
   * @param username 用户名
   * @param password 资金密码
   * @returns 验证结果
   */
  validateFundPassword(username: string, password: string): FundPasswordValidation
  
  /**
   * 充值
   * @param username 用户名
   * @param amount 金额（CNY，必须 > 0）
   * @param fundPassword 资金密码
   * @returns 操作结果
   * 
   * 业务规则:
   * - 金额必须大于0
   * - 资金密码必须正确
   * - 无金额上限
   */
  deposit(username: string, amount: number, fundPassword: string): FundOperationResult
  
  /**
   * 退款
   * @param username 用户名
   * @param amount 金额（CNY，必须 > 0）
   * @param fundPassword 资金密码
   * @returns 操作结果
   * 
   * 业务规则:
   * - 金额必须大于0
   * - 资金密码必须正确
   * - 余额必须充足
   */
  withdraw(username: string, amount: number, fundPassword: string): FundOperationResult
  
  /**
   * 消费（购买舱位时扣款）
   * @param username 用户名
   * @param amount 金额（CNY）
   * @param orderId 关联订单号
   * @param description 描述（如 "购买 上海-鹿特丹 航线"）
   * @returns 操作结果
   * 
   * 业务规则:
   * - 不验证资金密码（已在购买前验证余额）
   * - 余额必须充足
   * - 自动记录关联订单
   */
  purchase(username: string, amount: number, orderId: string, description: string): FundOperationResult
  
  /**
   * 检查余额是否充足
   * @param username 用户名
   * @param amount 需要的金额
   * @returns 是否充足
   */
  hasSufficientBalance(username: string, amount: number): boolean
  
  /**
   * 获取用户资金操作日志
   * @param query 查询条件
   * @param page 页码（从1开始）
   * @param pageSize 每页数量（默认10）
   * @returns 分页结果
   */
  getTransactionHistory(
    query: FundTransactionQuery,
    page?: number,
    pageSize?: number
  ): PaginatedTransactionResult
}

/**
 * 资金服务错误码
 */
export const FundErrorCodes = {
  INVALID_AMOUNT: '金额必须大于0',
  INVALID_PASSWORD: '资金密码错误',
  INSUFFICIENT_BALANCE: '余额不足',
  USER_NOT_FOUND: '用户不存在'
} as const
