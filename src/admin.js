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
    const res = await fetch(`${API_BASE}/admin/dashboard`);
    const data = await res.json();
    if (data.success) {
      const { tomorrowArrivals, currentStays, todayDepartures, upcomingBookings } = data.data;
      renderBookingsTable('tomorrowArrivalsBody', tomorrowArrivals || []);
      renderBookingsTable('currentStaysBody', currentStays || []);
      renderBookingsTable('todayDeparturesBody', todayDepartures || []);
      renderBookingsTable('upcomingBookingsBody', upcomingBookings || []);
    }
  } catch (err) {
    console.error('Failed to load bookings dashboard', err);
  }
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
    const res = await fetch(`${API_BASE}/admin/warehouse`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
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
    const res = await fetch(`${API_BASE}/admin/warehouse/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
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
    const res = await fetch(`${API_BASE}/admin/gifts/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
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
        const uploadRes = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${currentToken}` },
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
      const res = await fetch(`${API_BASE}/admin/gifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
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
    const res = await fetch(`${API_BASE}/admin/in-house-guests`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      const badge = document.getElementById('inHouseGuestsCountBadge');
      if (badge) {
        badge.innerText = `👥 ${data.guests.length} гостей сейчас в парке`;
      }
      window._inHouseGuests = data.guests || [];
    }
  } catch (err) {
    console.error('Error loading in-house guests for broadcast:', err);
  }
}

const broadcastTextarea = document.getElementById('broadcastTextarea');
const broadcastPreviewText = document.getElementById('broadcastPreviewText');
const insertNameTagBtn = document.getElementById('insertNameTagBtn');
const sendBroadcastBtn = document.getElementById('sendBroadcastBtn');

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
      const res = await fetch(`${API_BASE}/admin/broadcast-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
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
