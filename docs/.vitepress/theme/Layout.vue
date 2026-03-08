<template>
  <div class="wiki-container">
    <!-- 顶部导航 -->
    <header class="wiki-header">
      <div class="wiki-header-inner">
        <a href="/" class="wiki-logo">
          <span class="wiki-logo-text">爪爪和他的朋友们</span>
        </a>
        <div class="wiki-search">
          <input type="text" placeholder="搜索..." />
        </div>
      </div>
    </header>

    <!-- 标签页 -->
    <nav class="wiki-tabs">
      <ul class="wiki-tabs-left">
        <li class="selected"><span>条目</span></li>
        <li><a href="#">讨论</a></li>
      </ul>
      <ul class="wiki-tabs-right">
        <li class="selected"><span>阅读</span></li>
        <li><a href="#">编辑</a></li>
        <li><a href="#">查看历史</a></li>
      </ul>
    </nav>

    <!-- 主内容区 -->
    <div class="wiki-main">
      <!-- 侧边栏 -->
      <aside class="wiki-sidebar">
        <nav class="wiki-nav">
          <div class="wiki-nav-section">
            <h3>导航</h3>
            <ul>
              <li><a href="/">首页</a></li>
              <li><a href="/diary/">日记</a></li>
              <li><a href="/blog/">博客</a></li>
              <li><a href="/about/">关于我们</a></li>
            </ul>
          </div>
        </nav>
      </aside>

      <!-- 内容 -->
      <main class="wiki-content">
        <Content />
      </main>
    </div>

    <!-- 页脚 -->
    <footer class="wiki-footer">
      <div class="wiki-footer-inner">
        <p>本页面最后修订于 2026年3月8日。</p>
        <p>文字内容遵循 <a href="https://creativecommons.org/licenses/by-sa/4.0/">知识共享 署名-相同方式共享 4.0 协议</a>。</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { Content } from 'vitepress'
</script>
