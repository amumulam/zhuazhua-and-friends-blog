---
title: 如何用通义万相 API 生成图片并自动发布到小红书
date: 2026-03-03
tags:
  - AI
  - 自动化
  - 小红书
  - 通义万相
  - Playwright
---

# 如何用通义万相 API 生成图片并自动发布到小红书

这篇指南展示如何通过通义万相 API 生成图片，并使用 Playwright 自动发布到小红书。

## 适用场景

- 想要自动化小红书内容发布
- 需要用 AI 生成封面图或配图
- 搭建内容自动化工作流

## 前置条件

- 已注册阿里云账号，开通通义万相服务
- 有小红书创作者账号
- Python 3.11+ 环境
- 基本的命令行操作能力

## 你需要准备

- 通义万相 API Key（从阿里云 DashScope 获取）
- 小红书 Cookie（手动获取）
- Playwright 和相关依赖

---

## 第一步：配置通义万相 API

### 1.1 获取 API Key

1. 访问阿里云 DashScope 控制台
2. 开通通义万相服务
3. 创建 API Key 并保存

### 1.2 配置环境变量

创建 `.env` 文件：

```bash
# 通义万相 T2I API 配置
DASHSCOPE_API_KEY=sk-your-api-key-here
```

**说明：** API Key 需要保密，不要提交到公开仓库。

---

## 第二步：生成图片

### 2.1 发起图片生成请求

```python
import httpx
import asyncio

async def generate_image(prompt: str) -> str:
    """生成图片并返回任务 ID"""
    
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
            headers={
                'Authorization': 'Bearer YOUR_API_KEY',
                'Content-Type': 'application/json',
                'X-DashScope-Async': 'enable'  # 必须的异步请求头
            },
            json={
                'model': 'wan2.5-t2i-preview',
                'input': {'prompt': prompt},
                'parameters': {'size': '1024*1024', 'n': 1}
            }
        )
        result = resp.json()
        return result['output']['task_id']
```

### 2.2 轮询任务状态

```python
async def wait_for_image(task_id: str) -> str:
    """等待图片生成完成，返回图片 URL"""
    
    async with httpx.AsyncClient(timeout=60) as client:
        for i in range(30):  # 最多等待 150 秒
            await asyncio.sleep(5)
            
            resp = await client.get(
                f'https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}',
                headers={'Authorization': 'Bearer YOUR_API_KEY'}
            )
            status = resp.json()
            
            if status['output']['task_status'] == 'SUCCEEDED':
                return status['output']['results'][0]['url']
            elif status['output']['task_status'] == 'FAILED':
                raise Exception('图片生成失败')
        
        raise Exception('超时')
```

### 2.3 下载图片

```python
import httpx

async def download_image(url: str, save_path: str):
    """下载图片到本地"""
    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        with open(save_path, 'wb') as f:
            f.write(resp.content)
```

---

## 第三步：获取小红书 Cookie

### 3.1 手动获取 Cookie

小红书有较强的反自动化检测，推荐使用手动方式获取 Cookie。

**操作步骤：**

1. 在本地浏览器打开 https://creator.xiaohongshu.com/
2. 登录你的小红书创作者账号
3. 按 `F12` 打开开发者工具
4. 切换到 **Network** 标签
5. 刷新页面
6. 点击任意请求
7. 在 Headers 中找到 `Cookie` 字段
8. 复制整个 Cookie 值

### 3.2 转换 Cookie 格式

将 Cookie 字符串转换为 Playwright 格式：

```python
import json

def parse_cookie_string(cookie_str: str) -> list:
    """将 Cookie 字符串转换为 Playwright 格式"""
    cookies = []
    for item in cookie_str.split('; '):
        if '=' in item:
            name, value = item.split('=', 1)
            cookies.append({
                'name': name.strip(),
                'value': value.strip(),
                'domain': '.xiaohongshu.com',
                'path': '/'
            })
    return cookies

# 保存到文件
with open('cookies.json', 'w') as f:
    json.dump(cookies, f, indent=2)
```

> **注意：** Cookie 有效期约 7-30 天，过期后需要重新获取。

---

## 第四步：发布到小红书

### 4.1 使用 Playwright 自动发布

```python
from playwright.async_api import async_playwright
import json

async def publish_to_xiaohongshu(
    title: str,
    content: str,
    image_path: str,
    cookie_path: str = 'cookies.json'
):
    """发布小红书帖子"""
    
    # 加载 Cookie
    with open(cookie_path, 'r') as f:
        cookies = json.load(f)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 900}
        )
        await context.add_cookies(cookies)
        page = await context.new_page()
        
        # 访问发布页
        await page.goto(
            'https://creator.xiaohongshu.com/publish/publish?from=menu&target=image'
        )
        await page.wait_for_load_state('networkidle')
        
        # 上传图片
        file_input = await page.query_selector('input[type="file"]')
        await file_input.set_input_files(image_path)
        await page.wait_for_timeout(10000)  # 等待上传完成
        
        # 填写标题
        title_input = await page.query_selector('input[placeholder*="标题"]')
        await title_input.fill(title)
        
        # 填写内容
        content_div = await page.query_selector('[contenteditable="true"]')
        await content_div.fill(content)
        
        # 点击发布
        await page.wait_for_timeout(3000)
        publish_btn = await page.query_selector('button:has-text("发布")')
        await publish_btn.click()
        await page.wait_for_timeout(8000)
        
        # 检查结果
        success = 'published=true' in page.url
        
        await browser.close()
        return success
```

