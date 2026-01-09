# 数据模型: 用户登录、舱位购买与订单查询

**功能分支**: `003-user-booking-order`  
**创建日期**: 2026年1月9日  
**状态**: Phase 1 完成

## 实体关系图

```mermaid
erDiagram
    User ||--o{ Order : "creates"
    ShippingSchedule ||--o{ Order : "references"
    
    User {
        string username PK "用户名（唯一标识）"
        string password "密码"
        string email "邮箱"
        string country "所在国家"
    }
    
    ShippingSchedule {
        string id PK "船期编号"
        string departurePort FK "起运港代码"
        string arrivalPort FK "目的港代码"
        string etd "预计发运时间"
        number transitDays "运输耗时(天)"
        string carrier "承运公司"
        string vesselName "船名"
        string voyageNumber "航次号"
        number stock "库存数量"
    }
    
    Order {
        string id PK "订单号"
        string userId FK "下单用户"
        string orderTime "下单时间"
        string scheduleId FK "船期编号"
        string departurePort "起运港代码"
        string arrivalPort "目的港代码"
        string etd "预计发运时间"
        number transitDays "运输耗时(天)"
        string carrier "承运公司"
    }
```

## 实体详细定义

### 1. User（用户）

表示系统用户，用于登录认证。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | ✓ | 用户名，唯一标识，用于登录 |
| password | string | ✓ | 密码，明文存储（仅演示用途） |
| email | string | ✓ | 邮箱地址 |
| country | string | ✓ | 所在国家 |

**约束**:
- username 必须唯一
- 所有字段不可为空

**默认数据**: 5个用户，分别来自中国、美国、德国、新加坡、日本

```json
[
  { "username": "zhangsan", "password": "123456", "email": "zhangsan@example.com", "country": "中国" },
  { "username": "john", "password": "123456", "email": "john@example.com", "country": "美国" },
  { "username": "hans", "password": "123456", "email": "hans@example.com", "country": "德国" },
  { "username": "lim", "password": "123456", "email": "lim@example.com", "country": "新加坡" },
  { "username": "tanaka", "password": "123456", "email": "tanaka@example.com", "country": "日本" }
]
```

---

### 2. ShippingSchedule（船期）

在现有船期实体基础上新增库存字段。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | ✓ | 船期编号 (格式: SCH-YYYYMMDD-XXX) |
| departurePort | string | ✓ | 起运港代码 (关联 Port.code) |
| arrivalPort | string | ✓ | 目的港代码 (关联 Port.code) |
| etd | string | ✓ | 预计发运时间 (ISO 8601 日期格式) |
| transitDays | number | ✓ | 运输耗时 (天数) |
| carrier | string | ✓ | 承运公司代码 |
| vesselName | string | - | 船名 (可选) |
| voyageNumber | string | - | 航次号 (可选) |
| **stock** | number | ✓ | **新增: 库存数量，默认 99** |

**变更说明**:
- 新增 `stock` 字段，初始值为 99
- 库存为 0 时不可购买

---

### 3. Order（订单）

表示用户购买舱位的订单记录。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | ✓ | 订单号 (格式: ORD-YYYYMMDD-XXX) |
| userId | string | ✓ | 下单用户的用户名 |
| orderTime | string | ✓ | 下单时间 (ISO 8601 日期时间格式) |
| scheduleId | string | ✓ | 关联的船期编号 |
| departurePort | string | ✓ | 起运港代码 (冗余存储) |
| arrivalPort | string | ✓ | 目的港代码 (冗余存储) |
| etd | string | ✓ | 预计发运时间 (冗余存储) |
| transitDays | number | ✓ | 运输耗时 (冗余存储) |
| carrier | string | ✓ | 承运公司 (冗余存储) |

**设计决策**:
- 订单中冗余存储船期信息，确保历史订单数据完整性
- 即使船期数据变更，已下单的订单信息保持不变

**订单号生成规则**:
- 格式: `ORD-YYYYMMDD-XXX`
- 示例: `ORD-20260109-001`, `ORD-20260109-002`
- XXX: 当日序号，从 001 开始递增

---

## 状态转换

### 用户登录状态

```mermaid
stateDiagram-v2
    [*] --> 未登录: 打开应用
    未登录 --> 已登录: 登录成功
    已登录 --> 未登录: 登出
    已登录 --> 未登录: 关闭浏览器
    未登录 --> 未登录: 登录失败
```

### 船期库存状态

```mermaid
stateDiagram-v2
    [*] --> 有库存: 初始化(stock=99)
    有库存 --> 有库存: 购买(stock>1)
    有库存 --> 无库存: 购买(stock=1)
    无库存 --> 无库存: 无法购买
```

### 购买流程

```mermaid
sequenceDiagram
    participant U as 用户
    participant UI as 船期列表
    participant D as 确认弹窗
    participant S as 服务层
    participant L as localStorage

    U->>UI: 点击"购买"按钮
    UI->>D: 显示确认弹窗
    U->>D: 确认购买
    D->>S: 调用购买服务
    S->>S: 检查库存
    alt 库存充足
        S->>S: 扣减库存
        S->>S: 创建订单
        S->>L: 持久化数据
        S->>UI: 返回成功
        UI->>U: 显示成功提示
    else 库存不足
        S->>UI: 返回失败
        UI->>U: 显示库存不足提示
    end
```

---

## 数据存储

### 存储位置

| 数据 | 存储方式 | 说明 |
|------|----------|------|
| 用户数据 | 静态 JSON 文件 | `src/assets/data/users.json` |
| 船期数据(初始) | 静态 JSON 文件 | `src/assets/data/schedules.json` |
| 船期数据(运行时) | localStorage | key: `schedules` |
| 订单数据 | localStorage | key: `orders` |
| 登录状态 | sessionStorage | key: `currentUser` |

### localStorage 数据结构

```typescript
// key: "schedules"
// value: ShippingSchedule[] (包含 stock 字段)

// key: "orders"  
// value: Order[]

// key (sessionStorage): "currentUser"
// value: User (当前登录用户)
```

---

## 验证规则

### 用户登录

| 规则 | 说明 |
|------|------|
| 用户名必填 | 不能为空字符串 |
| 密码必填 | 不能为空字符串 |
| 用户名存在 | 必须在用户列表中存在 |
| 密码匹配 | 密码必须与用户数据匹配 |

### 舱位购买

| 规则 | 说明 |
|------|------|
| 用户已登录 | 必须处于登录状态 |
| 库存充足 | stock > 0 |
| 用户确认 | 必须在确认弹窗中确认 |

### 订单查询

| 规则 | 说明 |
|------|------|
| 用户已登录 | 必须处于登录状态 |
| 归属验证 | 只能查询自己的订单 |
