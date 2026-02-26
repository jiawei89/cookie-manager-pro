#!/bin/bash
# 图标生成脚本（需要ImageMagick）

echo "正在生成图标..."

# 创建简单的SVG图标
cat > /tmp/cookie_icon.svg << 'EOF'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <circle cx="64" cy="64" r="60" fill="#667eea"/>
  <text x="64" y="85" font-family="Arial" font-size="72" text-anchor="middle" fill="white">🍪</text>
</svg>
EOF

# 如果安装了ImageMagick，转换为PNG
if command -v convert &> /dev/null; then
    convert /tmp/cookie_icon.svg -resize 16x16 /tmp/cookie-manager-extension/icons/icon16.png
    convert /tmp/cookie_icon.svg -resize 32x32 /tmp/cookie-manager-extension/icons/icon32.png
    convert /tmp/cookie_icon.svg -resize 48x48 /tmp/cookie-manager-extension/icons/icon48.png
    convert /tmp/cookie_icon.svg -resize 128x128 /tmp/cookie-manager-extension/icons/icon128.png
    echo "✅ 图标生成成功！"
else
    echo "⚠️  未安装ImageMagick，请手动添加图标文件"
    echo "   或者运行: sudo apt-get install imagemagick"
fi

# 清理临时文件
rm -f /tmp/cookie_icon.svg
