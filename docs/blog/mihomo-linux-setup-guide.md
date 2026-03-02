# Linux 服务器 Mihomo 代理配置指南

**发布时间：** 2026-03-02
**标签：** Linux, Mihomo, 代理, 系统配置

---

## 概述

本指南帮助你在 Linux Ubuntu 服务器上配置 Mihomo（Clash.Meta）代理，实现科学上网。

**适用场景：**
- 云服务器需要访问 Google、GitHub 等海外资源
- 服务器需要拉取海外镜像、依赖包
- 开发环境需要稳定的代理服务

**前置条件：**
- Ubuntu Linux 服务器
- sudo 权限
- 已有机场订阅链接

---

## 快速安装

### 步骤 1：下载 Mihomo

```bash
# 确定系统架构
ARCH=$(uname -m | sed 's/aarch64/arm64/;s/x86_64/amd64/')

# 下载（使用 gh-proxy 加速）
wget -O mihomo.gz "https://gh-proxy.com/https://github.com/MetaCubeX/mihomo/releases/download/v1.19.20/mihomo-linux-${ARCH}-v1.19.20.gz"

# 解压并安装
gunzip mihomo.gz
chmod +x mihomo
sudo mv mihomo /usr/local/bin/mihomo

# 验证
mihomo -v
```

### 步骤 2：创建配置目录

```bash
sudo mkdir -p /etc/mihomo
```

### 步骤 3：下载 GeoIP 数据库

```bash
sudo wget -O /etc/mihomo/Country.mmdb https://gh-proxy.com/https://github.com/Dreamacro/maxmind-geoip/releases/latest/download/Country.mmdb
```

### 步骤 4：下载订阅配置

```bash
# 将订阅链接转换为 Clash 格式
SUB_URL="你的订阅链接"
ENCODED_URL=$(echo -n "$SUB_URL" | jq -sRr @uri)
sudo wget -O /etc/mihomo/config.yaml "https://api.dler.io/sub?target=clash&url=$ENCODED_URL"
```

### 步骤 5：创建系统服务

```bash
sudo tee /etc/systemd/system/mihomo.service > /dev/null << 'EOF'
[Unit]
Description=mihomo Daemon
After=network.target NetworkManager.service systemd-networkd.service
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/mihomo -d /etc/mihomo
Restart=always
RestartSec=5
LimitNOFILE=1048576
CapabilityBoundingSet=CAP_NET_ADMIN CAP_NET_BIND_SERVICE CAP_NET_RAW
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_BIND_SERVICE CAP_NET_RAW

[Install]
WantedBy=multi-user.target
EOF
```

### 步骤 6：启动服务

```bash
sudo systemctl daemon-reload
sudo systemctl enable mihomo
sudo systemctl start mihomo
sudo systemctl status mihomo
```

### 步骤 7：设置系统代理

```bash
# 添加到 .bashrc
echo 'export http_proxy=http://127.0.0.1:7890' >> ~/.bashrc
echo 'export https_proxy=http://127.0.0.1:7890' >> ~/.bashrc
echo 'export all_proxy=socks5://127.0.0.1:7890' >> ~/.bashrc
source ~/.bashrc
```

### 步骤 8：验证

```bash
curl -I https://www.google.com
```

成功返回 `HTTP/2 200` 表示配置完成。

---

## 常见问题解决

### 问题 1：下载链接返回 404

**症状：**
```
HTTP request sent, awaiting response... 404 Not Found
```

**原因：** 文件名格式已改变

**解决方案：**

| 来源 | 格式 | 示例 |
|------|------|------|
| ❌ 清华镜像 | 不同步 | 404 |
| ❌ GitHub 旧格式 | `mihomo-linux-amd64.gz` | 404 |
| ✅ GitHub 新格式 | `mihomo-linux-amd64-v1.19.20.gz` | 正常 |

使用带版本号的完整文件名。

### 问题 2：订阅配置解析失败

**症状：**
```
FATA[...] Parse config error: yaml: unmarshal errors:
  line 1: cannot unmarshal !!str `dmxlc3M...` into config.RawConfig
```

**原因：** 订阅链接返回的是 Base64 编码的 v2ray 格式，mihomo 需要 YAML 格式

