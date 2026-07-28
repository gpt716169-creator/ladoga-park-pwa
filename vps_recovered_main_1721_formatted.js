import"./style-CxO0_MCS.js";
function te(){
const o=document.createElement("canvas");
o.style.position="fixed",o.style.top="0",o.style.left="0",o.style.width="100vw",o.style.height="100vh",o.style.pointerEvents="none",o.style.zIndex="9999",document.body.appendChild(o);
const c=o.getContext("2d");
o.width=window.innerWidth,o.height=window.innerHeight;
const s=[],a=["#f4c478","#e6a15c","#34d399","#60a5fa","#f43f5e","#a855f7"];
for(let f=0;
f<100;
f++)s.push({
x:o.width/2,y:o.height*.6,vx:(Math.random()-.5)*12,vy:Math.random()*-15-5,size:Math.random()*8+4,color:a[Math.floor(Math.random()*a.length)],rotation:Math.random()*360,vRot:(Math.random()-.5)*10,opacity:1
}
);
let d;
function r(){
c.clearRect(0,0,o.width,o.height);
let f=!1;
s.forEach(m=>{
m.x+=m.vx,m.y+=m.vy,m.vy+=.4,m.rotation+=m.vRot,m.opacity-=.015,m.opacity>0&&(f=!0,c.save(),c.translate(m.x,m.y),c.rotate(m.rotation*Math.PI/180),c.globalAlpha=Math.max(0,m.opacity),c.fillStyle=m.color,c.fillRect(-m.size/2,-m.size/2,m.size,m.size),c.restore())
}
),f?d=requestAnimationFrame(r):(cancelAnimationFrame(d),o.remove())
}
r()
}
const ce=[{
id:"firewood",displayName:"🔥 Дрова березовые (Связка)",price:800,category:"service",desc:"Сухие березовые дрова камерной сушки. Идеально подходят для растопки камина в вашем домике и уютного вечера у живого огня без дыма и копоти.",icon:"🪵",fiscalName:"Услуги организации досуга (камин)"
}
,{
id:"water-19l",displayName:"🚰 Вода артезианская 19л с помпой",price:450,category:"service",desc:"Кристально чистая артезианская вода из собственной глубинной скважины курорта. Подается в бутыли 19 литров с установленной механической помпой.",icon:"💧",fiscalName:"Услуги сервиса в номере (питьевой режим)"
}
,{
id:"aroma-tub",displayName:"🍋 Арома-купель на травах и цитрусах",price:3500,category:"sauna",desc:"Парящая купель под открытым небом, заваренная на алтайских травах, целебной хвое, свежих грейпфрутах и апельсинах. Дарит неповторимый цитрусово-хвойный аромат и глубокое расслабление.",icon:"🍋",fiscalName:"Услуги предоставления оздоровительной купели"
}
,{
id:"minibox",displayName:"🪥 Премиум гигиена (Сет тапочек & уход)",price:650,category:"service",desc:"Индивидуальный набор премиальной косметики для ухода и парные махровые тапочки повышенного комфорта для вашего уютного проживания в домике.",icon:"✨",fiscalName:"Услуги комплектации номера средствами гигиены"
}
,{
id:"sauna-forest",displayName:"🌲 Баня в лесу у уединенной поляны",price:4500,category:"sauna",desc:"Традиционная русская парная на дровах в окружении соснового леса. Включает прогрев до 85°C, дубовые веники и зону отдыха.",icon:"🌲",fiscalName:"Услуги банного комплекса (лесная зона)"
}
,{
id:"sauna-lake",displayName:"🌊 Баня на берегу с видом на Ладогу",price:5500,category:"sauna",desc:"Панорамная баня на самой кромке воды с захватывающим видом на Ладожское озеро. Прямой выход к озеру для охлаждения после жаркой парной и парящая терраса.",icon:"🌊",fiscalName:"Услуги банного комплекса (береговая зона)"
}
,{
id:"hottub-siberian",displayName:"♨️ Сибирский банный чан на травах (доп. к бане)",price:3500,category:"sauna",desc:"Растопка горячего купель-чана на дровах с пихтовыми вениками и сбором алтайских трав. Добавляется к бронированию бани для парения под открытым небом.",icon:"♨️",fiscalName:"Услуги предоставления оздоровительного чана"
}
],ae={
id:"late-checkout-16",displayName:"⏳ Продление «Домика рыбака» до 16:00",price:2500,category:"service",desc:"Гарантированное продление проживания в вашем домике до 16:00. Проведите день выезда спокойно, наслаждаясь прогулкой у озера без спешки и суеты.",icon:"⏳",fiscalName:"Услуги продления проживания (поздний выезд)"
}
;
class re{
constructor(){
this.cart=[],this.listeners=[]
}
addItem(c){
const s=this.cart.find(a=>a.id===c.id);
s?s.quantity+=1:this.cart.push({
...c,quantity:1
}
),this.notify()
}
removeItem(c){
const s=this.cart.findIndex(a=>a.id===c);
s!==-1&&(this.cart[s].quantity>1?this.cart[s].quantity-=1:this.cart.splice(s,1)),this.notify()
}
clear(){
this.cart=[],this.notify()
}
getTotalPrice(){
return this.cart.reduce((c,s)=>c+s.price*s.quantity,0)
}
getTotalCount(){
return this.cart.reduce((c,s)=>c+s.quantity,0)
}
getItems(){
return this.cart
}
subscribe(c){
this.listeners.push(c)
}
notify(){
this.listeners.forEach(c=>c(this.cart))
}

}
const g=new re,le={
1:{
stageName:"1. T-1 день до заезда (Предвкушение)",videoPath:"./assets/video/stage1.mp4",title:"Ирина, ждём вас завтра!",subtitle:"Ваш домик на берегу озера готовится к приёму. Пройдите онлайн-регистрацию заранее, чтобы получить пропуск на территорию.",banner:{
actionText:"📋 Пройти онлайн-регистрацию",actionModal:"regModal"
}

}
,2:{
stageName:"2. В день заезда & Проживание (Обжитой уют)",videoPath:"./assets/video/stage2.mp4",title:"Добро пожаловать, Ирина!",subtitle:"Мы рады, что вы с нами. Приятного отдыха.",banner:{
actionText:"📜 5 правил проживания, Wi-Fi & Гид",actionModal:"guideModal"
}

}
,3:{
stageName:"3. Утро выезда 09:00 (Остывающий очаг)",videoPath:"./assets/video/stage3.mp4",title:"Ирина, доброе утро!",subtitle:"Ваш домик свободен до вечера! Вы можете продлить проживание до 16:00 и провести день без спешки и суеты.",banner:{
actionText:"⏳ Продлить домик до 16:00 (2 500 ₽)",actionItem:"late-checkout-16"
}

}
,4:{
stageName:"4. После выезда +2h (ORM & Прощание)",videoPath:"./assets/video/stage4.mp4",title:"Ирина, спасибо за отдых!",subtitle:"Мы уже скучаем по вам в Ладога Парк! Оцените ваше пребывание и заберите персональный подарок на следующий сезон.",banner:{
actionText:"🌟 Оценить отдых & Забрать подарок",actionModal:"ormModal"
}

}

}
;
let M=1;
function F(o,c="summer",s,a=null){
const d=le[o];
if(!d)return;
const r=JSON.parse(JSON.stringify(d));
if(a){
const{
guestName:u,cabinName:x
}
=a;
u&&(r.title=r.title.replace("Ирина",u),r.subtitle=r.subtitle.replace("Ирина",u)),x&&(r.subtitle=r.subtitle.replace("Ваш домик",`Ваш ${
x
}
`))
}
const f=document.getElementById("heroVideo1"),m=document.getElementById("heroVideo2");
if(f&&m){
const u=M===1?f:m,x=M===1?m:f;
if(!((u.getAttribute("src")||"")===r.videoPath||u.src&&u.src.endsWith(r.videoPath))){
x.src=r.videoPath,x.load();
const L=x.play();
L!==void 0?L.then(()=>{
x.classList.add("active"),u.classList.remove("active"),M=M===1?2:1
}
).catch(P=>{
console.log("Auto-play prevented or loading:",P),x.classList.add("active"),u.classList.remove("active"),M=M===1?2:1
}
):(x.classList.add("active"),u.classList.remove("active"),M=M===1?2:1)
}

}
const H=document.getElementById("heroTitle"),k=document.getElementById("heroSubtitle");
if(H&&(H.innerText=r.title),k&&(k.innerText=r.subtitle),k&&a&&(a.earlyArrival||a.lateDeparture)){
let u=document.getElementById("extraStayBadgeContainer");
u||(u=document.createElement("div"),u.id="extraStayBadgeContainer",u.style.cssText="margin-top: 0.75rem;
 display: flex;
 flex-direction: column;
 gap: 0.375rem;
 align-items: center;
",k.parentNode.appendChild(u)),u.innerHTML="",a.earlyArrival&&(o==="1"||o==="2")&&(u.innerHTML+=`
        <span style="background: rgba(52,211,153,0.15);
 color: #34d399;
 border: 1px solid rgba(52,211,153,0.3);
 padding: 0.25rem 0.625rem;
 border-radius: 9999px;
 font-size: 0.7rem;
 font-weight: 700;
 display: inline-flex;
 align-items: center;
 gap: 0.25rem;
 box-shadow: 0 2px 8px rgba(0,0,0,0.5);
">
          ✨ Ранний заезд подтвержден: с ${
a.earlyArrival
}

        </span>
      `),a.lateDeparture&&(o==="2"||o==="3")&&(u.innerHTML+=`
        <span style="background: rgba(96,165,250,0.15);
 color: #60a5fa;
 border: 1px solid rgba(96,165,250,0.3);
 padding: 0.25rem 0.625rem;
 border-radius: 9999px;
 font-size: 0.7rem;
 font-weight: 700;
 display: inline-flex;
 align-items: center;
 gap: 0.25rem;
 box-shadow: 0 2px 8px rgba(0,0,0,0.5);
">
          ⏳ Поздний выезд подтвержден: до ${
a.lateDeparture
}

        </span>
      `)
}
const b=document.getElementById("triggerBannerContainer");
if(b){
b.innerHTML=`
      <button id="triggerActionBtn" class="btn-primary-gold" style="width: 100%;
 max-width: 20rem;
 margin: 0 auto;
 padding: 0.875rem 1.25rem;
 justify-content: center;
">
        <span style="overflow: hidden;
 text-overflow: ellipsis;
 white-space: nowrap;
">${
r.banner.actionText
}
</span>
      </button>
    `;
const u=document.getElementById("triggerActionBtn");
u&&u.addEventListener("click",()=>{
s&&s(r.banner)
}
)
}
const I=document.getElementById("saunaSection");
document.getElementById("saunaBookedBanner");
const N=document.getElementById("stage2GuideSection"),S=document.getElementById("catalogueSection"),C=document.getElementById("morningServiceSection"),$=document.getElementById("farewellSection"),T=document.getElementById("saunaSectionHeader"),q=document.getElementById("scrollIndicator");
I&&I.classList.add("hidden"),N&&N.classList.add("hidden"),S&&S.classList.add("hidden"),C&&C.classList.add("hidden"),$&&$.classList.add("hidden"),q&&(q.style.display="flex"),o==="1"||o==1?(I&&I.classList.remove("hidden"),S&&S.classList.remove("hidden"),T&&(T.innerText="Выберите баню к приезду (Свайп ➔)")):o==="2"||o==2?(N&&N.classList.remove("hidden"),I&&I.classList.remove("hidden"),S&&S.classList.remove("hidden"),T&&(T.innerText="Вечерняя растопка бани (Свайп ➔)")):o==="3"||o==3?C&&C.classList.remove("hidden"):(o==="4"||o==4)&&($&&$.classList.remove("hidden"),q&&(q.style.display="none"))
}
let D=[],ne="all",B="1",j="summer";
function de(o){
return navigator.clipboard&&window.isSecureContext?navigator.clipboard.writeText(o):new Promise((c,s)=>{
const a=document.createElement("textarea");
a.value=o,a.style.position="fixed",a.style.left="-999999px",a.style.top="-999999px",document.body.appendChild(a),a.focus(),a.select();
try{
const d=document.execCommand("copy");
a.remove(),d?c():s(new Error("execCommand failed"))
}
catch(d){
a.remove(),s(d)
}

}
)
}
function p(o,c="🔔 Уведомление"){
const s=document.getElementById("toastContainer");
if(!s)return;
const a=document.createElement("div");
a.className="glass-card p-3 animate-float-in pointer-events-auto",a.style.cssText="background: rgba(20,31,25,0.95);
 border: 1px solid rgba(232,165,88,0.5);
 color: #f3f4f6;
 border-radius: 1rem;
 box-shadow: 0 10px 30px rgba(0,0,0,0.8);
 font-size: 0.75rem;
 display: flex;
 align-items: flex-start;
 gap: 0.625rem;
 padding: 0.875rem;
",a.innerHTML=`
    <span style="font-size: 20px;
 margin-top: 2px;
">✨</span>
    <div>
      <strong style="color: var(--accent-gold);
 font-weight: 700;
 display: block;
 margin-bottom: 0.125rem;
">${
c
}
</strong>
      <p style="color: var(--text-muted);
 line-height: 1.4;
">${
o
}
</p>
    </div>
  `,s.appendChild(a),setTimeout(()=>{
a.style.opacity="0",a.style.transform="translateY(-10px)",a.style.transition="all 0.3s ease",setTimeout(()=>a.remove(),300)
}
,1500)
}
function ie(o="all"){
const c=document.getElementById("fullCatalogueList");
if(!c)return;
c.innerHTML="",(o==="all"?D.filter(a=>a.category!=="sauna"):D.filter(a=>a.category===o&&a.category!=="sauna")).forEach(a=>{
const d=document.createElement("div");
d.className="glass-card p-4",d.style.cssText="padding: 1rem;
 border-radius: 1.25rem;
 display: flex;
 align-items: center;
 justify-content: space-between;
 gap: 1rem;
";
let r=`<div style="width: 3rem;
 height: 3rem;
 border-radius: 1rem;
 background: rgba(232,165,88,0.1);
 border: 1px solid rgba(232,165,88,0.2);
 display: flex;
 align-items: center;
 justify-content: center;
 font-size: 1.5rem;
 flex-shrink: 0;
