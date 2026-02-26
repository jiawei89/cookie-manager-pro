// Cookie Manager Pro - Popup Script

let currentTab = null;
let allCookies = [];
let blockedCookies = new Set();
let lockedCookies = new Set();

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
    await loadCookies();
  }
}

// 加载cookies
async function loadCookies() {
  if (!currentTab) return;

  const url = new URL(currentTab.url);
  const cookies = await chrome.cookies.getAll({ domain: url.hostname });

  allCookies = cookies.filter(cookie => {
    const key = `${cookie.domain}:${cookie.name}`;
    return !blockedCookies.has(key);
  });

  displayCookies();
  updateStats();
}

// 显示cookies
function displayCookies(cookies = allCookies) {
  const cookieList = document.getElementById('cookieList');

  if (cookies.length === 0) {
    cookieList.innerHTML = `
      <div class="empty-state">
        <p>🍪 没有找到cookies</p>
        <p>尝试刷新或搜索其他域名</p>
      </div>
    `;
    return;
  }

  cookieList.innerHTML = cookies.map(cookie => {
    const key = `${cookie.domain}:${cookie.name}`;
    const isLocked = lockedCookies.has(key);
    const isBlocked = blockedCookies.has(key);

    return `
      <div class="cookie-item" data-cookie-key="${key}">
        <div class="cookie-header">
          <span class="cookie-name">${escapeHtml(cookie.name)}</span>
          <div class="cookie-actions">
            <button class="action-copy" title="复制">📋</button>
            <button class="action-edit ${isLocked ? 'locked' : ''}" title="${isLocked ? '已锁定' : '锁定'}">
              ${isLocked ? '🔒' : '🔓'}
            </button>
            <button class="action-block" title="${isBlocked ? '解除屏蔽' : '屏蔽'}">
              ${isBlocked ? '✅' : '🚫'}
            </button>
            <button class="action-delete" title="删除">❌</button>
          </div>
        </div>
        <div class="cookie-details">
          <div class="cookie-detail">
            <span class="cookie-label">域名:</span>
            <span>${escapeHtml(cookie.domain)}</span>
          </div>
          <div class="cookie-detail">
            <span class="cookie-label">路径:</span>
            <span>${escapeHtml(cookie.path)}</span>
          </div>
          <div class="cookie-value-full">
            <span class="cookie-label">值:</span>
            ${escapeHtml(cookie.value)}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // 添加事件监听
  cookieList.querySelectorAll('.cookie-item').forEach(item => {
    const key = item.dataset.cookieKey;

    item.querySelector('.action-copy').addEventListener('click', () => copyCookie(key));
    item.querySelector('.action-edit').addEventListener('click', () => toggleLock(key));
    item.querySelector('.action-block').addEventListener('click', () => toggleBlock(key));
    item.querySelector('.action-delete').addEventListener('click', () => deleteCookie(key));
  });
}

// 更新统计
function updateStats() {
  document.getElementById('cookieCount').textContent = `${allCookies.length} cookies`;

  if (currentTab) {
    const url = new URL(currentTab.url);
    document.getElementById('domainInfo').textContent = url.hostname;
  }
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
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('已复制到剪贴板');
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

// 切换屏蔽
async function toggleBlock(key) {
  if (blockedCookies.has(key)) {
    blockedCookies.delete(key);
    showToast('已解除屏蔽');
  } else {
    blockedCookies.add(key);
    showToast('已屏蔽');
  }

  await chrome.storage.local.set({ blockedCookies: Array.from(blockedCookies) });
  await loadCookies();
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

// 搜索
function searchCookies(query) {
  if (!query.trim()) {
    displayCookies();
    return;
  }

  query = query.toLowerCase();
  const filtered = allCookies.filter(cookie =>
    cookie.name.toLowerCase().includes(query) ||
    cookie.value.toLowerCase().includes(query) ||
    cookie.domain.toLowerCase().includes(query)
  );

  displayCookies(filtered);
}

// 导出cookies
async function exportCookies() {
  const url = new URL(currentTab.url);
  const cookies = await chrome.cookies.getAll({ domain: url.hostname });

  const exportData = {
    url: currentTab.url,
    domain: url.hostname,
    exportedAt: new Date().toISOString(),
    cookies: cookies.map(c => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly,
      expirationDate: c.expirationDate
    }))
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url2 = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url2;
  a.download = `cookies_${url.hostname}_${Date.now()}.json`;
  a.click();

  URL.revokeObjectURL(url2);
  showToast('已导出');
}

// 导入cookies
function importCookies() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.cookies || !Array.isArray(data.cookies)) {
        throw new Error('无效的格式');
      }

      let imported = 0;
      for (const cookie of data.cookies) {
        try {
          const url = `https://${cookie.domain.replace(/^\./, '')}${cookie.path || '/'}`;
          await chrome.cookies.set({
            url: url,
            name: cookie.name,
            value: cookie.value,
            domain: cookie.domain,
            path: cookie.path || '/',
            secure: cookie.secure || false,
            httpOnly: cookie.httpOnly || false,
            expirationDate: cookie.expirationDate
          });
          imported++;
        } catch (err) {
          console.error('导入失败:', cookie.name, err);
        }
      }

      await loadCookies();
      showToast(`已导入 ${imported} 个cookies`);
    } catch (err) {
      showToast('导入失败: ' + err.message);
    }
  };

  input.click();
}

