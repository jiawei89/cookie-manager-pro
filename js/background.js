// Cookie Manager Pro - Background Service Worker

// 监听扩展安装
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Cookie Manager Pro 已安装');

    // 设置默认值
    chrome.storage.local.set({
      blockedCookies: [],
      lockedCookies: []
    });

    // 创建右键菜单
    chrome.contextMenus.create({
      id: 'viewCookies',
      title: '🍪 查看Cookies',
      contexts: ['page']
    }, () => {
      if (chrome.runtime.lastError) {
        console.log('创建右键菜单失败:', chrome.runtime.lastError.message);
      }
    });
  } else if (details.reason === 'update') {
    console.log('Cookie Manager Pro 已更新到版本', chrome.runtime.getManifest().version);
  }
});

// 监听cookie变化（用于屏蔽功能）
chrome.cookies.onChanged.addListener((changeInfo) => {
  if (!changeInfo.removed) {
    checkAndBlockCookie(changeInfo.cookie);
  }
});

// 检查是否需要屏蔽cookie
async function checkAndBlockCookie(cookie) {
  const result = await chrome.storage.local.get(['blockedCookies']);
  const blockedCookies = new Set(result.blockedCookies || []);

  const key = `${cookie.domain}:${cookie.name}`;

  if (blockedCookies.has(key)) {
    // 删除被屏蔽的cookie
    const url = `https://${cookie.domain.replace(/^\./, '')}${cookie.path}`;
    chrome.cookies.remove({
      url: url,
      name: cookie.name,
      storeId: cookie.storeId
    });
  }
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCookies') {
    const url = new URL(request.url);
    chrome.cookies.getAll({ domain: url.hostname })
      .then(cookies => sendResponse({ cookies }))
      .catch(err => sendResponse({ error: err.message }));
    return true; // 保持消息通道打开
  }

  if (request.action === 'setCookie') {
    const cookie = request.cookie;
    const url = `https://${cookie.domain.replace(/^\./, '')}${cookie.path}`;

    chrome.cookies.set({
      url: url,
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: cookie.path,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      expirationDate: cookie.expirationDate
    })
      .then(result => sendResponse({ success: true, cookie: result }))
      .catch(err => sendResponse({ success: false, error: err.message }));

    return true;
  }

  if (request.action === 'deleteCookie') {
    const cookie = request.cookie;
    const url = `https://${cookie.domain.replace(/^\./, '')}${cookie.path}`;

    chrome.cookies.remove({
      url: url,
      name: cookie.name,
      storeId: cookie.storeId
    })
      .then(result => sendResponse({ success: true }))
      .catch(err => sendResponse({ success: false, error: err.message }));

    return true;
  }
});

// 右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'viewCookies' && tab) {
    // 尝试打开popup
    chrome.action.openPopup().catch(err => {
      console.log('无法打开popup:', err.message);
    });
  }
});

console.log('✅ Cookie Manager Pro background service worker已加载');