">${
a.icon||"📦"
}
</div>`;
a.image&&(r=`<img src="${
a.image
}
" style="width: 3rem;
 height: 3rem;
 border-radius: 1rem;
 object-fit: cover;
 flex-shrink: 0;
 border: 1px solid rgba(232,165,88,0.2);
" />`),d.innerHTML=`
      <div style="display: flex;
 align-items: center;
 gap: 0.875rem;
">
        ${
r
}

        <div>
          <h4 style="font-weight: 700;
 font-size: 0.875rem;
 color: #f3f4f6;
 line-height: 1.3;
">${
a.displayName
}
</h4>
          <p style="font-size: 11px;
 color: var(--text-muted);
 margin-top: 0.125rem;
 display: -webkit-box;
 -webkit-line-clamp: 2;
 -webkit-box-orient: vertical;
 overflow: hidden;
">${
a.desc
}
</p>
        </div>
      </div>
      <div style="display: flex;
 flex-direction: column;
 align-items: flex-end;
 gap: 0.5rem;
 flex-shrink: 0;
">
        <span style="font-size: 0.875rem;
 font-weight: 800;
 color: var(--accent-gold);
 white-space: nowrap;
">${
a.price.toLocaleString("ru-RU")
}
 ₽</span>
        <button class="btn-add-item btn-primary-gold" style="padding: 0.375rem 0.875rem;
 font-size: 0.75rem;
 white-space: nowrap;
