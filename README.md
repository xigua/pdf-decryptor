
# ID995A Node.js 后端表单填充示例

本项目演示如何在 **Node.js** 环境中：

1. 打开已有 PDF (`ID995A.pdf`) 并列出全部表单字段名称  
2. 将英文姓、名等字段写入 PDF，生成 `filled_ID995A.pdf`

> **准备**：请把空白模板 **ID995A.pdf** 复制到项目根目录（与 `index.js` 同级）。

## 快速上手

```bash
npm install     # 安装 pdf-lib
npm start       # 执行 index.js
```

运行后将看到：

- 终端打印所有字段名  
- 生成的新文件 `filled_ID995A.pdf`（已填入示例值，且字段被 flatten，不可编辑）

如需改写字段，请编辑 `index.js` 中的 `fillPairs`。
