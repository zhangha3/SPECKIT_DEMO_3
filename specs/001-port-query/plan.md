# 实施计划：全球航运港口信息查询

**分支**: `001-port-query` | **日期**: 2026-01-08 | **规格**: [spec.md](./spec.md)
**输入**: 功能规格说明 `/specs/001-port-query/spec.md`

**说明**: 本文档由 `/speckit.plan` 命令生成。

## 摘要

构建一个单体前端 Web 应用，实现全球航运港口信息查询功能。用户可通过港口代码（5位纯字母，精确查询）或港口名称（中英文，模糊查询）搜索港口信息。数据从静态 JSON 文件加载，结果分页展示（每页10条）。技术栈：Vue 3 + TypeScript + Vitest。

## 技术上下文

**语言/版本**: TypeScript 5.x, Node.js 18+  
**主要依赖**: Vue 3 (Composition API), Vite (构建工具)  
**存储**: 静态 JSON 文件 (前端直接加载，无后端)  
**测试**: Vitest (单元测试), @vue/test-utils (组件测试)  
**目标平台**: 现代浏览器 (Chrome, Firefox, Safari, Edge 最新版本)
**项目类型**: 单体前端应用 (Single SPA)  
**性能目标**: 首次加载 < 2秒, 查询响应 < 100ms (本地数据)  
**约束**: 离线可用（数据加载后）, 无后端依赖  
**规模/范围**: ~500 港口数据, 1 个查询页面

## 宪法检查

*门禁: 必须在 Phase 0 研究前通过。Phase 1 设计后重新检查。*

| 原则 | 状态 | 说明 |
|------|------|------|
| 一、中文优先 | ✅ 通过 | 所有文档使用中文编写 |
| 二、可视化驱动 | ✅ 通过 | 数据模型使用 Mermaid ER 图 |
| 三、术语统一 | ✅ 通过 | 港口相关术语已记录到术语表 |
| 四、测试先行 | ✅ 通过 | 使用 Vitest 进行 TDD 开发 |
| 五、简约设计 | ✅ 通过 | 纯前端方案，无后端复杂性 |

**门禁结果**: ✅ 通过，无违规项

## 项目结构

### 文档结构 (本功能)

```text
specs/001-port-query/
├── plan.md              # 本文件 (/speckit.plan 输出)
├── research.md          # Phase 0 输出 (/speckit.plan)
├── data-model.md        # Phase 1 输出 (/speckit.plan)
├── quickstart.md        # Phase 1 输出 (/speckit.plan)
├── contracts/           # Phase 1 输出 (/speckit.plan)
│   └── port-service.ts  # 服务接口定义
└── tasks.md             # Phase 2 输出 (/speckit.tasks - 非本命令创建)
```

### 源码结构 (仓库根目录)

```text
src/
├── assets/              # 静态资源
│   └── data/
│       └── ports.json   # 港口数据文件
├── components/          # Vue 组件
│   ├── PortSearch.vue   # 搜索输入框组件
│   ├── PortList.vue     # 港口列表组件 (含分页)
│   ├── PortDetail.vue   # 港口详情组件
│   └── Pagination.vue   # 分页控件组件
├── composables/         # Vue Composables (可复用逻辑)
│   ├── usePortSearch.ts # 港口搜索逻辑
│   └── usePagination.ts # 分页逻辑
├── types/               # TypeScript 类型定义
│   └── port.ts          # 港口实体类型
├── services/            # 服务层
│   └── portService.ts   # 港口数据服务
├── views/               # 页面视图
│   └── PortQueryView.vue # 港口查询主页面
├── App.vue              # 根组件
└── main.ts              # 入口文件

tests/
├── unit/                # 单元测试
│   ├── portService.spec.ts
│   ├── usePortSearch.spec.ts
│   └── usePagination.spec.ts
└── components/          # 组件测试
    ├── PortSearch.spec.ts
    ├── PortList.spec.ts
    └── Pagination.spec.ts
```

**结构决策**: 采用单体前端应用结构，使用 Vue 3 Composition API 组织代码。通过 composables 分离业务逻辑，便于测试和复用。

## 复杂性跟踪

> **仅当宪法检查有违规需要说明时填写**

无违规项，无需填写。
