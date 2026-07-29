const API_BASE = '/api';

const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const catalogTableBody = document.getElementById('catalogTableBody');
const itemModal = document.getElementById('itemModal');
const itemForm = document.getElementById('itemForm');
const modalTitle = document.getElementById('modalTitle');
const currentImagePreview = document.getElementById('currentImagePreview');

let currentToken = localStorage.getItem('adminToken');
let catalogItems = [];

async function fetchAdmin(url, options = {}) {
  options.headers = options.headers || {};
  if (currentToken) {
    options.headers['Authorization'] = `Bearer ${currentToken}`;
  }
  const res = await fetch(url, options);
  if (res.status === 401 || res.status === 403) {
    console.warn('[Admin API] 401/403 response. Session expired.');
    currentToken = null;
    localStorage.removeItem('adminToken');
    if (loginScreen) loginScreen.style.display = 'flex';
    if (dashboardScreen) dashboardScreen.style.display = 'none';
    const loginError = document.getElementById('loginError');
    if (loginError) loginError.innerText = 'Сессия истекла или неверный токен. Войдите снова.';
    throw new Error('Unauthorized/Forbidden');
  }
  return res;
}

// App Init
if (currentToken) {
  showDashboard();
}

// ----------------------------------------------------
// LOGIN & LOGOUT
// ----------------------------------------------------
document.getElementById('loginBtn').addEventListener('click', async () => {
  const u = document.getElementById('username').value;
  const p = document.getElementById('password').value;
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    if (data.success) {
      currentToken = data.token;
      localStorage.setItem('adminToken', currentToken);
      showDashboard();
    } else {
      document.getElementById('loginError').innerText = data.error || 'Ошибка входа';
    }
  } catch (err) {
    document.getElementById('loginError').innerText = 'Ошибка сети';
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  currentToken = null;
  localStorage.removeItem('adminToken');
  loginScreen.style.display = 'flex';
  dashboardScreen.style.display = 'none';
});

async function showDashboard() {
  loginScreen.style.display = 'none';
  dashboardScreen.style.display = 'block';
  await loadCatalog();
  await loadBookingsDashboard();
  await loadWarehouseDashboard();
  await loadBroadcastDashboard();
}

// ----------------------------------------------------
// TABS & VIEW SWITCHING
// ----------------------------------------------------
const tabCatalogBtn = document.getElementById('tabCatalogBtn');
const tabBookingsBtn = document.getElementById('tabBookingsBtn');
const tabWarehouseBtn = document.getElementById('tabWarehouseBtn');
const tabBroadcastBtn = document.getElementById('tabBroadcastBtn');

const viewCatalog = document.getElementById('viewCatalog');
const viewBookings = document.getElementById('viewBookings');
const viewWarehouse = document.getElementById('viewWarehouse');
const viewBroadcast = document.getElementById('viewBroadcast');

function setActiveTab(activeBtn, activeView) {
  [tabCatalogBtn, tabBookingsBtn, tabWarehouseBtn, tabBroadcastBtn].forEach(btn => {
    if (btn) {
      btn.className = 'btn';
      btn.style.background = 'rgba(255,255,255,0.1)';
      btn.style.color = 'white';
    }
  });
  [viewCatalog, viewBookings, viewWarehouse, viewBroadcast].forEach(v => {
    if (v) v.style.display = 'none';
  });

  if (activeBtn) activeBtn.className = 'btn btn-primary';
  if (activeView) activeView.style.display = 'block';
}

if (tabCatalogBtn) tabCatalogBtn.addEventListener('click', () => setActiveTab(tabCatalogBtn, viewCatalog));
if (tabBookingsBtn) tabBookingsBtn.addEventListener('click', async () => {
  setActiveTab(tabBookingsBtn, viewBookings);
  await loadBookingsDashboard();
  await loadBroadcastDashboard();
});
if (tabWarehouseBtn) tabWarehouseBtn.addEventListener('click', async () => {
  setActiveTab(tabWarehouseBtn, viewWarehouse);
  await loadWarehouseDashboard();
});
if (tabBroadcastBtn) tabBroadcastBtn.addEventListener('click', async () => {
  setActiveTab(tabBroadcastBtn, viewBroadcast);
  await loadBroadcastDashboard();
});

const forceSyncBtn = document.getElementById('forceSyncBtn');
if (forceSyncBtn) {
  forceSyncBtn.addEventListener('click', async () => {
    forceSyncBtn.innerText = '⏳ Синхронизация...';
    forceSyncBtn.disabled = true;
    try {
      const res = await fetch(`${API_BASE}/admin/sync`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Синхронизация с TravelLine выполнена успешно!');
        await loadBookingsDashboard();
      } else {
        alert('Ошибка синхронизации: ' + (data.error || 'Неизвестная ошибка'));
      }
    } catch(e) {
      alert('Ошибка сети при синхронизации');
    } finally {
      forceSyncBtn.innerText = '🔄 Синхронизировать (TL)';
      forceSyncBtn.disabled = false;
    }
  });
}

async function loadBookingsDashboard() {
  try {
    const res = await fetchAdmin(`${API_BASE}/admin/dashboard`);
    const data = await res.json();
    if (data.success) {
      const { tomorrowArrivals, currentStays, upcomingBookings } = data.data;

      window._currentStays = currentStays || [];
      renderActiveGroupedBookingsTable(tomorrowArrivals || [], currentStays || []);
      renderMasterBookingsTable('futureBookingsTableBody', 'futureBookingsBadge', upcomingBookings || [], '(0 броней)');
      
      // Auto-sync broadcast dashboard as well
      loadBroadcastDashboard();
    }
  } catch (err) {
    console.error('Failed to load bookings dashboard', err);
  }
}

