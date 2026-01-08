# 快速启动指南：全球航运港口信息查询

**功能分支**: `001-port-query`  
**创建日期**: 2026-01-08

## 前置条件

- Node.js 18+ 
- npm 或 pnpm 包管理器

## 快速开始

### 1. 克隆并切换分支

```bash
git clone <repository-url>
cd speckit_demo_3
git checkout 001-port-query
```

### 2. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 pnpm (推荐)
pnpm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看应用。

### 4. 运行测试

```bash
# 运行所有测试
npm run test

# 监视模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

### 5. 构建生产版本

```bash
npm run build
```

构建产物位于 `dist/` 目录。

---

## 项目结构

```
src/
├── assets/data/ports.json   # 港口数据
├── components/              # Vue 组件
├── composables/             # 可复用逻辑
├── services/                # 服务层
├── types/                   # TypeScript 类型
└── views/                   # 页面视图

tests/
├── unit/                    # 单元测试
└── components/              # 组件测试
```

---

## 主要功能验证

### 精确查询（按港口代码）

1. 在搜索框输入 `CNSHA`
2. 点击"搜索"按钮
3. 预期：显示上海港详细信息

### 模糊查询（按港口名称）

1. 在搜索框输入 `上海` 或 `Shanghai`
2. 点击"搜索"按钮
3. 预期：显示包含关键词的港口列表

### 分页功能

1. 执行一个返回超过 10 条结果的查询（如搜索 `port`）
2. 预期：结果分页显示，可通过翻页控件切换

---

## 常见问题

### Q: 如何添加新港口数据？

编辑 `src/assets/data/ports.json` 文件，按照以下格式添加：

```json
{
  "code": "XXXXX",
  "name": "Port Name",
  "nameCN": "港口中文名",
  "country": "Country",
  "countryCode": "XX",
  "timezone": "Region/City"
}
```

### Q: 测试失败怎么办？

1. 确保已安装所有依赖：`npm install`
2. 检查 Node.js 版本：`node -v`（需要 18+）
3. 清除缓存重试：`npm run test -- --clearCache`

---

## 相关文档

- [功能规格说明](./spec.md)
- [实施计划](./plan.md)
- [数据模型](./data-model.md)
- [技术研究](./research.md)
- [服务契约](./contracts/port-service.ts)
