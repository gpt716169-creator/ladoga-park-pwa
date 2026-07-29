import"./style-CTAUnyPs.js";const r="/api",_=document.getElementById("loginScreen"),A=document.getElementById("dashboardScreen"),N=document.getElementById("catalogTableBody"),L=document.getElementById("itemModal");document.getElementById("itemForm");const V=document.getElementById("modalTitle"),b=document.getElementById("currentImagePreview");let m=localStorage.getItem("adminToken"),C=[];async function y(t,e={}){e.headers=e.headers||{},m&&(e.headers.Authorization=`Bearer ${m}`);const n=await fetch(t,e);if(n.status===401||n.status===403){console.warn("[Admin API] 401/403 response. Session expired."),m=null,localStorage.removeItem("adminToken"),_&&(_.style.display="flex"),A&&(A.style.display="none");const a=document.getElementById("loginError");throw a&&(a.innerText="Сессия истекла или неверный токен. Войдите снова."),new Error("Unauthorized/Forbidden")}return n}m&&K();document.getElementById("loginBtn").addEventListener("click",async()=>{const t=document.getElementById("username").value,e=document.getElementById("password").value;try{const a=await(await fetch(`${r}/admin/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:t,password:e})})).json();a.success?(m=a.token,localStorage.setItem("adminToken",m),K()):document.getElementById("loginError").innerText=a.error||"Ошибка входа"}catch{document.getElementById("loginError").innerText="Ошибка сети"}});document.getElementById("logoutBtn").addEventListener("click",()=>{m=null,localStorage.removeItem("adminToken"),_.style.display="flex",A.style.display="none"});async function K(){_.style.display="none",A.style.display="block",await H(),await G(),await E(),await O()}const k=document.getElementById("tabCatalogBtn"),T=document.getElementById("tabBookingsBtn"),x=document.getElementById("tabWarehouseBtn"),S=document.getElementById("tabBroadcastBtn"),X=document.getElementById("viewCatalog"),Y=document.getElementById("viewBookings"),Z=document.getElementById("viewWarehouse"),ee=document.getElementById("viewBroadcast");function j(t,e){[k,T,x,S].forEach(n=>{n&&(n.className="btn",n.style.background="rgba(255,255,255,0.1)",n.style.color="white")}),[X,Y,Z,ee].forEach(n=>{n&&(n.style.display="none")}),t&&(t.className="btn btn-primary"),e&&(e.style.display="block")}k&&k.addEventListener("click",()=>j(k,X));T&&T.addEventListener("click",async()=>{j(T,Y),await G(),await O()});x&&x.addEventListener("click",async()=>{j(x,Z),await E()});S&&S.addEventListener("click",async()=>{j(S,ee),await O()});const $=document.getElementById("forceSyncBtn");$&&$.addEventListener("click",async()=>{$.innerText="⏳ Синхронизация...",$.disabled=!0;try{const e=await(await fetch(`${r}/admin/sync`,{method:"POST",headers:{Authorization:`Bearer ${m}`}})).json();e.success?(alert("Синхронизация с TravelLine выполнена успешно!"),await G()):alert("Ошибка синхронизации: "+(e.error||"Неизвестная ошибка"))}catch{alert("Ошибка сети при синхронизации")}finally{$.innerText="🔄 Синхронизировать (TL)",$.disabled=!1}});async function G(){try{const e=await(await fetch(`${r}/admin/dashboard`)).json();if(e.success){const{tomorrowArrivals:n,currentStays:a,todayDepartures:s,upcomingBookings:l}=e.data,i=[...a||[],...n||[],...s||[]],d=new Map;i.forEach(g=>d.set(g.id,g));const f=Array.from(d.values());U("activeBookingsTableBody","activeGuestsCountBadge",f,"🔥 0 активных гостей"),U("futureBookingsTableBody","futureBookingsBadge",l||[],"(0 броней)")}}catch(t){console.error("Failed to load bookings dashboard",t)}}function te(t){if(!t||t==="Гость")return"Гость";const n=t.replace(/\*/g,"").trim().split(/\s+/);if(n.length===1)return n[0];const a=n[0],s=n[1],l=/(?:ов|ова|ев|ева|ин|ина|ский|ская|ый|ая)$/i.test(s),i=/(?:ов|ова|ев|ева|ин|ина|ский|ская|ый|ая)$/i.test(a);return l&&!i?`${s} ${a[0].toUpperCase()}.`:`${a} ${s[0].toUpperCase()}.`}function U(t,e,n,a){const s=document.getElementById(t),l=document.getElementById(e);if(s){if(l&&(l.innerText=n.length>0?e==="futureBookingsBadge"?`(${n.length} броней)`:`🔥 ${n.length} активных гостей`:a),!n||n.length===0){s.innerHTML='<tr><td colspan="8" style="text-align: center; color: #a1a1aa; padding: 1.5rem;">Бронирований не найдено</td></tr>';return}s.innerHTML=n.map(i=>{const d=String(i.house_number||""),f=te(i.guest_name),g=i.arrival_date?i.arrival_date.slice(5,10).replace("-","."):"",p=i.departure_date?i.departure_date.slice(5,10).replace("-","."):"",u=`${g} – ${p}`,o=i.sms_stages||i.sms&&Object.keys(i.sms).length>0?'<span style="background: rgba(52, 211, 153, 0.15); color: #34d399; padding: 0.2rem 0.45rem; border-radius: 0.375rem; font-size: 11px; font-weight: 700; border: 1px solid rgba(52, 211, 153, 0.3);">✅ Ушла</span>':'<span style="background: rgba(148, 163, 184, 0.12); color: #94a3b8; padding: 0.2rem 0.45rem; border-radius: 0.375rem; font-size: 11px; font-weight: 600;">⏳ Ожидает</span>';return`
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 0.6rem 0.5rem;">
          <button class="btn" style="background: rgba(255,255,255,0.08); color: #60a5fa; border: 1px solid rgba(96,165,250,0.3); padding: 0.25rem 0.5rem; font-size: 11px; font-weight: 600;" onclick="navigator.clipboard.writeText('${i.id}'); this.innerText='✓ Скопировано'; setTimeout(() => this.innerText='📋 ID', 1500);" title="Скопировать номер брони (${i.id})">📋 ID</button>
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          <strong style="color: white; font-size: 0.875rem;">${f}</strong>
        </td>
        <td style="padding: 0.6rem 0.5rem; font-size: 0.8125rem;">
          <span style="color: #34d399; font-weight: 600;">${i.phone?"📞 "+i.phone:"—"}</span>
        </td>
        <td style="padding: 0.6rem 0.5rem; color: #e4e4e7; font-size: 0.8125rem;">
          ${i.cabin_name||"Домик"}
        </td>
        <td style="padding: 0.6rem 0.5rem; font-size: 11px; color: #a1a1aa; font-weight: 600;">
          ${u}
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          <select style="margin-bottom: 0; padding: 0.3rem 0.4rem; font-size: 12px; font-weight: 700; color: #facc15; background: #0f172a; border: 1px solid rgba(250,204,21,0.5); border-radius: 0.375rem; cursor: pointer;" onchange="window.autoSaveHouseNumber('${i.id}', this.value)">
            <option value="">-- № --</option>
            <optgroup label="7-местный">
              <option value="101" ${d==="101"?"selected":""}>№ 101</option>
              <option value="102" ${d==="102"?"selected":""}>№ 102</option>
              <option value="103" ${d==="103"?"selected":""}>№ 103</option>
            </optgroup>
            <optgroup label="Мини 2-местный">
              <option value="104" ${d==="104"?"selected":""}>№ 104</option>
              <option value="105" ${d==="105"?"selected":""}>№ 105</option>
              <option value="106" ${d==="106"?"selected":""}>№ 106</option>
              <option value="107" ${d==="107"?"selected":""}>№ 107</option>
              <option value="108" ${d==="108"?"selected":""}>№ 108</option>
              <option value="109" ${d==="109"?"selected":""}>№ 109</option>
            </optgroup>
            <optgroup label="Мини 4-местный">
              <option value="110" ${d==="110"?"selected":""}>№ 110</option>
              <option value="111" ${d==="111"?"selected":""}>№ 111</option>
            </optgroup>
            <optgroup label="Барн 4-местный (Барн+)">
              <option value="112" ${d==="112"?"selected":""}>№ 112</option>
              <option value="113" ${d==="113"?"selected":""}>№ 113</option>
              <option value="114" ${d==="114"?"selected":""}>№ 114</option>
              <option value="115" ${d==="115"?"selected":""}>№ 115</option>
              <option value="116" ${d==="116"?"selected":""}>№ 116</option>
              <option value="117" ${d==="117"?"selected":""}>№ 117</option>
              <option value="118" ${d==="118"?"selected":""}>№ 118</option>
              <option value="119" ${d==="119"?"selected":""}>№ 119</option>
            </optgroup>
            <optgroup label="Барн 2-местный">
              <option value="120" ${d==="120"?"selected":""}>№ 120</option>
              <option value="121" ${d==="121"?"selected":""}>№ 121</option>
            </optgroup>
          </select>
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          <a href="/?booking=${i.id}" target="_blank" class="btn" style="background: rgba(0, 150, 217, 0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); padding: 0.25rem 0.5rem; font-size: 11px; font-weight: 600; text-decoration: none;">📱 ПВА</a>
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          ${o}
        </td>
      </tr>
    `}).join("")}}async function H(){try{const e=await(await fetch(`${r}/catalog`)).json();e.success&&(C=e.data,ne())}catch(t){console.error("Failed to load catalog",t)}}function ne(){N.innerHTML="",C.forEach(t=>{const e=document.createElement("tr");let n=`<span style="font-size: 24px;">${t.icon||"📦"}</span>`;t.image&&(n=`<img src="${t.image}" class="item-image" alt="icon"/>`),e.innerHTML=`
      <td style="color: #9ca3af; font-weight: 600;">${t.id}</td>
      <td>${n}</td>
      <td style="font-weight: 700;">${t.displayName}</td>
      <td>${t.category==="service"?"Услуга":"Баня"}</td>
      <td style="color: var(--accent-gold); font-weight: 700;">${t.price} ₽</td>
      <td>${t.isQuickOrder?"✅ Да":"❌ Нет"}</td>
      <td>
        <button class="btn btn-edit" onclick="editItem('${t.id}')">Изменить</button>
        <button class="btn btn-danger" onclick="deleteItem('${t.id}')">Удалить</button>
      </td>
    `,N.appendChild(e)})}document.getElementById("openAddModalBtn").addEventListener("click",()=>{V.innerText="Добавить услугу",document.getElementById("originalId").value="",document.getElementById("itemId").value="",document.getElementById("itemId").disabled=!1,document.getElementById("itemName").value="",document.getElementById("itemDesc").value="",document.getElementById("itemPrice").value="",document.getElementById("itemCategory").value="service",document.getElementById("itemIcon").value="",document.getElementById("existingImage").value="",document.getElementById("itemImage").value="",document.getElementById("itemQuickOrder").checked=!1,b.style.display="none",L.classList.add("active")});document.getElementById("closeModalBtn").addEventListener("click",()=>{L.classList.remove("active")});window.editItem=t=>{const e=C.find(n=>n.id===t);e&&(V.innerText="Изменить услугу",document.getElementById("originalId").value=e.id,document.getElementById("itemId").value=e.id,document.getElementById("itemId").disabled=!0,document.getElementById("itemName").value=e.displayName,document.getElementById("itemDesc").value=e.desc||"",document.getElementById("itemPrice").value=e.price,document.getElementById("itemCategory").value=e.category||"service",document.getElementById("itemIcon").value=e.icon||"",document.getElementById("existingImage").value=e.image||"",document.getElementById("itemImage").value="",document.getElementById("itemQuickOrder").checked=!!e.isQuickOrder,e.image?(b.src=e.image,b.style.display="block"):b.style.display="none",L.classList.add("active"))};window.deleteItem=async t=>{if(confirm(`Точно удалить услугу ${t}?`))try{(await fetch(`${r}/catalog/${t}`,{method:"DELETE",headers:{Authorization:`Bearer ${m}`}})).ok&&await H()}catch{alert("Ошибка удаления")}};document.getElementById("itemForm").addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("originalId").value,n=!!e,a=document.getElementById("itemId").value,s=document.getElementById("itemName").value,l=document.getElementById("itemDesc").value,i=parseInt(document.getElementById("itemPrice").value,10),d=document.getElementById("itemCategory").value,f=document.getElementById("itemIcon").value,g=document.getElementById("itemQuickOrder").checked,p=document.getElementById("itemImage");let u=document.getElementById("existingImage").value;if(p.files.length>0){const o=new FormData;o.append("image",p.files[0]);try{const z=await(await fetch(`${r}/upload`,{method:"POST",headers:{Authorization:`Bearer ${m}`},body:o})).json();z.success&&(u=z.imageUrl)}catch{alert("Ошибка загрузки картинки");return}}const v={id:a,displayName:s,desc:l,price:i,category:d,icon:f,image:u,isQuickOrder:g};try{const o=n?`${r}/catalog/${e}`:`${r}/catalog`,P=await(await fetch(o,{method:n?"PUT":"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${m}`},body:JSON.stringify(v)})).json();P.success?(L.classList.remove("active"),await H()):alert("Ошибка сохранения: "+P.error)}catch{alert("Ошибка сети")}});async function E(){if(m)try{const e=await(await y(`${r}/admin/warehouse`)).json();if(!e.success)return;const{totalValuation:n,lowStockCount:a,gifts:s,products:l,logs:i}=e.data,d=document.getElementById("kpiTotalValuation"),f=document.getElementById("kpiLowStockCount"),g=document.getElementById("kpiTotalGifts");d&&(d.innerText=`${(n||0).toLocaleString("ru-RU")} ₽`),f&&(f.innerText=`${a||0} позиций`),g&&(g.innerText=`${(s||[]).length} видов`);const p=document.getElementById("giftsTableBody");p&&(p.innerHTML=(s||[]).map(o=>{const B=o.stock<=o.min_threshold;return`
          <tr>
            <td><img src="${o.image_url}" style="width: 40px; height: 40px; object-fit: contain; background: white; border-radius: 6px; padding: 2px;" /></td>
            <td><strong>${o.title}</strong><br><span style="font-size: 11px; color: #a1a1aa;">${o.subtitle||""}</span></td>
            <td><span style="background: rgba(0,150,217,0.2); color: #0096d9; padding: 2px 8px; border-radius: 999px; font-weight: 700; font-size: 11px;">${o.badge||"Подарок"}</span></td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('gift', '${o.id}', ${o.stock-1}, ${o.min_threshold}, ${o.unit_cost})">-</button>
                <strong style="color: ${B?"#f87171":"#34d399"};">${o.stock} шт.</strong>
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('gift', '${o.id}', ${o.stock+1}, ${o.min_threshold}, ${o.unit_cost})">+</button>
              </div>
            </td>
            <td>${o.min_threshold} шт.</td>
            <td>${(o.unit_cost||0).toLocaleString("ru-RU")} ₽</td>
            <td><span style="color: ${o.is_active?"#34d399":"#f87171"}; font-weight: 700;">${o.is_active?"Активен":"Скрыт"}</span></td>
            <td>
              <div style="display: flex; gap: 0.25rem;">
                <button class="btn btn-edit" onclick="window.editGift('${o.id}')">✏️ Edit</button>
                <button class="btn" style="background: rgba(239,68,68,0.2); color: #ef4444;" onclick="window.deleteGift('${o.id}')">🗑️</button>
              </div>
            </td>
          </tr>
        `}).join(""));const u=document.getElementById("productsTableBody");u&&(u.innerHTML=(l||[]).map(o=>{const B=o.stock<=o.min_threshold;return`
          <tr>
            <td><strong>${o.name}</strong></td>
            <td>${o.category||"Услуги"}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('product', '${o.id}', ${o.stock-1}, ${o.min_threshold}, ${o.unit_cost})">-</button>
                <strong style="color: ${B?"#f87171":"#34d399"};">${o.stock} шт.</strong>
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('product', '${o.id}', ${o.stock+1}, ${o.min_threshold}, ${o.unit_cost})">+</button>
              </div>
            </td>
            <td>${o.min_threshold} шт.</td>
            <td>${(o.unit_cost||0).toLocaleString("ru-RU")} ₽</td>
            <td>${(o.price||0).toLocaleString("ru-RU")} ₽</td>
            <td><button class="btn btn-primary" style="padding: 4px 10px; font-size: 11px;" onclick="window.promptStockUpdate('product', '${o.id}', ${o.stock}, ${o.min_threshold}, ${o.unit_cost})">Корректировка</button></td>
          </tr>
        `}).join(""));const v=document.getElementById("stockLogsTableBody");v&&(v.innerHTML=(i||[]).map(o=>`
        <tr>
          <td style="font-size: 11px; color: #a1a1aa;">${o.created_at||""}</td>
          <td><span style="font-weight: 700; font-size: 11px; color: ${o.item_type==="gift"?"var(--accent-gold)":"#60a5fa"};">${o.item_type==="gift"?"Подарок":"Товар"}</span></td>
          <td><strong>${o.item_name||""}</strong></td>
          <td><span style="font-weight: 800; color: ${o.change_qty>=0?"#34d399":"#f87171"};">${o.change_qty>0?"+":""}${o.change_qty}</span></td>
          <td style="font-size: 11px; color: #e4e4e7;">${o.reason||""}</td>
        </tr>
      `).join("")),window._cachedGifts=s||[]}catch(t){console.error("Error loading warehouse dashboard:",t)}}window.updateStock=async(t,e,n,a,s,l="Быстрая корректировка остатка")=>{if(!(n<0))try{(await(await y(`${r}/admin/warehouse/update`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({itemType:t,id:e,stock:n,min_threshold:a,unit_cost:s,reason:l})})).json()).success&&await E()}catch{alert("Ошибка обновления остатка")}};window.promptStockUpdate=async(t,e,n,a,s)=>{const l=prompt("Введите новый остаток на складе (шт.):",n);if(l===null)return;const i=parseInt(l,10);if(isNaN(i)||i<0)return alert("Введите корректное число!");await window.updateStock(t,e,i,a,s,"Инвентаризация склада")};const M=document.getElementById("giftModalAdmin"),F=document.getElementById("giftFormAdmin"),R=document.getElementById("openAddGiftModalBtn"),J=document.getElementById("closeGiftModalAdminBtn");R&&R.addEventListener("click",()=>{document.getElementById("giftIdAdmin").value="",document.getElementById("giftTitleAdmin").value="",document.getElementById("giftSubtitleAdmin").value="",document.getElementById("giftBadgeAdmin").value="★ Символ Парка",document.getElementById("giftImageUrlAdmin").value="./assets/images/gifts/gift_toy.png?v=2",document.getElementById("giftStockAdmin").value="50",document.getElementById("giftMinThresholdAdmin").value="10",document.getElementById("giftUnitCostAdmin").value="350",document.getElementById("giftIsActiveAdmin").checked=!0,document.getElementById("giftModalAdminTitle").innerText="Добавить Новый Подарок",M.classList.add("active")});J&&J.addEventListener("click",()=>{M.classList.remove("active")});window.editGift=t=>{const e=(window._cachedGifts||[]).find(n=>n.id===t);e&&(document.getElementById("giftIdAdmin").value=e.id,document.getElementById("giftTitleAdmin").value=e.title||"",document.getElementById("giftSubtitleAdmin").value=e.subtitle||"",document.getElementById("giftBadgeAdmin").value=e.badge||"",document.getElementById("giftImageUrlAdmin").value=e.image_url||"",document.getElementById("giftStockAdmin").value=e.stock||50,document.getElementById("giftMinThresholdAdmin").value=e.min_threshold||10,document.getElementById("giftUnitCostAdmin").value=e.unit_cost||350,document.getElementById("giftIsActiveAdmin").checked=e.is_active!==0,document.getElementById("giftModalAdminTitle").innerText="Редактировать Подарок",M.classList.add("active"))};window.deleteGift=async t=>{if(confirm("Вы уверены, что хотите удалить этот подарок?"))try{(await y(`${r}/admin/gifts/${t}`,{method:"DELETE"})).ok&&await E()}catch{alert("Ошибка удаления подарка")}};F&&F.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("giftIdAdmin").value,n=document.getElementById("giftTitleAdmin").value,a=document.getElementById("giftSubtitleAdmin").value,s=document.getElementById("giftBadgeAdmin").value;let l=document.getElementById("giftImageUrlAdmin").value;const i=parseInt(document.getElementById("giftStockAdmin").value,10),d=parseInt(document.getElementById("giftMinThresholdAdmin").value,10),f=parseInt(document.getElementById("giftUnitCostAdmin").value,10),g=document.getElementById("giftIsActiveAdmin").checked?1:0,p=document.getElementById("giftImageFileAdmin");if(p&&p.files.length>0){const u=new FormData;u.append("image",p.files[0]);try{const o=await(await y(`${r}/upload`,{method:"POST",body:u})).json();o.success&&(l=o.imageUrl)}catch{alert("Ошибка загрузки фото подарка");return}}try{(await(await y(`${r}/admin/gifts`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:e,title:n,subtitle:a,badge:s,image_url:l,stock:i,min_threshold:d,unit_cost:f,is_active:g})})).json()).success?(M.classList.remove("active"),await E()):alert("Ошибка сохранения подарка")}catch{alert("Ошибка сети")}});async function O(){if(m){try{const e=await(await y(`${r}/admin/in-house-guests`)).json();if(e.success){const n=document.getElementById("inHouseGuestsCountBadge");n&&(n.innerText=`👥 ${e.guests.length} гостей сейчас в парке`),window._inHouseGuests=e.guests||[],renderInHouseGuestsTable(e.guests||[])}}catch(t){console.error("Error loading in-house guests for broadcast:",t)}await D()}}window.renderInHouseGuestsTable=t=>{const e=document.getElementById("inHouseGuestsTableBody");if(e){if(!t||t.length===0){e.innerHTML='<tr><td colspan="5" style="text-align: center; color: #a1a1aa; padding: 1rem;">Нет текущих проживающих гостей</td></tr>';return}e.innerHTML=t.map(n=>{const a=String(n.house_number||"");return`
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 0.75rem 0.5rem;">
          <strong style="color: white; font-size: 0.875rem;">${n.guest_name||"Гость"}</strong><br>
          <span style="font-size: 11px; color: #94a3b8;">ID: ${n.id}</span>
        </td>
        <td style="padding: 0.75rem 0.5rem;">
          <span style="color: #34d399; font-weight: 700; font-size: 0.8125rem;">📞 ${n.phone||"Нет телефона"}</span>
        </td>
        <td style="padding: 0.75rem 0.5rem; color: #e4e4e7; font-size: 0.8125rem;">
          ${n.cabin_name||"Домик"}
        </td>
        <td style="padding: 0.75rem 0.5rem; font-size: 11px; color: #a1a1aa;">
          ${n.arrival_date?n.arrival_date.slice(0,10):""} – ${n.departure_date?n.departure_date.slice(0,10):""}
        </td>
        <td style="padding: 0.75rem 0.5rem;">
          <select style="margin-bottom: 0; padding: 0.4rem 0.6rem; font-size: 0.8125rem; font-weight: 700; color: #facc15; background: #0f172a; border: 1px solid rgba(250,204,21,0.5); border-radius: 0.5rem; cursor: pointer;" onchange="window.autoSaveHouseNumber('${n.id}', this.value)">
            <option value="">-- Без номера --</option>
            <optgroup label="Дом в лесу 7-местный (101-103)">
              <option value="101" ${a==="101"?"selected":""}>№ 101 (7-местный)</option>
              <option value="102" ${a==="102"?"selected":""}>№ 102 (7-местный)</option>
              <option value="103" ${a==="103"?"selected":""}>№ 103 (7-местный)</option>
            </optgroup>
            <optgroup label="Мини 2-местный (104-109)">
              <option value="104" ${a==="104"?"selected":""}>№ 104 (Мини 2-местный)</option>
              <option value="105" ${a==="105"?"selected":""}>№ 105 (Мини 2-местный)</option>
              <option value="106" ${a==="106"?"selected":""}>№ 106 (Мини 2-местный)</option>
              <option value="107" ${a==="107"?"selected":""}>№ 107 (Мини 2-местный)</option>
              <option value="108" ${a==="108"?"selected":""}>№ 108 (Мини 2-местный)</option>
              <option value="109" ${a==="109"?"selected":""}>№ 109 (Мини 2-местный)</option>
            </optgroup>
            <optgroup label="Мини 4-местный (110-111)">
              <option value="110" ${a==="110"?"selected":""}>№ 110 (Мини 4-местный)</option>
              <option value="111" ${a==="111"?"selected":""}>№ 111 (Мини 4-местный)</option>
            </optgroup>
            <optgroup label="Барнхаус 4-местный (112-119)">
              <option value="112" ${a==="112"?"selected":""}>№ 112 (Барнхаус 4-местный)</option>
              <option value="113" ${a==="113"?"selected":""}>№ 113 (Барнхаус 4-местный)</option>
              <option value="114" ${a==="114"?"selected":""}>№ 114 (Барнхаус 4-местный)</option>
              <option value="115" ${a==="115"?"selected":""}>№ 115 (Барнхаус 4-местный)</option>
              <option value="116" ${a==="116"?"selected":""}>№ 116 (Барнхаус 4-местный)</option>
              <option value="117" ${a==="117"?"selected":""}>№ 117 (Барнхаус 4-местный)</option>
              <option value="118" ${a==="118"?"selected":""}>№ 118 (Барнхаус 4-местный)</option>
              <option value="119" ${a==="119"?"selected":""}>№ 119 (Барнхаус 4-местный)</option>
            </optgroup>
            <optgroup label="Барнхаус 2-местный (120-121)">
              <option value="120" ${a==="120"?"selected":""}>№ 120 (Барнхаус 2-местный)</option>
              <option value="121" ${a==="121"?"selected":""}>№ 121 (Барнхаус 2-местный)</option>
            </optgroup>
          </select>
        </td>
      </tr>
    `}).join("")}};window.autoSaveHouseNumber=async(t,e)=>{try{const a=await(await y(`${r}/admin/assign-house`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId:t,houseNumber:e})})).json();a.success?console.log(`[House Assigned] ${t} -> ${e}`):alert("Ошибка привязки домика: "+(a.error||""))}catch{alert("Ошибка сети при сохранении номера домика")}};async function D(){if(m)try{const e=await(await y(`${r}/admin/sms-templates`)).json();if(e.success&&e.templates){window._smsTemplates=e.templates;const n=document.getElementById("templateSelect");n&&(n.innerHTML='<option value="">-- Выберите шаблон для вставки --</option>'+e.templates.map(a=>`<option value="${a.id}">${a.title}</option>`).join(""))}}catch(t){console.error("Error loading SMS templates:",t)}}const w=document.getElementById("templateSelect"),h=document.getElementById("deleteTemplateBtn"),Q=document.getElementById("saveTemplateBtn"),c=document.getElementById("broadcastTextarea"),I=document.getElementById("broadcastPreviewText"),q=document.getElementById("insertNameTagBtn"),W=document.getElementById("sendBroadcastBtn");w&&w.addEventListener("change",()=>{const t=w.value,e=(window._smsTemplates||[]).find(n=>String(n.id)===String(t));e?(c&&(c.value=e.template,c.dispatchEvent(new Event("input"))),h&&(h.style.display="inline-block")):h&&(h.style.display="none")});Q&&Q.addEventListener("click",async()=>{const t=c?c.value.trim():"";if(!t)return alert("Введите текст сообщения в поле слева перед сохранением шаблона!");const e=prompt('Введите название шаблона (например: "Акция на Бани -20%"):');if(!(!e||!e.trim()))try{(await(await y(`${r}/admin/sms-templates`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:e.trim(),template:t})})).json()).success?(alert("✅ Шаблон рассылки успешно сохранен!"),await D()):alert("Ошибка сохранения шаблона")}catch{alert("Ошибка сети при сохранении шаблона")}});h&&h.addEventListener("click",async()=>{const t=w?w.value:null;if(t&&confirm("Вы действительно хотите удалить этот шаблон рассылки?"))try{(await(await y(`${r}/admin/sms-templates/${t}`,{method:"DELETE"})).json()).success&&(alert("✅ Шаблон удален"),c&&(c.value=""),I&&(I.innerText="[Введите текст слева]"),h.style.display="none",await D())}catch{alert("Ошибка удаления шаблона")}});c&&I&&c.addEventListener("input",()=>{const t=window._inHouseGuests&&window._inHouseGuests[0]?window._inHouseGuests[0].guest_name.split(" ")[0]:"Константин",e=c.value||"[Введите текст слева]";I.innerText=e.replace(/\{имя\}/g,t).replace(/\{name\}/g,t)});q&&c&&q.addEventListener("click",()=>{c.value+=" {имя}",c.dispatchEvent(new Event("input")),c.focus()});W&&W.addEventListener("click",async()=>{const t=c?c.value.trim():"";if(!t)return alert("Введите текст сообщения!");const e=(window._inHouseGuests||[]).length;if(confirm(`Вы действительно хотите отправить это СМС сообщение ${e} проживающим гостям прямо сейчас?`))try{const a=await(await y(`${r}/admin/broadcast-sms`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({template:t})})).json();a.success?(alert(`✅ СМС-рассылка успешно выполнена! Отправлено ${a.sentCount} гостям.`),c.value="",I&&(I.innerText="[Сообщение отправлено!]")):alert("Ошибка отправки: "+a.error)}catch{alert("Ошибка сети при отправке рассылки")}});
//# sourceMappingURL=admin-Bt9af-Ld.js.map
