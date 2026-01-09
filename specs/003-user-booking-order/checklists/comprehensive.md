# 需求质量检查清单: 用户登录、舱位购买与订单查询

**Purpose**: 验证需求规范的完整性、清晰性和一致性  
**Created**: 2026年1月9日  
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md)  
**Focus**: 综合检查（认证、购买、订单、UX、数据持久化）  
**Depth**: 标准（PR评审级别）  
**Audience**: 作者自检

---

## 需求完整性 (Requirement Completeness)

- [ ] CHK001 - 是否定义了用户名/密码的格式约束（最小长度、允许字符）？ [Gap, FR-001]
- [ ] CHK002 - 是否指定了邮箱字段的验证规则（格式校验）？ [Gap, FR-006]
- [ ] CHK003 - 是否定义了订单号序号用尽时的处理策略（当日订单超过999）？ [Gap, FR-014]
- [ ] CHK004 - 是否定义了localStorage存储空间不足时的处理方案？ [Gap, Edge Case]
- [ ] CHK005 - 是否定义了页面刷新时的状态恢复行为（订单列表分页位置、搜索条件）？ [Gap, UX]

## 需求清晰性 (Requirement Clarity)

- [ ] CHK006 - "登录成功并跳转到系统主页"中的"主页"是否明确为船期查询页面？ [Clarity, Spec §US-1 vs Clarifications]
- [ ] CHK007 - "暂无库存"文字的视觉样式是否有明确定义（颜色、字体等）？ [Clarity, FR-011]
- [ ] CHK008 - "购买成功提示"的展示方式是否明确（Toast/弹窗/内联）？ [Clarity, FR-016]
- [ ] CHK009 - "持续显示直到用户重新输入"中的"重新输入"触发条件是否清晰？ [Clarity, FR-028]
- [ ] CHK010 - 确认弹窗的具体内容（文案、按钮文字）是否有定义？ [Clarity, FR-017]

## 需求一致性 (Requirement Consistency)

- [ ] CHK011 - 登录跳转目标在US-1("系统主页")与Clarifications("船期查询页面")之间是否一致？ [Consistency, Spec §US-1, Clarifications]
- [ ] CHK012 - 库存持久化方案在Clarifications("更新原船期JSON文件")与plan.md("localStorage")之间是否一致？ [Consistency, Clarifications vs Plan]
- [ ] CHK013 - 分页每页记录数在FR-025(10条)与现有船期查询(10条)之间是否保持一致？ [Consistency, FR-025, FR-007 of 002-shipping-schedule]

## 验收标准质量 (Acceptance Criteria Quality)

- [ ] CHK014 - SC-001的"10秒内完成登录流程"是否可客观测量？ [Measurability, SC-001]
- [ ] CHK015 - SC-002的"直观看到"是否有具体验证方式？ [Measurability, SC-002]
- [ ] CHK016 - SC-003的"5秒"包含确认弹窗操作时间吗？ [Clarity, SC-003]
- [ ] CHK017 - 每个User Story的Acceptance Scenarios是否覆盖了成功和失败路径？ [Coverage, §User Scenarios]

## 场景覆盖 (Scenario Coverage)

- [ ] CHK018 - 是否定义了用户输入特殊字符（如SQL注入尝试）时的行为？ [Coverage, Security]
- [ ] CHK019 - 是否定义了同一用户多标签页登录/登出时的行为？ [Coverage, Edge Case]
- [ ] CHK020 - 是否定义了购买同一船期多次时的行为限制？ [Coverage, Business Rule]
- [ ] CHK021 - 是否定义了订单查询无结果时的空状态展示？ [Coverage, FR-020]

## 边界情况 (Edge Case Coverage)

- [ ] CHK022 - 当订单列表正好10条（边界分页）时的分页行为是否明确？ [Edge Case, FR-025]
- [ ] CHK023 - 当库存从1变为0的临界状态下UI更新时机是否明确？ [Edge Case, FR-011]
- [ ] CHK024 - 当用户在确认弹窗等待时会话过期的处理是否明确？ [Edge Case, Auth]
- [ ] CHK025 - 5个默认用户的具体用户名、密码是否需要在需求中定义？ [Gap, FR-007, FR-029]

## 非功能需求 (Non-Functional Requirements)

- [ ] CHK026 - 是否定义了登录页面的可访问性要求（键盘导航、屏幕阅读器）？ [Gap, Accessibility]
- [ ] CHK027 - 是否定义了错误提示的本地化/国际化策略？ [Gap, i18n]
- [ ] CHK028 - 是否定义了密码输入的安全性要求（掩码、禁止复制）？ [Gap, Security]
- [ ] CHK029 - 是否定义了localStorage数据的最大容量限制？ [Gap, NFR]

## 依赖与假设 (Dependencies & Assumptions)

- [ ] CHK030 - "密码以明文形式存储"的假设是否在UI或文档中对用户有声明？ [Assumption, §Assumptions]
- [ ] CHK031 - "不支持并发锁机制"的假设在多标签页场景下是否仍有效？ [Assumption, §Assumptions]
- [ ] CHK032 - 对现有schedules.json结构变更是否影响002-shipping-schedule功能？ [Dependency, FR-008]

## 歧义与冲突 (Ambiguities & Conflicts)

- [ ] CHK033 - "浏览器关闭失效"与"新标签页保持登录"之间是否存在理解歧义？ [Ambiguity, §Assumptions, US-1.5]
- [ ] CHK034 - FR-018"更新船期JSON数据文件"与纯前端架构是否存在实现矛盾？ [Conflict, FR-018 vs Technical Context]

---

## 检查摘要

| 类别 | 检查项数 | 说明 |
|------|---------|------|
| 需求完整性 | 5 | 识别未定义的需求细节 |
| 需求清晰性 | 5 | 识别模糊或歧义的表述 |
| 需求一致性 | 3 | 验证跨文档的一致性 |
| 验收标准质量 | 4 | 验证可测量性 |
| 场景覆盖 | 4 | 识别遗漏的用户场景 |
| 边界情况 | 4 | 识别边界条件处理 |
| 非功能需求 | 4 | 识别NFR缺失 |
| 依赖与假设 | 3 | 验证假设有效性 |
| 歧义与冲突 | 2 | 识别潜在矛盾 |
| **总计** | **34** | |

---

## 使用说明

1. 逐项检查每个CHK项，在 `[ ]` 中标记 `[x]` 表示通过
2. 对于未通过的项，在对应需求文档中补充或澄清
3. 所有项通过后，规范可进入实施阶段
4. 如有项目无法满足，需在规范中明确标注为"已知限制"

**Ready for**: `/speckit.tasks` 或实施阶段