function formatGuestInitials(name) {
  if (!name || name === "Гость") return "Гость";
  const clean = name.replace(/\*/g, '').trim();
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0];
  
  const p1 = parts[0];
  const p2 = parts[1];

  if (p2.length <= 2) {
    return `${p1} ${p2.toUpperCase()}${p2.endsWith('.') ? '' : '.'}`;
  }
  
  const isP2Surname = /(?:ов|ова|ев|ева|ин|ина|ский|ская|ый|ая|их|ых)$/i.test(p2);
  const isP1Surname = /(?:ов|ова|ев|ева|ин|ина|ский|ская|ый|ая|их|ых)$/i.test(p1);

  if (isP2Surname && !isP1Surname) {
    return `${p2} ${p1[0].toUpperCase()}.`;
  } else {
    return `${p1} ${p2[0].toUpperCase()}.`;
  }
}

function getHouseOptionsForCategory(cabinName, currentHouse) {
  const lower = (cabinName || '').toLowerCase();
  let allowedHouses = [];

  if (lower.includes("рыбак")) {
    allowedHouses = ["100"];
  } else if (lower.includes("7") || lower.includes("лесу")) {
    allowedHouses = ["101", "102", "103"];
  } else if (lower.includes("мини") && (lower.includes("2") || lower.includes("двух"))) {
    allowedHouses = ["104", "105", "106", "107", "108", "109"];
  } else if (lower.includes("мини") && (lower.includes("4") || lower.includes("четыр"))) {
    allowedHouses = ["110", "111"];
  } else if ((lower.includes("барн") || lower.includes("barn")) && (lower.includes("4") || lower.includes("четыр"))) {
    allowedHouses = ["112", "113", "114", "115", "116", "117", "118", "119"];
  } else if ((lower.includes("барн") || lower.includes("barn")) && (lower.includes("2") || lower.includes("двух"))) {
    allowedHouses = ["120", "121"];
  } else {
    allowedHouses = ["100", "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121"];
  }

  let cur = String(currentHouse || '');
  if (lower.includes("рыбак") && !cur) {
    cur = "100";
    // Trigger background auto-assign for Дом рыбака if not set
  }

  if (cur && !allowedHouses.includes(cur)) {
    allowedHouses.unshift(cur);
  }

  let html = `<option value="">-- № --</option>`;
  allowedHouses.forEach(h => {
    html += `<option value="${h}" ${cur === h ? 'selected' : ''}>№ ${h}</option>`;
  });
  return html;
}

