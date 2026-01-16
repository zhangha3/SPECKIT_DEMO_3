<script setup lang="ts">
/**
 * 资金账户页面
 * 
 * 功能分支: 004-fund-stats-enhancement
 * 任务: T022, T027, T030
 * 
 * 显示用户资金账户信息、操作按钮和交易记录
 */

import { ref, onMounted } from 'vue'
import FundAccountCard from '@/components/FundAccountCard.vue'
import FundDepositDialog from '@/components/FundDepositDialog.vue'
import FundWithdrawDialog from '@/components/FundWithdrawDialog.vue'
import { useFund } from '@/composables/useFund'
import type { FundTransaction } from '@/types/fund'

// ============================================================================
// Props
// ============================================================================

interface Props {
  /** 当前用户名 */
  username: string
}

const props = defineProps<Props>()

// ============================================================================
// 组合式函数
// ============================================================================

const { loadBalance, getTransactions, balance } = useFund()

// ============================================================================
// 状态
// ============================================================================

/** 交易记录列表 */
const transactions = ref<FundTransaction[]>([])

/** 当前页码 */
const currentPage = ref(1)

/** 总页数 */
const totalPages = ref(0)

/** 每页数量 */
const pageSize = 10

/** 充值弹窗显示状态 */
const showDepositDialog = ref(false)

/** 提现弹窗显示状态 */
const showWithdrawDialog = ref(false)

/** FundAccountCard 引用 */
const fundCardRef = ref<InstanceType<typeof FundAccountCard> | null>(null)

/** 交易类型筛选 */
const filterType = ref<string>('')

/** 时间范围筛选 */
const filterTimeRange = ref<string>('')

// ============================================================================
// 计算属性
// ============================================================================

/**
 * 获取交易类型显示文本
 */
function getTransactionTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    deposit: '充值',
    withdraw: '提现',
    purchase: '购买'
  }
  return typeMap[type] || type
}

/**
 * 获取交易类型样式类
 */
function getTransactionTypeClass(type: string): string {
  const classMap: Record<string, string> = {
    deposit: 'type-deposit',
    withdraw: 'type-withdraw',
    purchase: 'type-purchase'
  }
  return classMap[type] || ''
}

/**
 * 格式化日期时间
 */
function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * 格式化金额
 */
function formatAmount(amount: number, type: string): string {
  const prefix = type === 'deposit' ? '+' : '-'
  return `${prefix}¥${amount.toFixed(2)}`
}

/**
 * 获取时间范围的开始日期
 */
function getTimeRangeStartDate(range: string): string | undefined {
  if (!range) return undefined
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  switch (range) {
    case 'today':
      return today.toISOString().split('T')[0]
    case 'week': {
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      return weekAgo.toISOString().split('T')[0]
    }
    case 'month': {
      const monthAgo = new Date(today)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return monthAgo.toISOString().split('T')[0]
    }
    default:
      return undefined
  }
}

// ============================================================================
// 方法
// ============================================================================

/**
 * 加载交易记录
 */
function loadTransactions(): void {
  const filters: {
    type?: 'deposit' | 'withdraw' | 'purchase'
    startDate?: string
  } = {}
  
  if (filterType.value) {
    filters.type = filterType.value as 'deposit' | 'withdraw' | 'purchase'
  }
  
  const startDate = getTimeRangeStartDate(filterTimeRange.value)
  if (startDate) {
    filters.startDate = startDate
  }
  
  const result = getTransactions(currentPage.value, pageSize, filters)
  transactions.value = result.transactions
  totalPages.value = result.totalPages
}

/**
 * 处理筛选变化
 */
function handleFilterChange(): void {
  currentPage.value = 1
  loadTransactions()
}

/**
 * 上一页
 */
function prevPage(): void {
  if (currentPage.value > 1) {
    currentPage.value--
    loadTransactions()
  }
}

/**
 * 下一页
 */
function nextPage(): void {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    loadTransactions()
  }
}

/**
 * 打开充值弹窗
 */
function openDepositDialog(): void {
  showDepositDialog.value = true
}

/**
 * 打开提现弹窗
 */
function openWithdrawDialog(): void {
  showWithdrawDialog.value = true
}

/**
 * 处理充值成功
 */
function handleDepositSuccess(_amount: number): void {
  refreshData()
}

/**
 * 处理提现成功
 */
function handleWithdrawSuccess(_amount: number): void {
  refreshData()
}

/**
 * 刷新数据
 */
function refreshData(): void {
  fundCardRef.value?.refreshBalance()
  loadTransactions()
}

// ============================================================================
// 生命周期
// ============================================================================

onMounted(() => {
  loadBalance(props.username)
  loadTransactions()
})
</script>

