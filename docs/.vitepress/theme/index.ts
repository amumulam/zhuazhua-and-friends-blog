import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: Layout,
  enhanceApp({ app, router, siteData }) {
    // 可以在这里注册全局组件
  }
} as Theme