window.autoSavePhone = async (bookingId, phone) => {
  try {
    const res = await fetchAdmin(`${API_BASE}/admin/update-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, phone })
    });
    const data = await res.json();
    if (data.success) {
      console.log(`[Phone Updated] ${bookingId} -> ${phone}`);
      loadBroadcastDashboard();
    } else {
      alert('Ошибка обновления телефона: ' + (data.error || ''));
    }
  } catch (err) {
    alert('Ошибка сети при сохранении телефона');
  }
};

function renderActiveGroupedBookingsTable(tomorrowArrivals, currentStays) {
  const tbody = document.getElementById('activeBookingsTableBody');
  const badge = document.getElementById('activeGuestsCountBadge');
  if (!tbody) return;

  const totalCount = (tomorrowArrivals ? tomorrowArrivals.length : 0) + (currentStays ? currentStays.length : 0);
  if (badge) {
    badge.innerText = `🔥 ${totalCount} гостей (Завтра: ${tomorrowArrivals.length}, Живут: ${currentStays.length})`;
  }

  if (totalCount === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #a1a1aa; padding: 1.5rem;">Активных проживаний и заездов на завтра не найдено</td></tr>';
    return;
  }

  let html = '';

  // 1. TOMORROW ARRIVALS FIRST
  if (tomorrowArrivals && tomorrowArrivals.length > 0) {
    html += `
      <tr style="background: rgba(52, 211, 153, 0.15); border-left: 4px solid #34d399;">
        <td colspan="8" style="padding: 0.65rem 0.75rem; font-weight: 800; color: #34d399; font-size: 0.8125rem; letter-spacing: 0.05em;">
          ⚡ ЗАЕЗЖАЮТ ЗАВТРА (${tomorrowArrivals.length})
        </td>
      </tr>
    `;
    html += tomorrowArrivals.map(b => renderBookingRow(b, '🟢 Заезд завтра')).join('');
  }

  // 2. CURRENT STAYS SECOND
  if (currentStays && currentStays.length > 0) {
    html += `
      <tr style="background: rgba(232, 165, 88, 0.15); border-left: 4px solid var(--accent-gold);">
        <td colspan="8" style="padding: 0.65rem 0.75rem; font-weight: 800; color: var(--accent-gold); font-size: 0.8125rem; letter-spacing: 0.05em;">
          🏡 УЖЕ ПРОЖИВАЮТ В ПАРКЕ СЕГОДНЯ (${currentStays.length})
        </td>
      </tr>
    `;
    html += currentStays.map(b => renderBookingRow(b, '🏠 Проживает')).join('');
  }

  tbody.innerHTML = html;
}

function renderBookingRow(b, tagText) {
  const cur = String(b.house_number || '');
  const shortGuest = formatGuestInitials(b.guest_name);
  const arrShort = b.arrival_date ? b.arrival_date.slice(5, 10).replace('-', '.') : '';
  const depShort = b.departure_date ? b.departure_date.slice(5, 10).replace('-', '.') : '';
  const datesFormatted = `${arrShort} – ${depShort}`;
  const houseSelectHtml = getHouseOptionsForCategory(b.cabin_name, cur);

  const hasSmsSent = b.sms_stages || (b.sms && Object.keys(b.sms).length > 0);
  const smsBadge = hasSmsSent 
    ? `<span style="background: rgba(52, 211, 153, 0.15); color: #34d399; padding: 0.2rem 0.45rem; border-radius: 0.375rem; font-size: 11px; font-weight: 700; border: 1px solid rgba(52, 211, 153, 0.3);">✅ Ушла</span>`
    : `<span style="background: rgba(148, 163, 184, 0.12); color: #94a3b8; padding: 0.2rem 0.45rem; border-radius: 0.375rem; font-size: 11px; font-weight: 600;">⏳ Ожидает</span>`;

  const isTomorrow = tagText && tagText.includes('завтра');
  const tagBadge = tagText ? `<span style="font-size: 10px; font-weight: 700; padding: 0.15rem 0.35rem; border-radius: 0.25rem; margin-left: 0.35rem; ${isTomorrow ? 'background: rgba(52, 211, 153, 0.2); color: #34d399;' : 'background: rgba(232, 165, 88, 0.2); color: #facc15;'}">${tagText}</span>` : '';

  return `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); ${isTomorrow ? 'background: rgba(52, 211, 153, 0.03);' : ''}">
      <td style="padding: 0.6rem 0.5rem;">
        <button class="btn" style="background: rgba(255,255,255,0.08); color: #60a5fa; border: 1px solid rgba(96,165,250,0.3); padding: 0.25rem 0.5rem; font-size: 11px; font-weight: 600;" onclick="navigator.clipboard.writeText('${b.id}'); this.innerText='✓ Скопировано'; setTimeout(() => this.innerText='📋 ID', 1500);" title="Скопировать номер брони (${b.id})">📋 ID</button>
      </td>
      <td style="padding: 0.6rem 0.5rem;">
        <strong style="color: white; font-size: 0.875rem;">${shortGuest}</strong> ${tagBadge}
      </td>
      <td style="padding: 0.6rem 0.5rem;">
        <input type="text" value="${b.phone || ''}" placeholder="📱 +7..." style="width: 110px; margin-bottom: 0; padding: 0.25rem 0.4rem; font-size: 11px; font-weight: 600; color: #34d399; background: rgba(0,0,0,0.4); border: 1px solid rgba(52,211,153,0.3); border-radius: 0.375rem;" onchange="window.autoSavePhone('${b.id}', this.value)" title="Нажмите, чтобы ввести или отредактировать телефон для СМС" />
      </td>
      <td style="padding: 0.6rem 0.5rem; color: #e4e4e7; font-size: 0.8125rem;">
        ${b.cabin_name || 'Домик'}
      </td>
      <td style="padding: 0.6rem 0.5rem; font-size: 11px; color: #a1a1aa; font-weight: 600;">
        ${datesFormatted}
      </td>
      <td style="padding: 0.6rem 0.5rem;">
        <select style="margin-bottom: 0; padding: 0.3rem 0.4rem; font-size: 12px; font-weight: 700; color: #facc15; background: #0f172a; border: 1px solid rgba(250,204,21,0.5); border-radius: 0.375rem; cursor: pointer;" onchange="window.autoSaveHouseNumber('${b.id}', this.value)">
          ${houseSelectHtml}
        </select>
      </td>
      <td style="padding: 0.6rem 0.5rem;">
        <a href="/?booking=${b.id}" target="_blank" class="btn" style="background: rgba(0, 150, 217, 0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); padding: 0.25rem 0.5rem; font-size: 11px; font-weight: 600; text-decoration: none;">📱 ПВА</a>
      </td>
      <td style="padding: 0.6rem 0.5rem;">
        ${smsBadge}
      </td>
    </tr>
  `;
}

function renderMasterBookingsTable(tbodyId, badgeId, bookings, emptyBadgeText) {
  const tbody = document.getElementById(tbodyId);
  const badge = document.getElementById(badgeId);
  if (!tbody) return;

  if (badge) {
    badge.innerText = bookings.length > 0 ? (badgeId === 'futureBookingsBadge' ? `(${bookings.length} броней)` : `🔥 ${bookings.length} активных гостей`) : emptyBadgeText;
  }

  if (!bookings || bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #a1a1aa; padding: 1.5rem;">Бронирований не найдено</td></tr>';
    return;
  }

  tbody.innerHTML = bookings.map(b => {
    const cur = String(b.house_number || '');
    const shortGuest = formatGuestInitials(b.guest_name);
    const arrShort = b.arrival_date ? b.arrival_date.slice(5, 10).replace('-', '.') : '';
    const depShort = b.departure_date ? b.departure_date.slice(5, 10).replace('-', '.') : '';
    const datesFormatted = `${arrShort} – ${depShort}`;
    const houseSelectHtml = getHouseOptionsForCategory(b.cabin_name, cur);

    const hasSmsSent = b.sms_stages || (b.sms && Object.keys(b.sms).length > 0);
    const smsBadge = hasSmsSent 
      ? `<span style="background: rgba(52, 211, 153, 0.15); color: #34d399; padding: 0.2rem 0.45rem; border-radius: 0.375rem; font-size: 11px; font-weight: 700; border: 1px solid rgba(52, 211, 153, 0.3);">✅ Ушла</span>`
      : `<span style="background: rgba(148, 163, 184, 0.12); color: #94a3b8; padding: 0.2rem 0.45rem; border-radius: 0.375rem; font-size: 11px; font-weight: 600;">⏳ Ожидает</span>`;

    return `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 0.6rem 0.5rem;">
          <button class="btn" style="background: rgba(255,255,255,0.08); color: #60a5fa; border: 1px solid rgba(96,165,250,0.3); padding: 0.25rem 0.5rem; font-size: 11px; font-weight: 600;" onclick="navigator.clipboard.writeText('${b.id}'); this.innerText='✓ Скопировано'; setTimeout(() => this.innerText='📋 ID', 1500);" title="Скопировать номер брони (${b.id})">📋 ID</button>
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          <strong style="color: white; font-size: 0.875rem;">${shortGuest}</strong>
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          <input type="text" value="${b.phone || ''}" placeholder="📱 +7..." style="width: 110px; margin-bottom: 0; padding: 0.25rem 0.4rem; font-size: 11px; font-weight: 600; color: #34d399; background: rgba(0,0,0,0.4); border: 1px solid rgba(52,211,153,0.3); border-radius: 0.375rem;" onchange="window.autoSavePhone('${b.id}', this.value)" title="Нажмите, чтобы ввести или отредактировать телефон для СМС" />
        </td>
        <td style="padding: 0.6rem 0.5rem; color: #e4e4e7; font-size: 0.8125rem;">
          ${b.cabin_name || 'Домик'}
        </td>
        <td style="padding: 0.6rem 0.5rem; font-size: 11px; color: #a1a1aa; font-weight: 600;">
          ${datesFormatted}
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          <select style="margin-bottom: 0; padding: 0.3rem 0.4rem; font-size: 12px; font-weight: 700; color: #facc15; background: #0f172a; border: 1px solid rgba(250,204,21,0.5); border-radius: 0.375rem; cursor: pointer;" onchange="window.autoSaveHouseNumber('${b.id}', this.value)">
            ${houseSelectHtml}
          </select>
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          <a href="/?booking=${b.id}" target="_blank" class="btn" style="background: rgba(0, 150, 217, 0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); padding: 0.25rem 0.5rem; font-size: 11px; font-weight: 600; text-decoration: none;">📱 ПВА</a>
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          ${smsBadge}
        </td>
      </tr>
    `;
  }).join('');
}

function renderBookingsTable(targetId, bookings) {
  const body = document.getElementById(targetId);
  if (!body) return;
  body.innerHTML = '';
  if (bookings.length === 0) {
    body.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1rem;">Записей не найдено</td></tr>`;
    return;
  }
  bookings.forEach(b => {
    const tr = document.createElement('tr');
    const directLink = `/?booking=${b.id}`;
    tr.innerHTML = `
      <td style="font-weight: 700; color: var(--accent-gold);">${b.id}</td>
      <td style="font-weight: 600;">${b.guest_name || 'Гость'}</td>
      <td>${b.phone || '—'}</td>
      <td>${b.cabin_name || 'Домик / Баня'}</td>
      <td>${b.arrival_date || ''} → ${b.departure_date || ''}</td>
      <td><a href="${directLink}" target="_blank" style="color: #60a5fa; text-decoration: underline;">Открыть ПВА</a></td>
    `;
    body.appendChild(tr);
  });
}

