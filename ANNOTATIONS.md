# 项目文件注释 / Project File Annotations

> 本文件详细说明 `2025-blog-80oldcar` 博客项目中每个文件和目录的作用。
> This file documents the purpose of each file and directory in the blog project.

---

## 📁 根目录配置文件 (Root Config Files)

| 文件 | 作用 |
|------|------|
| `package.json` | **项目依赖清单** - 定义了所有 npm 依赖（包括 Next.js, React, TailwindCSS, zustand 状态管理等）和构建脚本 |
| `pnpm-lock.yaml` | **pnpm 锁定文件** - 确保团队成员安装相同版本的依赖 |
| `next.config.ts` | **Next.js 配置** - 设置 Turbopack、React Compiler、SVG 导入支持、页面重定向等 |
| `tsconfig.json` | **TypeScript 配置** - TypeScript 编译器的配置 |
| `wrangler.toml` | **Cloudflare Pages 部署配置** - 定义部署到 Cloudflare Pages 的构建命令和资源绑定 |
| `global.d.ts` | **全局类型声明** - 为 Node.js 环境提供全局类型定义 |
| `postcss.config.mjs` | **PostCSS 配置** - 处理 Tailwind CSS 的 CSS 转换 |
| `.npmrc` | **npm/pnpm 配置** - 包管理器的配置 |
| `.prettierrc` / `.prettierignore` | **Prettier 代码格式化配置** |
| `.gitignore` / `.gitattributes` | **Git 配置** - 指定忽略的文件和 Git 属性 |
| `LICENSE` | **开源协议** - MIT 许可证 |
| `README.md` | **项目说明文档** |

---

## 📁 `src/` 目录结构

### 🏠 `src/app/` - Next.js App Router 页面

#### `(home)` - 首页模块
> 包含首页所有的卡片组件和配置面板

| 文件 | 作用 |
|------|------|
| `page.tsx` | **首页主页面** - 组合所有卡片组件（打招呼、艺术、时钟、日历、社交按钮等）并支持拖拽编辑布局 |
| `home-draggable-layer.tsx` | **可拖拽图层** - 实现首页卡片的拖拽定位功能 |
| `stores/config-store.ts` | **配置状态管理** - 使用 Zustand 管理站点配置（主题颜色、网站内容、卡片样式等） |
| `stores/layout-edit-store.ts` | **布局编辑状态** - 管理首页布局编辑模式的开启/保存/取消 |
| `services/push-site-content.ts` | **推送站点配置** - 将站点配置（site-content.json）推送到 GitHub |
| `config-dialog/` | **配置弹窗** - 整个配置面板的容器组件 |
| `config-dialog/index.tsx` | **配置弹窗入口** - 主配置弹窗 |
| `config-dialog/color-config.tsx` | **颜色配置** - 设置主题颜色 |
| `config-dialog/home-layout.tsx` | **首页布局编辑** - 拖拽调整卡片位置 |
| `config-dialog/site-settings/index.tsx` | **网站设置** - 包含所有子设置的入口 |
| `config-dialog/site-settings/site-meta-form.tsx` | **站点元信息** - 设置标题、描述、博主名称 |
| `config-dialog/site-settings/background-images-section.tsx` | **背景图片** - 上传和选择背景图 |
| `config-dialog/site-settings/art-images-section.tsx` | **艺术图片** - 上传和选择艺术图（显示在首页） |
| `config-dialog/site-settings/favicon-avatar-upload.tsx` | **头像和图标** - 上传博主头像和网站 favicon |
| `config-dialog/site-settings/hat-section.tsx` | **帽子装饰** - 选择首页帽子装饰 |
| `config-dialog/site-settings/beian-form.tsx` | **备案信息** - 设置网站备案号 |
| `config-dialog/site-settings/social-buttons-section.tsx` | **社交按钮** - 配置社交链接（GitHub、邮箱等） |
| `config-dialog/site-settings/types.ts` | **类型定义** - 配置相关的 TypeScript 类型 |
| **`card-styles/`** | **各类卡片组件** |
| `hi-card.tsx` | **打招呼卡片** - 显示博主名称和问候语 |
| `art-card.tsx` | **艺术卡片** - 显示一张艺术图片 |
| `clock-card.tsx` | **时钟卡片** - 显示实时时间（可显示秒） |
| `calendar-card.tsx` | **日历卡片** - 显示当前日期和星期 |
| `social-buttons.tsx` | **社交按钮组** - 显示社交媒体链接 |
| `share-card.tsx` | **分享卡片** - 分享按钮集合 |
| `aritcle-card.tsx` | **文章卡片** - 显示最新文章 |
| `write-buttons.tsx` | **写作按钮** - 快捷入口到写作页面 |
| `hat-card.tsx` | **帽子卡片** - 显示装饰性帽子 |
| `beian-card.tsx` | **备案卡片** - 显示备案信息 |
| `like-position.tsx` | **点赞位置** - 控制点赞按钮在页面的位置 |
| `like-button.tsx` | **点赞按钮** - 在文章页面显示的点赞组件 |

