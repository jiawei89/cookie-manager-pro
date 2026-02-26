// Cookie Manager Pro - Enhanced with LocalStorage & SessionStorage support

let currentTab = null;
let allCookies = [];
let blockedCookies = new Set();
let lockedCookies = new Set();
let currentStorageType = 'cookies'; // 'cookies', 'localStorage', 'sessionStorage'
let allStorageData = {
  cookies: [],
  localStorage: [],
  sessionStorage: []
};

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await getCurrentTab();
  setupEventListeners();
});

// 加载设置
async function loadSettings() {
  const result = await chrome.storage.local.get(['blockedCookies', 'lockedCookies']);
  blockedCookies = new Set(result.blockedCookies || []);
  lockedCookies = new Set(result.lockedCookies || []);
}

// 获取当前标签页
async function getCurrentTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]) {
    currentTab = tabs[0];
    document.getElementById('currentUrl').textContent = currentTab.url;
    await loadCurrentStorage();
  }
}

// 加载当前存储类型的数据
async function loadCurrentStorage() {
  if (!currentTab) return;

  switch (currentStorageType) {
    case 'cookies':
      await loadCookies();
      break;
    case 'localStorage':
      await loadWebStorage('localStorage');
      break;
    case 'sessionStorage':
      await loadWebStorage('sessionStorage');
      break;
  }
}

// 加载cookies
async function loadCookies() {
  if (!currentTab) return;

  const url = new URL(currentTab.url);

  // 获取当前域名和所有相关域名的cookies
  const hostname = url.hostname;
  let cookies = [];

  // 尝试多种域名匹配方式
  const domains = [
    hostname,
    `.${hostname}`,
    `www.${hostname}`,
    `.www.${hostname}`
  ];

  for (const domain of domains) {
    try {
      const domainCookies = await chrome.cookies.getAll({ domain: domain });
      cookies = cookies.concat(domainCookies);
    } catch (err) {
      console.error(`获取域名 ${domain} 的cookies失败:`, err);
    }
  }

  // 去重
  const uniqueCookies = new Map();
  for (const cookie of cookies) {
    const key = `${cookie.domain}:${cookie.name}:${cookie.path}`;
    if (!uniqueCookies.has(key)) {
      uniqueCookies.set(key, cookie);
    }
  }

  cookies = Array.from(uniqueCookies.values());

  allCookies = cookies.filter(cookie => {
    const key = `${cookie.domain}:${cookie.name}`;
    return !blockedCookies.has(key);
  });

  allStorageData.cookies = allCookies;
  displayStorageItems(allCookies, 'cookie');
  updateStats();
}

// 加载Web存储（LocalStorage或SessionStorage）
async function loadWebStorage(storageType) {
  if (!currentTab) return;

  try {
    // 注入脚本到页面中读取存储
    const results = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: getStorageData,
      args: [storageType]
    });

    const storageItems = results[0].result || [];
    allStorageData[storageType] = storageItems;
    displayStorageItems(storageItems, storageType);
    updateStats();
  } catch (err) {
    console.error(`读取${storageType}失败:`, err);
    displayStorageItems([], storageType);
  }
}

// 在页面中执行的函数 - 读取存储数据
function getStorageData(storageType) {
  const items = [];
  const storage = storageType === 'localStorage' ? localStorage : sessionStorage;

  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    const value = storage.getItem(key);
    items.push({
      key: key,
      value: value,
      length: value ? value.length : 0
    });
  }

  return items;
}

// 显示存储项
function displayStorageItems(items, type) {
  const list = document.getElementById('storageList');

  if (!items || items.length === 0) {
    const typeNames = {
      cookie: 'Cookies',
      localStorage: 'LocalStorage',
      sessionStorage: 'SessionStorage'
    };
    list.innerHTML = `
      <div class="empty-state">
        <p>🍪 没有${typeNames[type]}数据</p>
        ${type === 'cookie' ? '<p>尝试点击"🌐 查看全部"查看所有域名的cookies</p>' : ''}
      </div>
    `;
    return;
  }

  if (type === 'cookie') {
    displayCookies(items);
  } else {
    displayWebStorageItems(items, type);
  }
}

