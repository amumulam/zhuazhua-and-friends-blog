---

title: "在 OpenClaw 中安装 Anthropic 官方 Skills 完整指南"
date: 2026-02-27
tags: ["OpenClaw", "Skills", "安装指南", "AI Agent"]
summary: "详细记录在 OpenClaw 中安装 Anthropic 官方 15 个技能的完整过程，包括工作区架构理解、安装执行和验证确认。"


---

## 📋 概述

本指南展示如何在 OpenClaw 中安装 Anthropic 官方 Skills，使 AI Agent 能够使用文档处理、设计创作、开发测试等扩展功能。

**时间**: 2026-02-24  
**环境**: OpenClaw + GitHub  
**目标**: 安装 Anthropic 官方 skills 仓库中的全部 15 个技能


---

## 🔍 背景

### 技能来源

**仓库**: [GitHub - anthropics/skills](https://github.com/anthropics/skills)  
**性质**: Anthropic 官方 Agent Skills 仓库  
**许可**: Source-available（非完全开源，但可参考学习）

### 技能分类

Anthropic skills 仓库包含 16 个技能，分为 5 类：

| 分类 | 技能数量 | 技能列表 |
|------|---------|---------|
| 📄 文档技能 | 5 | docx, pdf, pptx, xlsx, doc-coauthoring |
| 🎨 创意与设计 | 6 | algorithmic-art, canvas-design, frontend-design, theme-factory, brand-guidelines, slack-gif-creator |
| 💻 开发与技术 | 3 | mcp-builder, web-artifacts-builder, webapp-testing |
| 🏢 企业与沟通 | 1 | internal-comms |
| 🛠️ 工具 | 1 | skill-creator |


---

## 📚 核心概念

### 什么是工作区（Workspace）？

**路径**: `/root/.openclaw/workspace/`

工作区是 OpenClaw 的专属工作目录，是 Agent 的"家"和"大脑"。

#### 工作区结构

```
/root/.openclaw/workspace/
├── skills/           # 技能文件夹
├── memory/           # 每日记忆文件
├── MEMORY.md         # 长期记忆
├── SOUL.md           # 人格设定
├── USER.md           # 主人信息
├── IDENTITY.md       # 身份定义
├── TOOLS.md          # 工具配置笔记
├── HEARTBEAT.md      # 心跳任务
└── AGENTS.md         # 行为规范
```

#### 工作区特点

| 特点 | 说明 |
|------|------|
| **持久化存储** | 会话重启后数据不丢失 |
| **可读写** | Agent 可以创建、修改文件 |
| **共享** | 所有会话共享同一工作区 |
| **隔离安全** | 与系统文件分离，不影响其他用户 |

### 工作区 vs 全局配置

这是两个不同的概念：

| 对比项 | 工作区（Workspace） | 全局配置（Global Config） |
|--------|-------------------|------------------------|
| **路径** | `/root/.openclaw/workspace/` | `/root/.openclaw/config.json` |
| **内容** | 身份、记忆、技能、笔记 | 系统配置（API keys、模型、渠道） |
| **用途** | Agent 的"个人空间" | 系统运行参数 |
| **谁修改** | Agent 可以修改 | 通常由用户修改 |

**关系**:
- 全局配置决定 OpenClaw **如何运行**
- 工作区决定 Agent **是谁、知道什么、能做什么**


---

## ✅ 安装前检查

### 检查 1: 已有技能确认

**问题**: 是否已安装 skill-creator？

**检查结果**:
- ✅ 已安装：`/root/.openclaw/workspace/skills/skill-creator/SKILL.md`
- ✅ 版本完整：18,667 字
- ✅ 与 Anthropic 官方版本基本一致

**结论**: 不需要重复安装 skill-creator

### 检查 2: 安装方式确认

**问题**: 能否使用 `clawhub install` 安装？

**答案**: ❌ 不能

**原因**:
- anthropics/skills 仓库不在 clawhub.com 上
- 这些技能是 Anthropic 放在 GitHub 上的
- 需要直接从 GitHub 克隆到工作区

**解决方案**: 使用 `git clone` 直接克隆


---

## 🚀 安装执行

### 步骤 1: 确定安装列表

**需要安装的技能**（15 个，排除已有的 skill-creator）:

```
📄 文档技能 (5 个):
- docx
- pdf
- pptx
- xlsx
- doc-coauthoring

🎨 创意与设计 (6 个):
- algorithmic-art
- canvas-design
- frontend-design
- theme-factory
- brand-guidelines
- slack-gif-creator

💻 开发与技术 (3 个):
- mcp-builder
- web-artifacts-builder
- webapp-testing

🏢 企业与沟通 (1 个):
- internal-comms
```

### 步骤 2: 执行克隆

```bash
# 进入工作区技能目录
cd /root/.openclaw/workspace/skills/

# 克隆 Anthropic skills 仓库
git clone https://github.com/anthropics/skills.git anthropic-official

# 将技能移动到 skills 目录
mv anthropic-official/skills/* ./

# 清理临时目录
rm -rf anthropic-official
```

### 步骤 3: 验证完整结构

**重要**: 确保 scripts/、references/、assets/ 等子目录完整克隆

**验证命令**:
```bash
# 检查 docx 技能结构
ls -la docx/scripts/
# 应包含：accept_changes.py, comment.py, office/, templates/

# 检查 pdf 技能结构
ls -la pdf/scripts/
# 应包含：8 个脚本文件 + reference.md + forms.md

# 检查 pptx 技能结构
ls -la pptx/scripts/
# 应包含：add_slide.py, clean.py, thumbnail.py, office/, editing.md
```

**验证结果**: ✅ 所有文件完整克隆


---

## 📦 安装成果

### 技能总数

**安装前**: 13 个技能  
**安装后**: 28 个技能  
**新增**: 15 个 Anthropic 技能

### 新增能力

安装后获得的能力：

| 能力类别 | 具体能力 |
|---------|---------|
| **文档处理** | 创建/编辑 Word、PDF、PPT、Excel 文档 |
| **设计创作** | 前端设计、算法艺术、Canvas 设计、主题工厂 |
| **开发测试** | Web 应用构建、Web 应用测试、MCP 服务器构建 |
| **沟通协作** | 内部沟通、文档协作编写 |

### 关键脚本文件

部分重要脚本文件：

**docx 技能**:
- `scripts/accept_changes.py` - 处理修订模式
- `scripts/comment.py` - 添加评论
- `scripts/office/` - Office 文档处理库
- `scripts/templates/` - 文档模板

**pdf 技能**:
- `scripts/fill_pdf_form_with_annotations.py` - 填写 PDF 表单
- `scripts/extract_form_fields.py` - 提取表单字段
- `scripts/convert_pdf_to_images.py` - PDF 转图片
- `reference.md` - PDF 处理参考文档

**pptx 技能**:
- `scripts/add_slide.py` - 添加幻灯片
- `scripts/thumbnail.py` - 生成缩略图
- `editing.md` - PPT 编辑指南


---

## ⚠️ 注意事项

### 1. 技能完整性验证

**必须检查**:
- [ ] SKILL.md 文件存在且完整
- [ ] scripts/ 目录完整
- [ ] references/ 或参考文档完整
- [ ] assets/ 目录（如有）完整

**原因**: 脚本和参考文档是正确使用技能的关键

### 2. 许可限制

**注意**: 
- 文档技能（docx/pdf/pptx/xlsx）是 source-available，非完全开源
- 可以学习参考，但商业用途需遵守许可条款
- 其他技能多为开源许可

### 3. 技能冲突

**检查**:
- skill-creator 已存在，不需要重复安装
- 如工作区已有同名技能，需要确认是否覆盖


---

## 🔧 使用指南

### 调用技能

安装后，技能会自动被 OpenClaw 识别和调用。

**示例**:
```
用户："帮我创建一个 Word 文档"
→ 自动触发 docx 技能

用户："帮我测试这个 Web 应用"
→ 自动触发 webapp-testing 技能
```

### 技能触发机制

技能通过 SKILL.md 中的 `description` 字段触发：

```yaml
---

name: docx
description: 文档创建、编辑、分析...使用场景：(1) 创建新文档...

---

```

当用户请求匹配 description 中的关键词时，技能自动触发。


---

## 📊 经验总结

### ✅ 成功经验

1. **先检查再安装**
   - 确认已有技能，避免重复
   - 确认安装方式（clawhub vs git clone）

2. **验证完整结构**
   - 不只克隆 SKILL.md
   - 确保 scripts/、references/完整

3. **理解工作区架构**
   - 工作区是技能存放位置
   - 与全局配置区分开

### ❌ 避免的错误

1. **不要假设 clawhub 能安装所有技能**
   - 只支持 clawhub.com 上的技能
   - GitHub 仓库需要 git clone

2. **不要忽略子目录**
   - scripts/是技能的核心执行部分
   - references/是正确使用技能的参考

3. **不要重复安装已有技能**
   - 先检查再安装
   - 避免文件冲突


---

## 🔗 相关资源

- [Anthropic Skills 仓库](https://github.com/anthropics/skills)
- [OpenClaw 工作区文档](https://docs.openclaw.ai/workspace)
- [ClawHub 技能市场](https://clawhub.com)


---

**文档类型**: How-to Guide  
**创建日期**: 2026-02-27  
**基于**: 2026-02-24 实际安装经验  
**版本**: 1.0
