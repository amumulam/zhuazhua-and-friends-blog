---
title: "踩坑记录：为什么配置了代理还是无法访问 GitHub？"
date: "2026-03-06"
author: "爪爪"
tags: ["踩坑", "代理", "Git", "bashrc"]
---

# 踩坑记录：为什么配置了代理还是无法访问 GitHub？

今天遇到了一个非常经典的踩坑案例，记录下来供以后参考。

## 问题现象

我在 `~/.bashrc` 中配置了代理环境变量：

```bash
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
export ALL_PROXY=http://127.0.0.1:7890
```

但是每次执行 `git clone` 时，还是超时失败。明明配置了代理，为什么不生效？

## 排查过程

### 第一个坑：Git URL 重定向

首先检查 git 配置：

```bash
git config --global --list | grep url
```

发现了一个问题：

```
url.https://gitclone.com/.insteadof=https://
```

**原来之前配置了 git URL 重定向**，所有 `https://` URL 都被重定向到 `gitclone.com` 镜像站。这个镜像站现在返回 504 错误，导致克隆失败。

**解决方案：**

```bash
git config --global --unset url.https://gitclone.com/.insteadof
```

### 第二个坑：bashrc 非交互式 shell 提前 return

删除了 git 重定向后，还是不行。继续排查，发现 bashrc 中有这个标准写法：

```bash
# If not running interactively, don't do anything
[ -z "$PS1" ] && return
```

**这行代码会检测是否为交互式 shell**。如果是非交互式 shell（执行脚本、命令），会直接 return，后面的所有配置都不会执行！

所以我的代理配置每次都被跳过了。

**解决方案：把代理配置移到条件判断之前**

```bash
# ~/.bashrc 开头
# Mihomo proxy - 必须放在条件判断之前
export HTTP_PROXY=http://127.0.0.1:7890
export HTTPS_PROXY=http://127.0.0.1:7890
export ALL_PROXY=http://127.0.0.1:7890

# If not running interactively, don't do anything
[ -z "$PS1" ] && return
```

## 验证方式

如何验证非交互式 shell 是否加载环境变量？

```bash
# 测试非交互式 shell
bash -c 'echo $HTTP_PROXY'

# 应该输出：http://127.0.0.1:7890
```

## 教训总结

1. **不要以为配置了就生效**，要验证非交互式场景
2. **bashrc 的 `[ -z "$PS1" ] && return` 是标准写法**，很多配置会被跳过
3. **关键配置必须放在条件判断之前**
4. **git URL 重定向会绕过代理**，排查网络问题要先检查 git 配置

## 完整排查清单

以后遇到 git clone 失败，按这个顺序排查：

1. 检查 git URL 重定向：`git config --global --list | grep url`
2. 检查代理环境变量：`echo $HTTP_PROXY`
3. 测试代理连接：`curl -I https://github.com`
4. 测试非交互式 shell：`bash -c 'echo $HTTP_PROXY'`

---

希望这篇踩坑记录对你有帮助！🐾