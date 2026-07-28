const API_BASE = '/api';

let currentToken = localStorage.getItem('adminToken');
let catalogItems = [];

const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const catalogTableBody = document.getElementById('catalogTableBody');
const itemModal = document.getElementById('itemModal');
const itemForm = document.getElementById('itemForm');
const modalTitle = document.getElementById('modalTitle');
const currentImagePreview = document.getElementById('currentImagePreview');

// App Init
if (currentToken) {
  showDashboard();
}

// LOGIN & LOGOUT
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

document.getElementById('logoutBtn').addEventListener('click', logout);

function logout() {
  currentToken = null;
  localStorage.removeItem('adminToken');
  loginScreen.style.display = 'flex';
  dashboardScreen.style.display = 'none';
}

function showDashboard() {
  loginScreen.style.display = 'none';
  dashboardScreen.style.display = 'block';
  loadCatalog();
  loadDashboard();
}

// TABS LOGIC
const tabCatalogBtn = document.getElementById('tabCatalogBtn');
const tabBookingsBtn = document.getElementById('tabBookingsBtn');
const viewCatalog = document.getElementById('viewCatalog');
const viewBookings = document.getElementById('viewBookings');

if (tabCatalogBtn && tabBookingsBtn) {
  tabCatalogBtn.addEventListener('click', () => {
    tabCatalogBtn.className = 'btn btn-primary';
    tabBookingsBtn.className = 'btn';
    tabBookingsBtn.style.background = 'rgba(255,255,255,0.1)';
    tabBookingsBtn.style.color = 'white';
    if (viewCatalog) viewCatalog.style.display = 'block';
    if (viewBookings) viewBookings.style.display = 'none';
  });

  tabBookingsBtn.addEventListener('click', () => {
    tabBookingsBtn.className = 'btn btn-primary';
    tabBookingsBtn.style.background = '';
    tabCatalogBtn.className = 'btn';
    tabCatalogBtn.style.background = 'rgba(255,255,255,0.1)';
    tabCatalogBtn.style.color = 'white';
    if (viewCatalog) viewCatalog.style.display = 'none';
    if (viewBookings) viewBookings.style.display = 'block';
    loadDashboard();
  });
}

const forceSyncBtn = document.getElementById('forceSyncBtn');
if (forceSyncBtn) {
  forceSyncBtn.addEventListener('click', async () => {
    forceSyncBtn.innerText = 'Синхронизация...';
    await fetch(`${API_BASE}/admin/sync`, { method: 'POST', headers: { 'Authorization': `Bearer ${currentToken}` } });
    await loadDashboard();
    forceSyncBtn.innerText = '🔄 Синхронизировать (TL)';
  });
}

function getSmsBadge(status) {
  if (status === 'sent') return '<span style="color: #34d399;">✅ Отправлено</span>';
  if (status === 'error') return '<span style="color: #ef4444;">❌ Ошибка</span>';
  return '<span style="color: var(--text-muted);">⏳ Ожидает</span>';
}

async function loadDashboard() {
  if (!currentToken) return;
  try {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    if (res.status === 401 || res.status === 403) return logout();
    const data = await res.json();
    if (data.success) {
       const db = data.data;
       const renderRow = (b, stageCols) => {
         let html = `<tr>
           <td><strong>${b.guest_name}</strong><br><small style="color:var(--text-muted)">${b.id}</small></td>
           <td>${b.cabin_name}</td>
           <td>${b.arrival_date} - ${b.departure_date}</td>`;
         stageCols.forEach(s => {
           html += `<td>${getSmsBadge(b.sms[s])}</td>`;
         });
         html += '</tr>';
         return html;
       };
       
       const tomEl = document.getElementById('tomorrowArrivalsBody');
       const curEl = document.getElementById('currentStaysBody');
       const todEl = document.getElementById('todayDeparturesBody');

       if (tomEl) tomEl.innerHTML = (db.tomorrowArrivals && db.tomorrowArrivals.length)
         ? db.tomorrowArrivals.map(b => renderRow(b, [1])).join('') 
         : '<tr><td colspan="4">Нет заездов</td></tr>';
         
       if (curEl) curEl.innerHTML = (db.currentStays && db.currentStays.length)
         ? db.currentStays.map(b => renderRow(b, [2])).join('') 
         : '<tr><td colspan="4">Никто не проживает</td></tr>';
         
       if (todEl) todEl.innerHTML = (db.todayDepartures && db.todayDepartures.length)
         ? db.todayDepartures.map(b => renderRow(b, [3, 4])).join('') 
         : '<tr><td colspan="4">Нет выездов</td></tr>';
    }
  } catch (e) {
    console.error(e);
  }
}

// CATALOG API
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
  if (!catalogTableBody) return;
  catalogTableBody.innerHTML = '';
  catalogItems.forEach(item => {
    const tr = document.createElement('tr');
    
    let mediaHtml = `<span style="font-size: 24px;">${item.icon || '📦'}</span>`;
    if (item.image) {
      mediaHtml = `<img src="${item.image}" class="item-image" alt="icon"/>`;
    }

    tr.innerHTML = `
      <td style="color: var(--text-muted);">${item.id}</td>
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

// MODAL & FORM LOGIC
const openAddBtn = document.getElementById('openAddModalBtn');
if (openAddBtn) {
  openAddBtn.addEventListener('click', () => {
    modalTitle.innerText = 'Добавить услугу';
    document.getElementById('originalId').value = '';
    document.getElementById('itemId').value = '';
    document.getElementById('itemId').disabled = false;
    document.getElementById('itemName').value = '';
    document.getElementById('itemDesc').value = '';
    document.getElementById('itemPrice').value = '';
    document.getElementById('itemCategory').value = 'service';
    document.getElementById('itemIcon').value = '';
    document.getElementById('existingImage').value = '';
    document.getElementById('itemImage').value = '';
    document.getElementById('itemQuickOrder').checked = false;
    if (currentImagePreview) currentImagePreview.style.display = 'none';
    
    if (itemModal) itemModal.classList.add('active');
  });
}

const closeBtn = document.getElementById('closeModalBtn');
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    if (itemModal) itemModal.classList.remove('active');
  });
}

window.editItem = (id) => {
  const item = catalogItems.find(i => i.id === id);
  if (!item) return;

  modalTitle.innerText = 'Изменить услугу';
  document.getElementById('originalId').value = item.id;
  document.getElementById('itemId').value = item.id;
  document.getElementById('itemId').disabled = true;
  document.getElementById('itemName').value = item.displayName;
  document.getElementById('itemDesc').value = item.desc || '';
  document.getElementById('itemPrice').value = item.price;
  document.getElementById('itemCategory').value = item.category || 'service';
  document.getElementById('itemIcon').value = item.icon || '';
  document.getElementById('existingImage').value = item.image || '';
  document.getElementById('itemImage').value = '';

  if (item.image && currentImagePreview) {
    currentImagePreview.src = item.image;
    currentImagePreview.style.display = 'block';
  } else if (currentImagePreview) {
    currentImagePreview.style.display = 'none';
  }

  if (itemModal) itemModal.classList.add('active');
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

const form = document.getElementById('itemForm');
if (form) {
  form.addEventListener('submit', async (e) => {
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
        if (itemModal) itemModal.classList.remove('active');
        await loadCatalog();
      } else {
        alert('Ошибка сохранения: ' + data.error);
      }
    } catch (err) {
      alert('Ошибка сети');
    }
  });
}
