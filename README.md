# 🌧️ 沙漠一粒雨

> "有一场雨，曾经落在很远的沙漠里。"

一份送给重要朋友的数字纪念礼物 —— 像一本会被打开的电子日记。

---

## 预览

```bash
npm install
npm run dev
```

打开 http://localhost:5173

---

## 如何修改内容

### 编辑记忆数据

**只需修改一个文件：** `src/data/memories.ts`

```typescript
// 时间线记忆（ENTER 页面）
{
  id: '9',                          // 唯一 ID
  date: '2025.06.01',               // 日期
  title: '某个瞬间',                 // 标题
  image: '/your-photo.jpg',         // 照片（放在 public/ 目录下）
  text: '想写下的话...',            // 日记文字
  tags: ['标签'],                   // 可选标签
}

// "如果时间倒流"页面（OR? 页面）
{
  year: '2026',
  text: '如果回到这里……',
}
```

### 添加照片

1. 将照片文件放入 `public/` 目录
2. 在 `memories.ts` 中引用：`image: '/your-photo.jpg'`
3. 建议照片尺寸：**600×400** 或相近比例

---

## 部署上线

### 方式一：Vercel（推荐，全球免费）

1. 将项目推送到 GitHub
2. 访问 [vercel.com](https://vercel.com) 用 GitHub 登录
3. 点击 **New Project** → 选择此仓库
4. 直接点击 **Deploy**
5. 获得 `https://xxx.vercel.app` 地址

### 方式二：Netlify

1. 将项目推送到 GitHub
2. 访问 [netlify.com](https://netlify.com) 用 GitHub 登录
3. 点击 **Add new site** → **Import an existing project**
4. 选择此仓库 → **Deploy site**
5. 获得 `https://xxx.netlify.app` 地址

### 方式三：GitHub Pages

1. 将项目推送到 GitHub
2. 在仓库 Settings → Pages → Source 选择 **GitHub Actions**
3. 项目内置了构建配置，自动部署

### 方式四：手动部署

```bash
npm run build
# 将 dist/ 目录上传到任何静态托管服务
# 如：阿里云 OSS、腾讯云 COS、又拍云、Cloudflare Pages 等
```

---

## 自定义域名

以上所有平台都支持绑定你自己的域名：

1. 在平台设置中添加自定义域名
2. 在域名 DNS 中添加 CNAME 记录指向平台提供的地址
3. 等待 DNS 生效（通常几分钟到几小时）

---

## 项目结构

```
src/
├── data/memories.ts       ← 📝 只需改这里
├── components/
│   ├── Opening.tsx         开场动画
│   ├── Entry.tsx           入口页面
│   ├── Timeline.tsx        时间线主页
│   ├── MemoryCard.tsx      记忆卡片
│   ├── ReversePage.tsx     倒流页面
│   ├── RainCanvas.tsx      Canvas 雨滴引擎
│   └── SoundToggle.tsx     声音开关
├── context/SoundContext.tsx Web Audio 声音系统
└── types/index.ts          类型定义
```

---

## 技术栈

React · TypeScript · Tailwind CSS · Framer Motion · Canvas 2D · Web Audio API · Vite
