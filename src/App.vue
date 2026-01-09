<script setup lang="ts">
/**
 * 应用根组件
 * 
 * 功能分支: 001-port-query, 002-shipping-schedule
 * 使用动态组件实现页面切换（无 vue-router）
 */
import { ref, shallowRef, markRaw } from 'vue'
import PortQueryView from './views/PortQueryView.vue'
import ScheduleQueryView from './views/ScheduleQueryView.vue'

// 页面配置
const pages = [
  { key: 'port', label: '港口查询', component: markRaw(PortQueryView) },
  { key: 'schedule', label: '船期查询', component: markRaw(ScheduleQueryView) }
]

// 当前页面
const currentPageKey = ref('port')

// 当前组件
const currentComponent = shallowRef(pages[0].component)

function switchPage(key: string) {
  const page = pages.find(p => p.key === key)
  if (page) {
    currentPageKey.value = key
    currentComponent.value = page.component
  }
}
</script>

<template>
  <div id="app">
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
    </nav>

    <!-- 页面内容 -->
    <main class="main-container">
      <component :is="currentComponent" />
    </main>
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

