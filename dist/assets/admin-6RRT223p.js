import"./style-CTAUnyPs.js";const r="/api",_=document.getElementById("loginScreen"),A=document.getElementById("dashboardScreen"),N=document.getElementById("catalogTableBody"),L=document.getElementById("itemModal");document.getElementById("itemForm");const V=document.getElementById("modalTitle"),$=document.getElementById("currentImagePreview");let l=localStorage.getItem("adminToken"),z=[];async function g(n,e={}){e.headers=e.headers||{},l&&(e.headers.Authorization=`Bearer ${l}`);const t=await fetch(n,e);if(t.status===401||t.status===403){console.warn("[Admin API] 401/403 response. Session expired."),l=null,localStorage.removeItem("adminToken"),_&&(_.style.display="flex"),A&&(A.style.display="none");const o=document.getElementById("loginError");throw o&&(o.innerText="Сессия истекла или неверный токен. Войдите снова."),new Error("Unauthorized/Forbidden")}return t}l&&K();document.getElementById("loginBtn").addEventListener("click",async()=>{const n=document.getElementById("username").value,e=document.getElementById("password").value;try{const o=await(await fetch(`${r}/admin/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:n,password:e})})).json();o.success?(l=o.token,localStorage.setItem("adminToken",l),K()):document.getElementById("loginError").innerText=o.error||"Ошибка входа"}catch{document.getElementById("loginError").innerText="Ошибка сети"}});document.getElementById("logoutBtn").addEventListener("click",()=>{l=null,localStorage.removeItem("adminToken"),_.style.display="flex",A.style.display="none"});async function K(){_.style.display="none",A.style.display="block",await O(),await H(),await b(),await P()}const T=document.getElementById("tabCatalogBtn"),k=document.getElementById("tabBookingsBtn"),x=document.getElementById("tabWarehouseBtn"),S=document.getElementById("tabBroadcastBtn"),X=document.getElementById("viewCatalog"),Y=document.getElementById("viewBookings"),Z=document.getElementById("viewWarehouse"),ee=document.getElementById("viewBroadcast");function j(n,e){[T,k,x,S].forEach(t=>{t&&(t.className="btn",t.style.background="rgba(255,255,255,0.1)",t.style.color="white")}),[X,Y,Z,ee].forEach(t=>{t&&(t.style.display="none")}),n&&(n.className="btn btn-primary"),e&&(e.style.display="block")}T&&T.addEventListener("click",()=>j(T,X));k&&k.addEventListener("click",async()=>{j(k,Y),await H(),await P()});x&&x.addEventListener("click",async()=>{j(x,Z),await b()});S&&S.addEventListener("click",async()=>{j(S,ee),await P()});const w=document.getElementById("forceSyncBtn");w&&w.addEventListener("click",async()=>{w.innerText="⏳ Синхронизация...",w.disabled=!0;try{const e=await(await fetch(`${r}/admin/sync`,{method:"POST",headers:{Authorization:`Bearer ${l}`}})).json();e.success?(alert("Синхронизация с TravelLine выполнена успешно!"),await H()):alert("Ошибка синхронизации: "+(e.error||"Неизвестная ошибка"))}catch{alert("Ошибка сети при синхронизации")}finally{w.innerText="🔄 Синхронизировать (TL)",w.disabled=!1}});async function H(){try{const e=await(await fetch(`${r}/admin/dashboard`)).json();if(e.success){const{tomorrowArrivals:t,currentStays:o,todayDepartures:d,upcomingBookings:s}=e.data,i=[...o||[],...t||[],...d||[]],m=new Map;i.forEach(p=>m.set(p.id,p));const f=Array.from(m.values());U("activeBookingsTableBody","activeGuestsCountBadge",f,"🔥 0 активных гостей"),U("futureBookingsTableBody","futureBookingsBadge",s||[],"(0 броней)")}}catch(n){console.error("Failed to load bookings dashboard",n)}}function te(n){if(!n||n==="Гость")return"Гость";const t=n.replace(/\*/g,"").trim().split(/\s+/);if(t.length===1)return t[0];const o=t[0],d=t[1],s=/(?:ов|ова|ев|ева|ин|ина|ский|ская|ый|ая)$/i.test(d),i=/(?:ов|ова|ев|ева|ин|ина|ский|ская|ый|ая)$/i.test(o);return s&&!i?`${d} ${o[0].toUpperCase()}.`:`${o} ${d[0].toUpperCase()}.`}function ne(n,e){const t=(n||"").toLowerCase();let o=[];t.includes("рыбак")?o=["100"]:t.includes("7")||t.includes("лесу")?o=["101","102","103"]:t.includes("мини")&&(t.includes("2")||t.includes("двух"))?o=["104","105","106","107","108","109"]:t.includes("мини")&&(t.includes("4")||t.includes("четыр"))?o=["110","111"]:(t.includes("барн")||t.includes("barn"))&&(t.includes("4")||t.includes("четыр"))?o=["112","113","114","115","116","117","118","119"]:(t.includes("барн")||t.includes("barn"))&&(t.includes("2")||t.includes("двух"))?o=["120","121"]:o=["100","101","102","103","104","105","106","107","108","109","110","111","112","113","114","115","116","117","118","119","120","121"];let d=String(e||"");t.includes("рыбак")&&!d&&(d="100"),d&&!o.includes(d)&&o.unshift(d);let s='<option value="">-- № --</option>';return o.forEach(i=>{s+=`<option value="${i}" ${d===i?"selected":""}>№ ${i}</option>`}),s}window.autoSavePhone=async(n,e)=>{try{const o=await(await g(`${r}/admin/update-phone`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId:n,phone:e})})).json();o.success?console.log(`[Phone Updated] ${n} -> ${e}`):alert("Ошибка обновления телефона: "+(o.error||""))}catch{alert("Ошибка сети при сохранении телефона")}};function U(n,e,t,o){const d=document.getElementById(n),s=document.getElementById(e);if(d){if(s&&(s.innerText=t.length>0?e==="futureBookingsBadge"?`(${t.length} броней)`:`🔥 ${t.length} активных гостей`:o),!t||t.length===0){d.innerHTML='<tr><td colspan="8" style="text-align: center; color: #a1a1aa; padding: 1.5rem;">Бронирований не найдено</td></tr>';return}d.innerHTML=t.map(i=>{const m=String(i.house_number||""),f=te(i.guest_name),p=i.arrival_date?i.arrival_date.slice(5,10).replace("-","."):"",y=i.departure_date?i.departure_date.slice(5,10).replace("-","."):"",u=`${p} – ${y}`,h=ne(i.cabin_name,m),v=i.sms_stages||i.sms&&Object.keys(i.sms).length>0?'<span style="background: rgba(52, 211, 153, 0.15); color: #34d399; padding: 0.2rem 0.45rem; border-radius: 0.375rem; font-size: 11px; font-weight: 700; border: 1px solid rgba(52, 211, 153, 0.3);">✅ Ушла</span>':'<span style="background: rgba(148, 163, 184, 0.12); color: #94a3b8; padding: 0.2rem 0.45rem; border-radius: 0.375rem; font-size: 11px; font-weight: 600;">⏳ Ожидает</span>';return`
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 0.6rem 0.5rem;">
          <button class="btn" style="background: rgba(255,255,255,0.08); color: #60a5fa; border: 1px solid rgba(96,165,250,0.3); padding: 0.25rem 0.5rem; font-size: 11px; font-weight: 600;" onclick="navigator.clipboard.writeText('${i.id}'); this.innerText='✓ Скопировано'; setTimeout(() => this.innerText='📋 ID', 1500);" title="Скопировать номер брони (${i.id})">📋 ID</button>
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          <strong style="color: white; font-size: 0.875rem;">${f}</strong>
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          <input type="text" value="${i.phone||""}" placeholder="📱 +7..." style="width: 110px; margin-bottom: 0; padding: 0.25rem 0.4rem; font-size: 11px; font-weight: 600; color: #34d399; background: rgba(0,0,0,0.4); border: 1px solid rgba(52,211,153,0.3); border-radius: 0.375rem;" onchange="window.autoSavePhone('${i.id}', this.value)" title="Нажмите, чтобы ввести или отредактировать телефон для СМС" />
        </td>
        <td style="padding: 0.6rem 0.5rem; color: #e4e4e7; font-size: 0.8125rem;">
          ${i.cabin_name||"Домик"}
        </td>
        <td style="padding: 0.6rem 0.5rem; font-size: 11px; color: #a1a1aa; font-weight: 600;">
          ${u}
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          <select style="margin-bottom: 0; padding: 0.3rem 0.4rem; font-size: 12px; font-weight: 700; color: #facc15; background: #0f172a; border: 1px solid rgba(250,204,21,0.5); border-radius: 0.375rem; cursor: pointer;" onchange="window.autoSaveHouseNumber('${i.id}', this.value)">
            ${h}
          </select>
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          <a href="/?booking=${i.id}" target="_blank" class="btn" style="background: rgba(0, 150, 217, 0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); padding: 0.25rem 0.5rem; font-size: 11px; font-weight: 600; text-decoration: none;">📱 ПВА</a>
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          ${v}
        </td>
      </tr>
    `}).join("")}}async function O(){try{const e=await(await fetch(`${r}/catalog`)).json();e.success&&(z=e.data,oe())}catch(n){console.error("Failed to load catalog",n)}}function oe(){N.innerHTML="",z.forEach(n=>{const e=document.createElement("tr");let t=`<span style="font-size: 24px;">${n.icon||"📦"}</span>`;n.image&&(t=`<img src="${n.image}" class="item-image" alt="icon"/>`),e.innerHTML=`
      <td style="color: #9ca3af; font-weight: 600;">${n.id}</td>
      <td>${t}</td>
      <td style="font-weight: 700;">${n.displayName}</td>
      <td>${n.category==="service"?"Услуга":"Баня"}</td>
      <td style="color: var(--accent-gold); font-weight: 700;">${n.price} ₽</td>
      <td>${n.isQuickOrder?"✅ Да":"❌ Нет"}</td>
      <td>
        <button class="btn btn-edit" onclick="editItem('${n.id}')">Изменить</button>
        <button class="btn btn-danger" onclick="deleteItem('${n.id}')">Удалить</button>
      </td>
    `,N.appendChild(e)})}document.getElementById("openAddModalBtn").addEventListener("click",()=>{V.innerText="Добавить услугу",document.getElementById("originalId").value="",document.getElementById("itemId").value="",document.getElementById("itemId").disabled=!1,document.getElementById("itemName").value="",document.getElementById("itemDesc").value="",document.getElementById("itemPrice").value="",document.getElementById("itemCategory").value="service",document.getElementById("itemIcon").value="",document.getElementById("existingImage").value="",document.getElementById("itemImage").value="",document.getElementById("itemQuickOrder").checked=!1,$.style.display="none",L.classList.add("active")});document.getElementById("closeModalBtn").addEventListener("click",()=>{L.classList.remove("active")});window.editItem=n=>{const e=z.find(t=>t.id===n);e&&(V.innerText="Изменить услугу",document.getElementById("originalId").value=e.id,document.getElementById("itemId").value=e.id,document.getElementById("itemId").disabled=!0,document.getElementById("itemName").value=e.displayName,document.getElementById("itemDesc").value=e.desc||"",document.getElementById("itemPrice").value=e.price,document.getElementById("itemCategory").value=e.category||"service",document.getElementById("itemIcon").value=e.icon||"",document.getElementById("existingImage").value=e.image||"",document.getElementById("itemImage").value="",document.getElementById("itemQuickOrder").checked=!!e.isQuickOrder,e.image?($.src=e.image,$.style.display="block"):$.style.display="none",L.classList.add("active"))};window.deleteItem=async n=>{if(confirm(`Точно удалить услугу ${n}?`))try{(await fetch(`${r}/catalog/${n}`,{method:"DELETE",headers:{Authorization:`Bearer ${l}`}})).ok&&await O()}catch{alert("Ошибка удаления")}};document.getElementById("itemForm").addEventListener("submit",async n=>{n.preventDefault();const e=document.getElementById("originalId").value,t=!!e,o=document.getElementById("itemId").value,d=document.getElementById("itemName").value,s=document.getElementById("itemDesc").value,i=parseInt(document.getElementById("itemPrice").value,10),m=document.getElementById("itemCategory").value,f=document.getElementById("itemIcon").value,p=document.getElementById("itemQuickOrder").checked,y=document.getElementById("itemImage");let u=document.getElementById("existingImage").value;if(y.files.length>0){const a=new FormData;a.append("image",y.files[0]);try{const M=await(await fetch(`${r}/upload`,{method:"POST",headers:{Authorization:`Bearer ${l}`},body:a})).json();M.success&&(u=M.imageUrl)}catch{alert("Ошибка загрузки картинки");return}}const h={id:o,displayName:d,desc:s,price:i,category:m,icon:f,image:u,isQuickOrder:p};try{const a=t?`${r}/catalog/${e}`:`${r}/catalog`,D=await(await fetch(a,{method:t?"PUT":"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${l}`},body:JSON.stringify(h)})).json();D.success?(L.classList.remove("active"),await O()):alert("Ошибка сохранения: "+D.error)}catch{alert("Ошибка сети")}});async function b(){if(l)try{const e=await(await g(`${r}/admin/warehouse`)).json();if(!e.success)return;const{totalValuation:t,lowStockCount:o,gifts:d,products:s,logs:i}=e.data,m=document.getElementById("kpiTotalValuation"),f=document.getElementById("kpiLowStockCount"),p=document.getElementById("kpiTotalGifts");m&&(m.innerText=`${(t||0).toLocaleString("ru-RU")} ₽`),f&&(f.innerText=`${o||0} позиций`),p&&(p.innerText=`${(d||[]).length} видов`);const y=document.getElementById("giftsTableBody");y&&(y.innerHTML=(d||[]).map(a=>{const v=a.stock<=a.min_threshold;return`
          <tr>
            <td><img src="${a.image_url}" style="width: 40px; height: 40px; object-fit: contain; background: white; border-radius: 6px; padding: 2px;" /></td>
            <td><strong>${a.title}</strong><br><span style="font-size: 11px; color: #a1a1aa;">${a.subtitle||""}</span></td>
            <td><span style="background: rgba(0,150,217,0.2); color: #0096d9; padding: 2px 8px; border-radius: 999px; font-weight: 700; font-size: 11px;">${a.badge||"Подарок"}</span></td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('gift', '${a.id}', ${a.stock-1}, ${a.min_threshold}, ${a.unit_cost})">-</button>
                <strong style="color: ${v?"#f87171":"#34d399"};">${a.stock} шт.</strong>
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
        `}).join(""));const u=document.getElementById("productsTableBody");u&&(u.innerHTML=(s||[]).map(a=>{const v=a.stock<=a.min_threshold;return`
          <tr>
            <td><strong>${a.name}</strong></td>
            <td>${a.category||"Услуги"}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('product', '${a.id}', ${a.stock-1}, ${a.min_threshold}, ${a.unit_cost})">-</button>
                <strong style="color: ${v?"#f87171":"#34d399"};">${a.stock} шт.</strong>
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('product', '${a.id}', ${a.stock+1}, ${a.min_threshold}, ${a.unit_cost})">+</button>
              </div>
            </td>
            <td>${a.min_threshold} шт.</td>
            <td>${(a.unit_cost||0).toLocaleString("ru-RU")} ₽</td>
            <td>${(a.price||0).toLocaleString("ru-RU")} ₽</td>
            <td><button class="btn btn-primary" style="padding: 4px 10px; font-size: 11px;" onclick="window.promptStockUpdate('product', '${a.id}', ${a.stock}, ${a.min_threshold}, ${a.unit_cost})">Корректировка</button></td>
          </tr>
        `}).join(""));const h=document.getElementById("stockLogsTableBody");h&&(h.innerHTML=(i||[]).map(a=>`
        <tr>
          <td style="font-size: 11px; color: #a1a1aa;">${a.created_at||""}</td>
          <td><span style="font-weight: 700; font-size: 11px; color: ${a.item_type==="gift"?"var(--accent-gold)":"#60a5fa"};">${a.item_type==="gift"?"Подарок":"Товар"}</span></td>
          <td><strong>${a.item_name||""}</strong></td>
          <td><span style="font-weight: 800; color: ${a.change_qty>=0?"#34d399":"#f87171"};">${a.change_qty>0?"+":""}${a.change_qty}</span></td>
          <td style="font-size: 11px; color: #e4e4e7;">${a.reason||""}</td>
        </tr>
      `).join("")),window._cachedGifts=d||[]}catch(n){console.error("Error loading warehouse dashboard:",n)}}window.updateStock=async(n,e,t,o,d,s="Быстрая корректировка остатка")=>{if(!(t<0))try{(await(await g(`${r}/admin/warehouse/update`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({itemType:n,id:e,stock:t,min_threshold:o,unit_cost:d,reason:s})})).json()).success&&await b()}catch{alert("Ошибка обновления остатка")}};window.promptStockUpdate=async(n,e,t,o,d)=>{const s=prompt("Введите новый остаток на складе (шт.):",t);if(s===null)return;const i=parseInt(s,10);if(isNaN(i)||i<0)return alert("Введите корректное число!");await window.updateStock(n,e,i,o,d,"Инвентаризация склада")};const C=document.getElementById("giftModalAdmin"),F=document.getElementById("giftFormAdmin"),J=document.getElementById("openAddGiftModalBtn"),R=document.getElementById("closeGiftModalAdminBtn");J&&J.addEventListener("click",()=>{document.getElementById("giftIdAdmin").value="",document.getElementById("giftTitleAdmin").value="",document.getElementById("giftSubtitleAdmin").value="",document.getElementById("giftBadgeAdmin").value="★ Символ Парка",document.getElementById("giftImageUrlAdmin").value="./assets/images/gifts/gift_toy.png?v=2",document.getElementById("giftStockAdmin").value="50",document.getElementById("giftMinThresholdAdmin").value="10",document.getElementById("giftUnitCostAdmin").value="350",document.getElementById("giftIsActiveAdmin").checked=!0,document.getElementById("giftModalAdminTitle").innerText="Добавить Новый Подарок",C.classList.add("active")});R&&R.addEventListener("click",()=>{C.classList.remove("active")});window.editGift=n=>{const e=(window._cachedGifts||[]).find(t=>t.id===n);e&&(document.getElementById("giftIdAdmin").value=e.id,document.getElementById("giftTitleAdmin").value=e.title||"",document.getElementById("giftSubtitleAdmin").value=e.subtitle||"",document.getElementById("giftBadgeAdmin").value=e.badge||"",document.getElementById("giftImageUrlAdmin").value=e.image_url||"",document.getElementById("giftStockAdmin").value=e.stock||50,document.getElementById("giftMinThresholdAdmin").value=e.min_threshold||10,document.getElementById("giftUnitCostAdmin").value=e.unit_cost||350,document.getElementById("giftIsActiveAdmin").checked=e.is_active!==0,document.getElementById("giftModalAdminTitle").innerText="Редактировать Подарок",C.classList.add("active"))};window.deleteGift=async n=>{if(confirm("Вы уверены, что хотите удалить этот подарок?"))try{(await g(`${r}/admin/gifts/${n}`,{method:"DELETE"})).ok&&await b()}catch{alert("Ошибка удаления подарка")}};F&&F.addEventListener("submit",async n=>{n.preventDefault();const e=document.getElementById("giftIdAdmin").value,t=document.getElementById("giftTitleAdmin").value,o=document.getElementById("giftSubtitleAdmin").value,d=document.getElementById("giftBadgeAdmin").value;let s=document.getElementById("giftImageUrlAdmin").value;const i=parseInt(document.getElementById("giftStockAdmin").value,10),m=parseInt(document.getElementById("giftMinThresholdAdmin").value,10),f=parseInt(document.getElementById("giftUnitCostAdmin").value,10),p=document.getElementById("giftIsActiveAdmin").checked?1:0,y=document.getElementById("giftImageFileAdmin");if(y&&y.files.length>0){const u=new FormData;u.append("image",y.files[0]);try{const a=await(await g(`${r}/upload`,{method:"POST",body:u})).json();a.success&&(s=a.imageUrl)}catch{alert("Ошибка загрузки фото подарка");return}}try{(await(await g(`${r}/admin/gifts`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:e,title:t,subtitle:o,badge:d,image_url:s,stock:i,min_threshold:m,unit_cost:f,is_active:p})})).json()).success?(C.classList.remove("active"),await b()):alert("Ошибка сохранения подарка")}catch{alert("Ошибка сети")}});async function P(){if(l){try{const e=await(await g(`${r}/admin/in-house-guests`)).json();if(e.success){const t=document.getElementById("inHouseGuestsCountBadge");t&&(t.innerText=`👥 ${e.guests.length} гостей сейчас в парке`),window._inHouseGuests=e.guests||[],renderInHouseGuestsTable(e.guests||[])}}catch(n){console.error("Error loading in-house guests for broadcast:",n)}await G()}}window.renderInHouseGuestsTable=n=>{const e=document.getElementById("inHouseGuestsTableBody");if(e){if(!n||n.length===0){e.innerHTML='<tr><td colspan="5" style="text-align: center; color: #a1a1aa; padding: 1rem;">Нет текущих проживающих гостей</td></tr>';return}e.innerHTML=n.map(t=>{const o=String(t.house_number||"");return`
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 0.75rem 0.5rem;">
          <strong style="color: white; font-size: 0.875rem;">${t.guest_name||"Гость"}</strong><br>
          <span style="font-size: 11px; color: #94a3b8;">ID: ${t.id}</span>
        </td>
        <td style="padding: 0.75rem 0.5rem;">
          <span style="color: #34d399; font-weight: 700; font-size: 0.8125rem;">📞 ${t.phone||"Нет телефона"}</span>
        </td>
        <td style="padding: 0.75rem 0.5rem; color: #e4e4e7; font-size: 0.8125rem;">
          ${t.cabin_name||"Домик"}
        </td>
        <td style="padding: 0.75rem 0.5rem; font-size: 11px; color: #a1a1aa;">
          ${t.arrival_date?t.arrival_date.slice(0,10):""} – ${t.departure_date?t.departure_date.slice(0,10):""}
        </td>
        <td style="padding: 0.75rem 0.5rem;">
          <select style="margin-bottom: 0; padding: 0.4rem 0.6rem; font-size: 0.8125rem; font-weight: 700; color: #facc15; background: #0f172a; border: 1px solid rgba(250,204,21,0.5); border-radius: 0.5rem; cursor: pointer;" onchange="window.autoSaveHouseNumber('${t.id}', this.value)">
            <option value="">-- Без номера --</option>
            <optgroup label="Дом в лесу 7-местный (101-103)">
              <option value="101" ${o==="101"?"selected":""}>№ 101 (7-местный)</option>
              <option value="102" ${o==="102"?"selected":""}>№ 102 (7-местный)</option>
              <option value="103" ${o==="103"?"selected":""}>№ 103 (7-местный)</option>
            </optgroup>
            <optgroup label="Мини 2-местный (104-109)">
              <option value="104" ${o==="104"?"selected":""}>№ 104 (Мини 2-местный)</option>
              <option value="105" ${o==="105"?"selected":""}>№ 105 (Мини 2-местный)</option>
              <option value="106" ${o==="106"?"selected":""}>№ 106 (Мини 2-местный)</option>
              <option value="107" ${o==="107"?"selected":""}>№ 107 (Мини 2-местный)</option>
              <option value="108" ${o==="108"?"selected":""}>№ 108 (Мини 2-местный)</option>
              <option value="109" ${o==="109"?"selected":""}>№ 109 (Мини 2-местный)</option>
            </optgroup>
            <optgroup label="Мини 4-местный (110-111)">
              <option value="110" ${o==="110"?"selected":""}>№ 110 (Мини 4-местный)</option>
              <option value="111" ${o==="111"?"selected":""}>№ 111 (Мини 4-местный)</option>
            </optgroup>
            <optgroup label="Барнхаус 4-местный (112-119)">
              <option value="112" ${o==="112"?"selected":""}>№ 112 (Барнхаус 4-местный)</option>
              <option value="113" ${o==="113"?"selected":""}>№ 113 (Барнхаус 4-местный)</option>
              <option value="114" ${o==="114"?"selected":""}>№ 114 (Барнхаус 4-местный)</option>
              <option value="115" ${o==="115"?"selected":""}>№ 115 (Барнхаус 4-местный)</option>
              <option value="116" ${o==="116"?"selected":""}>№ 116 (Барнхаус 4-местный)</option>
              <option value="117" ${o==="117"?"selected":""}>№ 117 (Барнхаус 4-местный)</option>
              <option value="118" ${o==="118"?"selected":""}>№ 118 (Барнхаус 4-местный)</option>
              <option value="119" ${o==="119"?"selected":""}>№ 119 (Барнхаус 4-местный)</option>
            </optgroup>
            <optgroup label="Барнхаус 2-местный (120-121)">
              <option value="120" ${o==="120"?"selected":""}>№ 120 (Барнхаус 2-местный)</option>
              <option value="121" ${o==="121"?"selected":""}>№ 121 (Барнхаус 2-местный)</option>
            </optgroup>
          </select>
        </td>
      </tr>
    `}).join("")}};window.autoSaveHouseNumber=async(n,e)=>{try{const o=await(await g(`${r}/admin/assign-house`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId:n,houseNumber:e})})).json();o.success?console.log(`[House Assigned] ${n} -> ${e}`):alert("Ошибка привязки домика: "+(o.error||""))}catch{alert("Ошибка сети при сохранении номера домика")}};async function G(){if(l)try{const e=await(await g(`${r}/admin/sms-templates`)).json();if(e.success&&e.templates){window._smsTemplates=e.templates;const t=document.getElementById("templateSelect");t&&(t.innerHTML='<option value="">-- Выберите шаблон для вставки --</option>'+e.templates.map(o=>`<option value="${o.id}">${o.title}</option>`).join(""))}}catch(n){console.error("Error loading SMS templates:",n)}}const E=document.getElementById("templateSelect"),B=document.getElementById("deleteTemplateBtn"),Q=document.getElementById("saveTemplateBtn"),c=document.getElementById("broadcastTextarea"),I=document.getElementById("broadcastPreviewText"),q=document.getElementById("insertNameTagBtn"),W=document.getElementById("sendBroadcastBtn");E&&E.addEventListener("change",()=>{const n=E.value,e=(window._smsTemplates||[]).find(t=>String(t.id)===String(n));e?(c&&(c.value=e.template,c.dispatchEvent(new Event("input"))),B&&(B.style.display="inline-block")):B&&(B.style.display="none")});Q&&Q.addEventListener("click",async()=>{const n=c?c.value.trim():"";if(!n)return alert("Введите текст сообщения в поле слева перед сохранением шаблона!");const e=prompt('Введите название шаблона (например: "Акция на Бани -20%"):');if(!(!e||!e.trim()))try{(await(await g(`${r}/admin/sms-templates`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:e.trim(),template:n})})).json()).success?(alert("✅ Шаблон рассылки успешно сохранен!"),await G()):alert("Ошибка сохранения шаблона")}catch{alert("Ошибка сети при сохранении шаблона")}});B&&B.addEventListener("click",async()=>{const n=E?E.value:null;if(n&&confirm("Вы действительно хотите удалить этот шаблон рассылки?"))try{(await(await g(`${r}/admin/sms-templates/${n}`,{method:"DELETE"})).json()).success&&(alert("✅ Шаблон удален"),c&&(c.value=""),I&&(I.innerText="[Введите текст слева]"),B.style.display="none",await G())}catch{alert("Ошибка удаления шаблона")}});c&&I&&c.addEventListener("input",()=>{const n=window._inHouseGuests&&window._inHouseGuests[0]?window._inHouseGuests[0].guest_name.split(" ")[0]:"Константин",e=c.value||"[Введите текст слева]";I.innerText=e.replace(/\{имя\}/g,n).replace(/\{name\}/g,n)});q&&c&&q.addEventListener("click",()=>{c.value+=" {имя}",c.dispatchEvent(new Event("input")),c.focus()});W&&W.addEventListener("click",async()=>{const n=c?c.value.trim():"";if(!n)return alert("Введите текст сообщения!");const e=(window._inHouseGuests||[]).length;if(confirm(`Вы действительно хотите отправить это СМС сообщение ${e} проживающим гостям прямо сейчас?`))try{const o=await(await g(`${r}/admin/broadcast-sms`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({template:n})})).json();o.success?(alert(`✅ СМС-рассылка успешно выполнена! Отправлено ${o.sentCount} гостям.`),c.value="",I&&(I.innerText="[Сообщение отправлено!]")):alert("Ошибка отправки: "+o.error)}catch{alert("Ошибка сети при отправке рассылки")}});
//# sourceMappingURL=admin-6RRT223p.js.map