// ----------------------------------------------------
// CATALOG API
// ----------------------------------------------------
async function loadCatalog() {
  try {
    const res = await fetch(`${API_BASE}/catalog`);
    const data = await res.json();
    if (data.success) {
      catalogItems = data.data;
      renderTable();
    }
  } catch (err) {
    console.error('Failed to load catalog', err);
  }
}

function renderTable() {
  catalogTableBody.innerHTML = '';
  catalogItems.forEach(item => {
    const tr = document.createElement('tr');
    
    // Render Image or Icon
    let mediaHtml = `<span style="font-size: 24px;">${item.icon || '📦'}</span>`;
    if (item.image) {
      mediaHtml = `<img src="${item.image}" class="item-image" alt="icon"/>`;
    }

    tr.innerHTML = `
      <td style="color: #9ca3af; font-weight: 600;">${item.id}</td>
      <td>${mediaHtml}</td>
      <td style="font-weight: 700;">${item.displayName}</td>
      <td>${item.category === 'service' ? 'Услуга' : 'Баня'}</td>
      <td style="color: var(--accent-gold); font-weight: 700;">${item.price} ₽</td>
      <td>${item.isQuickOrder ? '✅ Да' : '❌ Нет'}</td>
      <td>
        <button class="btn btn-edit" onclick="editItem('${item.id}')">Изменить</button>
        <button class="btn btn-danger" onclick="deleteItem('${item.id}')">Удалить</button>
      </td>
    `;
    catalogTableBody.appendChild(tr);
  });
}

// ----------------------------------------------------
// MODAL & FORM LOGIC
// ----------------------------------------------------
document.getElementById('openAddModalBtn').addEventListener('click', () => {
  modalTitle.innerText = 'Добавить услугу';
  document.getElementById('originalId').value = '';
  document.getElementById('itemId').value = '';
  document.getElementById('itemId').disabled = false; // can edit ID on create
  document.getElementById('itemName').value = '';
  document.getElementById('itemDesc').value = '';
  document.getElementById('itemPrice').value = '';
  document.getElementById('itemCategory').value = 'service';
  document.getElementById('itemIcon').value = '';
  document.getElementById('existingImage').value = '';
  document.getElementById('itemImage').value = '';
  document.getElementById('itemQuickOrder').checked = false;
  currentImagePreview.style.display = 'none';
  
  itemModal.classList.add('active');
});

document.getElementById('closeModalBtn').addEventListener('click', () => {
  itemModal.classList.remove('active');
});

window.editItem = (id) => {
  const item = catalogItems.find(i => i.id === id);
  if (!item) return;

  modalTitle.innerText = 'Изменить услугу';
  document.getElementById('originalId').value = item.id;
  document.getElementById('itemId').value = item.id;
  document.getElementById('itemId').disabled = true; // cannot edit ID on update
  document.getElementById('itemName').value = item.displayName;
  document.getElementById('itemDesc').value = item.desc || '';
  document.getElementById('itemPrice').value = item.price;
  document.getElementById('itemCategory').value = item.category || 'service';
  document.getElementById('itemIcon').value = item.icon || '';
  document.getElementById('existingImage').value = item.image || '';
  document.getElementById('itemImage').value = ''; // clear file input
  document.getElementById('itemQuickOrder').checked = !!item.isQuickOrder;

  if (item.image) {
    currentImagePreview.src = item.image;
    currentImagePreview.style.display = 'block';
  } else {
    currentImagePreview.style.display = 'none';
  }

  itemModal.classList.add('active');
};

