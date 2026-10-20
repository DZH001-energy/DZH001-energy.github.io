# Dr. Zhihua Deng — 个人学术主页

🌐 **线上地址：https://dzh001-energy.github.io/**
📦 GitHub 仓库：https://github.com/DZH001-energy/DZH001-energy.github.io

一个**零依赖、纯静态**的个人科研网站。所有内容集中在一个文件里编辑，改完上传即全球生效。

```
website/
├── index.html                 页面骨架（一般不用动）
├── assets/
│   ├── css/style.css          主题样式（改颜色看文件顶部 :root）
│   ├── js/content.js          ★ 全部内容都在这里 —— 平时只改这个文件
│   ├── js/render.js           渲染引擎（不用动）
│   ├── js/main.js             交互脚本（不用动）
│   └── img/
│       ├── profile.jpg        你的照片（4:5 竖版，800×1000）← 换照片改这里
│       ├── profile.webp       同一张图的更小体积版本（备用）
│       ├── profile.png        原始照片备份
│       └── profile.svg        占位图（没放照片时显示）
├── setup-github.bat           【双击】首次一键发布：建仓 + 推送 + 开 Pages
├── setup-github.ps1           ↑ 上面的实际执行脚本
├── publish.bat                【双击】以后每次更新发布（commit + push）
├── undo.bat                   【双击】撤销上一次发布（revert + push）
├── preview.bat                【双击】本地预览 http://localhost:8000
├── github_token.txt           本机私密令牌文件（已被 .gitignore 忽略，不会外传）
├── askpass.cmd                git 自动取令牌用的小助手
├── .gitignore
└── README.md                  本说明
```

---

## 📁 文件放在哪 / 在哪改内容

| 问题 | 答案 |
|---|---|
| 网站文件存在哪？ | **`E://外星人电脑上资料//NTU项目//个人资料//ZhihuaDeng//website//`**（与你的简历同目录，长期保留，不会被清理） |
| 平时改哪个文件？ | **`assets\js\content.js`** —— 唯一需要动的文件（姓名、简介、论文、专利、项目、获奖、学生、联系方式全在里面） |
| 想改配色/风格？ | `assets\css\style.css` 顶部的 `:root` 变量（主色、背景、圆角…） |
| 想换照片？ | 照片放 `assets\img\profile.jpg`，再改 `content.js` 里 `photo:` 那一行 |
| 其他文件要动吗？ | 不用。`index.html` / `render.js` / `main.js` 一般无需改动 |

### 📷 照片规范

| 项目 | 要求 |
|---|---|
| 比例 | **4:5 竖版**（相框固定 4:5，超出部分自动居中裁切，`object-position` 锁在 16% 保证头部不被切） |
| 分辨率 | 建议 **800 × 1000** 像素（更高清可给 1200 × 1500） |
| 构图 | 半身照，头顶留白约 8%，人物居中；纯色或浅色背景最佳 |
| 格式 | **JPG**（质量 90 左右，200 KB 以内）；PNG 体积会大十几倍，务必先转 JPG |
| 构图不合适？ | 改 `style.css` 里 `.portrait-ring img` 的 `object-position`（`center 16%` → `center 0%` 可让画面更靠上） |

> `assets/img/profile.jpg` 是已按 4:5 优化好的成品（82 KB，原图 907 KB，缩减 11 倍）；
> `profile.png` 保留了你的原始照片备份，可自行删除。

---

## 一、日常更新（只需记这 5 件事）

| 想做什么 | 怎么做 |
|---|---|
| 加一篇论文 | 打开 `assets/js/content.js`，在 `publications.journal` 数组里**复制任意一条**，粘贴到最上面，改成新论文信息 |
| 加一条新闻 | 在 `news` 数组最上面加一行 `{ date: "2026-12", text: "…" }` |
| 换头像 | 照片放 `assets/img/profile.jpg`（4:5 竖版），再把 content.js 里 `photo:` 改成对应路径 |
| 挂上 CV 下载 | 把 PDF 放进站点目录，`cvFile: ""` 改成 `cvFile: "ZhihuaDeng_CV.pdf"` |
| 补充 Google Scholar / ORCID | `links` 里对应字段填上网址即可，按钮自动出现 |

**作者名单高亮规则**：把自己名字用 `**` 包起来，如 `"Bin Miao, **Zhihua Deng**, S. H. Chan"`，
页面会自动加粗显示。

**学生 / 审稿** 目前是空模板（`students`、`service.reviewer`），照抄数组里注释的格式往里加即可。

## 二、外观随时改（不用写代码）

