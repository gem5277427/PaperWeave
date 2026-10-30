# 第三方组件

本项目以 MIT License 发布，同时包含或依赖以下第三方组件。各组件的版权归其原作者所有。完整许可证全文保存在 `LICENSES/` 目录。

## 内置运行时

- **Python 3.12 (CPython, 64-bit)**，由 PyInstaller 打包进 `PaperWeave.exe`
  - 许可：Python Software Foundation License
  - 版权：Python Software Foundation
  - 全文：`LICENSES/python.txt`
  - 来源：https://www.python.org/downloads/windows/

## Python 包

| 组件 | 许可 | 许可证全文 |
| --- | --- | --- |
| pywebview | BSD 3-Clause | `LICENSES/pywebview.txt` |
| pythonnet | MIT | `LICENSES/pythonnet.txt` |
| clr-loader | MIT | `LICENSES/clr-loader.txt` |
| cffi | MIT | `LICENSES/cffi.txt` |
| pycparser | BSD 3-Clause | `LICENSES/pycparser.txt` |
| bottle | MIT | `LICENSES/bottle.txt` |
| proxy_tools | BSD 3-Clause（源码头） | `LICENSES/proxy-tools.txt` |
| typing_extensions | PSF | `LICENSES/typing-extensions.txt` |

### proxy_tools 许可说明

`proxy_tools-0.1.0.dist-info/METADATA` 标注 MIT，但其源文件头写明 BSD、并指向 Werkzeug 的 BSD 许可。本仓库按源码头的 BSD 3-Clause 处理，并在 `LICENSES/proxy-tools.txt` 中保留版权、条款和免责声明。若上游以后统一许可，以新版本为准。

## 运行环境：Microsoft Edge WebView2

桌面窗口通过 pywebview 使用 Windows 的 Edge WebView2。随 `PaperWeave.exe` 打包的 `webview/lib` 下包含 Microsoft WebView2 SDK 的以下二进制：

- `Microsoft.Web.WebView2.Core.dll`
- `Microsoft.Web.WebView2.WinForms.dll`
- `runtimes/win-*/native/WebView2Loader.dll`

这些文件版权归 Microsoft Corporation，受 Microsoft WebView2 SDK 许可约束，**不是** MIT 授权。说明与链接见 `LICENSES/webview2-NOTICE.txt`。

WebView2 Runtime 本身是 Microsoft 的独立组件，Windows 10/11 通常已预装，本项目不分发它。若目标机器缺少 Runtime，请从 Microsoft 安装：
https://developer.microsoft.com/microsoft-edge/webview2/

## 字体与素材

界面不使用外部字体文件或第三方图标库；图标为项目内联 SVG，界面字体使用系统字体。