// 显示Cookies
function displayCookies(cookies = allCookies) {
  const cookieList = document.getElementById('storageList');

  if (cookies.length === 0) {
    cookieList.innerHTML = `
      <div class="empty-state">
        <p>🍪 当前网站没有cookies</p>
        <p>试试点击"查看全部"查看所有域名的cookies</p>
      </div>
    `;
    return;
  }

  // 按域名分组
  const groupedCookies = new Map();
  for (const cookie of cookies) {
    const domain = cookie.domain;
    if (!groupedCookies.has(domain)) {
      groupedCookies.set(domain, []);
    }
    groupedCookies.get(domain).push(cookie);
  }

  let html = '';
  for (const [domain, domainCookies] of groupedCookies) {
    html += `<div class="domain-section">
      <div class="domain-header">🌐 ${escapeHtml(domain)} (${domainCookies.length}个)</div>`;

    for (const cookie of domainCookies) {
      const key = `${cookie.domain}:${cookie.name}`;
      const isLocked = lockedCookies.has(key);
      const isBlocked = blockedCookies.has(key);

      html += `
      <div class="cookie-item" data-cookie-key="${key}">
        <div class="cookie-header">
          <span class="cookie-name">${escapeHtml(cookie.name)}</span>
          <div class="cookie-actions">
            <button class="action-copy" title="复制">📋</button>
            <button class="action-lock ${isLocked ? 'locked' : ''}" title="${isLocked ? '已锁定' : '锁定'}">
              ${isLocked ? '🔒' : '🔓'}
            </button>
            <button class="action-delete" title="删除">❌</button>
          </div>
        </div>
        <div class="cookie-details">
          <div class="cookie-detail">
            <span class="cookie-label">值:</span>
            <span class="cookie-value-short">${escapeHtml(cookie.value.substring(0, 100))}${cookie.value.length > 100 ? '...' : ''}</span>
          </div>
        </div>
      </div>`;
    }

    html += '</div>';
  }

  cookieList.innerHTML = html;

  // 添加事件监听
  cookieList.querySelectorAll('.cookie-item').forEach(item => {
    const key = item.dataset.cookieKey;
    item.querySelector('.action-copy').addEventListener('click', () => copyCookie(key));
    item.querySelector('.action-lock').addEventListener('click', () => toggleLock(key));
    item.querySelector('.action-delete').addEventListener('click', () => deleteCookie(key));
  });
}

// 显示Web存储项
function displayWebStorageItems(items, type) {
  const list = document.getElementById('storageList');

  if (!items || items.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <p>🍪 没有${type}数据</p>
      </div>
    `;
    return;
  }

  let html = '';
  for (const item of items) {
    const displayValue = escapeHtml(item.value.substring(0, 150)) + (item.value.length > 150 ? '...' : '');

    html += `
      <div class="storage-item">
        <div class="storage-header">
          <span class="storage-key">${escapeHtml(item.key)}</span>
          <div class="storage-actions">
            <button class="action-copy-value" data-key="${escapeHtml(item.key)}" title="复制值">📋</button>
          </div>
        </div>
        <div class="storage-details">
          <div class="storage-detail">
            <span class="cookie-label">长度:</span>
            <span>${item.length} 字符</span>
          </div>
          <div class="storage-value-full">
            <span class="cookie-label">值:</span>
            ${displayValue}
          </div>
        </div>
      </div>`;
  }

  list.innerHTML = html;

  // 添加复制事件
  list.querySelectorAll('.action-copy-value').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.key;
      const item = items.find(i => i.key === key);
      if (item) {
        await navigator.clipboard.writeText(item.value);
        showToast('已复制到剪贴板');
      }
    });
  });
}

// 更新统计
function updateStats() {
  const countSpan = document.getElementById('cookieCount');

  if (currentStorageType === 'cookies') {
    countSpan.textContent = `${allStorageData.cookies.length} cookies`;
  } else {
    countSpan.textContent = `${allStorageData[currentStorageType]?.length || 0} 项`;
  }

  if (currentTab) {
    const url = new URL(currentTab.url);
    document.getElementById('domainInfo').textContent = url.hostname;
  }
}

// 切换存储类型
function switchStorageType(type) {
  currentStorageType = type;

  // 更新标签样式
  document.querySelectorAll('.storage-tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.type === type) {
      tab.classList.add('active');
    }
  });

  loadCurrentStorage();
}

// 复制cookie
async function copyCookie(key) {
  const cookie = allCookies.find(c => `${c.domain}:${c.name}` === key);
  if (!cookie) return;

  const text = `${cookie.name}=${cookie.value}; Domain=${cookie.domain}; Path=${cookie.path}`;

  try {
    await navigator.clipboard.writeText(text);
    showToast('已复制到剪贴板');
  } catch (err) {
    showToast('复制失败');
  }
}

// 切换锁定
async function toggleLock(key) {
  if (lockedCookies.has(key)) {
    lockedCookies.delete(key);
    showToast('已解锁');
  } else {
    lockedCookies.add(key);
    showToast('已锁定');
  }

  await chrome.storage.local.set({ lockedCookies: Array.from(lockedCookies) });
  displayCookies();
}

// 删除cookie
async function deleteCookie(key) {
  if (!confirm('确定要删除这个cookie吗？')) return;

  const cookie = allCookies.find(c => `${c.domain}:${c.name}` === key);
  if (!cookie) return;

  const url = `https://${cookie.domain.replace(/^\./, '')}${cookie.path}`;

  try {
    await chrome.cookies.remove({
      url: url,
      name: cookie.name,
      storeId: cookie.storeId
    });

    await loadCookies();
    showToast('已删除');
  } catch (err) {
    console.error('删除失败:', err);
    showToast('删除失败: ' + err.message);
  }
}

// 导出当前存储类型
async function exportCurrentStorage() {
  let exportData;
  let filename;

  if (currentStorageType === 'cookies') {
    exportData = {
      type: 'cookies',
      url: currentTab.url,
      domain: new URL(currentTab.url).hostname,
      itemCount: allStorageData.cookies.length,
      exportedAt: new Date().toISOString(),
      cookies: allStorageData.cookies.map(c => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path,
        secure: c.secure,
        httpOnly: c.httpOnly,
        expirationDate: c.expirationDate
      }))
    };
    filename = `cookies_${new URL(currentTab.url).hostname}_${Date.now()}.json`;
  } else {
    exportData = {
      type: currentStorageType,
      url: currentTab.url,
      domain: new URL(currentTab.url).hostname,
      itemCount: allStorageData[currentStorageType]?.length || 0,
      exportedAt: new Date().toISOString(),
      items: allStorageData[currentStorageType] || []
    };
    filename = `${currentStorageType}_${new URL(currentTab.url).hostname}_${Date.now()}.json`;
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
  showToast(`已导出 ${exportData.itemCount} 项`);
}

