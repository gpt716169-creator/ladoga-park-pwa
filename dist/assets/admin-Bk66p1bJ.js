import"./style-CTAUnyPs.js";const r="/api",A=document.getElementById("loginScreen"),z=document.getElementById("dashboardScreen"),U=document.getElementById("catalogTableBody"),H=document.getElementById("itemModal");document.getElementById("itemForm");const K=document.getElementById("modalTitle"),T=document.getElementById("currentImagePreview");let u=localStorage.getItem("adminToken"),P=[];async function g(e,t={}){t.headers=t.headers||{},u&&(t.headers.Authorization=`Bearer ${u}`);const n=await fetch(e,t);if(n.status===401||n.status===403){console.warn("[Admin API] 401/403 response. Session expired."),u=null,localStorage.removeItem("adminToken"),A&&(A.style.display="flex"),z&&(z.style.display="none");const o=document.getElementById("loginError");throw o&&(o.innerText="Сессия истекла или неверный токен. Войдите снова."),new Error("Unauthorized/Forbidden")}return n}u&&X();document.getElementById("loginBtn").addEventListener("click",async()=>{const e=document.getElementById("username").value,t=document.getElementById("password").value;try{const o=await(await fetch(`${r}/admin/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:e,password:t})})).json();o.success?(u=o.token,localStorage.setItem("adminToken",u),X()):document.getElementById("loginError").innerText=o.error||"Ошибка входа"}catch{document.getElementById("loginError").innerText="Ошибка сети"}});document.getElementById("logoutBtn").addEventListener("click",()=>{u=null,localStorage.removeItem("adminToken"),A.style.display="flex",z.style.display="none"});async function X(){A.style.display="none",z.style.display="block",await D(),await G(),await E(),await $()}const x=document.getElementById("tabCatalogBtn"),S=document.getElementById("tabBookingsBtn"),_=document.getElementById("tabWarehouseBtn"),L=document.getElementById("tabBroadcastBtn"),Y=document.getElementById("viewCatalog"),Z=document.getElementById("viewBookings"),ee=document.getElementById("viewWarehouse"),te=document.getElementById("viewBroadcast");function C(e,t){[x,S,_,L].forEach(n=>{n&&(n.className="btn",n.style.background="rgba(255,255,255,0.1)",n.style.color="white")}),[Y,Z,ee,te].forEach(n=>{n&&(n.style.display="none")}),e&&(e.className="btn btn-primary"),t&&(t.style.display="block")}x&&x.addEventListener("click",()=>C(x,Y));S&&S.addEventListener("click",async()=>{C(S,Z),await G(),await $()});_&&_.addEventListener("click",async()=>{C(_,ee),await E()});L&&L.addEventListener("click",async()=>{C(L,te),await $()});const B=document.getElementById("forceSyncBtn");B&&B.addEventListener("click",async()=>{B.innerText="⏳ Синхронизация...",B.disabled=!0;try{const t=await(await fetch(`${r}/admin/sync`,{method:"POST",headers:{Authorization:`Bearer ${u}`}})).json();t.success?(alert("Синхронизация с TravelLine выполнена успешно!"),await G()):alert("Ошибка синхронизации: "+(t.error||"Неизвестная ошибка"))}catch{alert("Ошибка сети при синхронизации")}finally{B.innerText="🔄 Синхронизировать (TL)",B.disabled=!1}});async function G(){try{const t=await(await g(`${r}/admin/dashboard`)).json();if(t.success){const{tomorrowArrivals:n,currentStays:o,upcomingBookings:d}=t.data;window._currentStays=o||[],ae(n||[],o||[]),ie("futureBookingsTableBody","futureBookingsBadge",d||[],"(0 броней)"),$()}}catch(e){console.error("Failed to load bookings dashboard",e)}}function ne(e){if(!e||e==="Гость")return"Гость";const n=e.replace(/\*/g,"").trim().split(/\s+/);if(n.length===1)return n[0];const o=n[0],d=n[1];if(d.length<=2)return`${o} ${d.toUpperCase()}${d.endsWith(".")?"":"."}`;const s=/(?:ов|ова|ев|ева|ин|ина|ский|ская|ый|ая|их|ых)$/i.test(d),i=/(?:ов|ова|ев|ева|ин|ина|ский|ская|ый|ая|их|ых)$/i.test(o);return s&&!i?`${d} ${o[0].toUpperCase()}.`:`${o} ${d[0].toUpperCase()}.`}function oe(e,t){const n=(e||"").toLowerCase();let o=[];n.includes("рыбак")?o=["100"]:n.includes("7")||n.includes("лесу")?o=["101","102","103"]:n.includes("мини")&&(n.includes("2")||n.includes("двух"))?o=["104","105","106","107","108","109"]:n.includes("мини")&&(n.includes("4")||n.includes("четыр"))?o=["110","111"]:(n.includes("барн")||n.includes("barn"))&&(n.includes("4")||n.includes("четыр"))?o=["112","113","114","115","116","117","118","119"]:(n.includes("барн")||n.includes("barn"))&&(n.includes("2")||n.includes("двух"))?o=["120","121"]:o=["100","101","102","103","104","105","106","107","108","109","110","111","112","113","114","115","116","117","118","119","120","121"];let d=String(t||"");n.includes("рыбак")&&!d&&(d="100"),d&&!o.includes(d)&&o.unshift(d);let s='<option value="">-- № --</option>';return o.forEach(i=>{s+=`<option value="${i}" ${d===i?"selected":""}>№ ${i}</option>`}),s}window.autoSavePhone=async(e,t)=>{try{const o=await(await g(`${r}/admin/update-phone`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId:e,phone:t})})).json();o.success?(console.log(`[Phone Updated] ${e} -> ${t}`),$()):alert("Ошибка обновления телефона: "+(o.error||""))}catch{alert("Ошибка сети при сохранении телефона")}};function ae(e,t){const n=document.getElementById("activeBookingsTableBody"),o=document.getElementById("activeGuestsCountBadge");if(!n)return;const d=(e?e.length:0)+(t?t.length:0);if(o&&(o.innerText=`🔥 ${d} гостей (Завтра: ${e.length}, Живут: ${t.length})`),d===0){n.innerHTML='<tr><td colspan="8" style="text-align: center; color: #a1a1aa; padding: 1.5rem;">Активных проживаний и заездов на завтра не найдено</td></tr>';return}let s="";e&&e.length>0&&(s+=`
      <tr style="background: rgba(52, 211, 153, 0.15); border-left: 4px solid #34d399;">
        <td colspan="8" style="padding: 0.65rem 0.75rem; font-weight: 800; color: #34d399; font-size: 0.8125rem; letter-spacing: 0.05em;">
          ⚡ ЗАЕЗЖАЮТ ЗАВТРА (${e.length})
        </td>
      </tr>
    `,s+=e.map(i=>F(i,"🟢 Заезд завтра")).join("")),t&&t.length>0&&(s+=`
      <tr style="background: rgba(232, 165, 88, 0.15); border-left: 4px solid var(--accent-gold);">
        <td colspan="8" style="padding: 0.65rem 0.75rem; font-weight: 800; color: var(--accent-gold); font-size: 0.8125rem; letter-spacing: 0.05em;">
          🏡 УЖЕ ПРОЖИВАЮТ В ПАРКЕ СЕГОДНЯ (${t.length})
        </td>
      </tr>
    `,s+=t.map(i=>F(i,"🏠 Проживает")).join("")),n.innerHTML=s}function F(e,t){const n=String(e.house_number||""),o=ne(e.guest_name),d=e.arrival_date?e.arrival_date.slice(5,10).replace("-","."):"",s=e.departure_date?e.departure_date.slice(5,10).replace("-","."):"",i=`${d} – ${s}`,p=oe(e.cabin_name,n),y=e.sms_stages||e.sms&&Object.keys(e.sms).length>0?'<span style="background: rgba(52, 211, 153, 0.15); color: #34d399; padding: 0.2rem 0.45rem; border-radius: 0.375rem; font-size: 11px; font-weight: 700; border: 1px solid rgba(52, 211, 153, 0.3);">✅ Ушла</span>':'<span style="background: rgba(148, 163, 184, 0.12); color: #94a3b8; padding: 0.2rem 0.45rem; border-radius: 0.375rem; font-size: 11px; font-weight: 600;">⏳ Ожидает</span>',c=t&&t.includes("завтра"),m=t?`<span style="font-size: 10px; font-weight: 700; padding: 0.15rem 0.35rem; border-radius: 0.25rem; margin-left: 0.35rem; ${c?"background: rgba(52, 211, 153, 0.2); color: #34d399;":"background: rgba(232, 165, 88, 0.2); color: #facc15;"}">${t}</span>`:"";return`
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); ${c?"background: rgba(52, 211, 153, 0.03);":""}">
      <td style="padding: 0.6rem 0.5rem;">
        <button class="btn" style="background: rgba(255,255,255,0.08); color: #60a5fa; border: 1px solid rgba(96,165,250,0.3); padding: 0.25rem 0.5rem; font-size: 11px; font-weight: 600;" onclick="navigator.clipboard.writeText('${e.id}'); this.innerText='✓ Скопировано'; setTimeout(() => this.innerText='📋 ID', 1500);" title="Скопировать номер брони (${e.id})">📋 ID</button>
      </td>
      <td style="padding: 0.6rem 0.5rem;">
        <strong style="color: white; font-size: 0.875rem;">${o}</strong> ${m}
      </td>
      <td style="padding: 0.6rem 0.5rem;">
        <input type="text" value="${e.phone||""}" placeholder="📱 +7..." style="width: 110px; margin-bottom: 0; padding: 0.25rem 0.4rem; font-size: 11px; font-weight: 600; color: #34d399; background: rgba(0,0,0,0.4); border: 1px solid rgba(52,211,153,0.3); border-radius: 0.375rem;" onchange="window.autoSavePhone('${e.id}', this.value)" title="Нажмите, чтобы ввести или отредактировать телефон для СМС" />
      </td>
      <td style="padding: 0.6rem 0.5rem; color: #e4e4e7; font-size: 0.8125rem;">
        ${e.cabin_name||"Домик"}
      </td>
      <td style="padding: 0.6rem 0.5rem; font-size: 11px; color: #a1a1aa; font-weight: 600;">
        ${i}
      </td>
      <td style="padding: 0.6rem 0.5rem;">
        <select style="margin-bottom: 0; padding: 0.3rem 0.4rem; font-size: 12px; font-weight: 700; color: #facc15; background: #0f172a; border: 1px solid rgba(250,204,21,0.5); border-radius: 0.375rem; cursor: pointer;" onchange="window.autoSaveHouseNumber('${e.id}', this.value)">
          ${p}
        </select>
      </td>
      <td style="padding: 0.6rem 0.5rem;">
        <a href="/?booking=${e.id}" target="_blank" class="btn" style="background: rgba(0, 150, 217, 0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); padding: 0.25rem 0.5rem; font-size: 11px; font-weight: 600; text-decoration: none;">📱 ПВА</a>
      </td>
      <td style="padding: 0.6rem 0.5rem;">
        ${y}
      </td>
    </tr>
  `}function ie(e,t,n,o){const d=document.getElementById(e),s=document.getElementById(t);if(d){if(s&&(s.innerText=n.length>0?`(${n.length} броней)`:o),!n||n.length===0){d.innerHTML='<tr><td colspan="8" style="text-align: center; color: #a1a1aa; padding: 1.5rem;">Бронирований не найдено</td></tr>';return}d.innerHTML=n.map(i=>{const p=String(i.house_number||""),f=ne(i.guest_name),y=i.arrival_date?i.arrival_date.slice(5,10).replace("-","."):"",c=i.departure_date?i.departure_date.slice(5,10).replace("-","."):"",m=`${y} – ${c}`,h=oe(i.cabin_name,p),b=i.sms_stages||i.sms&&Object.keys(i.sms).length>0?'<span style="background: rgba(52, 211, 153, 0.15); color: #34d399; padding: 0.2rem 0.45rem; border-radius: 0.375rem; font-size: 11px; font-weight: 700; border: 1px solid rgba(52, 211, 153, 0.3);">✅ Ушла</span>':'<span style="background: rgba(148, 163, 184, 0.12); color: #94a3b8; padding: 0.2rem 0.45rem; border-radius: 0.375rem; font-size: 11px; font-weight: 600;">⏳ Ожидает</span>';return`
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
          ${m}
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
          ${b}
        </td>
      </tr>
    `}).join("")}}async function D(){try{const t=await(await fetch(`${r}/catalog`)).json();t.success&&(P=t.data,de())}catch(e){console.error("Failed to load catalog",e)}}function de(){U.innerHTML="",P.forEach(e=>{const t=document.createElement("tr");let n=`<span style="font-size: 24px;">${e.icon||"📦"}</span>`;e.image&&(n=`<img src="${e.image}" class="item-image" alt="icon"/>`),t.innerHTML=`
      <td style="color: #9ca3af; font-weight: 600;">${e.id}</td>
      <td>${n}</td>
      <td style="font-weight: 700;">${e.displayName}</td>
      <td>${e.category==="service"?"Услуга":"Баня"}</td>
      <td style="color: var(--accent-gold); font-weight: 700;">${e.price} ₽</td>
      <td>${e.isQuickOrder?"✅ Да":"❌ Нет"}</td>
      <td>
        <button class="btn btn-edit" onclick="editItem('${e.id}')">Изменить</button>
        <button class="btn btn-danger" onclick="deleteItem('${e.id}')">Удалить</button>
      </td>
    `,U.appendChild(t)})}document.getElementById("openAddModalBtn").addEventListener("click",()=>{K.innerText="Добавить услугу",document.getElementById("originalId").value="",document.getElementById("itemId").value="",document.getElementById("itemId").disabled=!1,document.getElementById("itemName").value="",document.getElementById("itemDesc").value="",document.getElementById("itemPrice").value="",document.getElementById("itemCategory").value="service",document.getElementById("itemIcon").value="",document.getElementById("existingImage").value="",document.getElementById("itemImage").value="",document.getElementById("itemQuickOrder").checked=!1,T.style.display="none",H.classList.add("active")});document.getElementById("closeModalBtn").addEventListener("click",()=>{H.classList.remove("active")});window.editItem=e=>{const t=P.find(n=>n.id===e);t&&(K.innerText="Изменить услугу",document.getElementById("originalId").value=t.id,document.getElementById("itemId").value=t.id,document.getElementById("itemId").disabled=!0,document.getElementById("itemName").value=t.displayName,document.getElementById("itemDesc").value=t.desc||"",document.getElementById("itemPrice").value=t.price,document.getElementById("itemCategory").value=t.category||"service",document.getElementById("itemIcon").value=t.icon||"",document.getElementById("existingImage").value=t.image||"",document.getElementById("itemImage").value="",document.getElementById("itemQuickOrder").checked=!!t.isQuickOrder,t.image?(T.src=t.image,T.style.display="block"):T.style.display="none",H.classList.add("active"))};window.deleteItem=async e=>{if(confirm(`Точно удалить услугу ${e}?`))try{(await fetch(`${r}/catalog/${e}`,{method:"DELETE",headers:{Authorization:`Bearer ${u}`}})).ok&&await D()}catch{alert("Ошибка удаления")}};document.getElementById("itemForm").addEventListener("submit",async e=>{e.preventDefault();const t=document.getElementById("originalId").value,n=!!t,o=document.getElementById("itemId").value,d=document.getElementById("itemName").value,s=document.getElementById("itemDesc").value,i=parseInt(document.getElementById("itemPrice").value,10),p=document.getElementById("itemCategory").value,f=document.getElementById("itemIcon").value,y=document.getElementById("itemQuickOrder").checked,c=document.getElementById("itemImage");let m=document.getElementById("existingImage").value;if(c.files.length>0){const a=new FormData;a.append("image",c.files[0]);try{const O=await(await fetch(`${r}/upload`,{method:"POST",headers:{Authorization:`Bearer ${u}`},body:a})).json();O.success&&(m=O.imageUrl)}catch{alert("Ошибка загрузки картинки");return}}const h={id:o,displayName:d,desc:s,price:i,category:p,icon:f,image:m,isQuickOrder:y};try{const a=n?`${r}/catalog/${t}`:`${r}/catalog`,N=await(await fetch(a,{method:n?"PUT":"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${u}`},body:JSON.stringify(h)})).json();N.success?(H.classList.remove("active"),await D()):alert("Ошибка сохранения: "+N.error)}catch{alert("Ошибка сети")}});async function E(){if(u)try{const t=await(await g(`${r}/admin/warehouse`)).json();if(!t.success)return;const{totalValuation:n,lowStockCount:o,gifts:d,products:s,logs:i}=t.data,p=document.getElementById("kpiTotalValuation"),f=document.getElementById("kpiLowStockCount"),y=document.getElementById("kpiTotalGifts");p&&(p.innerText=`${(n||0).toLocaleString("ru-RU")} ₽`),f&&(f.innerText=`${o||0} позиций`),y&&(y.innerText=`${(d||[]).length} видов`);const c=document.getElementById("giftsTableBody");c&&(c.innerHTML=(d||[]).map(a=>{const b=a.stock<=a.min_threshold;return`
          <tr>
            <td><img src="${a.image_url}" style="width: 40px; height: 40px; object-fit: contain; background: white; border-radius: 6px; padding: 2px;" /></td>
            <td><strong>${a.title}</strong><br><span style="font-size: 11px; color: #a1a1aa;">${a.subtitle||""}</span></td>
            <td><span style="background: rgba(0,150,217,0.2); color: #0096d9; padding: 2px 8px; border-radius: 999px; font-weight: 700; font-size: 11px;">${a.badge||"Подарок"}</span></td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('gift', '${a.id}', ${a.stock-1}, ${a.min_threshold}, ${a.unit_cost})">-</button>
                <strong style="color: ${b?"#f87171":"#34d399"};">${a.stock} шт.</strong>
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
        `}).join(""));const m=document.getElementById("productsTableBody");m&&(m.innerHTML=(s||[]).map(a=>{const b=a.stock<=a.min_threshold;return`
          <tr>
            <td><strong>${a.name}</strong></td>
            <td>${a.category||"Услуги"}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('product', '${a.id}', ${a.stock-1}, ${a.min_threshold}, ${a.unit_cost})">-</button>
                <strong style="color: ${b?"#f87171":"#34d399"};">${a.stock} шт.</strong>
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
      `).join("")),window._cachedGifts=d||[]}catch(e){console.error("Error loading warehouse dashboard:",e)}}window.updateStock=async(e,t,n,o,d,s="Быстрая корректировка остатка")=>{if(!(n<0))try{(await(await g(`${r}/admin/warehouse/update`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({itemType:e,id:t,stock:n,min_threshold:o,unit_cost:d,reason:s})})).json()).success&&await E()}catch{alert("Ошибка обновления остатка")}};window.promptStockUpdate=async(e,t,n,o,d)=>{const s=prompt("Введите новый остаток на складе (шт.):",n);if(s===null)return;const i=parseInt(s,10);if(isNaN(i)||i<0)return alert("Введите корректное число!");await window.updateStock(e,t,i,o,d,"Инвентаризация склада")};const M=document.getElementById("giftModalAdmin"),R=document.getElementById("giftFormAdmin"),J=document.getElementById("openAddGiftModalBtn"),Q=document.getElementById("closeGiftModalAdminBtn");J&&J.addEventListener("click",()=>{document.getElementById("giftIdAdmin").value="",document.getElementById("giftTitleAdmin").value="",document.getElementById("giftSubtitleAdmin").value="",document.getElementById("giftBadgeAdmin").value="★ Символ Парка",document.getElementById("giftImageUrlAdmin").value="./assets/images/gifts/gift_toy.png?v=2",document.getElementById("giftStockAdmin").value="50",document.getElementById("giftMinThresholdAdmin").value="10",document.getElementById("giftUnitCostAdmin").value="350",document.getElementById("giftIsActiveAdmin").checked=!0,document.getElementById("giftModalAdminTitle").innerText="Добавить Новый Подарок",M.classList.add("active")});Q&&Q.addEventListener("click",()=>{M.classList.remove("active")});window.editGift=e=>{const t=(window._cachedGifts||[]).find(n=>n.id===e);t&&(document.getElementById("giftIdAdmin").value=t.id,document.getElementById("giftTitleAdmin").value=t.title||"",document.getElementById("giftSubtitleAdmin").value=t.subtitle||"",document.getElementById("giftBadgeAdmin").value=t.badge||"",document.getElementById("giftImageUrlAdmin").value=t.image_url||"",document.getElementById("giftStockAdmin").value=t.stock||50,document.getElementById("giftMinThresholdAdmin").value=t.min_threshold||10,document.getElementById("giftUnitCostAdmin").value=t.unit_cost||350,document.getElementById("giftIsActiveAdmin").checked=t.is_active!==0,document.getElementById("giftModalAdminTitle").innerText="Редактировать Подарок",M.classList.add("active"))};window.deleteGift=async e=>{if(confirm("Вы уверены, что хотите удалить этот подарок?"))try{(await g(`${r}/admin/gifts/${e}`,{method:"DELETE"})).ok&&await E()}catch{alert("Ошибка удаления подарка")}};R&&R.addEventListener("submit",async e=>{e.preventDefault();const t=document.getElementById("giftIdAdmin").value,n=document.getElementById("giftTitleAdmin").value,o=document.getElementById("giftSubtitleAdmin").value,d=document.getElementById("giftBadgeAdmin").value;let s=document.getElementById("giftImageUrlAdmin").value;const i=parseInt(document.getElementById("giftStockAdmin").value,10),p=parseInt(document.getElementById("giftMinThresholdAdmin").value,10),f=parseInt(document.getElementById("giftUnitCostAdmin").value,10),y=document.getElementById("giftIsActiveAdmin").checked?1:0,c=document.getElementById("giftImageFileAdmin");if(c&&c.files.length>0){const m=new FormData;m.append("image",c.files[0]);try{const a=await(await g(`${r}/upload`,{method:"POST",body:m})).json();a.success&&(s=a.imageUrl)}catch{alert("Ошибка загрузки фото подарка");return}}try{(await(await g(`${r}/admin/gifts`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:t,title:n,subtitle:o,badge:d,image_url:s,stock:i,min_threshold:p,unit_cost:f,is_active:y})})).json()).success?(M.classList.remove("active"),await E()):alert("Ошибка сохранения подарка")}catch{alert("Ошибка сети")}});async function $(){if(u){if(window._currentStays&&window._currentStays.length>0){const e=document.getElementById("inHouseGuestsCountBadge");e&&(e.innerText=`👥 ${window._currentStays.length} гостей сейчас в парке`),window._inHouseGuests=window._currentStays,renderInHouseGuestsTable(window._currentStays),await j();return}try{const t=await(await g(`${r}/admin/in-house-guests`)).json();if(t.success){const n=document.getElementById("inHouseGuestsCountBadge");n&&(n.innerText=`👥 ${t.guests.length} гостей сейчас в парке`),window._inHouseGuests=t.guests||[],renderInHouseGuestsTable(t.guests||[])}}catch(e){console.error("Error loading in-house guests for broadcast:",e)}await j()}}window.renderInHouseGuestsTable=e=>{const t=document.getElementById("inHouseGuestsTableBody");if(t){if(!e||e.length===0){t.innerHTML='<tr><td colspan="5" style="text-align: center; color: #a1a1aa; padding: 1rem;">Нет текущих проживающих гостей</td></tr>';return}t.innerHTML=e.map(n=>{const o=String(n.house_number||"");return`
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
    `}).join("")}};window.autoSaveHouseNumber=async(e,t)=>{try{const o=await(await g(`${r}/admin/assign-house`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId:e,houseNumber:t})})).json();o.success?console.log(`[House Assigned] ${e} -> ${t}`):alert("Ошибка привязки домика: "+(o.error||""))}catch{alert("Ошибка сети при сохранении номера домика")}};async function j(){if(u)try{const t=await(await g(`${r}/admin/sms-templates`)).json();if(t.success&&t.templates){window._smsTemplates=t.templates;const n=document.getElementById("templateSelect");n&&(n.innerHTML='<option value="">-- Выберите шаблон для вставки --</option>'+t.templates.map(o=>`<option value="${o.id}">${o.title}</option>`).join(""))}}catch(e){console.error("Error loading SMS templates:",e)}}const k=document.getElementById("refreshBroadcastBtn");k&&k.addEventListener("click",async()=>{k.innerText="🔄 Обновление...",window._currentStays=null,await G(),await $(),k.innerText="🔄 Обновить список"});const I=document.getElementById("templateSelect"),w=document.getElementById("deleteTemplateBtn"),W=document.getElementById("saveTemplateBtn"),l=document.getElementById("broadcastTextarea"),v=document.getElementById("broadcastPreviewText"),q=document.getElementById("insertNameTagBtn"),V=document.getElementById("sendBroadcastBtn");I&&I.addEventListener("change",()=>{const e=I.value,t=(window._smsTemplates||[]).find(n=>String(n.id)===String(e));t?(l&&(l.value=t.template,l.dispatchEvent(new Event("input"))),w&&(w.style.display="inline-block")):w&&(w.style.display="none")});W&&W.addEventListener("click",async()=>{const e=l?l.value.trim():"";if(!e)return alert("Введите текст сообщения в поле слева перед сохранением шаблона!");const t=prompt('Введите название шаблона (например: "Акция на Бани -20%"):');if(!(!t||!t.trim()))try{(await(await g(`${r}/admin/sms-templates`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:t.trim(),template:e})})).json()).success?(alert("✅ Шаблон рассылки успешно сохранен!"),await j()):alert("Ошибка сохранения шаблона")}catch{alert("Ошибка сети при сохранении шаблона")}});w&&w.addEventListener("click",async()=>{const e=I?I.value:null;if(e&&confirm("Вы действительно хотите удалить этот шаблон рассылки?"))try{(await(await g(`${r}/admin/sms-templates/${e}`,{method:"DELETE"})).json()).success&&(alert("✅ Шаблон удален"),l&&(l.value=""),v&&(v.innerText="[Введите текст слева]"),w.style.display="none",await j())}catch{alert("Ошибка удаления шаблона")}});l&&v&&l.addEventListener("input",()=>{const e=window._inHouseGuests&&window._inHouseGuests[0]?window._inHouseGuests[0].guest_name.split(" ")[0]:"Константин",t=l.value||"[Введите текст слева]";v.innerText=t.replace(/\{имя\}/g,e).replace(/\{name\}/g,e)});q&&l&&q.addEventListener("click",()=>{l.value+=" {имя}",l.dispatchEvent(new Event("input")),l.focus()});V&&V.addEventListener("click",async()=>{const e=l?l.value.trim():"";if(!e)return alert("Введите текст сообщения!");const t=(window._inHouseGuests||[]).length;if(confirm(`Вы действительно хотите отправить это СМС сообщение ${t} проживающим гостям прямо сейчас?`))try{const o=await(await g(`${r}/admin/broadcast-sms`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({template:e})})).json();o.success?(alert(`✅ СМС-рассылка успешно выполнена! Отправлено ${o.sentCount} гостям.`),l.value="",v&&(v.innerText="[Сообщение отправлено!]")):alert("Ошибка отправки: "+o.error)}catch{alert("Ошибка сети при отправке рассылки")}});
//# sourceMappingURL=admin-Bk66p1bJ.js.map