window.deleteItem = async (id) => {
  if (!confirm(`Точно удалить услугу ${id}?`)) return;
  try {
    const res = await fetch(`${API_BASE}/catalog/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    if (res.ok) {
      await loadCatalog();
    }
  } catch (err) {
    alert('Ошибка удаления');
  }
};

document.getElementById('itemForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const originalId = document.getElementById('originalId').value;
  const isUpdate = !!originalId;
  const id = document.getElementById('itemId').value;
  const displayName = document.getElementById('itemName').value;
  const desc = document.getElementById('itemDesc').value;
  const price = parseInt(document.getElementById('itemPrice').value, 10);
  const category = document.getElementById('itemCategory').value;
  const icon = document.getElementById('itemIcon').value;
  const isQuickOrder = document.getElementById('itemQuickOrder').checked;
  const fileInput = document.getElementById('itemImage');
  let image = document.getElementById('existingImage').value;

  // 1. Upload image if selected
  if (fileInput.files.length > 0) {
    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    try {
      const uploadRes = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${currentToken}` },
        body: formData
      });
      const uploadData = await uploadRes.json();
      if (uploadData.success) {
        image = uploadData.imageUrl;
      }
    } catch (err) {
      alert('Ошибка загрузки картинки');
      return;
    }
  }

  // 2. Save Item
  const payload = { id, displayName, desc, price, category, icon, image, isQuickOrder };
  
  try {
    const url = isUpdate ? `${API_BASE}/catalog/${originalId}` : `${API_BASE}/catalog`;
    const method = isUpdate ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    if (data.success) {
      itemModal.classList.remove('active');
      await loadCatalog();
    } else {
      alert('Ошибка сохранения: ' + data.error);
    }
  } catch (err) {
    alert('Ошибка сети');
  }
});

// ----------------------------------------------------
// WAREHOUSE & GIFTS DASHBOARD (CRUD & ANALYTICS)
// ----------------------------------------------------
async function loadWarehouseDashboard() {
  if (!currentToken) return;
  try {
    const res = await fetchAdmin(`${API_BASE}/admin/warehouse`);
    const result = await res.json();
    if (!result.success) return;

    const { totalValuation, lowStockCount, gifts, products, logs } = result.data;

    // KPI Cards
    const kpiTotalValuation = document.getElementById('kpiTotalValuation');
    const kpiLowStockCount = document.getElementById('kpiLowStockCount');
    const kpiTotalGifts = document.getElementById('kpiTotalGifts');

    if (kpiTotalValuation) kpiTotalValuation.innerText = `${(totalValuation || 0).toLocaleString('ru-RU')} ₽`;
    if (kpiLowStockCount) kpiLowStockCount.innerText = `${lowStockCount || 0} позиций`;
    if (kpiTotalGifts) kpiTotalGifts.innerText = `${(gifts || []).length} видов`;

    // Gifts Table Body
    const giftsBody = document.getElementById('giftsTableBody');
    if (giftsBody) {
      giftsBody.innerHTML = (gifts || []).map(g => {
        const isLow = g.stock <= g.min_threshold;
        return `
          <tr>
            <td><img src="${g.image_url}" style="width: 40px; height: 40px; object-fit: contain; background: white; border-radius: 6px; padding: 2px;" /></td>
            <td><strong>${g.title}</strong><br><span style="font-size: 11px; color: #a1a1aa;">${g.subtitle || ''}</span></td>
            <td><span style="background: rgba(0,150,217,0.2); color: #0096d9; padding: 2px 8px; border-radius: 999px; font-weight: 700; font-size: 11px;">${g.badge || 'Подарок'}</span></td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('gift', '${g.id}', ${g.stock - 1}, ${g.min_threshold}, ${g.unit_cost})">-</button>
                <strong style="color: ${isLow ? '#f87171' : '#34d399'};">${g.stock} шт.</strong>
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('gift', '${g.id}', ${g.stock + 1}, ${g.min_threshold}, ${g.unit_cost})">+</button>
              </div>
            </td>
            <td>${g.min_threshold} шт.</td>
            <td>${(g.unit_cost || 0).toLocaleString('ru-RU')} ₽</td>
            <td><span style="color: ${g.is_active ? '#34d399' : '#f87171'}; font-weight: 700;">${g.is_active ? 'Активен' : 'Скрыт'}</span></td>
            <td>
              <div style="display: flex; gap: 0.25rem;">
                <button class="btn btn-edit" onclick="window.editGift('${g.id}')">✏️ Edit</button>
                <button class="btn" style="background: rgba(239,68,68,0.2); color: #ef4444;" onclick="window.deleteGift('${g.id}')">🗑️</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Products Table Body
    const productsBody = document.getElementById('productsTableBody');
    if (productsBody) {
      productsBody.innerHTML = (products || []).map(p => {
        const isLow = p.stock <= p.min_threshold;
        return `
          <tr>
            <td><strong>${p.name}</strong></td>
            <td>${p.category || 'Услуги'}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('product', '${p.id}', ${p.stock - 1}, ${p.min_threshold}, ${p.unit_cost})">-</button>
                <strong style="color: ${isLow ? '#f87171' : '#34d399'};">${p.stock} шт.</strong>
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('product', '${p.id}', ${p.stock + 1}, ${p.min_threshold}, ${p.unit_cost})">+</button>
              </div>
            </td>
            <td>${p.min_threshold} шт.</td>
            <td>${(p.unit_cost || 0).toLocaleString('ru-RU')} ₽</td>
            <td>${(p.price || 0).toLocaleString('ru-RU')} ₽</td>
            <td><button class="btn btn-primary" style="padding: 4px 10px; font-size: 11px;" onclick="window.promptStockUpdate('product', '${p.id}', ${p.stock}, ${p.min_threshold}, ${p.unit_cost})">Корректировка</button></td>
          </tr>
        `;
      }).join('');
    }

    // Logs Table Body
    const logsBody = document.getElementById('stockLogsTableBody');
    if (logsBody) {
      logsBody.innerHTML = (logs || []).map(l => `
        <tr>
          <td style="font-size: 11px; color: #a1a1aa;">${l.created_at || ''}</td>
          <td><span style="font-weight: 700; font-size: 11px; color: ${l.item_type === 'gift' ? 'var(--accent-gold)' : '#60a5fa'};">${l.item_type === 'gift' ? 'Подарок' : 'Товар'}</span></td>
          <td><strong>${l.item_name || ''}</strong></td>
          <td><span style="font-weight: 800; color: ${l.change_qty >= 0 ? '#34d399' : '#f87171'};">${l.change_qty > 0 ? '+' : ''}${l.change_qty}</span></td>
          <td style="font-size: 11px; color: #e4e4e7;">${l.reason || ''}</td>
        </tr>
      `).join('');
    }

    window._cachedGifts = gifts || [];
  } catch (err) {
    console.error('Error loading warehouse dashboard:', err);
  }
}

window.updateStock = async (itemType, id, newStock, min_threshold, unit_cost, reason = 'Быстрая корректировка остатка') => {
  if (newStock < 0) return;
  try {
    const res = await fetchAdmin(`${API_BASE}/admin/warehouse/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemType, id, stock: newStock, min_threshold, unit_cost, reason })
    });
    const data = await res.json();
    if (data.success) {
      await loadWarehouseDashboard();
    }
  } catch (err) {
    alert('Ошибка обновления остатка');
  }
};