页面右上角 **齿轮按钮**：
- **Theme**：Light / Dark / Midnight 三种主题
- **Accent colour**：5 种强调色（氢能青、电蓝、琥珀、紫、绿）
- **Hero background**：Glow / Grid / Plain 三种背景风格
- **Background image**：粘贴图片 URL 或上传本地图片
- **Reset**：一键恢复默认

设置保存在浏览器本地（localStorage）。若想让**所有访客**默认看到某种配色，
改 `style.css` 顶部 `:root` 里的变量即可。

## 三、发布 / 更新 / 撤销 完整操作手册

> ✅ **已上线**：仓库 `DZH001-energy/DZH001-energy.github.io`（Public），Pages 状态 `built`，
> 地址 **https://dzh001-energy.github.io/** —— 全球任意电脑、任意网络（含中国大陆）均可访问。
>
> 三个已处理的关键配置：
> 1. **提交身份用 GitHub noreply**（`179661622+DZH001-energy@users.noreply.github.com`）——
>    否则会触发 `GH007 私有邮箱保护` 被拒绝推送。脚本已自动设置。
> 2. **git 路径自动探测**——本机没有系统级 Git for Windows，脚本会自动找到
>    WorkBuddy 自带的 PortableGit（`~/.workbuddy/binaries/PortableGit/*/cmd/git.exe`）。
> 3. **令牌走本机文件 + 剪贴板双通道**，`askpass` 助手复制到纯 ASCII 临时目录执行
>    （站点路径含中文，直接传给 git 拉起的子进程会乱码）。

站点是**纯静态、零外部依赖**（系统字体栈 + 内联 SVG，不引用 Google Fonts 或任何 CDN），
因此托管到任意静态平台后，**全球任何一台电脑、任何网络环境（含中国大陆）都能正常打开**。

### 工作流全貌

```
    本地编辑                本地预览              一键发布              全球访问
  ┌──────────┐          ┌──────────┐         ┌──────────┐        ┌──────────┐
  │ 改 content.js│──▶  │ 双击 preview.bat │──▶ │ 双击 publish.bat │──▶ │ github.io│
  │ 换头像/改配色│      │ 浏览器实时看    │     │ commit + push    │     │ 1-2分钟  │
  └──────────┘          └──────────┘         └──────────┘        └──────────┘
        ▲                                                          │
        └──────────── 双击 undo.bat 撤销上一版 ◀──────────────────┘
```

### 3.1 首次发布：最快路径（3 分钟，全程不用敲命令）

**第 1 步：生成令牌**（一次性）

1. 打开 <https://github.com/settings/tokens>
2. 页面顶部点 **Generate new token (classic)** → Note 随便写（如 `homepage`）
3. Expiration 选 90 天
4. 勾选权限：**`repo`** 和 **`gist`**（`repo` 是推送代码的必需权限）
5. 滑到底点 **Generate token** → 复制那串 `ghp_xxxxxxxx`

**第 2 步：把令牌放到脚本能拿到的地方（二选一）**

- **方案 A（最省事）**：在 <https://github.com/settings/tokens> 复制令牌后，直接按 **Win+V** 打开剪贴板历史确认它在，然后**双击 `setup-github.bat`**——脚本会自动从剪贴板读取令牌，你连文件都不用改。
  > 如果剪贴板历史里没有（被清理过了），就在 GitHub 重新 Generate 一个（令牌只显示一次，旧的可以一并删掉）。
- **方案 B**：把令牌粘进本机文件 `website\github_token.txt`（双击会用记事本打开，把 `[paste token here]` 那一行整行替换成 `ghp_xxxx`，前面不要留空格），保存后再双击 `setup-github.bat`。

**（方案 B 的操作细节）**

1. 打开 `website\github_token.txt`（双击会用记事本打开）
2. 把 `[paste token here]` 那一行整行替换成你的 `ghp_xxxx`（前面不要留空格）
3. 保存关闭

> 🔒 这个文件已被 `.gitignore` 忽略，**永远不会上传到 GitHub**。令牌只存在你这台电脑上。
> 脚本运行时会自动认出你的 GitHub 用户名，你不需要手动填写。

**第 3 步：一键发布**

**双击 `setup-github.bat`**，脚本会自动完成：

- 用令牌验证你的 GitHub 身份（自动认出用户名）
- 在你名下创建仓库 `你的用户名.github.io`（Public）
- 绑定远程仓库并推送全部文件
- 开启 GitHub Pages
- **打印出全球访问地址**（形如 `https://你的用户名.github.io/`）

首次构建约 1–2 分钟，之后浏览器打开该地址即可。过程日志同时写入 `setup-github.log`。
脚本窗口**不会闪退**（结尾有 pause 等待），出问题时窗口会停住并显示中文原因。