" data-id="${
a.id
}
">
          + Добавить
        </button>
      </div>
    `,c.appendChild(d)
}
),c.querySelectorAll(".btn-add-item").forEach(a=>{
a.addEventListener("click",()=>{
const d=D.find(r=>r.id===a.dataset.id);
d&&(g.addItem(d),p(`«${
d.displayName
}
» добавлен в ваш заказ`,"✨ Добавлено в корзину"),F(B,j))
}
)
}
)
}
function oe(){
const o=g.getTotalCount(),c=g.getTotalPrice(),s=document.getElementById("headerCartCount");
s&&(o>0?(s.innerText=o,s.classList.remove("hidden"),s.style.display="flex"):(s.classList.add("hidden"),s.style.display="none"));
const a=document.getElementById("drawerFinalTotal");
a&&(a.innerText=`${
c.toLocaleString("ru-RU")
}
 ₽`);
const d=document.getElementById("cartItemsList");
d&&(d.innerHTML="",g.getItems().length===0?d.innerHTML='<div style="text-align: center;
 color: var(--text-muted);
 font-size: 0.75rem;
 padding: 2rem 0;
">Ваша корзина пока пуста</div>':(g.getItems().forEach(r=>{
const f=document.createElement("div");
f.className="glass-card",f.style.cssText="padding: 0.875rem;
 border-radius: 1rem;
 display: flex;
 align-items: center;
 justify-content: space-between;
 border-color: rgba(232,165,88,0.3);
 gap: 0.5rem;
",f.innerHTML=`
        <div style="padding-right: 0.5rem;
