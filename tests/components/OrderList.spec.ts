/**
 * OrderList 组件测试
 * 
 * 功能分支: 003-user-booking-order
 * 测试范围: FR-022, FR-023, FR-024
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderList from '@/components/OrderList.vue'
import type { Order } from '@/services/orderService'

// 测试数据
const mockOrders: Order[] = [
  {
    id: 'ORD-20251209-001',
    userId: 'zhangsan',
    scheduleId: 'SCH-001',
    departurePort: { code: 'CNSHA', name: '上海港', country: '中国', timezone: 'Asia/Shanghai' },
    arrivalPort: { code: 'USLAX', name: '洛杉矶港', country: '美国', timezone: 'America/Los_Angeles' },
    etd: '2025-01-15',
    eta: '2025-02-01',
    carrier: 'COSCO',
    vesselName: '中远海运星',
    createdAt: '2025-12-09T10:30:00Z',
    status: 'confirmed'
  },
  {
    id: 'ORD-20251209-002',
    userId: 'zhangsan',
    scheduleId: 'SCH-002',
    departurePort: { code: 'CNSHA', name: '上海港', country: '中国', timezone: 'Asia/Shanghai' },
    arrivalPort: { code: 'JPYOK', name: '横滨港', country: '日本', timezone: 'Asia/Tokyo' },
    etd: '2025-01-20',
    eta: '2025-01-25',
    carrier: 'NYK',
    vesselName: '日本邮船号',
    createdAt: '2025-12-09T14:00:00Z',
    status: 'pending'
  }
]

describe('OrderList', () => {
  describe('渲染', () => {
    it('应该正确渲染订单列表', () => {
      const wrapper = mount(OrderList, {
        props: { orders: mockOrders }
      })
      
      expect(wrapper.find('.order-list').exists()).toBe(true)
      expect(wrapper.findAll('.order-card')).toHaveLength(2)
    })
    
    it('应该显示订单号', () => {
      const wrapper = mount(OrderList, {
        props: { orders: mockOrders }
      })
      
      expect(wrapper.text()).toContain('ORD-20251209-001')
      expect(wrapper.text()).toContain('ORD-20251209-002')
    })
    
    it('应该显示航线信息', () => {
      const wrapper = mount(OrderList, {
        props: { orders: mockOrders }
      })
      
      expect(wrapper.text()).toContain('CNSHA')
      expect(wrapper.text()).toContain('上海港')
      expect(wrapper.text()).toContain('USLAX')
      expect(wrapper.text()).toContain('洛杉矶港')
    })
    
    it('应该显示船公司和船名', () => {
      const wrapper = mount(OrderList, {
        props: { orders: mockOrders }
      })
      
      expect(wrapper.text()).toContain('COSCO')
      expect(wrapper.text()).toContain('中远海运星')
    })
    
    it('应该显示ETD和ETA', () => {
      const wrapper = mount(OrderList, {
        props: { orders: mockOrders }
      })
      
      // 检查日期显示（格式可能因 locale 略有不同）
      expect(wrapper.text()).toContain('ETD')
      expect(wrapper.text()).toContain('ETA')
    })
  })
  
  describe('订单状态显示 (FR-023)', () => {
    it('应该显示已确认状态', () => {
      const wrapper = mount(OrderList, {
        props: { orders: [mockOrders[0]] }
      })
      
      expect(wrapper.text()).toContain('已确认')
      expect(wrapper.find('.status-confirmed').exists()).toBe(true)
    })
    
    it('应该显示待确认状态', () => {
      const wrapper = mount(OrderList, {
        props: { orders: [mockOrders[1]] }
      })
      
      expect(wrapper.text()).toContain('待确认')
      expect(wrapper.find('.status-pending').exists()).toBe(true)
    })
    
    it('应该显示已取消状态', () => {
      const cancelledOrder: Order = { ...mockOrders[0], status: 'cancelled' }
      const wrapper = mount(OrderList, {
        props: { orders: [cancelledOrder] }
      })
      
      expect(wrapper.text()).toContain('已取消')
      expect(wrapper.find('.status-cancelled').exists()).toBe(true)
    })
    
    it('应该显示已完成状态', () => {
      const completedOrder: Order = { ...mockOrders[0], status: 'completed' }
      const wrapper = mount(OrderList, {
        props: { orders: [completedOrder] }
      })
      
      expect(wrapper.text()).toContain('已完成')
      expect(wrapper.find('.status-completed').exists()).toBe(true)
    })
  })
  
  describe('空状态', () => {
    it('订单为空时应该显示空状态', () => {
      const wrapper = mount(OrderList, {
        props: { orders: [] }
      })
      
      expect(wrapper.find('.empty-state').exists()).toBe(true)
      expect(wrapper.text()).toContain('暂无订单')
    })
    
    it('空状态应该有引导文案', () => {
      const wrapper = mount(OrderList, {
        props: { orders: [] }
      })
      
      expect(wrapper.text()).toContain('船期查询')
    })
    
    it('showEmpty=false 时不显示空状态', () => {
      const wrapper = mount(OrderList, {
        props: { orders: [], showEmpty: false }
      })
      
      expect(wrapper.find('.empty-state').exists()).toBe(false)
    })
  })
  
  describe('加载状态', () => {
    it('加载时应该显示加载状态', () => {
      const wrapper = mount(OrderList, {
        props: { orders: [], loading: true }
      })
      
      expect(wrapper.find('.loading-state').exists()).toBe(true)
      expect(wrapper.text()).toContain('正在加载')
    })
    
    it('加载时应该显示 spinner', () => {
      const wrapper = mount(OrderList, {
        props: { orders: [], loading: true }
      })
      
      expect(wrapper.find('.spinner').exists()).toBe(true)
    })
    
    it('加载时不应该显示空状态', () => {
      const wrapper = mount(OrderList, {
        props: { orders: [], loading: true }
      })
      
      expect(wrapper.find('.empty-state').exists()).toBe(false)
    })
  })
  
  describe('交互', () => {
    it('点击订单卡片应该触发 select 事件', async () => {
      const wrapper = mount(OrderList, {
        props: { orders: mockOrders }
      })
      
      await wrapper.find('.order-card').trigger('click')
      
      expect(wrapper.emitted('select')).toBeTruthy()
      expect(wrapper.emitted('select')![0]).toEqual([mockOrders[0]])
    })
    
    it('按 Enter 键应该触发 select 事件', async () => {
      const wrapper = mount(OrderList, {
        props: { orders: mockOrders }
      })
      
      await wrapper.find('.order-card').trigger('keydown', { key: 'Enter' })
      
      expect(wrapper.emitted('select')).toBeTruthy()
    })
  })
  
  describe('无障碍性', () => {
    it('订单卡片应该有 role=button', () => {
      const wrapper = mount(OrderList, {
        props: { orders: mockOrders }
      })
      
      expect(wrapper.find('.order-card').attributes('role')).toBe('button')
    })
    
    it('订单卡片应该可聚焦', () => {
      const wrapper = mount(OrderList, {
        props: { orders: mockOrders }
      })
      
      expect(wrapper.find('.order-card').attributes('tabindex')).toBe('0')
    })
  })
  
  describe('日期格式化', () => {
    it('应该显示下单时间', () => {
      const wrapper = mount(OrderList, {
        props: { orders: mockOrders }
      })
      
      expect(wrapper.text()).toContain('下单时间')
    })
  })
})
