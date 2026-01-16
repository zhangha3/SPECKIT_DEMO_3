/**
 * FundAccountCard 组件测试
 * 
 * 功能分支: 004-fund-stats-enhancement
 * 任务: T019
 */

import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import FundAccountCard from '@/components/FundAccountCard.vue'

// Mock useFund
vi.mock('@/composables/useFund', () => ({
  useFund: () => ({
    balance: ref(1234.56),
    balanceFormatted: ref('¥1234.56 CNY'),
    isLoading: ref(false),
    loadBalance: vi.fn()
  })
}))

describe('FundAccountCard', () => {
  it('应正确渲染余额', () => {
    const wrapper = mount(FundAccountCard, {
      props: {
        username: 'testuser'
      }
    })
    
    expect(wrapper.text()).toContain('¥')
    expect(wrapper.text()).toContain('CNY')
  })

  it('应显示账户余额标题', () => {
    const wrapper = mount(FundAccountCard, {
      props: {
        username: 'testuser'
      }
    })
    
    expect(wrapper.text()).toContain('账户余额')
  })

  it('应有充值和提现按钮', () => {
    const wrapper = mount(FundAccountCard, {
      props: {
        username: 'testuser'
      }
    })
    
    const buttons = wrapper.findAll('button')
    const buttonTexts = buttons.map(b => b.text())
    
    expect(buttonTexts.some(t => t.includes('充值'))).toBe(true)
    expect(buttonTexts.some(t => t.includes('提现'))).toBe(true)
  })

  it('应触发充值事件', async () => {
    const wrapper = mount(FundAccountCard, {
      props: {
        username: 'testuser'
      }
    })
    
    const depositButton = wrapper.findAll('button').find(b => b.text().includes('充值'))
    await depositButton?.trigger('click')
    
    expect(wrapper.emitted('deposit')).toBeTruthy()
  })

  it('应触发提现事件', async () => {
    const wrapper = mount(FundAccountCard, {
      props: {
        username: 'testuser'
      }
    })
    
    const withdrawButton = wrapper.findAll('button').find(b => b.text().includes('提现'))
    await withdrawButton?.trigger('click')
    
    expect(wrapper.emitted('withdraw')).toBeTruthy()
  })
})