">
          <strong style="font-size: 0.75rem;
 color: #f3f4f6;
 display: -webkit-box;
 -webkit-line-clamp: 2;
 -webkit-box-orient: vertical;
 overflow: hidden;
 line-height: 1.3;
">${
r.displayName
}
</strong>
          <span style="font-size: 11px;
 color: var(--accent-gold);
 font-weight: 700;
 margin-top: 0.125rem;
 display: block;
">${
r.price.toLocaleString("ru-RU")
}
 ₽ / шт.</span>
        </div>
        <div style="display: flex;
 align-items: center;
 gap: 0.5rem;
 flex-shrink: 0;
">
          <button class="btn-minus btn-icon-round" style="width: 1.75rem;
 height: 1.75rem;
 font-size: 0.875rem;
" data-id="${
r.id
}
">-</button>
          <span style="font-size: 0.75rem;
 font-weight: 800;
 width: 1rem;
 text-align: center;
">${
r.quantity
}
</span>
          <button class="btn-plus btn-icon-round" style="width: 1.75rem;
 height: 1.75rem;
 font-size: 0.875rem;
" data-id="${
r.id
}
">+</button>
        </div>
      `,d.appendChild(f)
}
),d.querySelectorAll(".btn-minus").forEach(r=>{
r.addEventListener("click",()=>{
g.removeItem(r.dataset.id),F(B,j)
}
)
}
),d.querySelectorAll(".btn-plus").forEach(r=>{
r.addEventListener("click",()=>{
const f=g.getItems().find(m=>m.id===r.dataset.id);
f&&g.addItem(f)
}
)
}
)))
}
function me(){
const o=document.getElementById("quickOrdersGrid");
if(!o)return;
o.innerHTML="",D.filter(s=>s.isQuickOrder).forEach(s=>{
const a=document.createElement("div");
a.className="glass-card",a.style.cssText="padding: 1rem;
 display: flex;
 flex-direction: column;
 justify-content: space-between;
 gap: 1rem;
";
let d=`<span style="font-size: 28px;
">${
s.icon||"📦"
}
</span>`;
s.image&&(d=`<img src="${
s.image
}
" style="width: 2.25rem;
 height: 2.25rem;
 border-radius: 8px;
 object-fit: cover;