window.promptStockUpdate = async (itemType, id, currentStock, currentMin, currentCost) => {
  const val = prompt('Введите новый остаток на складе (шт.):', currentStock);
  if (val === null) return;
  const num = parseInt(val, 10);
  if (isNaN(num) || num < 0) return alert('Введите корректное число!');
  await window.updateStock(itemType, id, num, currentMin, currentCost, 'Инвентаризация склада');
};

// Gift Modal Controls (CRUD)
const giftModalAdmin = document.getElementById('giftModalAdmin');
const giftFormAdmin = document.getElementById('giftFormAdmin');
const openAddGiftModalBtn = document.getElementById('openAddGiftModalBtn');
const closeGiftModalAdminBtn = document.getElementById('closeGiftModalAdminBtn');

if (openAddGiftModalBtn) {
  openAddGiftModalBtn.addEventListener('click', () => {
    document.getElementById('giftIdAdmin').value = '';
    document.getElementById('giftTitleAdmin').value = '';
    document.getElementById('giftSubtitleAdmin').value = '';
    document.getElementById('giftBadgeAdmin').value = '★ Символ Парка';
    document.getElementById('giftImageUrlAdmin').value = './assets/images/gifts/gift_toy.png?v=2';
    document.getElementById('giftStockAdmin').value = '50';
    document.getElementById('giftMinThresholdAdmin').value = '10';
    document.getElementById('giftUnitCostAdmin').value = '350';
    document.getElementById('giftIsActiveAdmin').checked = true;
    document.getElementById('giftModalAdminTitle').innerText = 'Добавить Новый Подарок';
    giftModalAdmin.classList.add('active');
  });
}

if (closeGiftModalAdminBtn) {
  closeGiftModalAdminBtn.addEventListener('click', () => {
    giftModalAdmin.classList.remove('active');
  });
}

window.editGift = (id) => {
  const g = (window._cachedGifts || []).find(x => x.id === id);
  if (!g) return;
  document.getElementById('giftIdAdmin').value = g.id;
  document.getElementById('giftTitleAdmin').value = g.title || '';
  document.getElementById('giftSubtitleAdmin').value = g.subtitle || '';
  document.getElementById('giftBadgeAdmin').value = g.badge || '';
  document.getElementById('giftImageUrlAdmin').value = g.image_url || '';
  document.getElementById('giftStockAdmin').value = g.stock || 50;
  document.getElementById('giftMinThresholdAdmin').value = g.min_threshold || 10;
  document.getElementById('giftUnitCostAdmin').value = g.unit_cost || 350;
  document.getElementById('giftIsActiveAdmin').checked = g.is_active !== 0;
  document.getElementById('giftModalAdminTitle').innerText = 'Редактировать Подарок';
  giftModalAdmin.classList.add('active');
};

window.deleteGift = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить этот подарок?')) return;
  try {
    const res = await fetchAdmin(`${API_BASE}/admin/gifts/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      await loadWarehouseDashboard();
    }
  } catch (err) {
    alert('Ошибка удаления подарка');
  }
};

if (giftFormAdmin) {
  giftFormAdmin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('giftIdAdmin').value;
    const title = document.getElementById('giftTitleAdmin').value;
    const subtitle = document.getElementById('giftSubtitleAdmin').value;
    const badge = document.getElementById('giftBadgeAdmin').value;
    let image_url = document.getElementById('giftImageUrlAdmin').value;
    const stock = parseInt(document.getElementById('giftStockAdmin').value, 10);
    const min_threshold = parseInt(document.getElementById('giftMinThresholdAdmin').value, 10);
    const unit_cost = parseInt(document.getElementById('giftUnitCostAdmin').value, 10);
    const is_active = document.getElementById('giftIsActiveAdmin').checked ? 1 : 0;
    const fileInput = document.getElementById('giftImageFileAdmin');

    if (fileInput && fileInput.files.length > 0) {
      const formData = new FormData();
      formData.append('image', fileInput.files[0]);
      try {
        const uploadRes = await fetchAdmin(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          image_url = uploadData.imageUrl;
        }
      } catch (err) {
        alert('Ошибка загрузки фото подарка');
        return;
      }
    }

    try {
      const res = await fetchAdmin(`${API_BASE}/admin/gifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, subtitle, badge, image_url, stock, min_threshold, unit_cost, is_active })
      });
      const data = await res.json();
      if (data.success) {
        giftModalAdmin.classList.remove('active');
        await loadWarehouseDashboard();
      } else {
        alert('Ошибка сохранения подарка');
      }
    } catch (err) {
      alert('Ошибка сети');
    }
  });
}

