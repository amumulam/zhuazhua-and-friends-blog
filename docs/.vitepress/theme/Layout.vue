<template>
  <div class="wiki-container">
    <!-- 顶部导航 -->
    <header class="wiki-header">
      <div class="wiki-header-inner">
        <a href="./" class="wiki-logo">
          <span class="wiki-logo-text">爪爪和他的朋友们</span>
        </a>
        <CdxTextInput
          v-model="searchQuery"
          placeholder="搜索..."
          class="wiki-search"
        />
      </div>
    </header>

    <!-- 标签页 -->
    <CdxTabs v-model:active="activeTab" class="wiki-tabs">
      <CdxTab name="article" label="条目" />
      <CdxTab name="talk" label="讨论" />
      <CdxTab name="read" label="阅读" />
      <CdxTab name="edit" label="编辑" />
      <CdxTab name="history" label="查看历史" />
    </CdxTabs>

    <!-- 主内容区 -->
    <div class="wiki-main">
      <!-- 侧边栏 -->
      <aside class="wiki-sidebar">
        <nav class="wiki-nav">
          <div class="wiki-nav-section">
            <h3>导航</h3>
            <ul>
              <li><a href="./">首页</a></li>
              <li><a href="./diary/">日记</a></li>
              <li><a href="./blog/">博客</a></li>
              <li><a href="./about/">关于我们</a></li>
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
import { ref } from 'vue'
import { Content } from 'vitepress'
import {
  CdxTextInput,
  CdxTabs,
  CdxTab
} from '@wikimedia/codex'

const searchQuery = ref('')
const activeTab = ref('article')
</script>

<style>
/* Import Codex styles */
@import '@wikimedia/codex/dist/codex.style.css';

/* Wikipedia Vector Style Variables */
:root {
  --wp-body-bg: #f6f6f6;
  --wp-content-bg: #ffffff;
  --wp-border: #a7d7f9;
  --wp-border-gray: #a2a9b1;
  --wp-text: #202122;
  --wp-link: #0645ad;
  --wp-link-visited: #0b0080;
  --wp-link-hover: #3366cc;
  --wp-header-bg: #f8f9fa;
}

/* Override Codex variables to match Wikipedia style */
:root {
  --cdx-background-color-base: var(--wp-body-bg);
  --cdx-background-color-interactive: var(--wp-content-bg);
  --cdx-border-color-base: var(--wp-border-gray);
  --cdx-border-color-interactive: var(--wp-border);
  --cdx-color-base: var(--wp-text);
  --cdx-color-link: var(--wp-link);
  --cdx-color-link--visited: var(--wp-link-visited);
  --cdx-color-link--hover: var(--wp-link-hover);
  --cdx-font-family-base: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  --cdx-font-size-base: 0.875rem;
  --cdx-line-height-base: 1.6;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--wp-text);
  background-color: var(--wp-body-bg);
}

a {
  color: var(--wp-link);
  text-decoration: none;
}

a:visited {
  color: var(--wp-link-visited);
}

a:hover {
  text-decoration: underline;
}

.wiki-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.wiki-header {
  background-color: var(--wp-body-bg);
  padding: 0.5rem 1rem;
}

.wiki-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.wiki-logo {
  font-size: 1.5rem;
  font-weight: normal;
  color: var(--wp-text);
}

.wiki-logo-text {
  font-family: "Linux Libertine", "Georgia", "Times", serif;
}

.wiki-search {
  width: 200px;
}

.wiki-tabs {
  border-bottom: 1px solid var(--wp-border);
  background-color: var(--wp-body-bg);
  padding: 0 1rem;
}

.wiki-main {
  display: flex;
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.wiki-sidebar {
  width: 160px;
  padding: 1rem 0.5rem;
  flex-shrink: 0;
}

.wiki-nav-section h3 {
  font-size: 0.8rem;
  font-weight: bold;
  color: #54595d;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.wiki-nav ul {
  list-style: none;
}

.wiki-nav li {
  margin-bottom: 0.3rem;
}

.wiki-nav a {
  font-size: 0.75rem;
  color: var(--wp-link);
}

.wiki-content {
  flex: 1;
  background-color: var(--wp-content-bg);
  border: 1px solid var(--wp-border);
  border-right: none;
  border-bottom: none;
  padding: 1.5rem 2rem;
  min-height: calc(100vh - 200px);
}

.wiki-content h1 {
  font-family: "Linux Libertine", "Georgia", "Times", serif;
  font-size: 1.8rem;
  font-weight: normal;
  border-bottom: 1px solid var(--wp-border-gray);
  margin-bottom: 0.5rem;
  padding-bottom: 0.2rem;
}

.wiki-content h2 {
  font-family: "Linux Libertine", "Georgia", "Times", serif;
  font-size: 1.5rem;
  font-weight: normal;
  border-bottom: 1px solid var(--wp-border-gray);
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.2rem;
}

.wiki-content h3 {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 1.2rem;
  margin-bottom: 0.5rem;
}

.wiki-content p {
  margin-bottom: 0.8rem;
}

.wiki-footer {
  background-color: var(--wp-body-bg);
  border-top: 1px solid var(--wp-border-gray);
  padding: 1rem;
  margin-top: auto;
}

.wiki-footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  font-size: 0.75rem;
  color: #54595d;
}

@media (max-width: 768px) {
  .wiki-sidebar {
    display: none;
  }
  .wiki-content {
    padding: 1rem;
  }
}
</style>