" />`),a.innerHTML=`
      <div style="display: flex;
 justify-content: space-between;
 align-items: flex-start;
">
        ${
d
}

        <button class="btn-quick-add btn-icon-round" style="width: 2.25rem;
 height: 2.25rem;
" data-id="${
s.id
}
" title="Добавить в заказ">
          <span style="font-size: 18px;
 font-weight: 800;
">+</span>
        </button>
      </div>
      <div>
        <p style="font-weight: 700;
 font-size: 0.75rem;
 color: #f3f4f6;
 line-height: 1.3;
">${
s.displayName
}
</p>
        <p style="font-size: 11px;
 color: var(--accent-gold);
 font-weight: 600;
 margin-top: 0.125rem;
">${
s.price.toLocaleString("ru-RU")
}
 ₽ <span style="color: var(--text-muted);
 font-weight: 400;
">• ${
s.desc
}
</span></p>
      </div>
    `,o.appendChild(a)
}
)
}
document.addEventListener("DOMContentLoaded",async()=>{
try{
const t=await(await fetch("/api/catalog")).json();
t.success&&(D=t.data)
}
catch{
console.error("Failed to fetch dynamic catalog")
}
ie("all"),me(),g.subscribe(()=>oe()),oe();
let o=null;
document.body.addEventListener("click",e=>{
const t=e.target.closest(".btn-quick-add");
if(!t)return;
e.preventDefault();
const i=t.dataset.id;
if(t.dataset.disabled==="true")return;
let n=D.find(l=>l.id===i)||ce.find(l=>l.id===i);
if(!n&&i==="sauna-forest"&&(n={
id:"sauna-forest",displayName:"Баня в лесу у поляны",category:"sauna",price:16e3
}
),!n&&i==="sauna-lake"&&(n={
id:"sauna-lake",displayName:"Баня на берегу Ладоги",category:"sauna",price:18e3
}
),i==="late-checkout-16"&&(n=ae),n){
if(n.category==="sauna"||i.includes("sauna")||i.includes("hottub")||i.includes("aroma")){
o=n,r(n);
return
}
g.addItem(n),p(`«${
n.displayName
}
» добавлен в ваш заказ`,"✨ Корзина обновлена")
}

}
);
const c=new Map,s={
"sauna-lake":[{
time:"13:00",available:!0,price:18e3
}
,{
time:"17:00",available:!0,price:18e3
}
,{
time:"21:00",available:!0,price:18e3
}
],"sauna-forest":[{
time:"12:00",available:!0,price:16e3
}
,{
time:"16:00",available:!0,price:16e3
}
,{
time:"20:00",available:!0,price:16e3
}
]
}
;
function a(e,t){
const i=`${
e
}
_${
t
}
`;
if(c.has(i)){
f(c.get(i),t);
return
}
const n=s[e]||s["sauna-forest"];
f(n,t),fetch(`/api/saunas?category=${
e
}
&date=${
t
}
`).then(l=>l.json()).then(l=>{
l.success&&l.data&&l.data.length>0&&(c.set(i,l.data),f(l.data,t))
}
).catch(()=>{

}
)
}
let d=null;
function r(e){
o=e;
const t=document.getElementById("saunaTimeModal"),i=document.getElementById("saunaTimeModalTitle"),n=document.getElementById("saunaDatePicker");
if(!t)return;
i.innerText=`Время: ${
e.displayName
}
`;
const l=document.getElementById("saunaOptChanText"),E=e.id.includes("lake")||e.displayName.toLowerCase().includes("берегу");
l&&(l.innerText=E?"Купель на берегу":"Сибирский банный чан");
const h=new Date().toISOString().split("T")[0],y=JSON.parse(localStorage.getItem("bookingData")||"null");
let v=h;
y&&y.arrivalDate?(y.arrivalDate>h&&(v=y.arrivalDate),n&&(n.min=y.arrivalDate>h?y.arrivalDate:h,y.departureDate&&(n.max=y.departureDate))):n&&(n.min=h),n&&(n.value=v,d=v,n.onchange=w=>{
d=w.target.value,a(e.id,d)
}
),t.classList.remove("opacity-0","pointer-events-none"),t.querySelector(".glass-modal").style.transform="scale(1)",a(e.id,v)
}
function f(e,t){
const i=document.getElementById("saunaTimeSlots");
i.innerHTML="",e.forEach(n=>{
const l=document.createElement("button");
l.innerHTML=`${
n.time
}
<br><span style="font-size: 10px;
 opacity: 0.8;