// ----------------------------------------------------
// LIVE IN-HOUSE GUEST SMS BROADCAST DASHBOARD
// ----------------------------------------------------
async function loadBroadcastDashboard() {
  if (!currentToken) return;
  try {
    const res = await fetchAdmin(`${API_BASE}/admin/in-house-guests`);
    const data = await res.json();
    if (data.success) {
      const badge = document.getElementById('inHouseGuestsCountBadge');
      if (badge) {
        badge.innerText = `👥 ${data.guests.length} гостей сейчас в парке`;
      }
      window._inHouseGuests = data.guests || [];
      renderInHouseGuestsTable(data.guests || []);
    }
  } catch (err) {
    console.error('Error loading in-house guests for broadcast:', err);
  }

  await loadSmsTemplates();
}

window.renderInHouseGuestsTable = (guests) => {
  const tbody = document.getElementById('inHouseGuestsTableBody');
  if (!tbody) return;
  if (!guests || guests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #a1a1aa; padding: 1rem;">Нет текущих проживающих гостей</td></tr>';
    return;
  }
  tbody.innerHTML = guests.map(g => {
    const cur = String(g.house_number || '');
    return `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 0.75rem 0.5rem;">
          <strong style="color: white; font-size: 0.875rem;">${g.guest_name || 'Гость'}</strong><br>
          <span style="font-size: 11px; color: #94a3b8;">ID: ${g.id}</span>
        </td>
        <td style="padding: 0.75rem 0.5rem;">
          <span style="color: #34d399; font-weight: 700; font-size: 0.8125rem;">📞 ${g.phone || 'Нет телефона'}</span>
        </td>
        <td style="padding: 0.75rem 0.5rem; color: #e4e4e7; font-size: 0.8125rem;">
          ${g.cabin_name || 'Домик'}
        </td>
        <td style="padding: 0.75rem 0.5rem; font-size: 11px; color: #a1a1aa;">
          ${g.arrival_date ? g.arrival_date.slice(0, 10) : ''} – ${g.departure_date ? g.departure_date.slice(0, 10) : ''}
        </td>
        <td style="padding: 0.75rem 0.5rem;">
          <select style="margin-bottom: 0; padding: 0.4rem 0.6rem; font-size: 0.8125rem; font-weight: 700; color: #facc15; background: #0f172a; border: 1px solid rgba(250,204,21,0.5); border-radius: 0.5rem; cursor: pointer;" onchange="window.autoSaveHouseNumber('${g.id}', this.value)">
            <option value="">-- Без номера --</option>
            <optgroup label="Дом в лесу 7-местный (101-103)">
              <option value="101" ${cur === '101' ? 'selected' : ''}>№ 101 (7-местный)</option>
              <option value="102" ${cur === '102' ? 'selected' : ''}>№ 102 (7-местный)</option>
              <option value="103" ${cur === '103' ? 'selected' : ''}>№ 103 (7-местный)</option>
            </optgroup>
            <optgroup label="Мини 2-местный (104-109)">
              <option value="104" ${cur === '104' ? 'selected' : ''}>№ 104 (Мини 2-местный)</option>
              <option value="105" ${cur === '105' ? 'selected' : ''}>№ 105 (Мини 2-местный)</option>
              <option value="106" ${cur === '106' ? 'selected' : ''}>№ 106 (Мини 2-местный)</option>
              <option value="107" ${cur === '107' ? 'selected' : ''}>№ 107 (Мини 2-местный)</option>
              <option value="108" ${cur === '108' ? 'selected' : ''}>№ 108 (Мини 2-местный)</option>
              <option value="109" ${cur === '109' ? 'selected' : ''}>№ 109 (Мини 2-местный)</option>
            </optgroup>
            <optgroup label="Мини 4-местный (110-111)">
              <option value="110" ${cur === '110' ? 'selected' : ''}>№ 110 (Мини 4-местный)</option>
              <option value="111" ${cur === '111' ? 'selected' : ''}>№ 111 (Мини 4-местный)</option>
            </optgroup>
            <optgroup label="Барнхаус 4-местный (112-119)">
              <option value="112" ${cur === '112' ? 'selected' : ''}>№ 112 (Барнхаус 4-местный)</option>
              <option value="113" ${cur === '113' ? 'selected' : ''}>№ 113 (Барнхаус 4-местный)</option>
              <option value="114" ${cur === '114' ? 'selected' : ''}>№ 114 (Барнхаус 4-местный)</option>
              <option value="115" ${cur === '115' ? 'selected' : ''}>№ 115 (Барнхаус 4-местный)</option>
              <option value="116" ${cur === '116' ? 'selected' : ''}>№ 116 (Барнхаус 4-местный)</option>
              <option value="117" ${cur === '117' ? 'selected' : ''}>№ 117 (Барнхаус 4-местный)</option>
              <option value="118" ${cur === '118' ? 'selected' : ''}>№ 118 (Барнхаус 4-местный)</option>
              <option value="119" ${cur === '119' ? 'selected' : ''}>№ 119 (Барнхаус 4-местный)</option>
            </optgroup>
            <optgroup label="Барнхаус 2-местный (120-121)">
              <option value="120" ${cur === '120' ? 'selected' : ''}>№ 120 (Барнхаус 2-местный)</option>
              <option value="121" ${cur === '121' ? 'selected' : ''}>№ 121 (Барнхаус 2-местный)</option>
            </optgroup>
          </select>
        </td>
      </tr>
    `;
  }).join('');
};

