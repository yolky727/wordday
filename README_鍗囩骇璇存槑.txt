WORDDAY V2.0.1 修复包

本次修复：
- 修复“换一组”按钮每次显示相同单词的问题。
- 点击后会重新排列并抽取当天单词，并显示提示。
- 更新 Service Worker 缓存版本为 wordday-v2.0.1，帮助浏览器获取新版本。

部署方式：
1. 备份当前学习记录（新版“学习统计”页面可导出 JSON）。
2. 在原 GitHub 仓库根目录替换 index.html、service-worker.js、manifest.webmanifest、icon-192.png、icon-512.png。
3. 不要删除仓库，不要更换 Pages 网址。
4. Commit changes，等待 GitHub Pages 发布。
5. 若仍看到旧页面，关闭网站后重新打开；必要时在浏览器中清除该站点缓存（不要清除网站数据/localStorage）。

学习数据仍使用 localStorage 键 wordday_v1，兼容旧版打卡、已认识单词、自定义单词等数据。
