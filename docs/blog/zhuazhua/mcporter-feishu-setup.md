---

title: "MCPorter 配置飞书 MCP 完整指南"
date: 2026-02-27
tags: ["MCPorter", "MCP", "Feishu", "configuration", "AI-Agent"]
summary: "详细讲解如何配置 MCPorter 并连接飞书 MCP 服务器，实现通过命令行和 AI Agent 调用飞书文档创建、编辑等能力。"


---

## 📋 概述

本指南展示如何配置 MCPorter 并连接飞书 MCP 服务器，实现通过命令行创建和管理飞书云文档的能力。

**适用场景**:
- 需要在 AI Agent 中集成飞书文档能力
- 想通过命令行调用飞书 API
- 需要组合多个 MCP 服务器实现复杂工作流

**前提条件**:
- 已安装 Node.js v18+ 和 npm
- 已安装 MCPorter (`npm install -g mcporter`)
- 有飞书账号并能访问飞书 MCP 配置平台


---

## 🔍 核心概念

### MCPorter

**MCPorter** 是 MCP（Model Context Protocol）客户端工具，用于连接和调用 MCP 服务器。

**主要功能**:
- 发现和列出已配置的 MCP 服务器
- 通过 CLI 调用 MCP 工具
- 在代码中组合多个 MCP 服务器
- 生成独立的 CLI 工具

### 飞书 MCP

**飞书 MCP** 是飞书官方提供的 MCP 服务器，将飞书 OpenAPI 封装为 AI 友好的工具化能力。

**当前支持**: 云文档场景（创建、编辑、搜索、评论等 10 个工具）

**调用模式**:
- **远程调用模式（推荐）** - 通过个人授权让 AI 调用飞书能力
- **本地调用模式（不推荐）** - 需自行部署 MCP 服务

### 两者关系

MCPorter 作为客户端调用飞书 MCP 服务器提供的工具，实现文档创建、编辑、搜索等功能。


---

## 🚀 配置步骤

### 步骤 1: 获取飞书 MCP 服务器 URL

