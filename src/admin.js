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
