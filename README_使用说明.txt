# WORDDAY · 每日单词打卡

## 文件说明
- `wordday_local.html`：独立单文件版本。下载到 iPhone「文件」App 后尝试打开；它不需要部署，但本地 HTML 在 iOS 上的打开方式受系统限制。
- `index.html` + `manifest.webmanifest` + `service-worker.js` + 图标：用于 HTTPS 托管的 PWA 版本，可添加到 iPhone 主屏幕，并缓存页面以便离线打开。

## 推荐：发布成 iPhone 主屏幕网页 App（GitHub Pages）
1. 在电脑或手机浏览器登录 GitHub，创建一个新仓库，例如 `wordday`。
2. 将本压缩包解压，把里面所有文件（注意：`index.html` 必须在仓库根目录）上传到仓库。
3. 在仓库进入 **Settings → Pages**。
4. 在 **Build and deployment** 中选择 **Deploy from a branch**。
5. Branch 选择 `main`，目录选择 `/ (root)`，点击 Save。
6. 等待 GitHub Pages 发布完成，页面会给出一个 `https://你的用户名.github.io/wordday/` 网址。
7. 在 iPhone 上用 Safari 打开这个网址。
8. 点击 Safari 的分享按钮 → **添加到主屏幕** → 打开“作为网页 App 打开”（若系统显示此选项）→ 添加。

## 本地单文件打开
1. 下载 `wordday_local.html` 到 iPhone。
2. 打开「文件」App → 下载项。
3. 点文件尝试预览；若预览空白或不执行脚本，可在共享菜单中选择可用浏览器/打开方式。
4. 若 iOS 不提供 Safari 打开选项，不是文件坏了；请用上面的 HTTPS 部署方式。

## 数据说明
打卡数据保存在当前浏览器的本地存储中。清除 Safari 网站数据、换浏览器或换设备可能导致数据不见；当前版本没有账号登录和云同步。
