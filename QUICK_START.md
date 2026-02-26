# Cookie Manager Pro - 快速使用指南

## 🚀 30秒上手

### 1. 安装扩展
1. 访问 https://github.com/jiawei89/cookie-manager-pro
2. 点击 "Code" → "Download ZIP"
3. 解压文件
4. 打开 `chrome://extensions/`
5. 启用"开发者模式"
6. 点击"加载已解压的扩展程序"，选择解压文件夹

### 2. 查看存储数据
1. 访问任何网站（如知识星球）
2. 点击浏览器工具栏的 🍪 图标
3. 点击顶部标签切换存储类型：
   - 🍪 Cookies
   - 💾 LocalStorage
   - 📦 SessionStorage

### 3. 导出数据
**方法A：导出全部（推荐）**
- 点击 "📤 导出全部" 按钮
- 所有存储数据打包导出

**方法B：导出当前类型**
- 切换到想要导出的存储类型
- 点击 "📋 导出当前" 按钮

---

## 🎯 典型使用场景

### 场景1：提取知识星球认证数据

1. 访问知识星球并登录
2. 打开扩展
3. 切换到 "💾 LocalStorage" 标签
4. 点击 "📤 导出全部"
5. 发送JSON文件给开发者或AI助手

### 场景2：调试Web应用

1. 在应用中执行某些操作
2. 打开扩展查看数据变化
3. 检查LocalStorage/SessionStorage中的数据
4. 复制token进行API测试

### 场景3：备份登录状态

1. 登录重要网站
2. 点击 "📤 导出全部"
3. 保存JSON文件作为备份
4. 需要时可以导入恢复（手动或使用其他工具）

---

## 💡 小技巧

### 快速复制值
- Cookies: 点击📋按钮
- LocalStorage/SessionStorage: 点击对应项的📋按钮

### 查看大文件
- LocalStorage中存储的长文本会自动截断显示
- 点击复制按钮查看完整内容

### 知识星球用户
- 知识星球使用LocalStorage存储认证信息
- 切换到 "💾 LocalStorage" 查看用户ID、Token等

---

## ❓ 常见问题

### Q: 为什么有些网站看不到Cookies？
A: 现代应用（如知识星球）更多使用LocalStorage，切换到对应标签查看。

### Q: 导出的数据安全吗？
A: 数据保存在本地，建议使用后修改密码。不要将导出文件分享给不可信的人。

### Q: 可以导入数据吗？
A: 当前版本主要用于查看和导出。导入功能需要手动操作或等待后续版本。

### Q: 扩展会收集我的数据吗？
A: 完全不会。所有操作在浏览器本地完成，开源可审查。

---

## 📧 反馈与支持

- GitHub Issues: https://github.com/jiawei89/cookie-manager-pro/issues
- Email: 331470234@qq.com

享受使用！🍪
