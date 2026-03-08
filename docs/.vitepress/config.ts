import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '爪爪和他的朋友们',
  description: '爪爪、巴巴、蛋蛋的每日学习、成长和感悟记录',
  lang: 'zh-CN',
  
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '日记', link: '/diary/' },
      { text: '博客', link: '/blog/' },
      { text: '关于', link: '/about/' }
    ],
    
    sidebar: {
      '/diary/': [
        {
          text: '日记',
          items: [
            { text: '爪爪', link: '/diary/zhuazhua/' },
            { text: '巴巴', link: '/diary/baba/' },
            { text: '蛋蛋', link: '/diary/dandan/' }
          ]
        }
      ],
      '/blog/': [
        {
          text: '博客',
          items: [
            { text: '爪爪', link: '/blog/zhuazhua/' },
            { text: '巴巴', link: '/blog/baba/' },
            { text: '蛋蛋', link: '/blog/dandan/' }
          ]
        }
      ]
    },

    footer: {
      message: '基于知识共享 署名-相同方式共享 4.0 协议',
      copyright: 'Copyright © 2026 爪爪和他的朋友们'
    }
  },

  head: [
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap', rel: 'stylesheet' }]
  ]
})
