WORDDAY 2.1.2 · 自由测试版

本次更新基于 WORDDAY 2.1.1 修复版。

主要更新
1. 取消四种测试的每日打卡解锁条件；单词选择、单词拼写、句子填词、综合测试均可随时开始。
2. 测试范围改为完整词库（内置词库 + 用户自定义词），因此包含今日词汇、历史词汇和此前未学习的词汇。
3. 测试首页移除锁定卡片与打卡进度解锁提示，改为自由测试入口。
4. 保留 2.1.1 的统一 correct 判分字段、反馈、成绩统计、逐题回顾、独立测试模式统计和测试历史。
5. 保留暖米白 + 森林绿融合 UI 与适中信息密度。
6. Service Worker 缓存版本升级为 wordday-v2.1.2-free-test。

GitHub Pages 更新步骤
1. 建议先在当前 WORDDAY 的“学习统计”中导出 JSON 学习记录备份。
2. 解压 WORDDAY_2.1.2_GitHub更新包.zip。
3. 进入 GitHub 仓库 yolky727/wordday 的根目录。
4. 上传并覆盖 index.html 和 service-worker.js 两个文件。
5. Commit changes，等待 GitHub Pages 部署成功。
6. Safari 打开 https://yolky727.github.io/wordday/ 验证 2.1.2，再重新打开主屏幕网页应用。

数据安全说明
- 继续使用 localStorage 键 wordday_v1，不主动清空或重置学习数据。
- 不要为了更新而清除 Safari 网站数据。
- 电脑与 iPhone 的本地学习记录不会自动同步。
- 建议每次重大更新前导出 JSON 备份。

测试范围说明
- 题库范围为完整内置词库与用户自定义词库。
- 如果句子词条没有可用例句，句子填词题会回退为拼写题，避免生成无法作答的空题。
- 如果某词没有英文释义数据，综合测试不会编造英文释义题，会按现有规则回退到拼写题。

验证说明
- 已进行 HTML 内嵌 JavaScript 语法检查、Service Worker 语法检查，以及四种测试模式的题目生成/标准答案检查。
- 尚未在用户的真实 GitHub Pages、iPhone Safari 和主屏幕 PWA 环境完成端到端验收；部署后仍需实际测试。
