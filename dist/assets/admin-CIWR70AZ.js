import"./style-CTAUnyPs.js";const r="/api",A=document.getElementById("loginScreen"),z=document.getElementById("dashboardScreen"),F=document.getElementById("catalogTableBody"),H=document.getElementById("itemModal");document.getElementById("itemForm");const K=document.getElementById("modalTitle"),T=document.getElementById("currentImagePreview");let u=localStorage.getItem("adminToken"),D=[];async function y(t,e={}){e.headers=e.headers||{},u&&(e.headers.Authorization=`Bearer ${u}`);const n=await fetch(t,e);if(n.status===401||n.status===403){console.warn("[Admin API] 401/403 response. Session expired."),u=null,localStorage.removeItem("adminToken"),A&&(A.style.display="flex"),z&&(z.style.display="none");const o=document.getElementById("loginError");throw o&&(o.innerText="Сессия истекла или неверный токен. Войдите снова."),new Error("Unauthorized/Forbidden")}return n}u&&X();document.getElementById("loginBtn").addEventListener("click",async()=>{const t=document.getElementById("username").value,e=document.getElementById("password").value;try{const o=await(await fetch(`${r}/admin/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:t,password:e})})).json();o.success?(u=o.token,localStorage.setItem("adminToken",u),X()):document.getElementById("loginError").innerText=o.error||"Ошибка входа"}catch{document.getElementById("loginError").innerText="Ошибка сети"}});document.getElementById("logoutBtn").addEventListener("click",()=>{u=null,localStorage.removeItem("adminToken"),A.style.display="flex",z.style.display="none"});async function X(){A.style.display="none",z.style.display="block",await N(),await G(),await E(),await v()}const x=document.getElementById("tabCatalogBtn"),S=document.getElementById("tabBookingsBtn"),_=document.getElementById("tabWarehouseBtn"),L=document.getElementById("tabBroadcastBtn"),Y=document.getElementById("viewCatalog"),Z=document.getElementById("viewBookings"),ee=document.getElementById("viewWarehouse"),te=document.getElementById("viewBroadcast");function C(t,e){[x,S,_,L].forEach(n=>{n&&(n.className="btn",n.style.background="rgba(255,255,255,0.1)",n.style.color="white")}),[Y,Z,ee,te].forEach(n=>{n&&(n.style.display="none")}),t&&(t.className="btn btn-primary"),e&&(e.style.display="block")}x&&x.addEventListener("click",()=>C(x,Y));S&&S.addEventListener("click",async()=>{C(S,Z),await G(),await v()});_&&_.addEventListener("click",async()=>{C(_,ee),await E()});L&&L.addEventListener("click",async()=>{C(L,te),await v()});const B=document.getElementById("forceSyncBtn");B&&B.addEventListener("click",async()=>{B.innerText="⏳ Синхронизация...",B.disabled=!0;try{const e=await(await fetch(`${r}/admin/sync`,{method:"POST",headers:{Authorization:`Bearer ${u}`}})).json();e.success?(alert("Синхронизация с TravelLine выполнена успешно!"),await G()):alert("Ошибка синхронизации: "+(e.error||"Неизвестная ошибка"))}catch{alert("Ошибка сети при синхронизации")}finally{B.innerText="🔄 Синхронизировать (TL)",B.disabled=!1}});async function G(){try{const e=await(await y(`${r}/admin/dashboard`)).json();if(e.success){const{tomorrowArrivals:n,todayArrivals:o,currentStays:i,upcomingBookings:s}=e.data;window._currentStays=i||[],ae(n||[],o||[],i||[]),de("futureBookingsTableBody","futureBookingsBadge",s||[],"(0 броней)"),v()}}catch(t){console.error("Failed to load bookings dashboard",t)}}function ne(t){if(!t||t==="Гость")return"Гость";const n=t.replace(/\*/g,"").trim().split(/\s+/);if(n.length===1)return n[0];const o=n[0],i=n[1];if(i.length<=2)return`${o} ${i.toUpperCase()}${i.endsWith(".")?"":"."}`;const s=/(?:ов|ова|ев|ева|ин|ина|ский|ская|ый|ая|их|ых)$/i.test(i),d=/(?:ов|ова|ев|ева|ин|ина|ский|ская|ый|ая|их|ых)$/i.test(o);return s&&!d?`${i} ${o[0].toUpperCase()}.`:`${o} ${i[0].toUpperCase()}.`}function oe(t,e){const n=(t||"").toLowerCase();let o=[];n.includes("рыбак")?o=["100"]:n.includes("7")||n.includes("лесу")?o=["101","102","103"]:n.includes("мини")&&(n.includes("2")||n.includes("двух"))?o=["104","105","106","107","108","109"]:n.includes("мини")&&(n.includes("4")||n.includes("четыр"))?o=["110","111"]:(n.includes("барн")||n.includes("barn"))&&(n.includes("4")||n.includes("четыр"))?o=["112","113","114","115","116","117","118","119"]:(n.includes("барн")||n.includes("barn"))&&(n.includes("2")||n.includes("двух"))?o=["120","121"]:o=["100","101","102","103","104","105","106","107","108","109","110","111","112","113","114","115","116","117","118","119","120","121"];let i=String(e||"");n.includes("рыбак")&&!i&&(i="100"),i&&!o.includes(i)&&o.unshift(i);let s='<option value="">-- № --</option>';return o.forEach(d=>{s+=`<option value="${d}" ${i===d?"selected":""}>№ ${d}</option>`}),s}window.autoSavePhone=async(t,e)=>{try{const o=await(await y(`${r}/admin/update-phone`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId:t,phone:e})})).json();o.success?(console.log(`[Phone Updated] ${t} -> ${e}`),v()):alert("Ошибка обновления телефона: "+(o.error||""))}catch{alert("Ошибка сети при сохранении телефона")}};function ae(t,e,n){const o=document.getElementById("activeBookingsTableBody"),i=document.getElementById("activeGuestsCountBadge");if(!o)return;const s=(t?t.length:0)+(e?e.length:0)+(n?n.length:0);if(i&&(i.innerText=`🔥 ${s} активных гостей (Завтра: ${t?t.length:0}, Сегодня: ${e?e.length:0}, Живут: ${n?n.length:0})`),s===0){o.innerHTML='<tr><td colspan="8" style="text-align: center; color: #a1a1aa; padding: 1.5rem;">Активных заездов и проживаний не найдено</td></tr>';return}let d="";t&&t.length>0&&(d+=`
      <tr style="background: rgba(52, 211, 153, 0.15); border-left: 4px solid #34d399;">
        <td colspan="8" style="padding: 0.65rem 0.75rem; font-weight: 800; color: #34d399; font-size: 0.8125rem; letter-spacing: 0.05em;">
          ⚡ ЗАЕЗЖАЮТ ЗАВТРА (${t.length})
        </td>
      </tr>
    `,d+=t.map(l=>P(l,"🟢 Заезд завтра")).join("")),e&&e.length>0&&(d+=`
      <tr style="background: rgba(56, 189, 248, 0.15); border-left: 4px solid #38bdf8;">
        <td colspan="8" style="padding: 0.65rem 0.75rem; font-weight: 800; color: #38bdf8; font-size: 0.8125rem; letter-spacing: 0.05em;">
          🌟 ЗАЕЗЖАЮТ СЕГОДНЯ (Заезд с 15:00) (${e.length})
        </td>
      </tr>
    `,d+=e.map(l=>P(l,"🔵 Заезд сегодня")).join("")),n&&n.length>0&&(d+=`
      <tr style="background: rgba(232, 165, 88, 0.15); border-left: 4px solid var(--accent-gold);">
        <td colspan="8" style="padding: 0.65rem 0.75rem; font-weight: 800; color: var(--accent-gold); font-size: 0.8125rem; letter-spacing: 0.05em;">
          🏡 УЖЕ ПРОЖИВАЮТ В ПАРКЕ (${n.length})
        </td>
      </tr>
    `,d+=n.map(l=>P(l,"🏠 Проживает")).join("")),o.innerHTML=d}function P(t,e){const n=String(t.house_number||""),o=ne(t.guest_name),i=t.arrival_date?t.arrival_date.slice(5,10).replace("-","."):"",s=t.departure_date?t.departure_date.slice(5,10).replace("-","."):"",d=`${i} – ${s}`,l=oe(t.cabin_name,n),f=t.sms_stages||t.sms&&Object.keys(t.sms).length>0?'<span style="background: rgba(52, 211, 153, 0.15); color: #34d399; padding: 0.2rem 0.45rem; border-radius: 0.375rem; font-size: 11px; font-weight: 700; border: 1px solid rgba(52, 211, 153, 0.3);">✅ Ушла</span>':'<span style="background: rgba(148, 163, 184, 0.12); color: #94a3b8; padding: 0.2rem 0.45rem; border-radius: 0.375rem; font-size: 11px; font-weight: 600;">⏳ Ожидает</span>',g=e&&e.includes("завтра"),m=e&&e.includes("сегодня");let p="background: rgba(232, 165, 88, 0.2); color: #facc15;",a="";g?(p="background: rgba(52, 211, 153, 0.2); color: #34d399;",a="background: rgba(52, 211, 153, 0.03);"):m&&(p="background: rgba(56, 189, 248, 0.2); color: #38bdf8;",a="background: rgba(56, 189, 248, 0.03);");const h=e?`<span style="font-size: 10px; font-weight: 700; padding: 0.15rem 0.35rem; border-radius: 0.25rem; margin-left: 0.35rem; ${p}">${e}</span>`:"";return`
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); ${a}">
      <td style="padding: 0.6rem 0.5rem;">
        <button class="btn" style="background: rgba(255,255,255,0.08); color: #60a5fa; border: 1px solid rgba(96,165,250,0.3); padding: 0.25rem 0.5rem; font-size: 11px; font-weight: 600;" onclick="navigator.clipboard.writeText('${t.id}'); this.innerText='✓ Скопировано'; setTimeout(() => this.innerText='📋 ID', 1500);" title="Скопировать номер брони (${t.id})">📋 ID</button>
      </td>
      <td style="padding: 0.6rem 0.5rem;">
        <strong style="color: white; font-size: 0.875rem;">${o}</strong> ${h}
      </td>
      <td style="padding: 0.6rem 0.5rem;">
        <input type="text" value="${t.phone||""}" placeholder="📱 +7..." style="width: 110px; margin-bottom: 0; padding: 0.25rem 0.4rem; font-size: 11px; font-weight: 600; color: #34d399; background: rgba(0,0,0,0.4); border: 1px solid rgba(52,211,153,0.3); border-radius: 0.375rem;" onchange="window.autoSavePhone('${t.id}', this.value)" title="Нажмите, чтобы ввести или отредактировать телефон для СМС" />
      </td>
      <td style="padding: 0.6rem 0.5rem; color: #e4e4e7; font-size: 0.8125rem;">
        ${t.cabin_name||"Домик"}
      </td>
      <td style="padding: 0.6rem 0.5rem; font-size: 11px; color: #a1a1aa; font-weight: 600;">
        ${d}
      </td>
      <td style="padding: 0.6rem 0.5rem;">
        <select style="margin-bottom: 0; padding: 0.3rem 0.4rem; font-size: 12px; font-weight: 700; color: #facc15; background: #0f172a; border: 1px solid rgba(250,204,21,0.5); border-radius: 0.375rem; cursor: pointer;" onchange="window.autoSaveHouseNumber('${t.id}', this.value)">
          ${l}
        </select>
      </td>
      <td style="padding: 0.6rem 0.5rem;">
        <a href="/?booking=${t.id}" target="_blank" class="btn" style="background: rgba(0, 150, 217, 0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); padding: 0.25rem 0.5rem; font-size: 11px; font-weight: 600; text-decoration: none;">📱 ПВА</a>
      </td>
      <td style="padding: 0.6rem 0.5rem;">
        ${f}
      </td>
    </tr>
  `}function de(t,e,n,o){const i=document.getElementById(t),s=document.getElementById(e);if(i){if(s&&(s.innerText=n.length>0?`(${n.length} броней)`:o),!n||n.length===0){i.innerHTML='<tr><td colspan="8" style="text-align: center; color: #a1a1aa; padding: 1.5rem;">Бронирований не найдено</td></tr>';return}i.innerHTML=n.map(d=>{const l=String(d.house_number||""),b=ne(d.guest_name),f=d.arrival_date?d.arrival_date.slice(5,10).replace("-","."):"",g=d.departure_date?d.departure_date.slice(5,10).replace("-","."):"",m=`${f} – ${g}`,p=oe(d.cabin_name,l),h=d.sms_stages||d.sms&&Object.keys(d.sms).length>0?'<span style="background: rgba(52, 211, 153, 0.15); color: #34d399; padding: 0.2rem 0.45rem; border-radius: 0.375rem; font-size: 11px; font-weight: 700; border: 1px solid rgba(52, 211, 153, 0.3);">✅ Ушла</span>':'<span style="background: rgba(148, 163, 184, 0.12); color: #94a3b8; padding: 0.2rem 0.45rem; border-radius: 0.375rem; font-size: 11px; font-weight: 600;">⏳ Ожидает</span>';return`
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 0.6rem 0.5rem;">
          <button class="btn" style="background: rgba(255,255,255,0.08); color: #60a5fa; border: 1px solid rgba(96,165,250,0.3); padding: 0.25rem 0.5rem; font-size: 11px; font-weight: 600;" onclick="navigator.clipboard.writeText('${d.id}'); this.innerText='✓ Скопировано'; setTimeout(() => this.innerText='📋 ID', 1500);" title="Скопировать номер брони (${d.id})">📋 ID</button>
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          <strong style="color: white; font-size: 0.875rem;">${b}</strong>
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          <input type="text" value="${d.phone||""}" placeholder="📱 +7..." style="width: 110px; margin-bottom: 0; padding: 0.25rem 0.4rem; font-size: 11px; font-weight: 600; color: #34d399; background: rgba(0,0,0,0.4); border: 1px solid rgba(52,211,153,0.3); border-radius: 0.375rem;" onchange="window.autoSavePhone('${d.id}', this.value)" title="Нажмите, чтобы ввести или отредактировать телефон для СМС" />
        </td>
        <td style="padding: 0.6rem 0.5rem; color: #e4e4e7; font-size: 0.8125rem;">
          ${d.cabin_name||"Домик"}
        </td>
        <td style="padding: 0.6rem 0.5rem; font-size: 11px; color: #a1a1aa; font-weight: 600;">
          ${m}
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          <select style="margin-bottom: 0; padding: 0.3rem 0.4rem; font-size: 12px; font-weight: 700; color: #facc15; background: #0f172a; border: 1px solid rgba(250,204,21,0.5); border-radius: 0.375rem; cursor: pointer;" onchange="window.autoSaveHouseNumber('${d.id}', this.value)">
            ${p}
          </select>
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          <a href="/?booking=${d.id}" target="_blank" class="btn" style="background: rgba(0, 150, 217, 0.15); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); padding: 0.25rem 0.5rem; font-size: 11px; font-weight: 600; text-decoration: none;">📱 ПВА</a>
        </td>
        <td style="padding: 0.6rem 0.5rem;">
          ${h}
        </td>
      </tr>
    `}).join("")}}async function N(){try{const e=await(await fetch(`${r}/catalog`)).json();e.success&&(D=e.data,ie())}catch(t){console.error("Failed to load catalog",t)}}function ie(){F.innerHTML="",D.forEach(t=>{const e=document.createElement("tr");let n=`<span style="font-size: 24px;">${t.icon||"📦"}</span>`;t.image&&(n=`<img src="${t.image}" class="item-image" alt="icon"/>`),e.innerHTML=`
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
    `,F.appendChild(e)})}document.getElementById("openAddModalBtn").addEventListener("click",()=>{K.innerText="Добавить услугу",document.getElementById("originalId").value="",document.getElementById("itemId").value="",document.getElementById("itemId").disabled=!1,document.getElementById("itemName").value="",document.getElementById("itemDesc").value="",document.getElementById("itemPrice").value="",document.getElementById("itemCategory").value="service",document.getElementById("itemIcon").value="",document.getElementById("existingImage").value="",document.getElementById("itemImage").value="",document.getElementById("itemQuickOrder").checked=!1,T.style.display="none",H.classList.add("active")});document.getElementById("closeModalBtn").addEventListener("click",()=>{H.classList.remove("active")});window.editItem=t=>{const e=D.find(n=>n.id===t);e&&(K.innerText="Изменить услугу",document.getElementById("originalId").value=e.id,document.getElementById("itemId").value=e.id,document.getElementById("itemId").disabled=!0,document.getElementById("itemName").value=e.displayName,document.getElementById("itemDesc").value=e.desc||"",document.getElementById("itemPrice").value=e.price,document.getElementById("itemCategory").value=e.category||"service",document.getElementById("itemIcon").value=e.icon||"",document.getElementById("existingImage").value=e.image||"",document.getElementById("itemImage").value="",document.getElementById("itemQuickOrder").checked=!!e.isQuickOrder,e.image?(T.src=e.image,T.style.display="block"):T.style.display="none",H.classList.add("active"))};window.deleteItem=async t=>{if(confirm(`Точно удалить услугу ${t}?`))try{(await fetch(`${r}/catalog/${t}`,{method:"DELETE",headers:{Authorization:`Bearer ${u}`}})).ok&&await N()}catch{alert("Ошибка удаления")}};document.getElementById("itemForm").addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("originalId").value,n=!!e,o=document.getElementById("itemId").value,i=document.getElementById("itemName").value,s=document.getElementById("itemDesc").value,d=parseInt(document.getElementById("itemPrice").value,10),l=document.getElementById("itemCategory").value,b=document.getElementById("itemIcon").value,f=document.getElementById("itemQuickOrder").checked,g=document.getElementById("itemImage");let m=document.getElementById("existingImage").value;if(g.files.length>0){const a=new FormData;a.append("image",g.files[0]);try{const O=await(await fetch(`${r}/upload`,{method:"POST",headers:{Authorization:`Bearer ${u}`},body:a})).json();O.success&&(m=O.imageUrl)}catch{alert("Ошибка загрузки картинки");return}}const p={id:o,displayName:i,desc:s,price:d,category:l,icon:b,image:m,isQuickOrder:f};try{const a=n?`${r}/catalog/${e}`:`${r}/catalog`,U=await(await fetch(a,{method:n?"PUT":"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${u}`},body:JSON.stringify(p)})).json();U.success?(H.classList.remove("active"),await N()):alert("Ошибка сохранения: "+U.error)}catch{alert("Ошибка сети")}});async function E(){if(u)try{const e=await(await y(`${r}/admin/warehouse`)).json();if(!e.success)return;const{totalValuation:n,lowStockCount:o,gifts:i,products:s,logs:d}=e.data,l=document.getElementById("kpiTotalValuation"),b=document.getElementById("kpiLowStockCount"),f=document.getElementById("kpiTotalGifts");l&&(l.innerText=`${(n||0).toLocaleString("ru-RU")} ₽`),b&&(b.innerText=`${o||0} позиций`),f&&(f.innerText=`${(i||[]).length} видов`);const g=document.getElementById("giftsTableBody");g&&(g.innerHTML=(i||[]).map(a=>{const h=a.stock<=a.min_threshold;return`
          <tr>
            <td><img src="${a.image_url}" style="width: 40px; height: 40px; object-fit: contain; background: white; border-radius: 6px; padding: 2px;" /></td>
            <td><strong>${a.title}</strong><br><span style="font-size: 11px; color: #a1a1aa;">${a.subtitle||""}</span></td>
            <td><span style="background: rgba(0,150,217,0.2); color: #0096d9; padding: 2px 8px; border-radius: 999px; font-weight: 700; font-size: 11px;">${a.badge||"Подарок"}</span></td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('gift', '${a.id}', ${a.stock-1}, ${a.min_threshold}, ${a.unit_cost})">-</button>
                <strong style="color: ${h?"#f87171":"#34d399"};">${a.stock} шт.</strong>
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
        `}).join(""));const m=document.getElementById("productsTableBody");m&&(m.innerHTML=(s||[]).map(a=>{const h=a.stock<=a.min_threshold;return`
          <tr>
            <td><strong>${a.name}</strong></td>
            <td>${a.category||"Услуги"}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('product', '${a.id}', ${a.stock-1}, ${a.min_threshold}, ${a.unit_cost})">-</button>
                <strong style="color: ${h?"#f87171":"#34d399"};">${a.stock} шт.</strong>
                <button class="btn" style="padding: 2px 8px;" onclick="window.updateStock('product', '${a.id}', ${a.stock+1}, ${a.min_threshold}, ${a.unit_cost})">+</button>
              </div>
            </td>
            <td>${a.min_threshold} шт.</td>
            <td>${(a.unit_cost||0).toLocaleString("ru-RU")} ₽</td>
            <td>${(a.price||0).toLocaleString("ru-RU")} ₽</td>
            <td><button class="btn btn-primary" style="padding: 4px 10px; font-size: 11px;" onclick="window.promptStockUpdate('product', '${a.id}', ${a.stock}, ${a.min_threshold}, ${a.unit_cost})">Корректировка</button></td>
          </tr>
        `}).join(""));const p=document.getElementById("stockLogsTableBody");p&&(p.innerHTML=(d||[]).map(a=>`
        <tr>
          <td style="font-size: 11px; color: #a1a1aa;">${a.created_at||""}</td>
          <td><span style="font-weight: 700; font-size: 11px; color: ${a.item_type==="gift"?"var(--accent-gold)":"#60a5fa"};">${a.item_type==="gift"?"Подарок":"Товар"}</span></td>
          <td><strong>${a.item_name||""}</strong></td>
          <td><span style="font-weight: 800; color: ${a.change_qty>=0?"#34d399":"#f87171"};">${a.change_qty>0?"+":""}${a.change_qty}</span></td>
          <td style="font-size: 11px; color: #e4e4e7;">${a.reason||""}</td>
        </tr>
      `).join("")),window._cachedGifts=i||[]}catch(t){console.error("Error loading warehouse dashboard:",t)}}window.updateStock=async(t,e,n,o,i,s="Быстрая корректировка остатка")=>{if(!(n<0))try{(await(await y(`${r}/admin/warehouse/update`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({itemType:t,id:e,stock:n,min_threshold:o,unit_cost:i,reason:s})})).json()).success&&await E()}catch{alert("Ошибка обновления остатка")}};window.promptStockUpdate=async(t,e,n,o,i)=>{const s=prompt("Введите новый остаток на складе (шт.):",n);if(s===null)return;const d=parseInt(s,10);if(isNaN(d)||d<0)return alert("Введите корректное число!");await window.updateStock(t,e,d,o,i,"Инвентаризация склада")};const M=document.getElementById("giftModalAdmin"),R=document.getElementById("giftFormAdmin"),J=document.getElementById("openAddGiftModalBtn"),Q=document.getElementById("closeGiftModalAdminBtn");J&&J.addEventListener("click",()=>{document.getElementById("giftIdAdmin").value="",document.getElementById("giftTitleAdmin").value="",document.getElementById("giftSubtitleAdmin").value="",document.getElementById("giftBadgeAdmin").value="★ Символ Парка",document.getElementById("giftImageUrlAdmin").value="./assets/images/gifts/gift_toy.png?v=2",document.getElementById("giftStockAdmin").value="50",document.getElementById("giftMinThresholdAdmin").value="10",document.getElementById("giftUnitCostAdmin").value="350",document.getElementById("giftIsActiveAdmin").checked=!0,document.getElementById("giftModalAdminTitle").innerText="Добавить Новый Подарок",M.classList.add("active")});Q&&Q.addEventListener("click",()=>{M.classList.remove("active")});window.editGift=t=>{const e=(window._cachedGifts||[]).find(n=>n.id===t);e&&(document.getElementById("giftIdAdmin").value=e.id,document.getElementById("giftTitleAdmin").value=e.title||"",document.getElementById("giftSubtitleAdmin").value=e.subtitle||"",document.getElementById("giftBadgeAdmin").value=e.badge||"",document.getElementById("giftImageUrlAdmin").value=e.image_url||"",document.getElementById("giftStockAdmin").value=e.stock||50,document.getElementById("giftMinThresholdAdmin").value=e.min_threshold||10,document.getElementById("giftUnitCostAdmin").value=e.unit_cost||350,document.getElementById("giftIsActiveAdmin").checked=e.is_active!==0,document.getElementById("giftModalAdminTitle").innerText="Редактировать Подарок",M.classList.add("active"))};window.deleteGift=async t=>{if(confirm("Вы уверены, что хотите удалить этот подарок?"))try{(await y(`${r}/admin/gifts/${t}`,{method:"DELETE"})).ok&&await E()}catch{alert("Ошибка удаления подарка")}};R&&R.addEventListener("submit",async t=>{t.preventDefault();const e=document.getElementById("giftIdAdmin").value,n=document.getElementById("giftTitleAdmin").value,o=document.getElementById("giftSubtitleAdmin").value,i=document.getElementById("giftBadgeAdmin").value;let s=document.getElementById("giftImageUrlAdmin").value;const d=parseInt(document.getElementById("giftStockAdmin").value,10),l=parseInt(document.getElementById("giftMinThresholdAdmin").value,10),b=parseInt(document.getElementById("giftUnitCostAdmin").value,10),f=document.getElementById("giftIsActiveAdmin").checked?1:0,g=document.getElementById("giftImageFileAdmin");if(g&&g.files.length>0){const m=new FormData;m.append("image",g.files[0]);try{const a=await(await y(`${r}/upload`,{method:"POST",body:m})).json();a.success&&(s=a.imageUrl)}catch{alert("Ошибка загрузки фото подарка");return}}try{(await(await y(`${r}/admin/gifts`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:e,title:n,subtitle:o,badge:i,image_url:s,stock:d,min_threshold:l,unit_cost:b,is_active:f})})).json()).success?(M.classList.remove("active"),await E()):alert("Ошибка сохранения подарка")}catch{alert("Ошибка сети")}});async function v(){if(u){if(window._currentStays&&window._currentStays.length>0){const t=document.getElementById("inHouseGuestsCountBadge");t&&(t.innerText=`👥 ${window._currentStays.length} гостей сейчас в парке`),window._inHouseGuests=window._currentStays,renderInHouseGuestsTable(window._currentStays),await j();return}try{const e=await(await y(`${r}/admin/in-house-guests`)).json();if(e.success){const n=document.getElementById("inHouseGuestsCountBadge");n&&(n.innerText=`👥 ${e.guests.length} гостей сейчас в парке`),window._inHouseGuests=e.guests||[],renderInHouseGuestsTable(e.guests||[])}}catch(t){console.error("Error loading in-house guests for broadcast:",t)}await j()}}window.renderInHouseGuestsTable=t=>{const e=document.getElementById("inHouseGuestsTableBody");if(e){if(!t||t.length===0){e.innerHTML='<tr><td colspan="5" style="text-align: center; color: #a1a1aa; padding: 1rem;">Нет текущих проживающих гостей</td></tr>';return}e.innerHTML=t.map(n=>{const o=String(n.house_number||"");return`
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
    `}).join("")}};window.autoSaveHouseNumber=async(t,e)=>{try{const o=await(await y(`${r}/admin/assign-house`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({bookingId:t,houseNumber:e})})).json();o.success?console.log(`[House Assigned] ${t} -> ${e}`):alert("Ошибка привязки домика: "+(o.error||""))}catch{alert("Ошибка сети при сохранении номера домика")}};async function j(){if(u)try{const e=await(await y(`${r}/admin/sms-templates`)).json();if(e.success&&e.templates){window._smsTemplates=e.templates;const n=document.getElementById("templateSelect");n&&(n.innerHTML='<option value="">-- Выберите шаблон для вставки --</option>'+e.templates.map(o=>`<option value="${o.id}">${o.title}</option>`).join(""))}}catch(t){console.error("Error loading SMS templates:",t)}}const k=document.getElementById("refreshBroadcastBtn");k&&k.addEventListener("click",async()=>{k.innerText="🔄 Обновление...",window._currentStays=null,await G(),await v(),k.innerText="🔄 Обновить список"});const I=document.getElementById("templateSelect"),w=document.getElementById("deleteTemplateBtn"),W=document.getElementById("saveTemplateBtn"),c=document.getElementById("broadcastTextarea"),$=document.getElementById("broadcastPreviewText"),q=document.getElementById("insertNameTagBtn"),V=document.getElementById("sendBroadcastBtn");I&&I.addEventListener("change",()=>{const t=I.value,e=(window._smsTemplates||[]).find(n=>String(n.id)===String(t));e?(c&&(c.value=e.template,c.dispatchEvent(new Event("input"))),w&&(w.style.display="inline-block")):w&&(w.style.display="none")});W&&W.addEventListener("click",async()=>{const t=c?c.value.trim():"";if(!t)return alert("Введите текст сообщения в поле слева перед сохранением шаблона!");const e=prompt('Введите название шаблона (например: "Акция на Бани -20%"):');if(!(!e||!e.trim()))try{(await(await y(`${r}/admin/sms-templates`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:e.trim(),template:t})})).json()).success?(alert("✅ Шаблон рассылки успешно сохранен!"),await j()):alert("Ошибка сохранения шаблона")}catch{alert("Ошибка сети при сохранении шаблона")}});w&&w.addEventListener("click",async()=>{const t=I?I.value:null;if(t&&confirm("Вы действительно хотите удалить этот шаблон рассылки?"))try{(await(await y(`${r}/admin/sms-templates/${t}`,{method:"DELETE"})).json()).success&&(alert("✅ Шаблон удален"),c&&(c.value=""),$&&($.innerText="[Введите текст слева]"),w.style.display="none",await j())}catch{alert("Ошибка удаления шаблона")}});c&&$&&c.addEventListener("input",()=>{const t=window._inHouseGuests&&window._inHouseGuests[0]?window._inHouseGuests[0].guest_name.split(" ")[0]:"Константин",e=c.value||"[Введите текст слева]";$.innerText=e.replace(/\{имя\}/g,t).replace(/\{name\}/g,t)});q&&c&&q.addEventListener("click",()=>{c.value+=" {имя}",c.dispatchEvent(new Event("input")),c.focus()});V&&V.addEventListener("click",async()=>{const t=c?c.value.trim():"";if(!t)return alert("Введите текст сообщения!");const e=(window._inHouseGuests||[]).length;if(confirm(`Вы действительно хотите отправить это СМС сообщение ${e} проживающим гостям прямо сейчас?`))try{const o=await(await y(`${r}/admin/broadcast-sms`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({template:t})})).json();o.success?(alert(`✅ СМС-рассылка успешно выполнена! Отправлено ${o.sentCount} гостям.`),c.value="",$&&($.innerText="[Сообщение отправлено!]")):alert("Ошибка отправки: "+o.error)}catch{alert("Ошибка сети при отправке рассылки")}});
//# sourceMappingURL=admin-CIWR70AZ.js.map
