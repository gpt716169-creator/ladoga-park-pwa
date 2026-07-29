import"./style-CTAUnyPs.js";const d="/api",_=document.getElementById("loginScreen"),A=document.getElementById("dashboardScreen"),N=document.getElementById("catalogTableBody"),L=document.getElementById("itemModal");document.getElementById("itemForm");const q=document.getElementById("modalTitle"),b=document.getElementById("currentImagePreview");let c=localStorage.getItem("adminToken"),M=[];async function u(t,e={}){e.headers=e.headers||{},c&&(e.headers.Authorization=`Bearer ${c}`);const o=await fetch(t,e);if(o.status===401||o.status===403){console.warn("[Admin API] 401/403 response. Session expired."),c=null,localStorage.removeItem("adminToken"),_&&(_.style.display="flex"),A&&(A.style.display="none");const n=document.getElementById("loginError");throw n&&(n.innerText="Сессия истекла или неверный токен. Войдите снова."),new Error("Unauthorized/Forbidden")}return o}c&&V();document.getElementById("loginBtn").addEventListener("click",async()=>{const t=document.getElementById("username").value,e=document.getElementById("password").value;try{const n=await(await fetch(`${d}/admin/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:t,password:e})})).json();n.success?(c=n.token,localStorage.setItem("adminToken",c),V()):document.getElementById("loginError").innerText=n.error||"Ошибка входа"}catch{document.getElementById("loginError").innerText="Ошибка сети"}});document.getElementById("logoutBtn").addEventListener("click",()=>{c=null,localStorage.removeItem("adminToken"),_.style.display="flex",A.style.display="none"});async function V(){_.style.display="none",A.style.display="block",await H(),await G(),await E(),await O()}const k=document.getElementById("tabCatalogBtn"),T=document.getElementById("tabBookingsBtn"),x=document.getElementById("tabWarehouseBtn"),S=document.getElementById("tabBroadcastBtn"),K=document.getElementById("viewCatalog"),X=document.getElementById("viewBookings"),Y=document.getElementById("viewWarehouse"),Z=document.getElementById("viewBroadcast");function j(t,e){[k,T,x,S].forEach(o=>{o&&(o.className="btn",o.style.background="rgba(255,255,255,0.1)",o.style.color="white")}),[K,X,Y,Z].forEach(o=>{o&&(o.style.display="none")}),t&&(t.className="btn btn-primary"),e&&(e.style.display="block")}k&&k.addEventListener("click",()=>j(k,K));T&&T.addEventListener("click",async()=>{j(T,X),await G(),await O()});x&&x.addEventListener("click",async()=>{j(x,Y),await E()});S&&S.addEventListener("click",async()=>{j(S,Z),await O()});const I=document.getElementById("forceSyncBtn");I&&I.addEventListener("click",async()=>{I.innerText="⏳ Синхронизация...",I.disabled=!0;try{const e=await(await fetch(`${d}/admin/sync`,{method:"POST",headers:{Authorization:`Bearer ${c}`}})).json();e.success?(alert("Синхронизация с TravelLine выполнена успешно!"),await G()):alert("Ошибка синхронизации: "+(e.error||"Неизвестная ошибка"))}catch{alert("Ошибка сети при синхронизации")}finally{I.innerText="🔄 Синхронизировать (TL)",I.disabled=!1}});async function G(){try{const e=await(await fetch(`${d}/admin/dashboard`)).json();if(e.success){const{allBookings:o}=e.data;te(o||[])}}catch(t){console.error("Failed to load bookings dashboard",t)}}function ee(t){if(!t||t==="Гость")return"Гость";const o=t.replace(/\*/g,"").trim().split(/\s+/);if(o.length===1)return o[0];const n=o[0],i=o[1],r=/(?:ов|ова|ев|ева|ин|ина|ский|ская|ый|ая)$/i.test(i),l=/(?:ов|ова|ев|ева|ин|ина|ский|ская|ый|ая)$/i.test(n);return r&&!l?`${i} ${n[0].toUpperCase()}.`:`${n} ${i[0].toUpperCase()}.`}function te(t){const e=document.getElementById("masterBookingsTableBody"),o=document.getElementById("allBookingsCountBadge");if(e){if(o&&(o.innerText=`👥 ${t.length} броней`),!t||t.length===0){e.innerHTML='<tr><td colspan="8" style="text-align: center; color: #a1a1aa; padding: 1.5rem;">Бронирований не найдено</td></tr>';return}e.innerHTML=t.map(n=>{const i=String(n.house_number||""),r=ee(n.guest_name),l=n.arrival_date?n.arrival_date.slice(5,10).replace("-","."):"",p=n.departure_date?n.departure_date.slice(5,10).replace("-","."):"",y=`${l} – ${p}`,m=n.sms_stages||n.sms&&Object.keys(n.sms).length>0?'<span style="background: rgba(52, 211, 153, 0.15); color: #34d399; padding: 0.2rem 0.45rem; border-radius: 0.375rem; font-size: 11px; font-weight: 700; border: 1px solid rgba(52, 211, 153, 0.3);">✅ Ушла</span>':'<span style="background: rgba(148, 163, 184, 0.12); color: #94a3b8; padding: 0.2rem 0.45rem; border-radius: 0.375rem; font-size: 11px; font-weight: 600;">⏳ Ожидает</span>';return`
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 0.6rem 0.5rem;">
          <button class="btn" style="background: rgba(255,255,255,0.08); color: #60a5fa; border: 1px solid rgba(96,165,250,0.3); padding: 0.25rem 0.5rem; font-size: 11px; font-weight: 600;" onclick="navigator.clipboard.writeText('${n.id}'); this.innerText='✓ Скопировано'; setTimeout(() => this.innerText='📋 ID', 1500);" title="Скопировать номер брони (${n.id})">📋 ID</button>
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          <strong style="color: white; font-size: 0.875rem;">${r}</strong>
        </td>
        <td style="padding: 0.6rem 0.5rem; font-size: 0.8125rem;">
          <span style="color: #34d399; font-weight: 600;">${n.phone?"📞 "+n.phone:"—"}</span>
        </td>
        <td style="padding: 0.6rem 0.5rem; color: #e4e4e7; font-size: 0.8125rem;">
          ${n.cabin_name||"Домик"}
        </td>
        <td style="padding: 0.6rem 0.5rem; font-size: 11px; color: #a1a1aa; font-weight: 600;">
          ${y}
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          <select style="margin-bottom: 0; padding: 0.3rem 0.4rem; font-size: 12px; font-weight: 700; color: #facc15; background: #0f172a; border: 1px solid rgba(250,204,21,0.5); border-radius: 0.375rem; cursor: pointer;" onchange="window.autoSaveHouseNumber('${n.id}', this.value)">
            <option value="">-- № --</option>
            <optgroup label="7-местный">
              <option value="101" ${i==="101"?"selected":""}>№ 101</option>
              <option value="102" ${i==="102"?"selected":""}>№ 102</option>
              <option value="103" ${i==="103"?"selected":""}>№ 103</option>
            </optgroup>
            <optgroup label="Мини 2-местный">
              <option value="104" ${i==="104"?"selected":""}>№ 104</option>
              <option value="105" ${i==="105"?"selected":""}>№ 105</option>
              <option value="106" ${i==="106"?"selected":""}>№ 106</option>
              <option value="107" ${i==="107"?"selected":""}>№ 107</option>
              <option value="108" ${i==="108"?"selected":""}>№ 108</option>
              <option value="109" ${i==="109"?"selected":""}>№ 109</option>
            </optgroup>
            <optgroup label="Мини 4-местный">
              <option value="110" ${i==="110"?"selected":""}>№ 110</option>
              <option value="111" ${i==="111"?"selected":""}>№ 111</option>
            </optgroup>
            <optgroup label="Барн 4-местный (Барн+)">
              <option value="112" ${i==="112"?"selected":""}>№ 112</option>
              <option value="113" ${i==="113"?"selected":""}>№ 113</option>
              <option value="114" ${i==="114"?"selected":""}>№ 114</option>
              <option value="115" ${i==="115"?"selected":""}>№ 115</option>
              <option value="116" ${i==="116"?"selected":""}>№ 116</option>
              <option value="117" ${i==="117"?"selected":""}>№ 117</option>
              <option value="118" ${i==="118"?"selected":""}>№ 118</option>
              <option value="119" ${i==="119"?"selected":""}>№ 119</option>
            </optgroup>
            <optgroup label="Барн 2-местный">
              <option value="120" ${i==="120"?"selected":""}>№ 120</option>
              <option value="121" ${i==="121"?"selected":""}>№ 121</option>
            </optgroup>
          </select>
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          <a href="/?booking=${n.id}" target="_blank" class="btn" style="background: rgba(0, 150, 217, 0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); padding: 0.25rem 0.5rem; font-size: 11px; font-weight: 600; text-decoration: none;">📱 ПВА</a>
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          ${m}
        </td>
      </tr>
    `}).join("")}}async function H(){try{const e=await(await fetch(`${d}/catalog`)).json();e.success&&(M=e.data,ne())}catch(t){console.error("Failed to load catalog",t)}}function ne(){N.innerHTML="",M.forEach(t=>{const e=document.createElement("tr");let o=`<span style="font-size: 24px;">${t.icon||"📦"}</span>`;t.image&&(o=`<img src="${t.image}" class="item-image" alt="icon"/>`),e.innerHTML=`
      <td style="color: #9ca3af; font-weight: 600;">${t.id}</td>
      <td>${o}</td>
      <td style="font-weight: 700;">${t.displayName}</td>
      <td>${t.category==="service"?"Услуга":"Баня"}</td>
      <td style="color: var(--accent-gold); font-weight: 700;">${t.price} ₽</td>
      <td>${t.isQuickOrder?"✅ Да":"❌ Нет"}</td>
      <td>
        <button class="btn btn-edit" onclick="editItem('${t.id}')">Изменить</button>
        <button class="btn btn-danger" onclick="deleteItem('${t.id}')">Удалить</button>
      </td>
    `,N.appendChild(e)})}document.getElementById("openAddModalBtn").addEventListener("click",()=>{q.innerText="Добавить услугу",document.getElementById("originalId").value="",document.getElementById("itemId").value="",document.getElementById("itemId").disabled=!1,document.getElementById("itemName").value="",document.getElementById("itemDesc").value="",document.getElementById("itemPrice").value="",document.getElementById("itemCategory").value="service",document.getElementById("itemIcon").value="",document.getElementById("existingImage").value="",document.getElementById("itemImage").value="",document.getElementById("itemQuickOrder").checked=!1,b.style.display="none",L.classList.add("active")});document.getElementById("closeModalBtn").addEventListener("click",()=>{L.classList.remove("active")});window.editItem=t=>{const e=M.find(o=>o.id===t);e&&(q.innerText="Изменить услугу",document.getElementById("originalId").value=e.id,document.getElementById("itemId").value=e.id,document.getElementById("itemId").disabled=!0,document.getElementById("itemName").value=e.displayName,document.getElementById("itemDesc").value=e.desc||"",document.getElementById("itemPrice").value=e.price,document.getElementById("itemCategory").value=e.category||"service",document.getElementById("itemIcon").value=e.icon||"",document.getElementById("existingImage").value=e.image||"",document.getElementById("itemImage").value="",document.getElementById("itemQuickOrder").checked=!!e.isQuickOrder,e.image?(b.src=e.image,b.style.display="block"):b.style.display="none",L.classList.add("active"))};window.deleteItem=async t=>{if(confirm(`Точно удалить услугу ${t}?`))try{(await fetch(`${d}/catalog/${t}`,{method:"DELETE",headers:{Authorization:`Bearer ${c}`}})).ok&&await H()}catch{alert("Ошибка удаления")}};document.getElementById("itemForm").addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("originalId").value,o=!!e,n=document.getElementById("itemId").value,i=document.getElementById("itemName").value,r=document.getElementById("itemDesc").value,l=parseInt(document.getElementById("itemPrice").value,10),p=document.getElementById("itemCategory").value,y=document.getElementById("itemIcon").value,f=document.getElementById("itemQuickOrder").checked,m=document.getElementById("itemImage");let g=document.getElementById("existingImage").value;if(m.files.length>0){const a=new FormData;a.append("image",m.files[0]);try{const C=await(await fetch(`${d}/upload`,{method:"POST",headers:{Authorization:`Bearer ${c}`},body:a})).json();C.success&&(g=C.imageUrl)}catch{alert("Ошибка загрузки картинки");return}}const v={id:n,displayName:i,desc:r,price:l,category:p,icon:y,image:g,isQuickOrder:f};try{const a=o?`${d}/catalog/${e}`:`${d}/catalog`,D=await(await fetch(a,{method:o?"PUT":"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c}`},body:JSON.stringify(v)})).json();D.success?(L.classList.remove("active"),await H()):alert("Ошибка сохранения: "+D.error)}catch{alert("Ошибка сети")}});async function E(){if(c)try{const e=await(await u(`${d}/admin/warehouse`)).json();if(!e.success)return;const{totalValuation:o,lowStockCount:n,gifts:i,products:r,logs:l}=e.data,p=document.getElementById("kpiTotalValuation"),y=document.getElementById("kpiLowStockCount"),f=document.getElementById("kpiTotalGifts");p&&(p.innerText=`${(o||0).toLocaleString("ru-RU")} ₽`),y&&(y.innerText=`${n||0} позиций`),f&&(f.innerText=`${(i||[]).length} видов`);const m=document.getElementById("giftsTableBody");m&&(m.innerHTML=(i||[]).map(a=>{const B=a.stock<=a.min_threshold;return`
          <tr>
            <td><img src="${a.image_url}" style="width: 40px; height: 40px; object-fit: contain; background: white; border-radius: 6px; padding: 2px;" /></td>
            <td><strong>${a.title}</strong><br><span style="font-size: 11px; color: #a1a1aa;">${a.subtitle||""}</span></td>
            <td><span style="background: rgba(0,150,217,0.2); color: #0096d9; padding: 2px 8px; border-radius: 999px; font-weight: 700; font-size: 11px;">${a.badge||"Подарок"}</span></td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('gift', '${a.id}', ${a.stock-1}, ${a.min_threshold}, ${a.unit_cost})">-</button>
                <strong style="color: ${B?"#f87171":"#34d399"};">${a.stock} шт.</strong>
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('gift', '${a.id}', ${a.stock+1}, ${a.min_threshold}, ${a.unit_cost})">+</button>
              </div>
            </td>
            <td>${a.min_threshold} шт.</td>
            <td>${(a.unit_cost||0).toLocaleString("ru-RU")} ₽</td>
            <td><span style="color: ${a.is_active?"#34d399":"#f87171"}; font-weight: 700;">${a.is_active?"Активен":"Скрыт"}</span></td>
            <td>
              <div style="display: flex; gap: 0.25rem;">
                <button class="btn btn-edit" onclick="window.editGift('${a.id}')">✏️ Edit</button>
                <button class="btn" style="background: rgba(239,68,68,0.2); color: #ef4444;" onclick="window.deleteGift('${a.id}')">🗑️</button>
              </div>
            </td>
          </tr>
        `}).join(""));const g=document.getElementById("productsTableBody");g&&(g.innerHTML=(r||[]).map(a=>{const B=a.stock<=a.min_threshold;return`
          <tr>
            <td><strong>${a.name}</strong></td>
            <td>${a.category||"Услуги"}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('product', '${a.id}', ${a.stock-1}, ${a.min_threshold}, ${a.unit_cost})">-</button>
                <strong style="color: ${B?"#f87171":"#34d399"};">${a.stock} шт.</strong>
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('product', '${a.id}', ${a.stock+1}, ${a.min_threshold}, ${a.unit_cost})">+</button>
              </div>
            </td>
            <td>${a.min_threshold} шт.</td>
            <td>${(a.unit_cost||0).toLocaleString("ru-RU")} ₽</td>
            <td>${(a.price||0).toLocaleString("ru-RU")} ₽</td>
            <td><button class="btn btn-primary" style="padding: 4px 10px; font-size: 11px;" onclick="window.promptStockUpdate('product', '${a.id}', ${a.stock}, ${a.min_threshold}, ${a.unit_cost})">Корректировка</button></td>
          </tr>
        `}).join(""));const v=document.getElementById("stockLogsTableBody");v&&(v.innerHTML=(l||[]).map(a=>`
        <tr>
          <td style="font-size: 11px; color: #a1a1aa;">${a.created_at||""}</td>
          <td><span style="font-weight: 700; font-size: 11px; color: ${a.item_type==="gift"?"var(--accent-gold)":"#60a5fa"};">${a.item_type==="gift"?"Подарок":"Товар"}</span></td>
          <td><strong>${a.item_name||""}</strong></td>
          <td><span style="font-weight: 800; color: ${a.change_qty>=0?"#34d399":"#f87171"};">${a.change_qty>0?"+":""}${a.change_qty}</span></td>
          <td style="font-size: 11px; color: #e4e4e7;">${a.reason||""}</td>
        </tr>
      `).join("")),window._cachedGifts=i||[]}catch(t){console.error("Error loading warehouse dashboard:",t)}}window.updateStock=async(t,e,o,n,i,r="Быстрая корректировка остатка")=>{if(!(o<0))try{(await(await u(`${d}/admin/warehouse/update`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({itemType:t,id:e,stock:o,min_threshold:n,unit_cost:i,reason:r})})).json()).success&&await E()}catch{alert("Ошибка обновления остатка")}};window.promptStockUpdate=async(t,e,o,n,i)=>{const r=prompt("Введите новый остаток на складе (шт.):",o);if(r===null)return;const l=parseInt(r,10);if(isNaN(l)||l<0)return alert("Введите корректное число!");await window.updateStock(t,e,l,n,i,"Инвентаризация склада")};const z=document.getElementById("giftModalAdmin"),U=document.getElementById("giftFormAdmin"),F=document.getElementById("openAddGiftModalBtn"),R=document.getElementById("closeGiftModalAdminBtn");F&&F.addEventListener("click",()=>{document.getElementById("giftIdAdmin").value="",document.getElementById("giftTitleAdmin").value="",document.getElementById("giftSubtitleAdmin").value="",document.getElementById("giftBadgeAdmin").value="★ Символ Парка",document.getElementById("giftImageUrlAdmin").value="./assets/images/gifts/gift_toy.png?v=2",document.getElementById("giftStockAdmin").value="50",document.getElementById("giftMinThresholdAdmin").value="10",document.getElementById("giftUnitCostAdmin").value="350",document.getElementById("giftIsActiveAdmin").checked=!0,document.getElementById("giftModalAdminTitle").innerText="Добавить Новый Подарок",z.classList.add("active")});R&&R.addEventListener("click",()=>{z.classList.remove("active")});window.editGift=t=>{const e=(window._cachedGifts||[]).find(o=>o.id===t);e&&(document.getElementById("giftIdAdmin").value=e.id,document.getElementById("giftTitleAdmin").value=e.title||"",document.getElementById("giftSubtitleAdmin").value=e.subtitle||"",document.getElementById("giftBadgeAdmin").value=e.badge||"",document.getElementById("giftImageUrlAdmin").value=e.image_url||"",document.getElementById("giftStockAdmin").value=e.stock||50,document.getElementById("giftMinThresholdAdmin").value=e.min_threshold||10,document.getElementById("giftUnitCostAdmin").value=e.unit_cost||350,document.getElementById("giftIsActiveAdmin").checked=e.is_active!==0,document.getElementById("giftModalAdminTitle").innerText="Редактировать Подарок",z.classList.add("active"))};window.deleteGift=async t=>{if(confirm("Вы уверены, что хотите удалить этот подарок?"))try{(await u(`${d}/admin/gifts/${t}`,{method:"DELETE"})).ok&&await E()}catch{alert("Ошибка удаления подарка")}};U&&U.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("giftIdAdmin").value,o=document.getElementById("giftTitleAdmin").value,n=document.getElementById("giftSubtitleAdmin").value,i=document.getElementById("giftBadgeAdmin").value;let r=document.getElementById("giftImageUrlAdmin").value;const l=parseInt(document.getElementById("giftStockAdmin").value,10),p=parseInt(document.getElementById("giftMinThresholdAdmin").value,10),y=parseInt(document.getElementById("giftUnitCostAdmin").value,10),f=document.getElementById("giftIsActiveAdmin").checked?1:0,m=document.getElementById("giftImageFileAdmin");if(m&&m.files.length>0){const g=new FormData;g.append("image",m.files[0]);try{const a=await(await u(`${d}/upload`,{method:"POST",body:g})).json();a.success&&(r=a.imageUrl)}catch{alert("Ошибка загрузки фото подарка");return}}try{(await(await u(`${d}/admin/gifts`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:e,title:o,subtitle:n,badge:i,image_url:r,stock:l,min_threshold:p,unit_cost:y,is_active:f})})).json()).success?(z.classList.remove("active"),await E()):alert("Ошибка сохранения подарка")}catch{alert("Ошибка сети")}});async function O(){if(c){try{const e=await(await u(`${d}/admin/in-house-guests`)).json();if(e.success){const o=document.getElementById("inHouseGuestsCountBadge");o&&(o.innerText=`👥 ${e.guests.length} гостей сейчас в парке`),window._inHouseGuests=e.guests||[],renderInHouseGuestsTable(e.guests||[])}}catch(t){console.error("Error loading in-house guests for broadcast:",t)}await P()}}window.renderInHouseGuestsTable=t=>{const e=document.getElementById("inHouseGuestsTableBody");if(e){if(!t||t.length===0){e.innerHTML='<tr><td colspan="5" style="text-align: center; color: #a1a1aa; padding: 1rem;">Нет текущих проживающих гостей</td></tr>';return}e.innerHTML=t.map(o=>{const n=String(o.house_number||"");return`
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 0.75rem 0.5rem;">
          <strong style="color: white; font-size: 0.875rem;">${o.guest_name||"Гость"}</strong><br>
          <span style="font-size: 11px; color: #94a3b8;">ID: ${o.id}</span>
        </td>
        <td style="padding: 0.75rem 0.5rem;">
          <span style="color: #34d399; font-weight: 700; font-size: 0.8125rem;">📞 ${o.phone||"Нет телефона"}</span>
        </td>
        <td style="padding: 0.75rem 0.5rem; color: #e4e4e7; font-size: 0.8125rem;">
          ${o.cabin_name||"Домик"}
        </td>
        <td style="padding: 0.75rem 0.5rem; font-size: 11px; color: #a1a1aa;">
          ${o.arrival_date?o.arrival_date.slice(0,10):""} – ${o.departure_date?o.departure_date.slice(0,10):""}
        </td>
        <td style="padding: 0.75rem 0.5rem;">
          <select style="margin-bottom: 0; padding: 0.4rem 0.6rem; font-size: 0.8125rem; font-weight: 700; color: #facc15; background: #0f172a; border: 1px solid rgba(250,204,21,0.5); border-radius: 0.5rem; cursor: pointer;" onchange="window.autoSaveHouseNumber('${o.id}', this.value)">
            <option value="">-- Без номера --</option>
            <optgroup label="Дом в лесу 7-местный (101-103)">
              <option value="101" ${n==="101"?"selected":""}>№ 101 (7-местный)</option>
              <option value="102" ${n==="102"?"selected":""}>№ 102 (7-местный)</option>
              <option value="103" ${n==="103"?"selected":""}>№ 103 (7-местный)</option>
            </optgroup>
            <optgroup label="Мини 2-местный (104-109)">
              <option value="104" ${n==="104"?"selected":""}>№ 104 (Мини 2-местный)</option>
              <option value="105" ${n==="105"?"selected":""}>№ 105 (Мини 2-местный)</option>
              <option value="106" ${n==="106"?"selected":""}>№ 106 (Мини 2-местный)</option>
              <option value="107" ${n==="107"?"selected":""}>№ 107 (Мини 2-местный)</option>
              <option value="108" ${n==="108"?"selected":""}>№ 108 (Мини 2-местный)</option>
              <option value="109" ${n==="109"?"selected":""}>№ 109 (Мини 2-местный)</option>
            </optgroup>
            <optgroup label="Мини 4-местный (110-111)">
              <option value="110" ${n==="110"?"selected":""}>№ 110 (Мини 4-местный)</option>
              <option value="111" ${n==="111"?"selected":""}>№ 111 (Мини 4-местный)</option>
            </optgroup>
            <optgroup label="Барнхаус 4-местный (112-119)">
              <option value="112" ${n==="112"?"selected":""}>№ 112 (Барнхаус 4-местный)</option>
              <option value="113" ${n==="113"?"selected":""}>№ 113 (Барнхаус 4-местный)</option>
              <option value="114" ${n==="114"?"selected":""}>№ 114 (Барнхаус 4-местный)</option>
              <option value="115" ${n==="115"?"selected":""}>№ 115 (Барнхаус 4-местный)</option>
              <option value="116" ${n==="116"?"selected":""}>№ 116 (Барнхаус 4-местный)</option>
              <option value="117" ${n==="117"?"selected":""}>№ 117 (Барнхаус 4-местный)</option>
              <option value="118" ${n==="118"?"selected":""}>№ 118 (Барнхаус 4-местный)</option>
              <option value="119" ${n==="119"?"selected":""}>№ 119 (Барнхаус 4-местный)</option>
            </optgroup>
            <optgroup label="Барнхаус 2-местный (120-121)">
              <option value="120" ${n==="120"?"selected":""}>№ 120 (Барнхаус 2-местный)</option>
              <option value="121" ${n==="121"?"selected":""}>№ 121 (Барнхаус 2-местный)</option>
            </optgroup>
          </select>
        </td>
      </tr>
    `}).join("")}};window.autoSaveHouseNumber=async(t,e)=>{try{const n=await(await u(`${d}/admin/assign-house`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId:t,houseNumber:e})})).json();n.success?console.log(`[House Assigned] ${t} -> ${e}`):alert("Ошибка привязки домика: "+(n.error||""))}catch{alert("Ошибка сети при сохранении номера домика")}};async function P(){if(c)try{const e=await(await u(`${d}/admin/sms-templates`)).json();if(e.success&&e.templates){window._smsTemplates=e.templates;const o=document.getElementById("templateSelect");o&&(o.innerHTML='<option value="">-- Выберите шаблон для вставки --</option>'+e.templates.map(n=>`<option value="${n.id}">${n.title}</option>`).join(""))}}catch(t){console.error("Error loading SMS templates:",t)}}const w=document.getElementById("templateSelect"),h=document.getElementById("deleteTemplateBtn"),J=document.getElementById("saveTemplateBtn"),s=document.getElementById("broadcastTextarea"),$=document.getElementById("broadcastPreviewText"),Q=document.getElementById("insertNameTagBtn"),W=document.getElementById("sendBroadcastBtn");w&&w.addEventListener("change",()=>{const t=w.value,e=(window._smsTemplates||[]).find(o=>String(o.id)===String(t));e?(s&&(s.value=e.template,s.dispatchEvent(new Event("input"))),h&&(h.style.display="inline-block")):h&&(h.style.display="none")});J&&J.addEventListener("click",async()=>{const t=s?s.value.trim():"";if(!t)return alert("Введите текст сообщения в поле слева перед сохранением шаблона!");const e=prompt('Введите название шаблона (например: "Акция на Бани -20%"):');if(!(!e||!e.trim()))try{(await(await u(`${d}/admin/sms-templates`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:e.trim(),template:t})})).json()).success?(alert("✅ Шаблон рассылки успешно сохранен!"),await P()):alert("Ошибка сохранения шаблона")}catch{alert("Ошибка сети при сохранении шаблона")}});h&&h.addEventListener("click",async()=>{const t=w?w.value:null;if(t&&confirm("Вы действительно хотите удалить этот шаблон рассылки?"))try{(await(await u(`${d}/admin/sms-templates/${t}`,{method:"DELETE"})).json()).success&&(alert("✅ Шаблон удален"),s&&(s.value=""),$&&($.innerText="[Введите текст слева]"),h.style.display="none",await P())}catch{alert("Ошибка удаления шаблона")}});s&&$&&s.addEventListener("input",()=>{const t=window._inHouseGuests&&window._inHouseGuests[0]?window._inHouseGuests[0].guest_name.split(" ")[0]:"Константин",e=s.value||"[Введите текст слева]";$.innerText=e.replace(/\{имя\}/g,t).replace(/\{name\}/g,t)});Q&&s&&Q.addEventListener("click",()=>{s.value+=" {имя}",s.dispatchEvent(new Event("input")),s.focus()});W&&W.addEventListener("click",async()=>{const t=s?s.value.trim():"";if(!t)return alert("Введите текст сообщения!");const e=(window._inHouseGuests||[]).length;if(confirm(`Вы действительно хотите отправить это СМС сообщение ${e} проживающим гостям прямо сейчас?`))try{const n=await(await u(`${d}/admin/broadcast-sms`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({template:t})})).json();n.success?(alert(`✅ СМС-рассылка успешно выполнена! Отправлено ${n.sentCount} гостям.`),s.value="",$&&($.innerText="[Сообщение отправлено!]")):alert("Ошибка отправки: "+n.error)}catch{alert("Ошибка сети при отправке рассылки")}});
//# sourceMappingURL=admin-DV7QLpHW.js.map