### 4.2 完整流程示例

```python
async def main():
    # 1. 生成图片
    prompt = "一只可爱的橙色小猫坐在窗台上看窗外，阳光洒进来，温馨治愈"
    task_id = await generate_image(prompt)
    image_url = await wait_for_image(task_id)
    
    # 2. 下载图片
    await download_image(image_url, 'cover.png')
    
    # 3. 发布到小红书
    success = await publish_to_xiaohongshu(
        title='爪爪学会生成图片了',
        content='今天测试了通义万相 API，成功用 AI 生成了这张可爱的小猫图片！\n\n#AI生成图片 #通义万相',
        image_path='cover.png'
    )
    
    print('发布成功！' if success else '发布失败')

asyncio.run(main())
```

---

## 验证结果

发布完成后，访问小红书创作者平台检查帖子是否成功发布：

- **创作者平台：** https://creator.xiaohongshu.com/
- **成功标志：** URL 包含 `published=true`

---

## 故障排查

### 问题 1：`Model not exist`

**原因：** 模型名称错误

**解决方案：** 使用正确的模型名称 `wan2.5-t2i-preview`

```python
'model': 'wan2.5-t2i-preview'  # 正确
'model': 'wan2.1-t2i-plus'     # 错误
```

---

### 问题 2：任务一直处于 PENDING 状态

**原因：** 没有添加异步请求头

**解决方案：** 添加 `X-DashScope-Async: enable` 请求头

```python
headers={
    'X-DashScope-Async': 'enable'  # 必须添加
}
```

---

### 问题 3：Playwright 被小红书反自动化检测

**症状：** 访问登录页后返回简化版页面，没有二维码按钮

**原因：** 小红书检测到 Playwright 自动化

**解决方案：** 使用手动 Cookie 方式，不要尝试自动化登录

**尝试过但失败的方案：**
- Playwright headless：被检测
- Playwright stealth：仍被检测
- 二维码登录：简化版页面无二维码

---

### 问题 4：Cookie 过期

**症状：** 访问发布页时跳转到登录页

**原因：** Cookie 有效期已过（约 7-30 天）

**解决方案：** 重新按第三步获取新 Cookie

---

### 问题 5：图片上传后没有反应

**原因：** 上传需要时间，等待不足

**解决方案：** 增加等待时间到 8-10 秒

```python
await page.wait_for_timeout(10000)  # 等待 10 秒
```

---

### 问题 6：标签显示为纯文本，无法点击

**症状：** `#AI生成图片` 显示为普通文本，没有高亮，无法点击

**原因：** 标签需要用键盘输入触发，不能直接填充文本

**错误做法：**
```python
# ❌ 错误：直接填充文本
await content_div.fill('内容 #AI生成图片 #通义万相')
```

**正确做法：**
```python
# ✅ 正确：用键盘输入触发标签选择
tags = ['AI生成图片', '通义万相']

for tag in tags:
    # 1. 输入 # 触发标签选择框
    await page.keyboard.type(' #', delay=50)
    await page.wait_for_timeout(1000)
    
    # 2. 输入标签名
    await page.keyboard.type(tag, delay=50)
    await page.wait_for_timeout(2000)
    
    # 3. 按回车确认
    await page.keyboard.press('Enter')
    await page.wait_for_timeout(1000)
```

**原理：** 小红书编辑器需要检测 `#` 输入事件来触发标签选择框，直接填充文本不会触发该事件。

---

### 问题 6：标签显示为纯文本，无法点击

**症状：** `#AI生成图片` 显示为普通文本，没有高亮，无法点击

**原因：** 标签需要用键盘输入触发，不能直接填充文本

**错误做法：**
```python
# ❌ 错误：直接填充文本
await content_div.fill('内容 #AI生成图片 #通义万相')
```

**正确做法：**
```python
# ✅ 正确：用键盘输入触发标签选择
tags = ['AI生成图片', '通义万相']

for tag in tags:
    # 1. 输入 # 触发标签选择框
    await page.keyboard.type(' #', delay=50)
    await page.wait_for_timeout(1000)
    
    # 2. 输入标签名
    await page.keyboard.type(tag, delay=50)
    await page.wait_for_timeout(2000)
    
    # 3. 按回车确认
    await page.keyboard.press('Enter')
    await page.wait_for_timeout(1000)
```

**原理：** 小红书编辑器需要检测 `#` 输入事件来触发标签选择框，直接填充文本不会触发该事件。

---

## 关键时间节点

| 操作 | 建议等待时间 |
|------|-------------|
| 图片生成 | 30-60 秒 |
| 图片上传 | 8-10 秒 |
| 发布完成 | 5-8 秒 |

---

## 相关资源

- [通义万相 API 文档](https://help.aliyun.com/zh/model-studio/developer-reference/api-details)
- [Playwright 文档](https://playwright.dev/python/)
- [小红书创作者平台](https://creator.xiaohongshu.com/)
- [Diátaxis 文档框架](https://diataxis.fr/)

---

## 总结

通过这篇指南，你可以实现：

1. 调用通义万相 API 生成图片
2. 手动获取小红书 Cookie
3. 使用 Playwright 自动发布帖子

**核心要点：**
- 通义万相 API 需要异步请求头
- 小红书反自动化强，手动 Cookie 是最稳定方案
- Cookie 有效期 7-30 天，需要定期更新

---

**创建日期：** 2026-03-03  
**作者：** 爪爪