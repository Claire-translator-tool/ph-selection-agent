# 北京平和工业品智能选型工具

这是一个适合部署到 GitHub Pages 的静态版工业品选型网站，用于北京平和安全栅、信号隔离器、电涌保护器、安全继电器等产品的初步选型。

## 核心选型原则

1. 先判断信号流向，再判断 AI/AO/DI/DO，最后匹配型号。
2. 现场设备进入 PLC/DCS：AI 或 DI。
3. PLC/DCS 输出到现场设备：AO 或 DO。
4. 通道判断统一为：
   - 一入一出（单通道）
   - 一入两出（一分二）
   - 两入两出（双通道）
5. T 系列优先；客户明确强调便宜、经济、预算低时，再补 C 系列候选。
6. 防爆、本安、SIL、回路参数必须以正式样册、证书和安全手册为准。

## 文件结构

```text
pinghe-selection-agent/
├── index.html
├── style.css
├── README.md
├── assets/
│   ├── images/          # 产品图片
│   └── docs/            # 样册、证书、说明书、EPLAN 等资料
├── data/
│   ├── products.json    # 产品库
│   ├── rules.json       # 选型规则库
│   ├── training_cases.json
│   ├── documents.json   # 资料索引
│   └── corrections_pending.json
└── src/
    ├── engine/          # 选型逻辑
    ├── ui/              # 页面渲染
    └── main.js
```

## 本地预览

因为页面会读取 `data/*.json`，不要直接双击 `index.html`。建议在项目目录运行：

```bash
python3 -m http.server 8000
```

然后浏览器打开：

```text
http://localhost:8000
```

## 上传 GitHub Pages

1. 新建 GitHub 仓库，例如 `pinghe-selection-agent`。
2. 把本项目所有文件上传到仓库根目录。
3. 进入仓库 `Settings` → `Pages`。
4. Source 选择 `Deploy from a branch`。
5. Branch 选择 `main`，目录选择 `/root`。
6. 保存后等待部署完成。
7. 打开 GitHub Pages 链接分享给大家使用。

## 如何补产品

编辑 `data/products.json`，复制已有产品对象，修改：

- `model`
- `name`
- `series`
- `ioType`
- `channelType`
- `signals`
- `keywords`
- `negativeKeywords`
- `specs`
- `selectionBasis`
- `questions`
- `image`

图片放到：

```text
assets/images/
```

然后在产品里写：

```json
"image": "assets/images/型号.png"
```

## 如何补资料

把 PDF、证书、说明书、EPLAN 等文件放到：

```text
assets/docs/
```

然后编辑：

```text
data/documents.json
```

把 `href` 指向对应文件。

## 如何训练纠错

网页里的“选错了？教它”会生成一段 JSON。人工确认后，把这段 JSON 追加到：

```text
data/training_cases.json
```

并把：

```json
"approved": true
```

只有人工确认后的案例才应该进入正式训练库。

## 后续联网版建议

GitHub Pages 是静态站点，不要把大模型 API Key 写进前端。后续如果要联网和接大模型，建议：

```text
GitHub Pages 前端 → Vercel / Cloudflare Worker 后端 → 大模型 API / 资料检索
```

工业品选型必须保留人工审核机制，联网资料只能作为参考，不能自动覆盖正式型号库。
