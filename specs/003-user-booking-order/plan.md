# Implementation Plan: 用户登录、舱位购买与订单查询

**Branch**: `003-user-booking-order` | **Date**: 2026年1月9日 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-user-booking-order/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

在现有航运信息平台基础上扩展用户认证、舱位购买和订单管理功能。采用 Vue 3 + TypeScript 技术栈，使用 sessionStorage 管理登录状态，JSON 文件持久化用户、库存和订单数据。新增登录页面、购买确认弹窗、订单查询页面，并在船期列表中集成库存展示和购买按钮。

## Technical Context

**Language/Version**: TypeScript 5.6 + Vue 3.5  
**Primary Dependencies**: Vue 3, Vite 6, @vue/test-utils  
**Storage**: JSON 文件 (users.json, orders.json, schedules.json)  
**Testing**: Vitest 2.1 + @vue/test-utils  
**Target Platform**: 现代浏览器 (Chrome/Firefox/Safari/Edge)  
**Project Type**: 单页 Web 应用 (SPA)  
**Performance Goals**: 页面加载 < 3秒，操作响应 < 500ms  
**Constraints**: 纯前端实现，无后端 API，数据持久化依赖浏览器 localStorage  
**Scale/Scope**: 5个默认用户，30+船期数据，支持订单增长

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原则 | 状态 | 说明 |
|------|------|------|
| 一、中文优先原则 | ✅ 通过 | 所有文档、注释使用中文 |
| 二、可视化驱动原则 | ✅ 通过 | 架构图、流程图使用 Mermaid |
| 三、术语统一原则 | ✅ 通过 | 新术语将添加到术语表 |
| 四、测试先行原则 | ✅ 通过 | 遵循 TDD 流程 |
| 五、简约设计原则 | ✅ 通过 | 使用 JSON 文件 + sessionStorage 简单方案 |

## Project Structure

### Documentation (this feature)

```text
specs/003-user-booking-order/
├── plan.md              # 本文件
├── research.md          # Phase 0 研究输出
├── data-model.md        # Phase 1 数据模型
├── quickstart.md        # Phase 1 快速开始指南
├── contracts/           # Phase 1 服务契约
│   ├── user-service.ts
│   ├── order-service.ts
│   └── auth-service.ts
└── tasks.md             # Phase 2 任务清单 (由 /speckit.tasks 生成)
```

### Source Code (repository root)

```text
src/
├── assets/
│   └── data/
│       ├── users.json       # 新增: 用户数据
│       ├── orders.json      # 新增: 订单数据
│       └── schedules.json   # 修改: 新增 stock 字段
├── components/
│   ├── LoginForm.vue        # 新增: 登录表单
│   ├── UserHeader.vue       # 新增: 用户信息头部
│   ├── PurchaseDialog.vue   # 新增: 购买确认弹窗
│   ├── OrderList.vue        # 新增: 订单列表
│   ├── OrderSearch.vue      # 新增: 订单搜索
│   └── ScheduleList.vue     # 修改: 添加库存和购买按钮
├── composables/
│   ├── useAuth.ts           # 新增: 认证状态管理
│   └── useOrderSearch.ts    # 新增: 订单查询逻辑
├── services/
│   ├── userService.ts       # 新增: 用户服务
│   ├── orderService.ts      # 新增: 订单服务
│   └── scheduleService.ts   # 修改: 库存管理
├── types/
│   ├── user.ts              # 新增: 用户类型
│   └── order.ts             # 新增: 订单类型
├── views/
│   ├── LoginView.vue        # 新增: 登录页面
│   └── OrderQueryView.vue   # 新增: 订单查询页面
└── App.vue                  # 修改: 添加路由守卫和导航

tests/
├── components/
│   ├── LoginForm.spec.ts
│   ├── UserHeader.spec.ts
│   ├── PurchaseDialog.spec.ts
│   ├── OrderList.spec.ts
│   └── OrderSearch.spec.ts
└── unit/
    ├── userService.spec.ts
    ├── orderService.spec.ts
    └── useAuth.spec.ts
```

**Structure Decision**: 沿用现有单项目结构，新增文件按功能模块组织。保持与 001-port-query 和 002-shipping-schedule 一致的目录约定。

## Post-Design Constitution Check

*Re-check after Phase 1 design completion.*

| 原则 | 状态 | 验证说明 |
|------|------|----------|
| 一、中文优先原则 | ✅ 通过 | 所有文档使用中文，代码注释为中文 |
| 二、可视化驱动原则 | ✅ 通过 | data-model.md 和 quickstart.md 包含 Mermaid 图表 |
| 三、术语统一原则 | ✅ 通过 | 使用一致术语：用户、船期、订单、库存 |
| 四、测试先行原则 | ✅ 通过 | contracts/ 定义了服务接口，便于 TDD |
| 五、简约设计原则 | ✅ 通过 | 使用 sessionStorage + localStorage，无过度设计 |

## Complexity Tracking

> 本功能无 Constitution Check 违规，无需记录。

---

*Phase 0 和 Phase 1 已完成。执行 `/speckit.tasks` 进入 Phase 2 任务分解。*