#### `blog/` - 文章列表页
| 文件 | 作用 |
|------|------|
| `page.tsx` | **文章列表页** - 按日/周/月/年/分类展示所有文章，支持编辑模式和批量删除 |
| `components/category-modal.tsx` | **分类弹窗** - 管理文章分类（添加、删除、排序） |
| `types.ts` | **文章类型定义** |
| `services/save-blog-edits.ts` | **保存文章编辑** - 将文章分类、删除等更改推送到 GitHub |
| `services/batch-delete-blogs.ts` | **批量删除** - 删除多篇文章 |

#### `blog/[id]/` - 文章详情页
| 文件 | 作用 |
|------|------|
| `page.tsx` | **文章详情页** - 渲染并展示单篇文章内容 |

#### `write/` - 写文章页面
| 文件 | 作用 |
|------|------|
| `page.tsx` | **写作页面入口** - 组合编辑器、侧边栏、操作按钮、预览 |
| `types.ts` | **写作相关类型定义** |
| `stores/write-store.ts` | **写作状态管理** - 管理表单数据（标题、内容、标签等） |
| `stores/preview-store.ts` | **预览状态管理** - 控制预览模式的开关 |
| `hooks/use-load-blog.ts` | **加载文章** - 编辑时从 GitHub 加载已有文章 |
| `hooks/use-write-data.ts` | **写作数据管理** - 处理文章数据和保存逻辑 |
| `hooks/use-publish.ts` | **发布逻辑** - 处理文章发布到 GitHub |
| `components/editor.tsx` | **Markdown 编辑器** - 富文本编辑组件 |
| `components/preview.tsx` | **预览面板** - 实时预览 Markdown 渲染效果 |
| `components/sidebar.tsx` | **写作侧边栏** - 包含元数据设置（封面、标签、分类等） |
| `components/actions.tsx` | **操作按钮** - 保存、发布、删除按钮 |
| `components/sections/cover-section.tsx` | **封面设置** - 上传和选择文章封面图 |
| `components/sections/images-section.tsx` | **图片管理** - 文章内嵌图片管理 |
| `components/sections/meta-section.tsx` | **元数据设置** - 标题、slug、日期、分类、标签 |
| `components/ui/tag-input.tsx` | **标签输入组件** - 输入和选择标签 |
| `services/push-blog.ts` | **推送文章** - 将文章保存到 GitHub |
| `services/delete-blog.ts` | **删除文章** - 从 GitHub 删除文章 |

#### `about/` - 关于页面
| 文件 | 作用 |
|------|------|
| `page.tsx` | **关于页面** - 显示博主简介 |
| `services/push-about.ts` | **推送关于信息** - 将 about 内容推送到 GitHub |
| `list.json` | **关于页面的 JSON 数据** |

#### `projects/` - 项目展示页
| 文件 | 作用 |
|------|------|
| `page.tsx` | **项目列表页** - 展示个人项目 |
| `components/project-card.tsx` | **项目卡片** |
| `components/create-dialog.tsx` | **创建项目弹窗** |
| `components/image-upload-dialog.tsx` | **图片上传弹窗** |
| `services/push-projects.ts` | **推送项目列表** |
| `list.json` | **项目数据** |

