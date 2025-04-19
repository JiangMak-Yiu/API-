let apiData = {};
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let recentVisits = JSON.parse(localStorage.getItem('recentVisits') || '[]');
let visitStats = JSON.parse(localStorage.getItem('visitStats') || '{}');
let currentView = localStorage.getItem('viewMode') || 'grid';
let totalVisits = parseInt(localStorage.getItem('totalVisits') || '0');

const apiList = document.getElementById('apiList');
const searchInput = document.getElementById('searchInput');
const totalCount = document.getElementById('totalCount');
const visitCount = document.getElementById('visitCount');
const totalFavs = document.getElementById('totalFavs');
const favCount = document.getElementById('favCount');
const sortSelect = document.getElementById('sortSelect');
const gridViewBtn = document.getElementById('gridViewBtn');
const listViewBtn = document.getElementById('listViewBtn');
const randomBtn = document.getElementById('randomBtn');
const favoritesBtn = document.getElementById('favoritesBtn');
const randomPanel = document.getElementById('randomPanel');
const favoritesPanel = document.getElementById('favoritesPanel');
const recentPanel = document.getElementById('recentPanel');
const randomApiList = document.getElementById('randomApiList');
const favoritesApiList = document.getElementById('favoritesApiList');
const recentApiList = document.getElementById('recentApiList');
const apiPreview = document.getElementById('apiPreview');
const previewTitle = document.getElementById('previewTitle');
const previewApiCount = document.getElementById('previewApiCount');
const previewUrl = document.getElementById('previewUrl');
const previewFavBtn = document.getElementById('previewFavBtn');
const previewShareBtn = document.getElementById('previewShareBtn');
const shareModal = document.getElementById('shareModal');
const shareName = document.getElementById('shareName');
const shareLink = document.getElementById('shareLink');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const themeToggle = document.getElementById('themeToggle');

fetch('api.json')
  .then(r => r.json())
  .then(d => {
    apiData = d;
    initApp(d);
  })
  .catch(e => {
    console.error('加载数据失败', e);
    apiList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px;">加载数据失败，请刷新页面重试</div>';
  });

function initApp(data) {
  if (currentView === 'list') {
    apiList.classList.add('list-view');
    listViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
  }
  
  renderApiList(data.allSites);
  
  updateStats(data);
  
  renderFavorites();
  renderRecentVisits();
  
  initTheme();
  
  addEventListeners();
}

function renderApiList(items, container = apiList, className = 'api-card') {
  container.innerHTML = '';
  if (items.length === 0) {
    container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--text-light);">没有找到匹配的API网站</div>';
    return;
  }
  
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = className;
    card.dataset.name = item.name;
    card.dataset.url = item.url;
    card.dataset.apiCount = item.apiCount || 0;
    
    if (isFavorite(item.url)) {
      card.classList.add('favorite');
    }
    
    card.innerHTML = `
      <h2>${item.name}</h2>
      <button type="button" class="fav-btn ${isFavorite(item.url) ? 'active' : ''}" 
        data-url="${item.url}" 
        data-name="${item.name}" 
        data-api-count="${item.apiCount || 0}"
        style="cursor: pointer; z-index: 10;">
          <i class="${isFavorite(item.url) ? 'fas' : 'far'} fa-heart"></i>
      </button>
    `;
    
    card.addEventListener('click', (e) => {
      if (e.target.closest('.fav-btn') || e.target.classList.contains('fa-heart')) {
        console.log('阻止卡片点击，因为点击了收藏按钮');
        return;
      }
      
      console.log('卡片点击，打开链接:', item.url);
      recordVisit(item);
      window.open(item.url, '_blank');
    });
    
    card.addEventListener('mouseenter', (e) => {
      showPreview(item, e);
    });
    
    card.addEventListener('mouseleave', () => {
      hidePreview();
    });
    
    const randomDelay = Math.random() * 0.5;
    card.style.animation = `fadeInUp 0.5s ${randomDelay}s both`;
    
    container.appendChild(card);
  });
}

function updateStats(data) {
  totalCount.textContent = data.total || data.allSites.length;
  visitCount.textContent = totalVisits;
  totalFavs.textContent = favorites.length;
  favCount.textContent = favorites.length;
}

function recordVisit(item) {
  totalVisits++;
  localStorage.setItem('totalVisits', totalVisits);
  
  visitStats[item.url] = (visitStats[item.url] || 0) + 1;
  localStorage.setItem('visitStats', JSON.stringify(visitStats));
  
  const existingIndex = recentVisits.findIndex(v => v.url === item.url);
  if (existingIndex !== -1) {
    recentVisits.splice(existingIndex, 1);
  }
  
  recentVisits.unshift({
    name: item.name,
    url: item.url,
    apiCount: item.apiCount,
    timestamp: Date.now()
  });
  
  if (recentVisits.length > 10) {
    recentVisits = recentVisits.slice(0, 10);
  }
  
  localStorage.setItem('recentVisits', JSON.stringify(recentVisits));
  
  visitCount.textContent = totalVisits;
  renderRecentVisits();
}

