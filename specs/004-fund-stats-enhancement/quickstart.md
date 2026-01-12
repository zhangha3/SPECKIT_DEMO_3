# 快速开始指南: 004-fund-stats-enhancement

本文档为开发人员提供快速上手本功能分支开发的指南。

---

## 1. 前置条件

### 1.1 环境要求

| 软件 | 版本要求 | 验证命令 |
|------|---------|---------|
| Node.js | >= 18.x | `node -v` |
| npm | >= 9.x | `npm -v` |
| Git | >= 2.x | `git --version` |

### 1.2 推荐的 IDE 扩展

- Vue - Official（原 Volar）
- TypeScript Vue Plugin
- ESLint
- Vitest Explorer

---

## 2. 环境搭建

### 2.1 切换分支

```bash
git checkout 004-fund-stats-enhancement
```

### 2.2 安装依赖

```bash
# 安装现有依赖
npm install

# 安装新增依赖（图表库）
npm install echarts vue-echarts

# 安装日期处理库
npm install date-fns
```

### 2.3 依赖版本参考

新增依赖列表（需添加到 package.json）:

```json
{
  "dependencies": {
    "echarts": "^5.5.1",
    "vue-echarts": "^7.0.3",
    "date-fns": "^4.1.0"
  }
}
```

---

## 3. 项目结构

### 3.1 现有结构

```
src/
├── assets/data/          # 静态数据（JSON）
├── components/           # Vue 组件
├── composables/          # 组合式函数
├── services/             # 业务服务
├── types/                # TypeScript 类型
└── views/                # 页面视图
```

### 3.2 新增结构

```
src/
├── assets/data/
│   └── users.json          # 更新：增加 balance, fundPassword 字段
│   └── schedules.json      # 更新：增加 price 字段
├── components/
│   ├── FundAccountCard.vue     # 资金账户卡片
│   ├── FundDepositDialog.vue   # 充值弹窗
│   ├── FundWithdrawDialog.vue  # 退款弹窗
│   ├── FundHistoryTable.vue    # 资金日志表格
│   ├── TimeStatChart.vue       # 时间统计图表
│   ├── PortStatChart.vue       # 港口统计图表
│   ├── UserStatChart.vue       # 用户统计图表
│   ├── HotSchedulePanel.vue    # 热门船期面板
│   └── ToastNotification.vue   # Toast 通知组件
├── composables/
│   ├── useFund.ts              # 资金账户组合式函数
│   ├── useStatistics.ts        # 统计分析组合式函数
│   └── useToast.ts             # Toast 通知组合式函数
├── services/
│   ├── fundService.ts          # 资金服务
│   └── statisticsService.ts    # 统计服务
├── types/
│   ├── fund.ts                 # 资金相关类型
│   └── statistics.ts           # 统计相关类型
└── views/
    ├── FundAccountView.vue     # 资金账户页面
    └── StatisticsView.vue      # 统计分析页面
```

---

## 4. 开发流程

### 4.1 启动开发服务器

```bash
npm run dev
```

访问地址: http://localhost:5173

### 4.2 运行测试

```bash
# 运行所有测试
npm run test

# 监听模式（开发时推荐）
npm run test:watch

# 运行特定文件测试
npm run test -- --filter="fundService"
```

### 4.3 类型检查

```bash
npm run type-check
```

---

## 5. 数据初始化

### 5.1 更新静态数据文件

需要修改以下 JSON 文件:

**users.json** - 为每个用户添加:
```json
{
  "balance": 0,
  "fundPassword": "fund123"
}
```

**schedules.json** - 为每个船期添加:
```json
{
  "price": "<transitDays> * 5"
}
```

### 5.2 localStorage 说明

应用使用 localStorage 持久化以下数据:
- `users`: 用户数据（登录后同步）
- `orders`: 订单数据
- `fundTransactions`: 资金操作日志
- `schedules`: 船期数据

**重置数据**: 在浏览器控制台执行
```javascript
localStorage.clear()
location.reload()
```

---

## 6. 关键配置

### 6.1 ECharts 全局注册

在 `main.ts` 中添加:

```typescript
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'

use([
  CanvasRenderer,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])
```

### 6.2 路径别名

已在 `tsconfig.json` 中配置:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 7. 测试账号

| 用户名 | 密码 | 资金密码 | 说明 |
|--------|------|---------|------|
| zhangsan | 123456 | fund123 | 中国用户 |
| john | 123456 | fund123 | 美国用户 |
| hans | 123456 | fund123 | 德国用户 |
| lim | 123456 | fund123 | 新加坡用户 |
| tanaka | 123456 | fund123 | 日本用户 |

---

## 8. 常见问题

### Q1: ECharts 图表不显示

确保已正确安装并注册 ECharts:
```bash
npm install echarts vue-echarts
```

检查组件是否正确导入:
```typescript
import VChart from 'vue-echarts'
```

### Q2: 余额不更新

检查 localStorage 是否正确写入:
```javascript
console.log(JSON.parse(localStorage.getItem('users')))
```

### Q3: 类型报错

确保已创建新的类型定义文件:
- `src/types/fund.ts`
- `src/types/statistics.ts`

---

## 9. 相关文档

- [规范文档](./spec.md) - 功能需求详细说明
- [数据模型](./data-model.md) - 实体定义与关系
- [技术研究](./research.md) - 技术选型与设计决策
- [任务列表](./tasks.md) - 开发任务分解

---

## 10. 联系方式

如有问题，请在 GitHub Issue 中反馈。