---

### 3.1′ 手动版（不想用令牌文件时）

1. 注册/登录 **GitHub** → 右上角 `+` → **New repository**
   - 仓库名建议 `你的用户名.github.io`（用个人账号名，GitHub Pages 直接免费提供 `用户名.github.io` 顶级域名）
   - **不要勾选** "Add a README"（避免首次推送冲突）
   - 可见性选 **Public**（Pages 免费服务要求公开仓库）
2. 在 `website` 目录打开 Git Bash 或命令行，执行：
   ```bash
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   git push -u origin main
   ```
   > 推送时若要密码，**GitHub 已不支持账户密码**，请用 Personal Access Token 代替（见 3.1 第 1 步）。
   > 更省事：改用 SSH 地址 `git@github.com:你的用户名/你的仓库名.git`
3. 打开仓库 **Settings → Pages → Build and deployment → Source** 选 **Deploy from a branch**，
   Branch 选 **main**、目录选 **/ (root)**，保存。
4. 等 1–2 分钟，访问 `https://你的用户名.github.io/仓库名/` 即为你的全球主页。

### 3.2 日常发布（每次 10 秒）

改完内容 → **双击 `publish.bat`** → 自动 `git add` / `commit` / `push` → GitHub 自动构建 → 约 1–2 分钟全球生效。

`publish.bat` 自带保护：没检测到改动会提示"无需发布"；缺 git、没绑远程仓库、推送失败都会给出中文提示并停在错误处，不会静默失败。

### 3.3 撤销（撤回上一次发布）

**双击 `undo.bat`** → 会先列出最近 5 次提交 → 输入 `y` 确认 → 生成一个反向提交并推送 → 线上恢复成上一版。

它用的是 `git revert`（新增一个"反向提交"），**历史记录完整保留**，是最安全的撤销方式。
如果你要的是"彻底抹掉这一版"（比如不小心把邮箱贴错了），在 Git Bash 里执行：
```bash
git reset --soft HEAD~1     # 撤回到上一版内容
git commit -m "fix: 移除误提交内容"
git push --force-with-lease origin main
```

### 3.4 本地预览（改完先看效果）

**双击 `preview.bat`** → 浏览器自动打开 `http://localhost:8000` → 改文件即时刷新 → 关闭黑窗口即停止服务。
预览和线上是同一份文件，所见即所得。

### 3.5 不想用 Git？最省事的备选：Cloudflare Pages 拖拽发布

1. 登录 <https://dash.cloudflare.com> → **Workers & Pages** → **Create** → **Pages** → **Direct Upload**
2. 把整个 `zhihua-deng-site` 文件夹**拖进上传框** → 点 **Deploy site**
3. 立刻得到 `https://xxx.pages.dev` 地址
4. 以后每次更新：把文件夹再拖进去一次即可（国内访问速度很快，优于 GitHub）
5. **撤销**：Cloudflare 控制台的 **Deployments** 列表里点任意历史版本 → **Rollback to this deployment** 即可回退

> 两种方式可以并存：GitHub Pages 当"版本历史 + 备份"，Cloudflare Pages 当"日常更新通道"。

### 3.6 绑定自己的域名（强烈建议）

学术主页挂独立域名（例如 `zhihuadeng.com`）比 `xxx.github.io` 更容易被搜索引擎收录，也更适合发给合作者。

1. 在 Cloudflare / 阿里云 / Namecheap 买一个域名
2. 添加 CNAME 记录：主机名 `www` → 指向你的 Pages 地址或 `用户名.github.io`
3. 在 Pages 后台 **Custom domains** 里填入你的域名，按提示添加 CNAME 记录
4. SSL 证书自动签发，全程免费

## 四、编辑小贴士

- `content.js` 是标准 JS 对象语法：**别删逗号、别删引号**，改完可先在浏览器打开 index.html 本地预览
- 每个字段留空 `""` 就自动隐藏，不会报错
- 论文条目 `badges` 支持：`"TOP"`、`"Q1"`、`"IF 21.5"`、`"Corresponding Author"` 或任意自定义文字
- 站点统计数字在 `stats` 数组里（如论文总数变了记得同步改）
- 打印友好：Ctrl+P 可直接导出一份干净的 CV 风格 PDF

## 五、以后想加新板块？

比如"博客""演示视频""数据集下载"：
1. 在 `index.html` 复制任意一个 `<section class="sec">…</section>` 改 id 和标题
2. 在 `content.js` 加一个数组
3. 在 `render.js` 仿照现有函数写三行渲染逻辑（或直接让我加）

---
版本 v1.0 · 2026-10 · 生成于 WorkBuddy
