# 发布说明

本站是纯静态站点，根目录即发布目录。主站走 GitHub Pages，镜像走 Cloudflare Pages。两条路线共用同一份文件，不需要维护两套。

仓库名建议：`comfyui-course`。以下命令都在站点根目录执行。

## 一、GitHub Pages（主站）

### 1. 前置检查

```bash
git --version
gh auth status
```

没登录就先登录：

```bash
gh auth login
```

### 2. 初始化并推送

```bash
git init
git add .
git commit -m "publish: comfyui course"
gh repo create comfyui-course --public --source=. --remote=origin --push
```

### 3. 打开 Pages

路线 A：网页设置更稳妥。

1. 打开仓库的 Settings → Pages。
2. Source 选 `Deploy from a branch`。
3. 分支选 `main`，目录选 `/`（root），保存。

路线 B：命令行。

```bash
gh api -X POST "repos/<用户名>/comfyui-course/pages" -f "source[branch]=main" -f "source[path]=/"
```

如果仓库已经开过 Pages，把 `POST` 换成 `PUT` 再执行一次。

### 4. 访问地址

```text
https://<用户名>.github.io/comfyui-course/
```

首次生效大约半分钟到两分钟。没出来就等一会儿再刷新，或到 Actions 里看 `pages build and deployment` 的状态。

> 私有仓库开 Pages 需要付费账号。默认走 public。

## 二、Cloudflare Pages（镜像）

1. 进入 Cloudflare 控制台 → Workers & Pages → Create → Pages → Connect to Git。
2. 授权 GitHub，选中同一个 `comfyui-course` 仓库。
3. 构建设置：

```text
Framework preset: None
Build command:    （留空）
Build output directory: /
```

4. 点 Deploy。

得到地址：

```text
https://<项目名>.pages.dev
```

之后每次 push 会自动重建，不需要在两处分别改文件。

## 三、运维

### 更新一节课

```bash
git add .
git commit -m "update: l2-06"
git push
```

GitHub Pages 与 Cloudflare Pages 都会自动更新。

### 绑定自己的域名

- Cloudflare Pages：项目 → Custom domains → 添加域名，按提示配置 DNS。Cloudflare 侧免备案。
- GitHub Pages：仓库 Settings → Pages → Custom domain，填写域名并配置 DNS。GitHub 侧也可以绑。

### 回退

```bash
git log --oneline
git revert <提交哈希>
git push
```

不要用 `git reset --hard`。`revert` 会留下一条可追溯的回退提交，远程历史不会被改写。

## 四、坑

- `.nojekyll` 必须在仓库根目录。否则 GitHub Pages 会跳过以下划线开头的目录，`_archive/` 会 404。
- 单文件上限：GitHub 单文件 25 MB，仓库建议控制在 1 GB 内。当前最大的 `a/a08-whos-ai.html` 约 546 KB，安全。
- 中文文件名已经全部改成英文小写 slug，URL 不会再出现 `%E6%95%99` 这类编码。
- `_archive/` 会一起推上去，但不进任何导航。若嫌仓库大，可以在根目录 `.gitignore` 里加一行 `_archive/`，代价是线上不再保留历史快照；保留还是忽略，按需要取舍。