// 导出所有存储类型
async function exportAllStorage() {
  // 先加载所有存储类型
  await loadAllStorageTypes();

  const exportData = {
    url: currentTab.url,
    domain: new URL(currentTab.url).hostname,
    exportedAt: new Date().toISOString(),
    cookies: {
      count: allStorageData.cookies.length,
      items: allStorageData.cookies.map(c => ({
        name: c.name,
        value: c.value,
        domain: c.domain,
        path: c.path,
        secure: c.secure,
        httpOnly: c.httpOnly
      }))
    },
    localStorage: {
      count: allStorageData.localStorage?.length || 0,
      items: allStorageData.localStorage || []
    },
    sessionStorage: {
      count: allStorageData.sessionStorage?.length || 0,
      items: allStorageData.sessionStorage || []
    }
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `all_storage_${new URL(currentTab.url).hostname}_${Date.now()}.json`;
  a.click();

  URL.revokeObjectURL(url);

  const totalItems = exportData.cookies.count + exportData.localStorage.count + exportData.sessionStorage.count;
  showToast(`已导出全部 ${totalItems} 项`);
}

// 加载所有存储类型
async function loadAllStorageTypes() {
  if (!currentTab) return;

  // Cookies已经在allStorageData中了
  // 加载LocalStorage
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: getStorageData,
      args: ['localStorage']
    });
    allStorageData.localStorage = results[0].result || [];
  } catch (err) {
    allStorageData.localStorage = [];
  }

  // 加载SessionStorage
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: currentTab.id },
      func: getStorageData,
      args: ['sessionStorage']
    });
    allStorageData.sessionStorage = results[0].result || [];
  } catch (err) {
    allStorageData.sessionStorage = [];
  }
}

// Toast提示
function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #333;
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// HTML转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 设置事件监听
function setupEventListeners() {
  document.getElementById('refreshBtn').addEventListener('click', loadCurrentStorage);
  document.getElementById('exportCurrentBtn').addEventListener('click', exportCurrentStorage);
  document.getElementById('exportBtn').addEventListener('click', exportAllStorage);

  // 存储类型切换
  document.querySelectorAll('.storage-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchStorageType(tab.dataset.type);
    });
  });
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .storage-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    background: #f5f5f5;
    padding: 4px;
    border-radius: 8px;
  }

  .storage-tab {
    flex: 1;
    padding: 8px 12px;
    border: none;
    background: transparent;
    color: #666;
    cursor: pointer;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .storage-tab:hover {
    background: rgba(102, 126, 234, 0.1);
  }

  .storage-tab.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .storage-item {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 8px;
    transition: all 0.2s;
  }

  .storage-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-color: #667eea;
  }

  .storage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .storage-key {
    font-weight: 600;
    color: #333;
    font-size: 14px;
    word-break: break-all;
  }

  .storage-value-short {
    color: #666;
    font-size: 12px;
    word-break: break-all;
  }

  .storage-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 12px;
    color: #666;
  }
`;
document.head.appendChild(style);
