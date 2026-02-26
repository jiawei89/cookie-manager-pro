# 🍪 Cookie Manager Pro

一个强大的Chrome浏览器Cookie管理器扩展，可以轻松管理、编辑、导出和导入cookies。

## ✨ 功能特性

- ✅ **查看Cookies** - 查看当前网站的所有cookies
- ➕ **添加Cookies** - 手动添加新的cookies
- ✏️ **编辑Cookies** - 修改现有cookie的值和属性
- 🗑️ **删除Cookies** - 删除不需要的cookies
- 🔍 **搜索功能** - 快速搜索特定cookies
- 🔒 **锁定Cookies** - 锁定重要cookies防止误操作
- 🚫 **屏蔽Cookies** - 屏蔽特定cookie的设置
- 📤 **导出功能** - 导出cookies为JSON格式
- 📥 **导入功能** - 从JSON文件导入cookies
- 🎨 **美观界面** - 现代化的用户界面设计

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

### 查看Cookies

1. 访问任何网站
2. 点击浏览器工具栏中的Cookie Manager Pro图标
3. 自动显示当前网站的所有cookies

### 添加/编辑Cookie

1. 点击"添加"按钮或现有cookie的编辑按钮
2. 填写cookie信息：
   - 域名 (Domain)
   - 名称 (Name)
   - 值 (Value)
   - 路径 (Path)
   - 过期时间 (Expiration)
   - 安全选项 (Secure, HttpOnly)
3. 点击"保存"

### 导出Cookies

1. 查看要导出的cookies
2. 点击"导出"按钮
3. 选择保存位置
4. Cookies将保存为JSON文件

### 导入Cookies

1. 点击"导入"按钮
2. 选择之前导出的JSON文件
3. 自动导入所有cookies

### 锁定/屏蔽Cookies

- **锁定**：点击🔒按钮锁定cookie，防止误操作
- **屏蔽**：点击🚫按钮屏蔽cookie，防止网站设置该cookie

## 🔒 隐私与安全

- 所有数据存储在本地，不上传到任何服务器
- 不会收集或传输任何个人信息
- 完全开源，可自行审查代码
- 建议使用后及时修改密码

## 🛠️ 技术栈

- **Manifest V3** - 最新的Chrome扩展API
- **原生JavaScript** - 无外部依赖
- **Chrome Storage API** - 本地数据持久化
- **Chrome Cookies API** - Cookie操作

## 📝 开发说明

### 项目结构

```
cookie-manager-extension/
├── manifest.json          # 扩展配置文件
├── popup.html            # 弹出页面HTML
├── css/
│   └── popup.css         # 样式文件
├── js/
│   ├── popup.js          # 弹出页面逻辑
│   └── background.js     # 后台服务脚本
├── icons/                # 图标文件
└── README.md             # 说明文档
```

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