#### `bloggers/` - 博主页面
| 文件 | 作用 |
|------|------|
| `page.tsx` | **博主列表页** - 展示博主信息 |
| `components/blogger-card.tsx` | **博主卡片** |
| `components/create-dialog.tsx` | **创建博主弹窗** |
| `components/avatar-upload-dialog.tsx` | **头像上传弹窗** |
| `services/push-bloggers.ts` | **推送博主信息** |
| `list.json` | **博主数据** |

#### `share/` - 分享页面
| 文件 | 作用 |
|------|------|
| `page.tsx` | **分享列表页** |
| `components/share-card.tsx` | **分享卡片** |
| `components/create-dialog.tsx` | **创建分享弹窗** |
| `components/logo-upload-dialog.tsx` | **Logo 上传弹窗** |
| `services/push-shares.ts` | **推送分享内容** |
| `list.json` | **分享数据** |

#### `pictures/` - 图片集页面
| 文件 | 作用 |
|------|------|
| `page.tsx` | **图片列表页** - 展示图片集 |
| `components/random-layout.tsx` | **随机布局** - 瀑布流或随机排列 |
| `components/upload-dialog.tsx` | **上传图片弹窗** |
| `services/push-pictures.ts` | **推送图片列表** |
| `list.json` | **图片数据** |

#### `snippets/` - 代码片段页面
| 文件 | 作用 |
|------|------|
| `page.tsx` | **代码片段页** |
| `services/push-snippets.ts` | **推送代码片段** |
| `list.json` | **代码片段数据** |

#### 其他页面
| 文件 | 作用 |
|------|------|
| `clock/page.tsx` | **全屏时钟页面** |
| `live2d/page.tsx` | **Live2D 页面** - 二次元角色展示 |
| `live2d/live2d-viewer.tsx` | **Live2D 渲染组件** |
| `image-toolbox/page.tsx` | **图片工具箱** - 可能是图片处理工具 |
| `svgs/page.tsx` | **SVG 展示页** |
| `rss.xml/route.ts` | **RSS 订阅源** - 生成博客 RSS |
| `sitemap.ts` | **站点地图** - 生成 sitemap.xml |

---

### 🧩 `src/components/` - 通用组件

| 文件 | 作用 |
|------|------|
| `card.tsx` | **通用卡片组件** - 博客中使用的卡片基础样式 |
| `nav-card.tsx` | **导航卡片** - 侧边导航 |
| `blog-sidebar.tsx` | **文章侧边栏** |
| `blog-toc.tsx` | **文章目录** - 标题导航 |
| `blog-preview.tsx` | **文章预览** |
| `code-block.tsx` | **代码块组件** - 语法高亮 |
| `markdown-image.tsx` | **Markdown 图片处理** |
| `color-picker.tsx` / `color-picker-panel.tsx` | **颜色选择器** |
| `dialog-modal.tsx` | **对话框/模态框** |
| `editable-star-rating.tsx` | **可编辑星级评分** |
| `star-rating.tsx` | **星级评分显示** |
| `scroll-top-button.tsx` | **返回顶部按钮** |
| `music-card.tsx` | **音乐播放卡片** |
| `select.tsx` | **选择器组件** |
| `wip.tsx` | **WIP（Work In Progress）占位组件** |
| `liquid-grass/index.tsx` | **液体草地动画效果** |

---

### 🧠 `src/hooks/` - React Hooks

| 文件 | 作用 |
|------|------|
| `use-auth.ts` | **认证 Hook** - 管理 GitHub App 私钥和 token |
| `use-blog-index.ts` | **文章索引 Hook** - 获取和缓存文章列表 |
| `use-categories.ts` | **分类 Hook** - 获取文章分类 |
| `use-read-articles.ts` | **已读标记 Hook** - 跟踪已读文章 |
| `use-center.ts` | **居中布局 Hook** |
| `use-size.ts` | **屏幕尺寸 Hook** - 响应式布局判断 |
| `use-markdown-render.tsx` | **Markdown 渲染 Hook** - 处理 Markdown 转 HTML |

---

### 🔧 `src/lib/` - 核心工具库