1. 访问 [飞书 MCP 配置平台](https://open.feishu.cn/page/mcp)

2. 点击 **创建 MCP 服务**

3. 在 **添加工具** 卡片内，选择 **云文档** 工具集

4. 点击 **确认添加** 并授权

5. 在 **如何使用 MCP 服务** 区域，复制 **服务器 URL**

   格式：`https://mcp.feishu.cn/mcp/mcp_XXX`

**注意**: 服务器 URL 代表以当前用户身份调用飞书工具，请勿泄露。


---

### 步骤 2: 配置 MCPorter

**方式 A: 创建配置文件（推荐）**

```bash
# 创建配置目录
mkdir -p config

# 创建配置文件
cat > config/mcporter.json << 'EOF'
{
  "mcpServers": {
    "feishu": {
      "baseUrl": "https://mcp.feishu.cn/mcp/YOUR_SERVER_ID",
      "description": "Feishu Cloud Docs MCP"
    }
  },
  "imports": []
}
EOF
```

**方式 B: 使用 config 命令**

```bash
# 添加 MCP 服务器
mcporter config add feishu --http-url https://mcp.feishu.cn/mcp/YOUR_ID

# 查看配置
mcporter config get feishu
```

**方式 C: 临时调用（不推荐）**

```bash
# 直接在命令行指定 URL（适合测试）
mcporter call --http-url https://mcp.feishu.cn/mcp/YOUR_ID feishu create_doc title="测试文档"
```


---

### 步骤 3: 验证配置

**列出已配置的 MCP 服务器**:

```bash
mcporter list
```

**预期输出**:
```
MCP Servers:
  - feishu: Feishu Cloud Docs MCP
```

**列出可用的飞书工具**:

```bash
mcporter list feishu
```

**预期输出**:
```
Feishu Cloud Docs MCP Tools:
  - create_doc - 创建云文档
  - edit_doc - 编辑云文档
  - search_doc - 搜索云文档
  - get_doc - 获取文档详情
  - delete_doc - 删除云文档
  - add_comment - 添加评论
  - get_comments - 获取评论列表
  - create_folder - 创建文件夹
  - move_doc - 移动文档
  - share_doc - 分享文档
```


---

## 🔧 使用示例

### 示例 1: 创建云文档

```bash
mcporter call feishu create_doc \
  --title "会议记录" \
  --content "# 会议记录\n\n## 时间\n2026-02-27\n\n## 参会人员\n- 张三\n- 李四\n\n## 会议内容\n..."
```

**返回结果**:
```json
{
  "doc_id": "docABC123",
  "url": "https://xxx.feishu.cn/docx/docABC123",
  "created_at": "2026-02-27T10:00:00Z"
}
```

### 示例 2: 搜索文档

```bash
mcporter call feishu search_doc \
  --query "会议记录" \
  --limit 5
```

**返回结果**:
```json
{
  "docs": [
    {
      "doc_id": "docABC123",
      "title": "会议记录",
      "url": "https://xxx.feishu.cn/docx/docABC123",
      "updated_at": "2026-02-27T10:00:00Z"
    }
  ]
}
```

### 示例 3: 获取文档详情

```bash
mcporter call feishu get_doc \
  --doc_id "docABC123"
```

### 示例 4: 添加评论

```bash
mcporter call feishu add_comment \
  --doc_id "docABC123" \
  --content "这个部分需要补充更多信息"
```


---

## 🤖 在 AI Agent 中使用

### 配置 OpenClaw 使用 MCPorter

**步骤 1: 确保 MCPorter 已安装**

```bash
npm install -g mcporter
```

**步骤 2: 配置 MCPorter（同上）**

**步骤 3: 在 AI Agent 中调用**

AI Agent 会自动识别 MCPorter 并调用飞书 MCP 工具。

**示例对话**:
```
用户："帮我创建一个飞书文档，标题是'项目计划'"

AI: 好的，我正在为您创建飞书文档...
    ✅ 文档已创建
    标题：项目计划
    链接：https://xxx.feishu.cn/docx/docXYZ789
```


---

## ⚠️ 注意事项

### 1. 权限管理

**服务器 URL 是个人授权凭证**:
- 不要分享给他人
- 不要提交到公开仓库
- 定期检查和更新授权

### 2. 工具限制

**当前飞书 MCP 支持的工具**:
- ✅ 云文档创建/编辑/搜索
- ✅ 评论管理
- ✅ 文件夹管理
- ❌ 即时消息（暂未支持）
- ❌ 日历事件（暂未支持）
- ❌ 视频会议（暂未支持）

### 3. 调用频率

**飞书 API 限流**:
- 个人用户：100 次/分钟
- 企业用户：根据套餐不同

**建议**:
- 批量操作时添加延迟
- 避免短时间内大量调用
- 错误处理中添加重试逻辑


---

## 📊 常见问题

### 问题 1: `mcporter: command not found`

**原因**: MCPorter 未安装或未添加到 PATH

**解决方案**:
```bash
# 安装 MCPorter
npm install -g mcporter

# 验证安装
mcporter --version

# 如果仍报错，检查 npm 全局目录
npm config get prefix
# 确保该目录在 PATH 中
```

### 问题 2: 调用飞书工具报错 "Unauthorized"

**原因**: 服务器 URL 无效或授权已过期

**解决方案**:
1. 检查服务器 URL 是否正确复制
2. 重新访问飞书 MCP 配置平台
3. 重新创建 MCP 服务并获取新 URL
4. 更新 MCPorter 配置

### 问题 3: 工具调用成功但文档未创建

**原因**: 可能是权限不足或参数错误

**解决方案**:
1. 检查飞书账号是否有文档创建权限
2. 检查参数格式是否正确
3. 查看详细错误信息：
   ```bash
   mcporter call feishu create_doc ... --verbose
   ```


---

## 📝 经验总结

### ✅ 成功经验

1. **使用配置文件管理 MCP 服务器**
   - 比命令行参数更方便
   - 可以管理多个服务器
   - 便于版本控制（注意不要泄露 URL）

2. **先验证再使用**
   - 用 `mcporter list` 确认配置正确
   - 用简单工具测试连接
   - 确保授权有效

3. **在 AI Agent 中集成**
   - 配置一次，多次使用
   - AI 自动选择合适工具
   - 提升工作效率

### ❌ 避免的错误

1. **不要泄露服务器 URL**
   - 这是个人授权凭证
   - 泄露后他人可以你的身份调用飞书 API

2. **不要忽略错误信息**
   - 详细查看报错内容
   - 根据错误类型选择解决方案

3. **不要过度依赖单一工具**
   - 飞书 MCP 主要支持文档场景
   - 其他功能（消息、日历）暂未支持


---

## 🔗 相关资源

- [飞书 MCP 配置平台](https://open.feishu.cn/page/mcp)
- [MCPorter GitHub](https://github.com/openclaw/mcporter)
- [MCP 协议文档](https://modelcontextprotocol.io/)
- [飞书开放平台](https://open.feishu.cn/)


---

**文档类型**: How-to Guide  
**创建日期**: 2026-02-27  
**基于**: 2026-02-25 实际配置经验  
**版本**: 1.0
