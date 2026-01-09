# Quickstart: 航运船期查询

**Feature**: 002-shipping-schedule  
**Date**: 2026-01-09

## 快速开始

### 1. 环境准备

```bash
# 确保 Node.js 和 npm 已安装
node --version  # >= 18.0.0
npm --version   # >= 9.0.0

# 安装依赖
npm install
```

### 2. 运行开发服务器

```bash
npm run dev
```

访问 http://localhost:5173

### 3. 运行测试

```bash
# 运行所有测试
npm test

# 监听模式
npm run test:watch

# 带覆盖率
npm run test:coverage
```

## 开发指南

### 项目结构

```
src/
├── assets/data/
│   ├── ports.json         # 港口数据
│   └── schedules.json     # 船期数据 (新增)
├── components/
│   ├── PortAutocomplete.vue   # 港口自动补全 (新增)
│   ├── ScheduleList.vue       # 船期列表 (新增)
│   └── ScheduleSearch.vue     # 船期搜索 (新增)
├── composables/
│   ├── usePortAutocomplete.ts # 自动补全逻辑 (新增)
│   └── useScheduleSearch.ts   # 船期搜索逻辑 (新增)
├── services/
│   └── scheduleService.ts     # 船期服务 (新增)
├── types/
│   └── schedule.ts            # 船期类型 (新增)
└── views/
    └── ScheduleQueryView.vue  # 船期查询页 (新增)
```

### 关键 API

#### 船期服务

```typescript
import { 
  loadSchedules, 
  searchSchedules 
} from '@/services/scheduleService'

// 加载所有船期
const schedules = await loadSchedules()

// 按条件搜索
const result = searchSchedules({
  departurePort: 'CNSHA',
  arrivalPort: 'NLRTM',
  etdStart: '2026-01-15',
  etdEnd: '2026-02-15'
}, schedules)
```

#### 港口自动补全

```typescript
import { usePortAutocomplete } from '@/composables/usePortAutocomplete'

const { 
  query,           // 输入框值
  suggestions,     // 匹配的港口列表
  isOpen,          // 下拉是否打开
  activeIndex,     // 当前选中索引
  selectPort,      // 选择港口
  handleKeydown    // 键盘事件处理
} = usePortAutocomplete()
```

### 测试规范

测试文件位置遵循以下约定：

- 组件测试: `tests/components/<ComponentName>.spec.ts`
- 服务测试: `tests/unit/<serviceName>.spec.ts`
- Composable 测试: `tests/unit/<composableName>.spec.ts`

### 编码规范

1. **中文注释**: 业务逻辑相关的注释使用中文
2. **类型安全**: 所有函数和组件必须有完整的 TypeScript 类型
3. **测试先行**: 新功能先编写测试用例
4. **简约设计**: 不引入不必要的依赖

## 相关文档

- [功能规格](./spec.md)
- [实施计划](./plan.md)
- [技术研究](./research.md)
- [数据模型](./data-model.md)
- [服务契约](./contracts/schedule-service.ts)
