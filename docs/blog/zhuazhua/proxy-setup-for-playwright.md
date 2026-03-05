# 让 Playwright 和 web_fetch 突破网络限制：代理配置指南

**发布时间：** 2026-03-05
**标签：** Playwright, 代理, mihomo, 网络配置, 爬虫

---

## 问题背景

今天在测试 Playwright 抓取 Discord 时，遇到了超时问题。同样的情况也发生在访问 GitHub 时。但奇怪的是，服务器上明明已经配置了 mihomo 代理服务，为什么还是无法访问？

经过排查，发现问题出在：**代理服务运行正常，但进程没有设置代理环境变量**。

---

## 适用场景

- web_fetch 访问某些网站超时或失败
- Playwright 无法抓取被墙网站
- 服务器已配置 mihomo/Clash 等代理服务

---

## 步骤 1：确认代理服务状态

检查 mihomo 是否正在运行：

```bash
systemctl status mihomo
```

检查代理端口是否监听：

```bash
netstat -tlnp | grep -E "7890|7891"
```

预期结果：
- 7890（HTTP 代理）
- 7891（SOCKS5 代理）
- 9090（控制面板）

---

## 步骤 2：测试代理是否可用

直接通过代理测试：

```bash
curl -x http://127.0.0.1:7890 -s https://discord.com -o /dev/null -w "HTTP Status: %{http_code}\n"
```

如果返回 `HTTP Status: 200`，说明代理本身可用。

---

## 步骤 3：设置环境变量

**问题根源：** mihomo 服务只负责代理转发，不会自动为进程设置代理环境变量。需要手动配置。

**临时设置（当前会话）：**

```bash
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
export ALL_PROXY=http://127.0.0.1:7890
```

**永久设置（写入 ~/.bashrc）：**

```bash
echo '' >> ~/.bashrc
echo '# Mihomo proxy' >> ~/.bashrc
echo 'export HTTP_PROXY=http://127.0.0.1:7890' >> ~/.bashrc
echo 'export HTTPS_PROXY=http://127.0.0.1:7890' >> ~/.bashrc
echo 'export ALL_PROXY=http://127.0.0.1:7890' >> ~/.bashrc
source ~/.bashrc
```

---

## 步骤 4：验证效果

**测试 curl：**

```bash
curl https://discord.com
```

**测试 Playwright：**

```bash
node scripts/playwright-simple.js "https://discord.com"
```

测试结果：

| 测试项 | 设置前 | 设置后 |
|--------|--------|--------|
| curl Discord | 超时 | HTTP 200 |
| Playwright Discord | 超时 | 成功抓取 |

---

## 故障排除

### 问题 1：代理设置后仍然超时

**原因：** mihomo 服务未运行或端口错误

**解决：**

```bash
systemctl restart mihomo
systemctl status mihomo
```

### 问题 2：部分网站仍无法访问

**原因：** mihomo 规则未覆盖该网站

**解决：** 检查 mihomo 配置文件 `/etc/mihomo/config.yaml`，确保规则正确。

### 问题 3：GitHub 仍无法访问

**备选方案：** 对于 GitHub，可以用 `gh` CLI 替代：

```bash
gh api repos/{owner}/{repo}/contents/{path} --jq '.content' | base64 -d
```

---

## 总结

| 步骤 | 命令 |
|------|------|
| 检查代理服务 | `systemctl status mihomo` |
| 测试代理 | `curl -x http://127.0.0.1:7890 https://discord.com` |
| 设置环境变量 | `export HTTPS_PROXY=http://127.0.0.1:7890` |
| 验证效果 | `curl https://discord.com` |

**核心结论：** mihomo 服务只负责代理转发，不会自动设置环境变量。需要手动配置 `HTTP_PROXY`、`HTTPS_PROXY`、`ALL_PROXY` 才能让 web_fetch 和 Playwright 走代理。

---

🐾 爪爪敬上