WORDDAY V2.0 部署与升级说明

文件：
- index.html：网站入口（上传到 GitHub 仓库根目录）
- manifest.webmanifest：添加到主屏幕配置
- service-worker.js：离线缓存与版本更新
- icon-192.png / icon-512.png：网站图标
- wordday_local.html：本地预览版

更新现有 GitHub Pages：
1. 确认你正在使用的旧网站地址（例如 https://用户名.github.io/wordday/）。
2. 解压本 ZIP。
3. 打开原来的 wordday 仓库根目录，上传并替换 index.html、manifest.webmanifest、service-worker.js、icon-192.png、icon-512.png。
4. 点击 Commit changes。不要删除仓库，也不要更换 GitHub Pages 域名/路径。
5. 等待 Pages 更新。iPhone Safari 打开原网址刷新；若主屏幕图标仍显示旧版，关闭网页后重新打开。
6. 新版打开后，进入“学习统计”→“导出学习备份”，保存 JSON 文件，作为今后升级/换机前的备份。

数据保留说明：
- 本版本继续使用 localStorage 键 wordday_v1，兼容旧版 known、days、custom、daily、quizDone。
- 新增 favorites、mistakes、reviews、quizTotal、quizCorrect、studyLog。
- 同一设备、同一浏览器、同一网站源（origin）且未清除网站数据时，旧记录会被读取并保留。
- 不要删除旧仓库重建，不要更换用户名/仓库名/Pages 域名。
- 如果旧版曾在 file:// 本地文件方式打开，而新版在 https://github.io 打开，浏览器存储不共享；需先在原环境备份/迁移，不能自动跨环境读取。
- 原版没有内置导出功能；若原有记录只存在于旧版的另一浏览器或本地文件环境，先不要清理该环境。
- 若 Safari 清除了网站数据，网页无法凭空恢复。

当前智能复习规则：
- 标记认识或复习成功后逐步延长复习间隔（约 1、3、7、14、30 天）。
- 标记“不熟悉”或小测答错后，安排次日复习并加入错词本。
- 统计与学习数据均为本机本浏览器数据；本版尚未提供跨设备云同步。