window.autoSaveHouseNumber = async (bookingId, houseNumber) => {
  try {
    const res = await fetchAdmin(`${API_BASE}/admin/assign-house`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, houseNumber })
    });
    const data = await res.json();
    if (data.success) {
      console.log(`[House Assigned] ${bookingId} -> ${houseNumber}`);
    } else {
      alert('Ошибка привязки домика: ' + (data.error || ''));
    }
  } catch (err) {
    alert('Ошибка сети при сохранении номера домика');
  }
};

async function loadSmsTemplates() {
  if (!currentToken) return;
  try {
    const res = await fetchAdmin(`${API_BASE}/admin/sms-templates`);
    const data = await res.json();
    if (data.success && data.templates) {
      window._smsTemplates = data.templates;
      const select = document.getElementById('templateSelect');
      if (select) {
        select.innerHTML = '<option value="">-- Выберите шаблон для вставки --</option>' +
          data.templates.map(t => `<option value="${t.id}">${t.title}</option>`).join('');
      }
    }
  } catch (err) {
    console.error('Error loading SMS templates:', err);
  }
}

const templateSelect = document.getElementById('templateSelect');
const deleteTemplateBtn = document.getElementById('deleteTemplateBtn');
const saveTemplateBtn = document.getElementById('saveTemplateBtn');
const broadcastTextarea = document.getElementById('broadcastTextarea');
const broadcastPreviewText = document.getElementById('broadcastPreviewText');
const insertNameTagBtn = document.getElementById('insertNameTagBtn');
const sendBroadcastBtn = document.getElementById('sendBroadcastBtn');

if (templateSelect) {
  templateSelect.addEventListener('change', () => {
    const id = templateSelect.value;
    const t = (window._smsTemplates || []).find(x => String(x.id) === String(id));
    if (t) {
      if (broadcastTextarea) {
        broadcastTextarea.value = t.template;
        broadcastTextarea.dispatchEvent(new Event('input'));
      }
      if (deleteTemplateBtn) deleteTemplateBtn.style.display = 'inline-block';
    } else {
      if (deleteTemplateBtn) deleteTemplateBtn.style.display = 'none';
    }
  });
}

if (saveTemplateBtn) {
  saveTemplateBtn.addEventListener('click', async () => {
    const text = broadcastTextarea ? broadcastTextarea.value.trim() : '';
    if (!text) return alert('Введите текст сообщения в поле слева перед сохранением шаблона!');

    const title = prompt('Введите название шаблона (например: "Акция на Бани -20%"):');
    if (!title || !title.trim()) return;

    try {
      const res = await fetchAdmin(`${API_BASE}/admin/sms-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), template: text })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Шаблон рассылки успешно сохранен!');
        await loadSmsTemplates();
      } else {
        alert('Ошибка сохранения шаблона');
      }
    } catch (err) {
      alert('Ошибка сети при сохранении шаблона');
    }
  });
}

if (deleteTemplateBtn) {
  deleteTemplateBtn.addEventListener('click', async () => {
    const id = templateSelect ? templateSelect.value : null;
    if (!id) return;
    if (!confirm('Вы действительно хотите удалить этот шаблон рассылки?')) return;

    try {
      const res = await fetchAdmin(`${API_BASE}/admin/sms-templates/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Шаблон удален');
        if (broadcastTextarea) broadcastTextarea.value = '';
        if (broadcastPreviewText) broadcastPreviewText.innerText = '[Введите текст слева]';
        deleteTemplateBtn.style.display = 'none';
        await loadSmsTemplates();
      }
    } catch (err) {
      alert('Ошибка удаления шаблона');
    }
  });
}

if (broadcastTextarea && broadcastPreviewText) {
  broadcastTextarea.addEventListener('input', () => {
    const sampleGuest = (window._inHouseGuests && window._inHouseGuests[0]) ? window._inHouseGuests[0].guest_name.split(' ')[0] : 'Константин';
    const text = broadcastTextarea.value || '[Введите текст слева]';
    broadcastPreviewText.innerText = text.replace(/\{имя\}/g, sampleGuest).replace(/\{name\}/g, sampleGuest);
  });
}

if (insertNameTagBtn && broadcastTextarea) {
  insertNameTagBtn.addEventListener('click', () => {
    broadcastTextarea.value += ' {имя}';
    broadcastTextarea.dispatchEvent(new Event('input'));
    broadcastTextarea.focus();
  });
}

if (sendBroadcastBtn) {
  sendBroadcastBtn.addEventListener('click', async () => {
    const text = broadcastTextarea ? broadcastTextarea.value.trim() : '';
    if (!text) return alert('Введите текст сообщения!');

    const count = (window._inHouseGuests || []).length;
    if (!confirm(`Вы действительно хотите отправить это СМС сообщение ${count} проживающим гостям прямо сейчас?`)) {
      return;
    }

    try {
      const res = await fetchAdmin(`${API_BASE}/admin/broadcast-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: text })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ СМС-рассылка успешно выполнена! Отправлено ${data.sentCount} гостям.`);
        broadcastTextarea.value = '';
        if (broadcastPreviewText) broadcastPreviewText.innerText = '[Сообщение отправлено!]';
      } else {
        alert('Ошибка отправки: ' + data.error);
      }
    } catch (err) {
      alert('Ошибка сети при отправке рассылки');
    }
  });
}