**解决方案：** 使用订阅转换服务

```bash
# 方式 1：直接转换
sudo wget -O /etc/mihomo/config.yaml "https://api.dler.io/sub?target=clash&url=编码后的订阅链接"

# 方式 2：自动编码
sudo wget -O /etc/mihomo/config.yaml "https://api.dler.io/sub?target=clash&url=$(echo -n '订阅链接' | jq -sRr @uri)"
```

### 问题 3：服务频繁重启

**症状：** 服务启动后几秒就退出

**排查步骤：**

1. 查看日志
```bash
journalctl -u mihomo -n 50
```

2. 检查配置文件
```bash
mihomo -d /etc/mihomo -t  # 测试配置
```

3. 常见原因
   - GeoIP 数据库缺失
   - 订阅节点全部失效
   - 端口被占用

---

## 配置 Web 管理面板

### 步骤 1：下载面板文件

```bash
sudo apt update && sudo apt install -y unzip
sudo mkdir -p /etc/mihomo/ui
sudo wget -O /tmp/ui.zip https://gh-proxy.com/https://github.com/MetaCubeX/metacubexd/archive/refs/heads/gh-pages.zip
sudo unzip -o /tmp/ui.zip -d /tmp/
sudo cp -r /tmp/metacubexd-gh-pages/* /etc/mihomo/ui/
sudo rm -rf /tmp/ui.zip /tmp/metacubexd-gh-pages
```

### 步骤 2：修改配置

```bash
# 添加 external-ui
sudo sed -i '1i\external-ui: /etc/mihomo/ui' /etc/mihomo/config.yaml

# 监听所有接口
sudo sed -i 's/external-controller: 127.0.0.1:9090/external-controller: 0.0.0.0:9090/' /etc/mihomo/config.yaml

sudo systemctl restart mihomo
```

### 步骤 3：开放防火墙

**云服务器安全组规则：**

| 字段 | 值 |
|------|-----|
| 协议 | TCP |
| 端口 | 9090 |
| 来源 | 0.0.0.0/0 |
| 策略 | 允许 |

### 步骤 4：访问面板

```
http://你的服务器公网IP:9090/ui
```

**登录配置：**

| 字段 | 值 |
|------|-----|
| 后端地址 | `http://公网IP:9090` |
| 密钥 | 留空 |

---

## 常用操作

### 切换节点

```bash
# 查看当前节点
curl -s http://127.0.0.1:9090/proxies/Proxies | grep -o '"now":"[^"]*"'

# 切换节点
curl -X PUT http://127.0.0.1:9090/proxies/Proxies \
  -H "Content-Type: application/json" \
  -d '{"name":"日本东京"}'
```

### 更新订阅

```bash
SUB_URL="你的订阅链接"
ENCODED_URL=$(echo -n "$SUB_URL" | jq -sRr @uri)
sudo wget -O /etc/mihomo/config.yaml "https://api.dler.io/sub?target=clash&url=$ENCODED_URL"
sudo systemctl restart mihomo
```

### 查看流量

```bash
curl -s http://127.0.0.1:9090/connections
```

### 查看日志

```bash
journalctl -u mihomo -f
```

---

## 常用命令速查

| 命令 | 说明 |
|------|------|
| `mihomo -v` | 查看版本 |
| `sudo systemctl start mihomo` | 启动 |
| `sudo systemctl stop mihomo` | 停止 |
| `sudo systemctl restart mihomo` | 重启 |
| `sudo systemctl status mihomo` | 状态 |
| `journalctl -u mihomo -f` | 实时日志 |
| `mihomo -d /etc/mihomo -t` | 测试配置 |

---

## 附录：流量消耗说明

**结论：空闲时几乎不消耗流量**

| 状态 | 消耗 |
|------|------|
| 空闲 | 几乎为 0 |
| UrlTest 测速 | 约 2KB/次（默认 30 分钟一次） |
| 实际使用 | 按实际流量 |

---

**参考资源：**
- [Mihomo GitHub](https://github.com/MetaCubeX/mihomo)
- [订阅转换服务](https://api.dler.io)
- [在线面板](https://metacubexd.pages.dev/)