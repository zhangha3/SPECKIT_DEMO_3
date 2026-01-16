<script setup lang="ts">
/**
 * 应用根组件
 * 
 * 功能分支: 001-port-query, 002-shipping-schedule, 003-user-booking-order, 004-fund-stats-enhancement
 * 使用动态组件实现页面切换（无 vue-router）
 * 新增: 登录状态管理和认证守卫
 * 新增: 资金账户和统计分析页面 (004-fund-stats-enhancement)
 */
import { ref, shallowRef, markRaw, onMounted, computed } from 'vue'
import PortQueryView from './views/PortQueryView.vue'
import ScheduleQueryView from './views/ScheduleQueryView.vue'
import OrderQueryView from './views/OrderQueryView.vue'
import LoginView from './views/LoginView.vue'
import UserHeader from './components/UserHeader.vue'
import FundAccountView from './views/FundAccountView.vue'
import StatisticsView from './views/StatisticsView.vue'
import ToastNotification from './components/ToastNotification.vue'
import { useAuth } from '@/composables/useAuth'

// 认证状态
const { isLoggedIn, restoreSession, currentUser } = useAuth()

// 页面配置
const pages = [
  { key: 'port', label: '港口查询', component: markRaw(PortQueryView) },
  { key: 'schedule', label: '船期查询', component: markRaw(ScheduleQueryView) },
  { key: 'order', label: '我的订单', component: markRaw(OrderQueryView) },
  { key: 'fund', label: '资金账户', component: markRaw(FundAccountView) },
  { key: 'stats', label: '统计分析', component: markRaw(StatisticsView) }
]

// 当前页面（登录成功后默认跳转到船期查询页面 FR-026）
const currentPageKey = ref('schedule')

// 当前组件
const currentComponent = shallowRef(pages[1].component)

// 获取当前用户名
const currentUsername = computed(() => currentUser.value?.username || '')

function switchPage(key: string) {
  const page = pages.find(p => p.key === key)
  if (page) {
    currentPageKey.value = key
    currentComponent.value = page.component
  }
}

/**
 * 处理登录成功
 * FR-026: 登录成功后，系统必须默认跳转到船期查询页面
 */
function handleLoginSuccess(_username: string) {
  currentPageKey.value = 'schedule'
  currentComponent.value = pages[1].component
}

// 应用启动时恢复会话
onMounted(() => {
  restoreSession()
})
</script>

<template>
  <div id="app">
    <!-- 未登录时显示登录页面 (FR-005) -->
    <LoginView 
      v-if="!isLoggedIn" 
      @login-success="handleLoginSuccess" 
    />
    
    <!-- 已登录时显示主应用界面 -->
    <template v-else>
      <!-- 导航栏 -->
      <nav class="main-nav">
        <div class="nav-brand">航运信息平台</div>
        <ul class="nav-links">
          <li 
            v-for="page in pages" 
            :key="page.key"
            :class="{ active: currentPageKey === page.key }"
          >
            <button @click="switchPage(page.key)">{{ page.label }}</button>
          </li>
        </ul>
        <!-- 用户信息和登出按钮 (FR-003, FR-004) -->
        <UserHeader />
      </nav>

      <!-- 页面内容 -->
      <main class="main-container">
        <component 
          :is="currentComponent" 
          :key="currentPageKey" 
          :username="currentUsername"
          @navigate-to="switchPage"
        />
      </main>
      
      <!-- Toast 通知 -->
      <ToastNotification />
    </template>
  </div>
</template>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

/* 导航栏样式 */
.main-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
  background-color: #1976d2;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-brand {
  font-size: 20px;
  font-weight: 600;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 8px;
}

.nav-links li button {
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.nav-links li button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-links li.active button {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 500;
}

/* 主容器样式 */
.main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>