| 文件 | 作用 |
|------|------|
| `github-client.ts` | **GitHub API 客户端** - 封装所有 GitHub API 调用（文件读写、JWT 签发、Token 获取等） |
| `auth.ts` | **认证工具** - GitHub App 认证流程、JWT 签发、私钥缓存 |
| `load-blog.ts` | **加载文章** - 从 GitHub 加载 Markdown 文章 |
| `blog-index.ts` | **文章索引** - 管理文章列表数据 |
| `markdown-renderer.ts` | **Markdown 渲染器** - 配置 marked 库和代码高亮 |
| `aes256-util.ts` | **AES256 加密工具** - 加密私钥缓存 |
| `color.ts` | **颜色工具** - 颜色相关辅助函数 |
| `utils.ts` | **通用工具函数** |
| `file-utils.ts` | **文件处理工具** |
| `log.ts` | **日志工具** |

---

### 🎨 `src/layout/` - 布局组件

| 文件 | 作用 |
|------|------|
| `index.tsx` | **主布局组件** - 组合背景、导航、音乐卡片等 |
| `header.tsx` | **页头组件** |
| `footer.tsx` | **页脚组件** |
| `head.tsx` | **Head 标签组件** - SEO 相关 meta 标签 |
| `backgrounds/snowfall.tsx` | **雪花飘落背景动画** |
| `backgrounds/blurred-bubbles.tsx` | **模糊气泡背景动画** |
| `backgrounds/utils.ts` | **背景动画工具函数** |

---

### 📄 `src/config/` - 配置文件

| 文件 | 作用 |
|------|------|
| `site-content.json` | **站点内容配置** - 标题、描述、主题颜色、社交按钮、背景设置等 |
| `card-styles.json` | **卡片样式配置** - 每个卡片的尺寸、位置、偏移量、显示/隐藏 |
| `card-styles-default.json` | **卡片样式默认配置** - 恢复默认样式时使用 |

---

### 🎯 `src/consts.ts` - 常量定义

定义全局常量：
- `INIT_DELAY` / `ANIMATION_DELAY` - 动画延迟
- `CARD_SPACING` / `CARD_SPACING_SM` - 卡片间距
- `GITHUB_CONFIG` - GitHub 仓库配置（owner, repo, branch, app_id）

---

### 🖼️ `src/svgs/` - SVG 图标组件

| 文件 | 作用 |
|------|------|
| `index.ts` | **SVG 组件导出** - 包含掘金、短线等 SVG 图标 |

---

## 📁 `public/` - 静态资源

| 目录 | 作用 |
|------|------|
| `blogs/` | **博客文章 Markdown 文件** |
| `blogs/index.json` | **文章索引** - 所有文章的元数据列表 |
| `blogs/categories.json` | **文章分类索引** |
| `images/` | **图片资源** |
| `images/art/` | **艺术图片** |
| `images/blogger/` | **博主头像** |
| `images/pictures/` | **图片集图片** |
| `images/share/` | **分享相关图片** |
| `images/hats/` | **帽子装饰图片** |
| `images/christmas/` | **圣诞主题资源** |
| `live2d/` | **Live2D 模型配置** |
| `manifest.json` | **PWA 应用清单** |

---

## 📁 `.github/` - GitHub 配置

| 文件 | 作用 |
|------|------|
| `workflows/` | **GitHub Actions 工作流** - CI/CD 自动部署 |

---

## 🔑 核心数据流

```
用户操作 → Zustand Store → GitHub API → GitHub 仓库 → Next.js 构建 → Cloudflare Pages 部署
```

### 认证流程
1. 用户导入 GitHub App 私钥（.pem 文件）
2. 使用 `jsrsasign` 签发 JWT
3. 通过 GitHub API 获取 Installation Token
4. 使用 Token 操作仓库文件

### 文章发布流程
1. 用户在 `/write` 编写 Markdown
2. 文章保存到 `src/app/write/stores/write-store.ts`
3. 点击发布 → `services/push-blog.ts`
4. 通过 GitHub API 创建/更新 `public/blogs/{slug}.md` 文件
5. 更新 `public/blogs/index.json` 索引

---

## 🛠️ 部署架构

```
开发环境: next dev (本地)
     ↓
构建: pnpm build:cf (= opennextjs-cloudflare build)
     ↓
部署: Cloudflare Pages
     ↓
全球化 CDN 分发
```

---

*最后更新: 2026-04-14*