function isFavorite(url) {
  return favorites.some(item => item.url === url);
}

function toggleFavorite(item) {
  const index = favorites.findIndex(fav => fav.url === item.url);
  
  if (index === -1) {
    favorites.push({
      name: item.name,
      url: item.url,
      apiCount: item.apiCount,
      timestamp: Date.now()
    });
  } else {
    favorites.splice(index, 1);
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
  
  totalFavs.textContent = favorites.length;
  favCount.textContent = favorites.length;
  renderFavorites();
}

function renderFavorites() {
  renderApiList(favorites, favoritesApiList, 'api-card small');
}

function renderRecentVisits() {
  renderApiList(recentVisits, recentApiList, 'api-card small');
}

function getRandomApis(count = 6) {
  const allApis = [...apiData.allSites];
  const randomApis = [];
  
  for (let i = 0; i < count && allApis.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * allApis.length);
    randomApis.push(allApis[randomIndex]);
    allApis.splice(randomIndex, 1);
  }
  
  return randomApis;
}

function showPreview(item, event) {
  previewTitle.textContent = item.fullName || item.name;
  previewApiCount.textContent = item.apiCount || '未知';
  previewUrl.href = item.url;
  previewUrl.textContent = item.url;
  
  const isFav = isFavorite(item.url);
  previewFavBtn.innerHTML = `<i class="${isFav ? 'fas' : 'far'} fa-heart"></i> ${isFav ? '取消收藏' : '收藏'}`;
  previewFavBtn.dataset.url = item.url;
  previewFavBtn.dataset.name = item.name;
  previewFavBtn.dataset.apiCount = item.apiCount || 0;
  
  previewShareBtn.dataset.url = item.url;
  previewShareBtn.dataset.name = item.name;
  
  const cardRect = event.currentTarget.getBoundingClientRect();
  const previewRect = apiPreview.getBoundingClientRect();
  
  let left = cardRect.left + (cardRect.width / 2) - (previewRect.width / 2);
  let top = cardRect.top - previewRect.height - 10;
  
  if (left < 10) left = 10;
  if (left + previewRect.width > window.innerWidth - 10) {
    left = window.innerWidth - previewRect.width - 10;
  }
  
  if (top < 10) {
    top = cardRect.bottom + 10;
  }
  
  apiPreview.style.left = `${left}px`;
  apiPreview.style.top = `${top}px`;
  
  apiPreview.classList.add('visible');
}

function hidePreview() {
  apiPreview.classList.remove('visible');
}

function showShareModal(url, name) {
  shareName.textContent = name;
  shareLink.value = url;
  shareModal.classList.add('visible');
}

function hideShareModal() {
  shareModal.classList.remove('visible');
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    copyLinkBtn.textContent = '已复制!';
    setTimeout(() => {
      copyLinkBtn.innerHTML = '<i class="fas fa-copy"></i> 复制';
    }, 2000);
  }).catch(err => {
    console.error('无法复制链接: ', err);
  });
}

function filterApis(searchTerm = '', sortBy = 'default') {
  let filteredItems = [...apiData.allSites];
  
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredItems = filteredItems.filter(item => 
      item.name.toLowerCase().includes(term) || 
      (item.fullName && item.fullName.toLowerCase().includes(term))
    );
  }
  
  switch(sortBy) {
    case 'nameAsc':
      filteredItems.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'nameDesc':
      filteredItems.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'apiCountDesc':
      filteredItems.sort((a, b) => {
        const countA = a.apiCount || 0;
        const countB = b.apiCount || 0;
        return countB - countA;
      });
      break;
    case 'apiCountAsc':
      filteredItems.sort((a, b) => {
        const countA = a.apiCount || 0;
        const countB = b.apiCount || 0;
        return countA - countB;
      });
      break;
  }
  
  renderApiList(filteredItems);
}

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  themeToggle.innerHTML = newTheme === 'dark' 
    ? '<i class="fas fa-sun"></i>' 
    : '<i class="fas fa-moon"></i>';
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeToggle.innerHTML = savedTheme === 'dark' 
      ? '<i class="fas fa-sun"></i>' 
      : '<i class="fas fa-moon"></i>';
  } else {
    localStorage.setItem('theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

function debounce(func, wait = 300) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const debouncedSearch = debounce(() => {
  const searchTerm = searchInput.value.toLowerCase();
  const sortValue = sortSelect.value;
  filterApis(searchTerm, sortValue);
});

function addEventListeners() {
  // 添加全局事件委托，处理所有收藏按钮点击
  document.addEventListener('click', (e) => {
    console.log('点击元素:', e.target); // 调试用
    
    // 检查是否点击的是收藏按钮或其内部的爱心图标
    const heartIcon = e.target.closest('.fa-heart') || e.target.querySelector('.fa-heart');
    const favBtn = e.target.closest('.fav-btn');
    
    // 如果点击的是收藏按钮或爱心图标
    if (favBtn || heartIcon) {
      e.stopPropagation();
      e.preventDefault();
      
      // 获取到实际的按钮元素
      const button = favBtn || (heartIcon ? heartIcon.closest('.fav-btn') : null);
      if (!button) return;
      
      const url = button.dataset.url;
      const name = button.dataset.name;
      const apiCount = button.dataset.apiCount || 0;
      
      console.log('收藏操作:', name, url); // 调试用
      
      toggleFavorite({name, url, apiCount});
      
      // 更新所有相关按钮状态
      const isFav = isFavorite(url);
      document.querySelectorAll(`.fav-btn[data-url="${url}"]`).forEach(btn => {
        btn.classList.toggle('active', isFav);
        btn.innerHTML = `<i class="${isFav ? 'fas' : 'far'} fa-heart"></i>`;
        
        // 更新父卡片
        const card = btn.closest('.api-card');
        if (card) {
          card.classList.toggle('favorite', isFav);
        }
      });
      
      return false; // 阻止事件继续传播
    }
    
    // 处理预览中的收藏按钮
    if (e.target.closest('#previewFavBtn')) {
      const url = previewFavBtn.dataset.url;
      const name = previewFavBtn.dataset.name;
      const apiCount = previewFavBtn.dataset.apiCount;
      
      console.log('预览收藏:', name, url); // 调试用
      
      toggleFavorite({name, url, apiCount});
      
      const isFav = isFavorite(url);
      previewFavBtn.innerHTML = `<i class="${isFav ? 'fas' : 'far'} fa-heart"></i> ${isFav ? '取消收藏' : '收藏'}`;
      
      // 更新所有相关卡片
      document.querySelectorAll(`.api-card[data-url="${url}"]`).forEach(card => {
        const favBtn = card.querySelector('.fav-btn');
        card.classList.toggle('favorite', isFav);
        if (favBtn) {
          favBtn.classList.toggle('active', isFav);
          favBtn.innerHTML = `<i class="${isFav ? 'fas' : 'far'} fa-heart"></i>`;
        }
      });
      
      return false; // 阻止事件继续传播
    }
  });
  
  searchInput.addEventListener('input', debouncedSearch);
  sortSelect.addEventListener('change', debouncedSearch);
  
  gridViewBtn.addEventListener('click', () => {
    apiList.classList.remove('list-view');
    gridViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
    currentView = 'grid';
    localStorage.setItem('viewMode', 'grid');
  });
  
  listViewBtn.addEventListener('click', () => {
    apiList.classList.add('list-view');
    listViewBtn.classList.add('active');
    gridViewBtn.classList.remove('active');
    currentView = 'list';
    localStorage.setItem('viewMode', 'list');
  });
  
  randomBtn.addEventListener('click', () => {
    const randomApis = getRandomApis(6);
    renderApiList(randomApis, randomApiList, 'api-card small');
    randomPanel.classList.remove('hidden');
  });
  
  favoritesBtn.addEventListener('click', () => {
    favoritesPanel.classList.toggle('hidden');
  });
  
  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const panel = e.target.closest('.panel');
      if (panel) panel.classList.add('hidden');
      
      const modal = e.target.closest('.modal');
      if (modal) hideShareModal();
    });
  });
  
  document.querySelector('#recentPanel .toggle-btn').addEventListener('click', (e) => {
    const panel = e.target.closest('.panel');
    const icon = e.target.closest('.toggle-btn').querySelector('i');
    
    if (panel.classList.contains('collapsed')) {
      panel.classList.remove('collapsed');
      icon.classList.remove('fa-chevron-down');
      icon.classList.add('fa-chevron-up');
    } else {
      panel.classList.add('collapsed');
      icon.classList.remove('fa-chevron-up');
      icon.classList.add('fa-chevron-down');
    }
  });
  
  previewShareBtn.addEventListener('click', () => {
    const url = previewShareBtn.dataset.url;
    const name = previewShareBtn.dataset.name;
    showShareModal(url, name);
  });
  
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      alert(`分享到${btn.textContent.trim()}功能未实现，请手动复制链接分享`);
    });
  });
  
  copyLinkBtn.addEventListener('click', () => {
    copyToClipboard(shareLink.value);
  });
  
  themeToggle.addEventListener('click', toggleTheme);
  
  window.addEventListener('click', (e) => {
    if (e.target === shareModal) {
      hideShareModal();
    }
  });
}

// 移除重复的事件监听器绑定
// document.addEventListener('DOMContentLoaded', addEventListeners); 