// 清空所有cookies
async function clearAllCookies() {
  if (!confirm('确定要清空当前域名的所有cookies吗？此操作不可恢复！')) return;

  const url = new URL(currentTab.url);

  for (const cookie of allCookies) {
    try {
      const cookieUrl = `https://${cookie.domain.replace(/^\./, '')}${cookie.path}`;
      await chrome.cookies.remove({
        url: cookieUrl,
        name: cookie.name,
        storeId: cookie.storeId
      });
    } catch (err) {
      console.error('删除失败:', cookie.name, err);
    }
  }

  await loadCookies();
  showToast('已清空所有cookies');
}

// 显示模态框
function showEditModal(cookie = null) {
  const modal = document.getElementById('editModal');
  const title = document.getElementById('modalTitle');
  const form = document.getElementById('cookieForm');

  title.textContent = cookie ? '编辑Cookie' : '添加Cookie';

  if (cookie) {
    document.getElementById('cookieDomain').value = cookie.domain;
    document.getElementById('cookieName').value = cookie.name;
    document.getElementById('cookieValue').value = cookie.value;
    document.getElementById('cookiePath').value = cookie.path;
    document.getElementById('cookieSecure').checked = cookie.secure;
    document.getElementById('cookieHttpOnly').checked = cookie.httpOnly;

    if (cookie.expirationDate) {
      const date = new Date(cookie.expirationDate * 1000);
      document.getElementById('cookieExpiration').value = date.toISOString().slice(0, 16);
    }
  } else {
    form.reset();
    document.getElementById('cookiePath').value = '/';
    if (currentTab) {
      const url = new URL(currentTab.url);
      document.getElementById('cookieDomain').value = url.hostname;
    }
  }

  modal.classList.add('active');
}

// 隐藏模态框
function hideEditModal() {
  document.getElementById('editModal').classList.remove('active');
}

// 保存cookie
async function saveCookie(e) {
  e.preventDefault();

  const domain = document.getElementById('cookieDomain').value;
  const name = document.getElementById('cookieName').value;
  const value = document.getElementById('cookieValue').value;
  const path = document.getElementById('cookiePath').value || '/';
  const secure = document.getElementById('cookieSecure').checked;
  const httpOnly = document.getElementById('cookieHttpOnly').checked;

  let expirationDate = null;
  const expirationInput = document.getElementById('cookieExpiration').value;
  if (expirationInput) {
    expirationDate = new Date(expirationInput).getTime() / 1000;
  }

  const url = `https://${domain.replace(/^\./, '')}${path}`;

  try {
    await chrome.cookies.set({
      url: url,
      name: name,
      value: value,
      domain: domain,
      path: path,
      secure: secure,
      httpOnly: httpOnly,
      expirationDate: expirationDate
    });

    hideEditModal();
    await loadCookies();
    showToast('保存成功');
  } catch (err) {
    console.error('保存失败:', err);
    showToast('保存失败: ' + err.message);
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
  document.getElementById('refreshBtn').addEventListener('click', loadCookies);
  document.getElementById('addCookieBtn').addEventListener('click', () => showEditModal());
  document.getElementById('exportBtn').addEventListener('click', exportCookies);
  document.getElementById('importBtn').addEventListener('click', importCookies);
  document.getElementById('clearAllBtn').addEventListener('click', clearAllCookies);
  document.getElementById('cancelBtn').addEventListener('click', hideEditModal);
  document.getElementById('cookieForm').addEventListener('submit', saveCookie);

  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => searchCookies(e.target.value));

  // 点击模态框外部关闭
  document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target.id === 'editModal') hideEditModal();
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
`;
document.head.appendChild(style);
