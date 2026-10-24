# 咕咕创意工坊 · 社区皮肤模板

社区皮肤走 **PR 进仓库**，全站玩家即可在「形象工坊 → 社区模板」一键应用（纯前端、无后端）。

## 贡献步骤

1. 准备一张**透明底 PNG**（推荐 512×640 竖幅，圆润无脸形象效果最佳——脸上的表情由游戏叠加，会眨眼）
   - 有脸的形象也可以：把 `faceOverlay` 设为 `false` 即可保留原图表情
2. 图片放入 `apps/pet/public/templates/skins/<你的id>.png`（≤ 300KB）
3. 在 `apps/pet/public/templates/skins.json` 的 `skins` 数组追加一条：

```json
{
  "id": "community-<你的id>",
  "name": "中文名",
  "nameEn": "English Name",
  "author": "你的 GitHub 用户名",
  "file": "<你的id>.png",
  "faceOverlay": true,
  "zhDesc": "一句话介绍",
  "enDesc": "One-line intro"
}
```

4. 提交 PR（标题建议 `feat(pet): 新增社区皮肤 <名字>`），合并后全站生效

## 规范

- 原创作品，禁止搬运他人版权形象；Q 宠物等复刻素材一律不收
- 内容健康、适合全年龄
- 图片仅支持 PNG（透明通道），不接收外链 URL 进模板库（本地 URL 皮肤可自行在工坊添加）