<template>
  <div class="fund-account-view">
    <div class="view-header">
      <h2 class="view-title">💰 资金账户</h2>
      <p class="view-subtitle">管理您的账户余额和交易记录</p>
    </div>

    <div class="main-content">
      <!-- 左侧：账户卡片 -->
      <div class="account-section">
        <FundAccountCard
          ref="fundCardRef"
          :username="username"
          @deposit="openDepositDialog"
          @withdraw="openWithdrawDialog"
        />
        
        <!-- 快捷操作提示 -->
        <div class="quick-tips">
          <h4>💡 温馨提示</h4>
          <ul>
            <li>充值后即可购买舱位</li>
            <li>提现需验证资金密码</li>
            <li>默认资金密码: fund123</li>
          </ul>
        </div>
      </div>

      <!-- 右侧：交易记录 -->
      <div class="transactions-section">
        <div class="section-header">
          <h3>📋 交易记录</h3>
          <button class="refresh-btn" @click="refreshData">
            🔄 刷新
          </button>
        </div>

        <!-- 筛选条件 -->
        <div class="filter-bar">
          <div class="filter-group">
            <label class="filter-label">交易类型：</label>
            <select 
              v-model="filterType" 
              class="filter-select"
              @change="handleFilterChange"
            >
              <option value="">全部</option>
              <option value="deposit">充值</option>
              <option value="withdraw">提现</option>
              <option value="purchase">购买</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">时间范围：</label>
            <select 
              v-model="filterTimeRange" 
              class="filter-select"
              @change="handleFilterChange"
            >
              <option value="">全部</option>
              <option value="today">今天</option>
              <option value="week">最近一周</option>
              <option value="month">最近一月</option>
            </select>
          </div>
        </div>

        <div v-if="transactions.length === 0" class="empty-state">
          <p>暂无交易记录</p>
          <p class="empty-hint">充值后开始您的第一笔交易吧</p>
        </div>

        <div v-else class="transactions-list">
          <div 
            v-for="tx in transactions" 
            :key="tx.id" 
            class="transaction-item"
          >
            <div class="tx-left">
              <span class="tx-type" :class="getTransactionTypeClass(tx.type)">
                {{ getTransactionTypeText(tx.type) }}
              </span>
              <span class="tx-desc">{{ tx.description }}</span>
            </div>
            <div class="tx-right">
              <span class="tx-amount" :class="getTransactionTypeClass(tx.type)">
                {{ formatAmount(tx.amount, tx.type) }}
              </span>
              <span class="tx-time">{{ formatDateTime(tx.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            class="page-btn" 
            :disabled="currentPage <= 1"
            @click="prevPage"
          >
            ← 上一页
          </button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button 
            class="page-btn" 
            :disabled="currentPage >= totalPages"
            @click="nextPage"
          >
            下一页 →
          </button>
        </div>
      </div>
    </div>
    
    <!-- 充值弹窗 -->
    <FundDepositDialog
      :visible="showDepositDialog"
      @close="showDepositDialog = false"
      @success="handleDepositSuccess"
    />
    
    <!-- 提现弹窗 -->
    <FundWithdrawDialog
      :visible="showWithdrawDialog"
      :current-balance="balance"
      @close="showWithdrawDialog = false"
      @success="handleWithdrawSuccess"
    />
  </div>
</template>

<style scoped>
.fund-account-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.view-header {
  margin-bottom: 30px;
}

.view-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0 0 8px 0;
}

.view-subtitle {
  color: #666;
  margin: 0;
}

.main-content {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 30px;
}

@media (max-width: 900px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

.account-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.quick-tips {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
}

.quick-tips h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #666;
}

.quick-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #888;
  font-size: 13px;
  line-height: 1.8;
}

.transactions-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.refresh-btn {
  padding: 8px 16px;
  background: #f5f5f5;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.refresh-btn:hover {
  background: #e8e8e8;
}

.filter-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  min-width: 120px;
  outline: none;
  transition: border-color 0.2s;
}

.filter-select:hover {
  border-color: #bbb;
}

.filter-select:focus {
  border-color: #1a73e8;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-hint {
  font-size: 13px;
  margin-top: 8px;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 10px;
  transition: background 0.2s;
}

.transaction-item:hover {
  background: #f0f0f0;
}

.tx-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tx-type {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.type-deposit {
  background: #d4edda;
  color: #155724;
}

.type-withdraw {
  background: #f8d7da;
  color: #721c24;
}

.type-purchase {
  background: #cce5ff;
  color: #004085;
}

.tx-desc {
  font-size: 14px;
  color: #333;
}

.tx-right {
  text-align: right;
}

.tx-amount {
  display: block;
  font-size: 16px;
  font-weight: 600;
}

.tx-amount.type-deposit {
  color: #28a745;
}

.tx-amount.type-withdraw,
.tx-amount.type-purchase {
  color: #dc3545;
}

.tx-time {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.page-btn {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #5a6fd6;
}

.page-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}
</style>
