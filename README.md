# 🍪 Cookie Manager Pro

一个强大的Chrome浏览器存储管理器扩展，支持Cookies、LocalStorage和SessionStorage的查看、导出和管理。

## ✨ 功能特性

### 存储类型支持
- 🍪 **Cookies** - 查看和管理所有cookies
- 💾 **LocalStorage** - 查看和管理本地存储
- 📦 **SessionStorage** - 查看和管理会话存储

### 核心功能
- ✅ **多存储类型切换** - 标签页快速切换不同存储类型
- 📋 **复制功能** - 一键复制存储值
- 📤 **导出当前存储** - 导出当前查看的存储类型
- 📦 **导出全部数据** - 一键导出所有存储类型（Cookies + LocalStorage + SessionStorage）
- 🔍 **实时查看** - 实时加载当前网站的所有存储数据
- 🎨 **美观界面** - 现代化的用户界面设计

### Cookies专属功能
- 🔒 **锁定Cookies** - 锁定重要cookies防止误操作
- 🗑️ **删除Cookies** - 删除不需要的cookies

## 🚀 特色

### 适用于现代Web应用
很多现代应用（如知识星球、微博等）使用LocalStorage存储认证信息，而不仅仅是cookies。本扩展可以完整提取所有类型的存储数据！

### 完整的数据导出
导出功能会生成包含以下内容的完整JSON文件：
- 所有Cookies（含域名、路径、过期时间等）
- 所有LocalStorage数据
- 所有SessionStorage数据

## 🚀 安装方法

## 🚀 安装方法

### 方法1：开发者模式安装（推荐）

1. 下载或克隆此仓库
2. 解压到本地目录
3. 打开Chrome浏览器，访问 `chrome://extensions/`
4. 启用右上角的"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择扩展文件夹
7. 完成！

### 方法2：打包安装

1. 在 `chrome://extensions/` 页面
2. 点击"打包扩展程序"
3. 选择扩展文件夹
4. 生成.crx文件后拖拽到浏览器安装

## 📖 使用说明

### 查看存储数据

1. 访问任何网站
2. 点击浏览器工具栏中的Cookie Manager Pro图标
3. 点击顶部的标签切换不同存储类型：
   - **🍪 Cookies** - 查看HTTP Cookies
   - **💾 LocalStorage** - 查看本地存储
   - **📦 SessionStorage** - 查看会话存储

### 复制存储值

- Cookies: 点击📋按钮复制cookie
- LocalStorage/SessionStorage: 点击📋按钮复制对应的值

### 导出数据

**导出当前存储类型**：
1. 切换到想要导出的存储类型标签
2. 点击"📋 导出当前"按钮
3. 保存JSON文件

**导出全部数据**（推荐）：
1. 点击"📤 导出全部"按钮
2. 自动导出所有存储类型的数据
3. 保存为完整的JSON文件

### 锁定Cookies

- 点击🔒按钮锁定cookie，防止误操作
- 锁定的cookies会显示黄色锁图标

### 删除Cookies

- 点击❌按钮删除cookie
- 确认后立即删除

## 🔒 隐私与安全

- 所有数据存储在本地，不上传到任何服务器
- 不会收集或传输任何个人信息
- 完全开源，可自行审查代码
- 数据仅在浏览器本地处理

## 🛠️ 技术栈

- **Manifest V3** - 最新的Chrome扩展API
- **原生JavaScript** - 无外部依赖，轻量高效
- **Chrome Storage API** - 本地数据持久化
- **Chrome Cookies API** - Cookie操作
- **Chrome Scripting API** - 注入脚本读取Web存储

## 📝 开发说明

### 项目结构

```
cookie-manager-extension/
├── manifest.json          # 扩展配置文件
├── popup.html            # 弹出页面HTML
├── css/
│   └── popup.css         # 样式文件
├── js/
│   ├── popup.js          # 弹出页面逻辑（增强版）
│   ├── popup-old.js      # 旧版备份
│   └── background.js     # 后台服务脚本
├── icons/                # 图标文件
└── README.md             # 说明文档
```

### 本地开发

1. 克隆仓库：`git clone https://github.com/jiawei89/cookie-manager-pro.git`
2. 在Chrome中加载扩展（开发者模式）
3. 修改代码后在`chrome://extensions/`页面点击刷新按钮

### 构建项目

项目无需构建过程，直接加载即可使用。

## 🌟 应用场景

### 调试Web应用
- 查看应用存储的所有数据
- 快速复制token用于API测试
- 检查存储数据是否正确

### 数据迁移
- 导出所有存储数据备份
- 在不同设备间传输登录状态
- 批量导入测试数据

### 安全审计
- 检查网站存储了哪些数据
- 验证敏感信息是否加密存储
- 清理不需要的存储数据

### 本地开发

1. 克隆仓库：`git clone https://github.com/jiawei89/cookie-manager-pro.git`
2. 在Chrome中加载扩展（开发者模式）
3. 修改代码后重新加载扩展

### 构建

项目无需构建过程，直接加载即可使用。

## 🤝 贡献

欢迎提交问题和拉取请求！

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启拉取请求

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 👨‍💻 作者

**jiawei89** - [GitHub](https://github.com/jiawei89)

## 🙏 致谢

- 项目灵感来源于 EditThisCookie
- 感谢所有贡献者的支持

## 📮 联系方式

- 邮箱: 331470234@qq.com
- GitHub Issues: [提交问题](https://github.com/jiawei89/cookie-manager-pro/issues)

---

如果这个项目对你有帮助，请给个⭐️Star支持一下！
