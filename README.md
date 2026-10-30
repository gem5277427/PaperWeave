# PaperWeave · 脉络

一个本地优先的论文阅读工作台：读完一篇论文，把结构化总结放进来；`PaperWeave` 会把它和旧论文连成研究版图，并帮你把“局限、方法、评测”重新组合成可以动手的研究 idea。

这是 **Windows 桌面便携版**：解压后双击即可运行，不需要安装 Python、Node 或数据库。

## 快速开始

1. 解压整个文件夹到任意位置（例如桌面）。
2. 双击 **`PaperWeave.exe`**。
3. 第一次打开是空库，从「添加论文」开始建立自己的阅读档案。

关闭窗口即退出。数据会自动写入 exe 旁边的 `data/paperweave.json`。

> Windows 10/11 通常自带 Edge WebView2。若提示缺少 WebView2，请安装微软官方的“Microsoft Edge WebView2 Runtime”后再试。

## 能做什么

- **两种录入方式**：新论文（还没读，先加入待读清单）或读过的论文（直接填写六段总结）。
- **结构化总结**：研究问题、方法、贡献、结果、局限、未来工作；也可粘贴一段笔记自动拆段。
- **论文联系**：推进、方法同源、应用验证、观点张力、灵感关联五种关系；系统按文本相似度给出候选。
- **阅读进度**：自定义阶段（未开始、泛读、精读、已复现、已总结……）和 0–100% 进度；阶段决定「待读 / 在读 / 已读」。
- **研究版图**：按研究板块分组着色，点顶部板块只看一组；实线是人工关系，虚线是系统推断的相似关系。
- **灵感工坊**：空白桥接、方法移植、三方融合、领域前沿、跨域类比、混合模式六种本地策略，每条 idea 都附带原文证据。
- **导出**：JSON 备份、Markdown 总结。

## 数据与隐私

- 唯一数据源是 **`data/paperweave.json`**，不写浏览器 localStorage。
- 每次修改会自动保存；上一版保留为 `data/paperweave.bak.json`。
- 没有账号、没有外部网络请求、没有模型调用；页面只与本机内置的服务通信。
- 想换电脑：复制整个文件夹（包含 `data/`）即可。
- 如果之前用过旧版：先关闭旧版窗口，把旧文件夹里的 `data/paperweave.json` 复制到本文件夹的 `data/`，再启动即可。

## 目录结构

源码仓库：

```text
PaperWeave/
├─ pyproject.toml          项目与依赖声明（uv 管理）
├─ src/paperweave/
│  ├─ desktop.py           桌面窗口入口
│  ├─ server.py            本地静态服务 + 数据 API
│  └─ web/                 前端：index.html、assets/、js/
├─ packaging/
│  ├─ launcher.py          PyInstaller 入口
│  └─ build.py             构建发布包
└─ data/
   ├─ README.md
   └─ paperweave.json      运行后自动生成
```

发布包（`uv run packaging/build.py` 产物）：

```text
PaperWeave-<version>-win64/
├─ PaperWeave.exe          双击启动，自带 Python 运行时
├─ LICENSE
├─ LICENSES/
├─ THIRD_PARTY_NOTICES.md
└─ data/README.md
```

## 常见问题

**双击 exe 出现“Windows 已保护你的电脑”**
这是 SmartScreen 对未签名程序的提示，不是病毒。点击“更多信息 → 仍要运行”，或右键 exe → 属性 → 勾选“解除锁定”。

**窗口没有出现**
先确认已安装 WebView2 Runtime；若杀毒软件把 exe 隔离了，请把解压后的整个文件夹加入信任。需要看报错时用命令行运行 `PaperWeave.exe --debug`，再按 `Ctrl+Shift+I` 打开开发者工具。

## 源码运行
需要 [uv](https://docs.astral.sh/uv/)（会自动准备 Python 与依赖）：

```bash
uv sync                        # 创建 .venv 并安装依赖（含 pywebview）
uv run paperweave-desktop      # 桌面窗口
uv run paperweave              # 或只跑本地服务，浏览器打开 http://127.0.0.1:8765
```

前端是零构建的原生 HTML/CSS/JS，源文件在 `src/paperweave/web/`，改完刷新即可。

## 打包发布

在 Windows 上执行：

```bash
uv sync
uv run packaging/build.py
```

产出 `dist/PaperWeave-<version>-win64/` 与同名 `.zip`：单文件 `PaperWeave.exe`（PyInstaller，内含 Python、pywebview 与前端资源），与 exe 同级附带许可证材料。双击 exe 即运行，数据写在 exe 旁边的 `data/`，无需安装。

## 许可

代码以 MIT License 发布。打包进 exe 的 Python 运行时、第三方库与 WebView2 SDK 的许可见 `THIRD_PARTY_NOTICES.md`，完整许可证全文在 `LICENSES/`。
