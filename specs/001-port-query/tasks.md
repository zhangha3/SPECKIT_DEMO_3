# Tasks: 全球航运港口信息查询

**Input**: Design documents from `/specs/001-port-query/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/port-service.ts ✅, quickstart.md ✅

**Tests**: 本功能采用 TDD 开发（宪法原则四：测试先行），测试任务已包含在内。

**Organization**: 任务按用户故事组织，支持独立实现和测试。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 所属用户故事 (US1, US2, US3)
- 描述中包含确切文件路径

---

## Phase 1: Setup (项目初始化)

**Purpose**: 项目基础结构和依赖配置

- [ ] T001 使用 Vite 初始化 Vue 3 + TypeScript 项目结构
- [ ] T002 配置 package.json 添加必要依赖 (vue, vitest, @vue/test-utils)
- [ ] T003 [P] 配置 vite.config.ts 构建工具
- [ ] T004 [P] 配置 tsconfig.json TypeScript 编译选项
- [ ] T005 [P] 创建 .gitignore 文件

---

## Phase 2: Foundational (基础设施)

**Purpose**: 所有用户故事共享的核心基础设施

**⚠️ CRITICAL**: 必须完成此阶段后才能开始任何用户故事

- [ ] T006 创建 Port 类型定义 in src/types/port.ts
- [ ] T007 [P] 创建 SearchMode、SearchResult、PaginatedResult 类型定义 in src/types/port.ts
- [ ] T008 准备初始港口数据（至少20个主流港口）in src/assets/data/ports.json
- [ ] T009 [P] 创建 App.vue 根组件基础结构 in src/App.vue
- [ ] T010 [P] 创建 main.ts 入口文件 in src/main.ts

**Checkpoint**: 基础设施就绪 - 可开始用户故事实现

---

## Phase 3: User Story 1 - 按港口代码精确查询 (Priority: P1) 🎯 MVP

**Goal**: 物流操作员可通过输入5位港口代码（如 CNSHA）快速精确查找港口信息

**Independent Test**: 在搜索框输入 "CNSHA" 点击搜索，验证返回上海港完整信息；输入 "XXXXX" 验证显示"未找到匹配的港口"

### Tests for User Story 1

> **NOTE: 先写测试，确保测试失败后再实现**

- [ ] T011 [P] [US1] 编写 determineSearchMode 单元测试 in tests/unit/portService.spec.ts
- [ ] T012 [P] [US1] 编写 findByCode 单元测试 in tests/unit/portService.spec.ts
- [ ] T013 [P] [US1] 编写 PortSearch 组件测试（精确查询场景）in tests/components/PortSearch.spec.ts

### Implementation for User Story 1

- [ ] T014 [US1] 实现 determineSearchMode 函数（5位字母→exact）in src/services/portService.ts
- [ ] T015 [US1] 实现 loadPorts 函数加载 JSON 数据 in src/services/portService.ts
- [ ] T016 [US1] 实现 findByCode 精确查询函数（大小写不敏感）in src/services/portService.ts
- [ ] T017 [US1] 创建 usePortSearch Composable 封装搜索逻辑 in src/composables/usePortSearch.ts
- [ ] T018 [US1] 创建 PortSearch.vue 搜索输入框组件 in src/components/PortSearch.vue
- [ ] T019 [US1] 创建 PortDetail.vue 港口详情展示组件 in src/components/PortDetail.vue
- [ ] T020 [US1] 创建 PortQueryView.vue 主页面视图（集成搜索和详情）in src/views/PortQueryView.vue
- [ ] T021 [US1] 实现空输入验证提示"请输入查询条件" in src/components/PortSearch.vue
- [ ] T022 [US1] 实现无结果时显示"未找到匹配的港口"提示 in src/views/PortQueryView.vue

**Checkpoint**: 用户故事1完成 - 可独立测试精确代码查询功能

---

## Phase 4: User Story 2 - 按港口名称模糊查询 (Priority: P2)

**Goal**: 物流操作员可通过输入港口名称关键词（中英文）搜索港口列表

**Independent Test**: 在搜索框输入 "Shanghai" 点击搜索，验证返回包含该关键词的港口列表；输入 "上海" 验证中文模糊匹配正常

### Tests for User Story 2

- [ ] T023 [P] [US2] 编写 searchByName 单元测试（中英文匹配）in tests/unit/portService.spec.ts
- [ ] T024 [P] [US2] 编写 usePagination Composable 单元测试 in tests/unit/usePagination.spec.ts
- [ ] T025 [P] [US2] 编写 PortList 组件测试（列表展示）in tests/components/PortList.spec.ts
- [ ] T026 [P] [US2] 编写 Pagination 组件测试 in tests/components/Pagination.spec.ts

### Implementation for User Story 2

- [ ] T027 [US2] 实现 searchByName 模糊查询函数（中英文 name/nameCN 匹配）in src/services/portService.ts
- [ ] T028 [US2] 实现统一 search 入口函数（自动判断模式）in src/services/portService.ts
- [ ] T029 [US2] 创建 usePagination Composable 实现前端分页逻辑 in src/composables/usePagination.ts
- [ ] T030 [US2] 创建 PortList.vue 港口列表组件 in src/components/PortList.vue
- [ ] T031 [US2] 创建 Pagination.vue 分页控件组件（默认每页10条）in src/components/Pagination.vue
- [ ] T032 [US2] 更新 PortQueryView.vue 集成列表和分页组件 in src/views/PortQueryView.vue
- [ ] T033 [US2] 更新 usePortSearch Composable 支持模糊查询结果 in src/composables/usePortSearch.ts

**Checkpoint**: 用户故事2完成 - 可独立测试模糊名称查询和分页功能

---

## Phase 5: User Story 3 - 查看港口详细信息 (Priority: P3)

**Goal**: 物流操作员可查看港口完整详细信息（代码、名称、国家、时区等）

**Independent Test**: 在搜索结果列表点击任意港口，验证显示完整详情面板，时区以标准格式显示

### Tests for User Story 3

- [ ] T034 [P] [US3] 编写 PortDetail 组件测试（完整字段展示）in tests/components/PortDetail.spec.ts
- [ ] T035 [P] [US3] 编写时区格式化函数单元测试 in tests/unit/portService.spec.ts

### Implementation for User Story 3

- [ ] T036 [US3] 实现时区格式化辅助函数（IANA → UTC+X 显示）in src/services/portService.ts
- [ ] T037 [US3] 更新 PortDetail.vue 展示完整港口信息（所有字段）in src/components/PortDetail.vue
- [ ] T038 [US3] 更新 PortList.vue 支持点击港口项触发详情展示 in src/components/PortList.vue
- [ ] T039 [US3] 更新 PortQueryView.vue 集成详情面板交互 in src/views/PortQueryView.vue

**Checkpoint**: 用户故事3完成 - 所有用户故事均可独立运行

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 跨用户故事的优化和完善

- [ ] T040 [P] 实现 XSS 安全处理（特殊字符输入过滤）in src/components/PortSearch.vue
- [ ] T041 [P] 实现输入长度限制（超过100字符截断/提示）in src/components/PortSearch.vue
- [ ] T042 [P] 实现加载状态指示器（FR-010）in src/views/PortQueryView.vue
- [ ] T043 [P] 添加数据加载失败错误处理和友好提示 in src/services/portService.ts
- [ ] T044 [P] 代码清理和重构优化
- [ ] T045 运行 quickstart.md 验证流程确认功能正常
- [ ] T046 [P] 补充港口数据至覆盖至少5大洲主要港口

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无依赖 - 可立即开始
- **Foundational (Phase 2)**: 依赖 Setup 完成 - 阻塞所有用户故事
- **User Stories (Phase 3-5)**: 全部依赖 Foundational 阶段完成
  - 用户故事可按优先级顺序执行 (P1 → P2 → P3)
  - 或并行执行（如有多人协作）
- **Polish (Phase 6)**: 依赖所有用户故事完成

### User Story Dependencies

- **User Story 1 (P1)**: Foundational 完成后可开始 - 不依赖其他故事
- **User Story 2 (P2)**: Foundational 完成后可开始 - 与 US1 共享 portService，但可独立测试
- **User Story 3 (P3)**: Foundational 完成后可开始 - 复用 US1 的 PortDetail 组件，扩展功能

### Within Each User Story

- 测试必须先编写并确保失败
- 服务层先于组件
- 组件先于视图集成
- 核心实现先于边缘情况处理

### Parallel Opportunities

- Setup 阶段：T003, T004, T005 可并行
- Foundational 阶段：T007, T009, T010 可并行
- 各用户故事的测试任务可并行
- 不同用户故事可由不同开发者并行实现

---

## Parallel Example: User Story 1

```bash
# 并行启动 US1 所有测试:
Task T011: "编写 determineSearchMode 单元测试 in tests/unit/portService.spec.ts"
Task T012: "编写 findByCode 单元测试 in tests/unit/portService.spec.ts"
Task T013: "编写 PortSearch 组件测试 in tests/components/PortSearch.spec.ts"
```

---

## Parallel Example: User Story 2

```bash
# 并行启动 US2 所有测试:
Task T023: "编写 searchByName 单元测试 in tests/unit/portService.spec.ts"
Task T024: "编写 usePagination Composable 单元测试 in tests/unit/usePagination.spec.ts"
Task T025: "编写 PortList 组件测试 in tests/components/PortList.spec.ts"
Task T026: "编写 Pagination 组件测试 in tests/components/Pagination.spec.ts"
```

---

## Implementation Strategy

### MVP First (仅 User Story 1)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational (关键阻塞点)
3. 完成 Phase 3: User Story 1
4. **停止验证**: 独立测试 US1 功能
5. 可部署/演示 MVP

### Incremental Delivery

1. Setup + Foundational → 基础就绪
2. 添加 User Story 1 → 独立测试 → 部署/演示 (MVP!)
3. 添加 User Story 2 → 独立测试 → 部署/演示
4. 添加 User Story 3 → 独立测试 → 部署/演示
5. 每个故事增量交付价值

---

## Notes

- [P] 任务 = 不同文件，无依赖
- [Story] 标签映射任务到特定用户故事以便追踪
- 每个用户故事应可独立完成和测试
- 实现前确认测试失败
- 每个任务或逻辑组完成后提交
- 任何检查点都可停止验证故事独立性
- 避免：模糊任务、同文件冲突、破坏独立性的跨故事依赖
