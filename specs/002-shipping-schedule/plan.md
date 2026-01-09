# Implementation Plan: 航运船期查询

**Branch**: `002-shipping-schedule` | **Date**: 2026-01-09 | **Spec**: [spec.md](./spec.md)
**Input**: 功能规格文档 `/specs/002-shipping-schedule/spec.md`

## Summary

在现有港口查询系统基础上，新增航运船期查询功能。主要技术工作包括：
1. 创建船期数据模型和 JSON 数据文件（至少30条全球主流航线）
2. 开发船期服务层（查询、筛选、排序功能）
3. 实现带有自动补全的港口选择组件（复用现有港口数据，300ms防抖）
4. 构建船期查询页面（列表展示、分页、条件筛选）
5. 在顶部导航栏添加页面路由

## Technical Context

**Language/Version**: TypeScript 5.6, Vue 3.5  
**Primary Dependencies**: Vue 3, Vite 6, @vue/test-utils  
**Storage**: 静态 JSON 文件 (`src/assets/data/`)  
**Testing**: Vitest 2.1  
**Target Platform**: Web 浏览器 (SPA)  
**Project Type**: 单体前端项目（无后端）  
**Performance Goals**: 页面加载 < 3s, 自动补全响应 < 100ms  
**Constraints**: 自动补全防抖 300ms, 每页固定 10 条, 手动触发查询  
**Scale/Scope**: 约 30+ 船期数据, 25+ 港口数据, 2 个页面视图

## Constitution Check

*GATE: 必须在 Phase 0 研究之前通过。Phase 1 设计完成后重新检查。*

### Phase 0 前检查 ✅

| 原则 | 状态 | 说明 |
|------|------|------|
| **中文优先原则** | ✅ 通过 | 所有文档使用中文，代码注释使用中文描述业务逻辑 |
| **可视化驱动原则** | ✅ 通过 | 将在设计文档中使用 Mermaid 图表描述数据流和组件关系 |
| **术语统一原则** | ✅ 通过 | 新术语（船期、ETD、承运公司）将添加到术语表 |
| **测试先行原则** | ✅ 通过 | 将遵循 TDD 流程，先编写测试用例 |
| **简约设计原则** | ✅ 通过 | 复用现有组件和模式，不引入新依赖 |

### Phase 1 后复检 ✅

| 原则 | 状态 | 说明 |
|------|------|------|
| **中文优先原则** | ✅ 通过 | research.md, data-model.md, quickstart.md 均使用中文 |
| **可视化驱动原则** | ✅ 通过 | data-model.md 包含 Mermaid ER图和数据流图 |
| **术语统一原则** | ⚠️ 待办 | 需在 `.specify/memory/glossary.md` 添加新术语 |
| **测试先行原则** | ✅ 通过 | contracts/ 已定义服务接口，为 TDD 做好准备 |
| **简约设计原则** | ✅ 通过 | research.md 确认不引入新依赖，复用现有模式 |

**评估结果**: 通过。需在 tasks 阶段添加术语表更新任务。

## Project Structure

### Documentation (this feature)

```text
specs/002-shipping-schedule/
├── plan.md              # 本文件
├── research.md          # Phase 0 输出
├── data-model.md        # Phase 1 输出
├── quickstart.md        # Phase 1 输出
├── contracts/           # Phase 1 输出
│   └── schedule-service.ts
└── tasks.md             # Phase 2 输出 (由 /speckit.tasks 创建)
```

### Source Code (repository root)

```text
src/
├── assets/
│   └── data/
│       ├── ports.json           # 现有港口数据（需扩展）
│       └── schedules.json       # 新增：船期数据
├── components/
│   ├── Pagination.vue           # 复用：分页组件
│   ├── PortList.vue             # 复用：港口列表
│   ├── PortDetail.vue           # 复用：港口详情
│   ├── PortSearch.vue           # 复用：港口搜索
│   ├── PortAutocomplete.vue     # 新增：港口自动补全组件
│   ├── ScheduleList.vue         # 新增：船期列表组件
│   └── ScheduleSearch.vue       # 新增：船期搜索条件组件
├── composables/
│   ├── usePagination.ts         # 复用：分页逻辑
│   ├── usePortSearch.ts         # 复用：港口搜索
│   ├── useScheduleSearch.ts     # 新增：船期搜索逻辑
│   └── usePortAutocomplete.ts   # 新增：自动补全逻辑
├── services/
│   ├── portService.ts           # 现有：港口服务（扩展模糊搜索）
│   └── scheduleService.ts       # 新增：船期服务
├── types/
│   ├── port.ts                  # 现有：港口类型
│   └── schedule.ts              # 新增：船期类型
├── views/
│   ├── PortQueryView.vue        # 现有：港口查询页
│   └── ScheduleQueryView.vue    # 新增：船期查询页
├── App.vue                      # 修改：添加导航栏
├── main.ts
└── router.ts                    # 新增：路由配置（可选）

tests/
├── components/
│   ├── PortAutocomplete.spec.ts # 新增
│   ├── ScheduleList.spec.ts     # 新增
│   └── ScheduleSearch.spec.ts   # 新增
└── unit/
    ├── scheduleService.spec.ts  # 新增
    └── useScheduleSearch.spec.ts # 新增
```

**Structure Decision**: 采用现有单体前端项目结构，遵循已建立的目录约定。新增组件和服务遵循相同的命名和组织模式。

## Complexity Tracking

> 无违规，此表格不适用

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | - | - |
