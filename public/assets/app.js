async function loadPartial(id, url) {
  const mount = document.getElementById(id);
  if (!mount) return;
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    const html = await res.text();
    mount.innerHTML = html;
    if (id === 'site-header') {
      postHeaderInit();
      // Call updateHeaderAuth after header is loaded with retries
      let attempts = 0;
      const tryUpdateAuth = () => {
        attempts++;
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        
        if ((authButtons || userMenu) && typeof updateHeaderAuth === 'function') {
          updateHeaderAuth();
        } else if (attempts < 10) {
          // Retry up to 10 times (500ms total)
          setTimeout(tryUpdateAuth, 50);
        }
      };
      setTimeout(tryUpdateAuth, 100);
    }
  } catch (e) {
    console.error('Failed to load partial', id, url, e);
  }
}

function postHeaderInit() {
  const nav = document.querySelector('.main-nav');
  const toggle = document.querySelector('.menu-toggle');
  if (toggle && nav) {
    const mobileQuery = window.matchMedia('(max-width: 920px)');

    const closeNav = () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (!mobileQuery.matches) return;
        closeNav();
      });
    });

    const handleWidthChange = event => {
      if (!(event.matches ?? mobileQuery.matches)) {
        closeNav();
      }
    };

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', handleWidthChange);
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(handleWidthChange);
    }
  }

  const path = location.pathname;
  document.querySelectorAll('.main-nav a').forEach(a => {
    if (path.startsWith('/html') && a.dataset.nav === 'HTML') a.classList.add('active');
    else if (path.startsWith('/css') && a.dataset.nav === 'CSS') a.classList.add('active');
    else if (path.startsWith('/ai') && a.dataset.nav === 'AI') a.classList.add('active');
    else if (path.startsWith('/playground') && a.dataset.nav === 'Playground') a.classList.add('active');
  });

  document.querySelectorAll('.sidebar a').forEach(a => {
    if (a.getAttribute('href') === location.pathname) a.classList.add('active');
  });
}

function enhanceDocsSidebar() {
  const docs = document.querySelector('.docs');
  const sidebar = docs?.querySelector('.sidebar');
  const toggle = docs?.querySelector('.sidebar-toggle');
  if (!docs || !sidebar || !toggle) return;

  sidebar.setAttribute('tabindex', '-1');

  const mobileQuery = window.matchMedia('(max-width: 920px)');
  const state = { open: false };

  const isMobile = () => mobileQuery.matches;

  const setSidebarState = (open, { focusToggle = false } = {}) => {
    state.open = open;
    document.body.classList.toggle('sidebar-open', open);
    sidebar.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));

    if (isMobile()) {
      sidebar.toggleAttribute('inert', !open);
      sidebar.setAttribute('aria-hidden', String(!open));
      if (open) {
        requestAnimationFrame(() => {
          try {
            sidebar.focus({ preventScroll: true });
          } catch {
            sidebar.focus();
          }
        });
      } else if (focusToggle) {
        toggle.focus();
      }
    } else {
      sidebar.removeAttribute('inert');
      sidebar.removeAttribute('aria-hidden');
      if (focusToggle) toggle.focus();
    }
  };

  const closeSidebar = (options = {}) => {
    if (!state.open) return;
    setSidebarState(false, options);
  };

  toggle.addEventListener('click', () => {
    if (!isMobile()) return;
    const nextOpen = !state.open;
    setSidebarState(nextOpen, { focusToggle: !nextOpen });
  });

  sidebar.addEventListener('click', event => {
    const target = event.target;
    if (target instanceof HTMLElement && target.matches('a')) {
      closeSidebar({ focusToggle: true });
    }
  });

  document.addEventListener('click', event => {
    if (!isMobile() || !state.open) return;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (sidebar.contains(target) || toggle.contains(target)) return;
    closeSidebar();
  });

  document.addEventListener('keydown', event => {
    if (!isMobile() || event.key !== 'Escape' || !state.open) return;
    event.preventDefault();
    closeSidebar({ focusToggle: true });
  });

  const syncForViewport = mq => {
    const matches = mq.matches ?? isMobile();
    if (matches) {
      sidebar.toggleAttribute('inert', !state.open);
      sidebar.setAttribute('aria-hidden', String(!state.open));
    } else {
      closeSidebar();
      sidebar.removeAttribute('inert');
      sidebar.removeAttribute('aria-hidden');
      toggle.setAttribute('aria-expanded', 'false');
    }
  };

  syncForViewport(mobileQuery);

  const listener = event => syncForViewport(event);
  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', listener);
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(listener);
  }
}

enhanceDocsSidebar();

loadPartial('site-header', '/partials/header.html');
loadPartial('site-footer', '/partials/footer.html');

// Collapsible "HTML Colors" section heading (simple arrow toggle)
(function installColorsCollapsible(){
  if (!location.pathname.startsWith('/html')) return;
  const sidebar = document.querySelector('.docs .sidebar');
  if (!sidebar) return;

  // Find color-related links in the sidebar
  const colorLinks = Array.from(sidebar.querySelectorAll('a')).filter(a => /^\/html\/colors(\/|\.html|$)/.test(a.getAttribute('href')||''));
  if (!colorLinks.length) return;

  // If a static "HTML Colors" heading exists, remove it to avoid duplicates
  const existingHeading = Array.from(sidebar.querySelectorAll('h3')).find(h => /html\s+colors/i.test(h.textContent));
  if (existingHeading) existingHeading.remove();

  // Group links and add a collapsible row
  const group = document.createElement('div');
  group.className = 'colors-subnav';
  colorLinks[0].before(group);
  colorLinks.forEach(a => group.appendChild(a));

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'collapsible-row';
  btn.setAttribute('aria-expanded', 'false');
  const caret = document.createElement('span'); caret.className = 'caret'; caret.textContent = '▾'; caret.setAttribute('aria-hidden','true');
  btn.append('HTML Colors', caret);
  group.before(btn);

  function setOpen(open){ btn.setAttribute('aria-expanded', String(open)); group.hidden = !open; }
  btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));

  // Open when browsing colors pages
  setOpen(/^\/html\/colors(\/|\.html|$)/.test(location.pathname));
})();

// --- Header & Auth Logic ---

// Check authentication status and update header
async function updateHeaderAuth() {
  try {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    
    // console.log('Auth check result:', data);
    
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const headerUsername = document.getElementById('headerUsername');
    const headerProfilePicture = document.getElementById('headerProfilePicture');
    const mobileAuthBtn = document.getElementById('mobileAuthBtn');
    const mobileUserBtn = document.getElementById('mobileUserBtn');
    
    if (data.success && data.user) {
      // User is logged in
      if (authButtons) {
        authButtons.style.setProperty('display', 'none', 'important');
        authButtons.style.setProperty('visibility', 'hidden', 'important');
        authButtons.setAttribute('hidden', 'true');
      }
      if (userMenu) {
        userMenu.style.setProperty('display', 'flex', 'important');
        userMenu.style.setProperty('visibility', 'visible', 'important');
        userMenu.removeAttribute('hidden');
      }
      if (headerUsername) headerUsername.textContent = data.user.username;
      
      // Update profile picture
      if (headerProfilePicture) {
        if (data.user.profilePicture) {
          headerProfilePicture.innerHTML = `<img src="${data.user.profilePicture}" style="width: 100%; height: 100%; object-fit: cover;" alt="${data.user.username}">`;
        } else {
          headerProfilePicture.textContent = data.user.username.charAt(0).toUpperCase();
        }
      }
      
      // Load notification count
      if (typeof loadNotificationCount === 'function') loadNotificationCount();
      
      // Mobile
      if (mobileAuthBtn) mobileAuthBtn.style.display = 'none';
      if (mobileUserBtn) mobileUserBtn.style.display = 'inline-flex';
    } else {
      // User is not logged in
      if (authButtons) {
        authButtons.style.setProperty('display', 'flex', 'important');
        authButtons.style.setProperty('visibility', 'visible', 'important');
        authButtons.removeAttribute('hidden');
      }
      if (userMenu) {
        userMenu.style.setProperty('display', 'none', 'important');
        userMenu.style.setProperty('visibility', 'hidden', 'important');
        userMenu.setAttribute('hidden', 'true');
      }
      
      // Mobile
      if (mobileAuthBtn) mobileAuthBtn.style.display = 'inline-flex';
      if (mobileUserBtn) mobileUserBtn.style.display = 'none';
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    // On error, show login buttons
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    if (authButtons) {
      authButtons.style.setProperty('display', 'flex', 'important');
      authButtons.style.setProperty('visibility', 'visible', 'important');
      authButtons.removeAttribute('hidden');
    }
    if (userMenu) {
      userMenu.style.setProperty('display', 'none', 'important');
      userMenu.style.setProperty('visibility', 'hidden', 'important');
      userMenu.setAttribute('hidden', 'true');
    }
  }
}

// Logout function
async function handleLogout() {
  if (!confirm('Are you sure you want to logout?')) {
    return;
  }

  try {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    const data = await response.json();
    
    if (data.success) {
      window.location.href = '/login.html';
    } else {
      alert('Logout failed. Please try again.');
    }
  } catch (error) {
    console.error('Logout error:', error);
    alert('Logout failed. Please try again.');
  }
}

// Notification System
let notificationDropdownOpen = false;

async function loadNotifications() {
  try {
    const response = await fetch('/api/notifications?limit=10');
    const data = await response.json();
    
    if (data.success) {
      const list = document.getElementById('notificationList');
      if (!list) return;
      
      if (data.notifications.length === 0) {
        list.innerHTML = '<p class="text-center text-gray-400 py-4">No notifications</p>';
        return;
      }
      
      list.innerHTML = data.notifications.map(notif => `
        <div class="px-4 py-3 hover:bg-white/5 border-b border-dark-border/50 cursor-pointer ${notif.read ? 'opacity-60' : ''}" data-notification-id="${notif._id}" onclick="handleNotificationClick('${notif._id}', '${notif.data?.pageUrl || ''}')">
          <p class="text-sm text-white ${notif.read ? '' : 'font-semibold'}">${notif.message}</p>
          <p class="text-xs text-gray-400 mt-1">${formatNotificationDate(notif.createdAt)}</p>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading notifications:', error);
  }
}

async function loadNotificationCount() {
  try {
    const response = await fetch('/api/notifications/unread-count');
    const data = await response.json();
    
    if (data.success) {
      const countBadge = document.getElementById('notificationCount');
      if (!countBadge) return;
      
      if (data.count > 0) {
        countBadge.textContent = data.count > 99 ? '99+' : data.count;
        countBadge.style.display = 'block';
      } else {
        countBadge.style.display = 'none';
      }
    }
  } catch (error) {
    // console.log('Error loading notification count');
  }
}

function formatNotificationDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}

async function handleNotificationClick(notificationId, pageUrl) {
  try {
    // Mark as read
    await fetch(`/api/notifications/${notificationId}/read`, { method: 'PUT' });
    
    // Reload count
    await loadNotificationCount();
    
    // Navigate to the page
    if (pageUrl) {
      window.location.href = pageUrl;
    }
  } catch (error) {
    console.error('Error handling notification:', error);
  }
}

// Toggle notification dropdown
document.addEventListener('click', async (e) => {
  const bell = document.getElementById('notificationBell');
  const dropdown = document.getElementById('notificationDropdown');
  
  // Only proceed if elements exist
  if (!bell || !dropdown) return;
  
  if (bell.contains(e.target)) {
    notificationDropdownOpen = !notificationDropdownOpen;
    dropdown.style.display = notificationDropdownOpen ? 'block' : 'none';
    
    if (notificationDropdownOpen) {
      await loadNotifications();
    }
  } else if (!dropdown.contains(e.target) && e.target !== bell && !bell.contains(e.target)) {
    notificationDropdownOpen = false;
    dropdown.style.display = 'none';
  }
});

// Mark all as read
document.addEventListener('click', async (e) => {
  if (e.target && e.target.id === 'markAllRead') {
    try {
      const response = await fetch('/api/notifications/mark-all-read', { method: 'PUT' });
      const data = await response.json();
      
      if (data.success) {
        await loadNotifications();
        await loadNotificationCount();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }
});

// Load notifications periodically if logged in
setInterval(() => {
  const userMenu = document.getElementById('userMenu');
  if (userMenu && userMenu.style.display !== 'none') {
    loadNotificationCount();
  }
}, 30000); // Every 30 seconds

// Expose functions globally for inline HTML events
window.handleLogout = handleLogout;
window.handleNotificationClick = handleNotificationClick;
window.updateHeaderAuth = updateHeaderAuth;