">${
n.price.toLocaleString("ru-RU")
}
 ₽</span>`,n.available?(l.style.cssText="background: rgba(232,165,88,0.1);
 border: 1px solid rgba(232,165,88,0.3);
 color: var(--accent-gold);
 padding: 0.5rem;
 border-radius: 0.75rem;
 font-weight: 700;
 font-size: 0.875rem;
 cursor: pointer;
 transition: all 0.2s;
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 gap: 0.125rem;
",l.onclick=()=>{
const E=t?t.split("-").reverse().slice(0,2).join("."):"",h={
...o,displayName:`${
o.displayName
}
 (${
E?E+" ":""
}
${
n.time
}
)`,id:`${
o.id
}
-${
t
}
-${
n.time
}
`,price:n.price
}
;
g.addItem(h);
const y=document.getElementById("saunaOptBirch"),v=document.getElementById("saunaOptOak"),w=document.getElementById("saunaOptChan"),R=document.getElementById("saunaOptAroma");
if(y&&y.checked&&g.addItem({
id:"extra-birch-"+Date.now(),displayName:"Веник березовый (к бане)",price:700,category:"service",icon:"🌿"
}
),v&&v.checked&&g.addItem({
id:"extra-oak-"+Date.now(),displayName:"Веник дубовый (к бане)",price:700,category:"service",icon:"🌿"
}
),w&&w.checked){
const se=o.id.includes("lake")||o.displayName.toLowerCase().includes("берегу");
g.addItem({
id:"extra-chan-"+Date.now(),displayName:se?"Купель на берегу (к бане)":"Сибирский чан (к бане)",price:7e3,category:"sauna",icon:"♨️"
}
)
}
R&&R.checked&&g.addItem({
id:"extra-aroma-"+Date.now(),displayName:"Арома-масла (к бане)",price:500,category:"service",icon:"🍋"
}
),y&&(y.checked=!1),v&&(v.checked=!1),w&&(w.checked=!1),R&&(R.checked=!1),p("Баня и выбранные услуги добавлены","✨ Забронировано"),F(B,j),m()
}
):(l.style.cssText="background: rgba(255,255,255,0.05);
 border: 1px solid rgba(255,255,255,0.1);
 color: var(--text-muted);
 padding: 0.5rem;
 border-radius: 0.75rem;
 font-weight: 600;
 font-size: 0.875rem;
 cursor: not-allowed;
 opacity: 0.5;
 display: flex;
 flex-direction: column;
 align-items: center;
 justify-content: center;
 gap: 0.125rem;
",l.disabled=!0),i.appendChild(l)
}
)
}
function m(){
const e=document.getElementById("saunaTimeModal");
e&&(e.classList.add("opacity-0","pointer-events-none"),e.querySelector(".glass-modal").style.transform="scale(0.95)",o=null)
}
document.querySelectorAll(".btn-close-sauna").forEach(e=>{
e.addEventListener("click",m)
}
);
const H=document.getElementById("showSaunaCarouselBtn");
H&&H.addEventListener("click",()=>{
const e=document.getElementById("saunaSection");
e&&(e.classList.remove("hidden"),e.scrollIntoView({
behavior:"smooth"
}
))
}
);
const k=document.getElementById("toggleDemoMenuBtn"),b=document.getElementById("demoMenuPanel"),I=document.getElementById("closeDemoPanelBtn");
k&&b&&k.addEventListener("click",e=>{
e.stopPropagation(),b.classList.toggle("hidden")
}
),I&&b&&I.addEventListener("click",()=>{
b.classList.add("hidden")
}
),document.addEventListener("click",e=>{
b&&!b.classList.contains("hidden")&&!b.contains(e.target)&&e.target!==k&&b.classList.add("hidden")
}
);
function N(e){
if(!e)return;
const t=e.guestName,i=e.cabinName;
if(t&&t!=="Гость"){
const n=document.getElementById("heroTitle");
n&&(n.innerText=`Добро пожаловать, ${
t
}
!`);
const l=document.getElementById("farewellTitle");
l&&(l.innerText=`Благодарим за визит, ${
t
}
!`);
const E=document.getElementById("regModalGuestHeader");
E&&(E.innerText=`${
t
}
, ждём вас!`);
const h=document.getElementById("ormModalTitle");
h&&(h.innerText=`Как прошёл ваш отдых, ${
t
}
?`);
const y=document.getElementById("highRatingBanner");
y&&(y.innerHTML=`<span>🎉</span> Спасибо за высокую оценку, ${
t
}
! Вы сделали наш день!`)
}
if(t||i){
const n=document.getElementById("cartSubtext");
n&&(n.innerText=`${
t||"Гость"
}
 • «${
i||"Домик"
}
» • Доставка 15 мин`)
}

}
const S=JSON.parse(localStorage.getItem("bookingData")||"null");
S&&N(S);
const C=new URLSearchParams(window.location.search),$=C.get("booking");
$?fetch(`/api/booking/${
$
}
`).then(e=>e.json()).then(e=>{
if(e.success&&e.data){
N(e.data);
const{
guestName:t,cabinName:i,arrivalDate:n,departureDate:l
}
=e.data;
localStorage.setItem("bookingData",JSON.stringify(e.data));
const E=new Date,h=E.toISOString().split("T")[0],y=E.getHours();
let v="1";
h<n?v="1":h===n||h>n&&h<l?v="2":h===l?y<12?v="3":v="4":h>l&&(v="4"),B=v,localStorage.setItem("demoStage",B);
const w=document.getElementById("stageSelector");
w&&(w.value=B),q(B,e.data)
}
else T()
}
).catch(e=>{
console.error("Booking fetch error:",e),T()
}
):T();
function T(){
B=C.get("stage")||localStorage.getItem("demoStage")||"1";
const t=document.getElementById("stageSelector");
t&&(t.value=B);
const i=JSON.parse(localStorage.getItem("bookingData")||"null");
q(B,i)
}
function q(e,t){
const i=document.querySelectorAll('[data-id="late-checkout-16"]');
t&&t.canExtend===!1?i.forEach(n=>{
n.style.opacity="0.5",n.style.cursor="not-allowed",n.innerHTML="Продление недоступно",n.onclick=l=>{
l.preventDefault(),l.stopPropagation(),p("К сожалению, ваш домик сегодня забронирован следующими гостями, поэтому продлить проживание не получится.","❌ Продление недоступно")
}
,n.dataset.disabled="true"
}
):i.forEach(n=>{
n.style.opacity="1",n.style.cursor="pointer",n.innerHTML="Продление до 16:00",n.onclick=null,n.dataset.disabled="false"
}
),F(e,j,n=>{
if(n.actionCategory){
const l=document.querySelector(`.tab-btn[data-cat="${
n.actionCategory
}
"]`);
l&&l.click();
const E=document.getElementById("fullCatalogueList");
E&&E.scrollIntoView({
behavior:"smooth"
}
)
}
else n.actionModal?G(n.actionModal):n.actionItem==="late-checkout-16"&&(g.addItem(ae),u("cartDrawer"),p("Поздний выезд до 16:00 добавлен в корзину","⏳ Продление проживания"))
}
,t)
}
stageSelector&&stageSelector.addEventListener("change",()=>{
const e=stageSelector.value;
localStorage.setItem("demoStage",e),b&&b.classList.add("hidden"),stageSelector.blur(),window.location.href=`?stage=${
e
}
`
}
),document.querySelectorAll(".tab-btn").forEach(e=>{
e.addEventListener("click",()=>{
document.querySelectorAll(".tab-btn").forEach(t=>t.classList.remove("active")),e.classList.add("active"),ne=e.dataset.cat,ie(ne)
}
)
}
);
const u=e=>{
const t=document.getElementById(e);
if(!t)return;
t.classList.remove("opacity-0","pointer-events-none");
const i=t.querySelector(".drawer-panel");
i&&(i.style.transform="translateX(0)")
}
,x=e=>{
const t=document.getElementById(e);
if(!t)return;
const i=t.querySelector(".drawer-panel");
i&&(i.style.transform="translateX(100%)"),setTimeout(()=>{
t.classList.add("opacity-0","pointer-events-none")
}
,250)
}
,G=e=>{
const t=document.getElementById(e);
if(!t)return;
t.classList.remove("opacity-0","pointer-events-none");
const i=t.querySelector(".glass-modal");
i&&(i.style.transform="scale(1)")
}
,L=e=>{
const t=document.getElementById(e);
if(!t)return;
const i=t.querySelector(".glass-modal");
i&&(i.style.transform="scale(0.95)"),setTimeout(()=>{
t.classList.add("opacity-0","pointer-events-none")
}
,200)
}
;
document.querySelectorAll(".modal-overlay, .drawer-overlay").forEach(e=>{
e.addEventListener("click",t=>{
if(t.target===e){
const i=e.id;
e.classList.contains("modal-overlay")?L(i):x(i)
}

}
)
}
),document.querySelectorAll(".btn-close-modal-bottom").forEach(e=>{
e.addEventListener("click",()=>{
const t=e.dataset.modal;
t&&L(t)
}
)
}
);
const P=document.getElementById("openCartHeaderBtn"),U=document.getElementById("closeCartBtn");
P&&P.addEventListener("click",()=>u("cartDrawer")),U&&U.addEventListener("click",()=>x("cartDrawer"));
const W=document.getElementById("closeGuideBtn");
W&&W.addEventListener("click",()=>L("guideModal"));
const _=document.getElementById("closeRegBtn");
_&&_.addEventListener("click",()=>L("regModal"));
const J=document.getElementById("closeOrmBtn");
J&&J.addEventListener("click",()=>L("ormModal"));
const V=document.getElementById("submitRegBtn");
V&&V.addEventListener("click",()=>{
var t;
const e=(t=document.getElementById("regPhone"))==null?void 0:t.value;
if(!e||e.trim()===""){
p("Укажите ваш контактный телефон для связи","⚠️ Внимание");
return
}
p("✅ Онлайн-регистрация завершена, Ирина! Пропуск на въезд для вашего автомобиля оформлен.","📋 Добро пожаловать"),L("regModal")
}
);
const K=document.getElementById("copyWifiBtn");
K&&K.addEventListener("click",()=>{
de("11111111").then(()=>{
p("Пароль 11111111 скопирован в буфер обмена","📡 Wi-Fi подключение")
}
).catch(()=>{
p("Пароль Wi-Fi: 11111111","📡 Wi-Fi подключение")
}
)
}
);
const Q=document.querySelectorAll(".hk-star"),A=document.getElementById("hkFeedbackBox"),X=document.getElementById("submitHkBtn");
Q.forEach(e=>{
e.addEventListener("click",()=>{
const t=parseInt(e.dataset.star,10);
Q.forEach(i=>{
parseInt(i.dataset.star,10)<=t?(i.style.color="var(--accent-gold)",i.style.transform="scale(1.15)"):(i.style.color="#4b5563",i.style.transform="scale(1)")
}
),t>=4?(A&&A.classList.add("hidden"),te(),p("🎉 Спасибо за высокую оценку чистоты! Передали благодарность нашей горничной Ладога Парк.","✨ Отличная уборка")):A&&A.classList.remove("hidden")
}
)
}
),X&&X.addEventListener("click",()=>{
var t;
const e=(t=document.getElementById("hkText"))==null?void 0:t.value;
if(!e||e.trim()===""){
p("Напишите, что нам исправить в номере","⚠️ Внимание");
return
}
p("Ваше замечание по уборке отправлено лично управляющему. Сейчас всё исправим!","🙏 Спасибо за сигнал"),A&&A.classList.add("hidden")
}
);
const Y=document.querySelectorAll(".star-btn"),z=document.getElementById("lowRatingForm"),O=document.getElementById("highRatingCard");
Y.forEach(e=>{
e.addEventListener("click",()=>{
const t=parseInt(e.dataset.star,10);
Y.forEach(i=>{
parseInt(i.dataset.star,10)<=t?(i.style.color="var(--accent-gold)",i.style.transform="scale(1.15)"):(i.style.color="#4b5563",i.style.transform="scale(1)")
}
),t>=4?(z&&z.classList.add("hidden"),O&&(O.classList.remove("hidden"),O.classList.add("animate-fade-in")),te(),p("Спасибо за вашу высокую оценку!","🎉 Ладога Парк")):(O&&O.classList.add("hidden"),z&&(z.classList.remove("hidden"),z.classList.add("animate-fade-in")))
}
)
}
);
const Z=document.getElementById("submitFeedbackBtn");
Z&&Z.addEventListener("click",()=>{
var t;
const e=(t=document.getElementById("feedbackText"))==null?void 0:t.value;
if(!e||e.trim()===""){
p("Пожалуйста, напишите пару слов о вашем впечатлении","⚠️ Внимание");
return
}
p("Отзыв отправлен лично управляющему парком. Мы свяжемся с вами!","🙏 Спасибо за помощь"),L("ormModal")
}
);
const ee=document.getElementById("submitOrderBtn");
ee&&ee.addEventListener("click",()=>{
var i;
if(g.getItems().length===0){
p("Сначала добавьте услуги в корзину","🛒 Корзина пуста");
return
}
const e=(i=document.querySelector('input[name="payType"]:checked'))==null?void 0:i.value,t=g.getTotalPrice();
e==="sbp"?p(`Инициирована оплата СБП на сумму ${
t.toLocaleString("ru-RU")
}
 ₽. Электронный чек ОФД сформирован.`,"⚡ Оплата СБП"):p(`Заказ на сумму ${
t.toLocaleString("ru-RU")
}
 ₽ добавлен в ваш фолио TravelLine. Оплата при выезде.`,"🏨 Фолио обновлено"),g.clearCart(),x("cartDrawer")
}
)
}
);

