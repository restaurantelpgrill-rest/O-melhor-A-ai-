/* =========================
   CARRINHO + ENTREGA/RETIRAR + NOTAS POR ITEM
   ========================= */

const CART_KEY = "acai_cart_v2";
const MODE_KEY = "delivery_mode_v1"; // "entrega" | "retirar"

function brl(v){
  return (v || 0).toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
}

function loadCart(){
  try{
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    return [];
  }
}
function saveCart(items){
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function getDeliveryMode(){
  return localStorage.getItem(MODE_KEY) || "entrega";
}
function setDeliveryMode(mode){
  localStorage.setItem(MODE_KEY, mode);
  renderCartEverywhere();
}

function getDeliveryFee(){
  const mode = getDeliveryMode();
  const fee = window.STORE?.deliveryFee ?? 5;
  return mode === "retirar" ? 0 : fee;
}

function cartCount(items){
  return items.reduce((a,i)=> a + (i.qty||1), 0);
}
function cartSubtotal(items){
  return items.reduce((a,i)=> a + (i.price*(i.qty||1)), 0);
}
function cartTotal(items){
  return cartSubtotal(items) + getDeliveryFee();
}

function findItemIndex(items, key){
  return items.findIndex(i => i.key === key);
}

function addToCart(item){
  const items = loadCart();
  const idx = findItemIndex(items, item.key);
  if(idx >= 0){
    items[idx].qty += 1;
  }else{
    items.push({ note:"", qty:1, ...item });
  }
  saveCart(items);
  renderCartEverywhere();
}

function setQty(key, qty){
  const items = loadCart();
  const idx = findItemIndex(items, key);
  if(idx < 0) return;
  items[idx].qty = Math.max(1, qty|0);
  saveCart(items);
  renderCartEverywhere();
}

function setNote(key, note){
  const items = loadCart();
  const idx = findItemIndex(items, key);
  if(idx < 0) return;
  items[idx].note = String(note || "").slice(0, 180);
  saveCart(items);
  // não precisa rerender geral a cada tecla, mas atualiza totais/cta
  renderStickyCTA();
}

function removeItem(key){
  const items = loadCart().filter(i => i.key !== key);
  saveCart(items);
  renderCartEverywhere();
}

function clearCart(){
  saveCart([]);
  renderCartEverywhere();
}

/* Drawer */
function renderCartDrawer(){
  const items = loadCart();

  const countEl = document.getElementById("cartCount");
  if(countEl) countEl.textContent = String(cartCount(items));

  const etaText = document.getElementById("etaText");
  if(etaText) etaText.textContent = window.STORE?.eta || "30–60 min";

  const listEl = document.getElementById("cartItems");
  if(listEl){
    if(items.length === 0){
      listEl.innerHTML = `<div class="muted">Seu carrinho está vazio.</div>`;
    }else{
      listEl.innerHTML = items.map(i => `
        <div class="citem">
          <div class="citem-top">
            <div style="min-width:0">
              <div class="cname">${escapeHtml(i.name)}</div>
              ${i.desc ? `<div class="cdesc">${escapeHtml(i.desc)}</div>` : ""}
            </div>
            <strong class="price">${brl(i.price)}</strong>
          </div>

          <div class="ccontrols">
            <div class="qty">
              <button class="qbtn" data-act="dec" data-key="${escapeAttr(i.key)}">−</button>
              <strong>${i.qty}</strong>
              <button class="qbtn" data-act="inc" data-key="${escapeAttr(i.key)}">+</button>
            </div>
            <button class="qbtn remove" data-act="rm" data-key="${escapeAttr(i.key)}">Remover</button>
          </div>

          <div class="note">
            <label>Obs do item</label>
            <textarea data-note="${escapeAttr(i.key)}" placeholder="Ex: sem granola, pouco leite condensado...">${escapeHtml(i.note || "")}</textarea>
          </div>
        </div>
      `).join("");
    }

    listEl.querySelectorAll("[data-act]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const key = btn.getAttribute("data-key");
        const act = btn.getAttribute("data-act");
        const cur = loadCart().find(x => x.key === key);
        if(!cur) return;
        if(act === "inc") setQty(key, cur.qty + 1);
        if(act === "dec") setQty(key, cur.qty - 1);
        if(act === "rm") removeItem(key);
      });
    });

    listEl.querySelectorAll("[data-note]").forEach(tx=>{
      tx.addEventListener("input", ()=>{
        const key = tx.getAttribute("data-note");
        setNote(key, tx.value);
      });
    });
  }

  const subEl = document.getElementById("subTotal");
  const feeEl = document.getElementById("deliveryFee");
  const totEl = document.getElementById("grandTotal");

  if(subEl) subEl.textContent = brl(cartSubtotal(items));
  if(feeEl) feeEl.textContent = brl(getDeliveryFee());
  if(totEl) totEl.textContent = brl(cartTotal(items));

  renderDeliveryButtons();
  renderStickyCTA();
}

function renderDeliveryButtons(){
  const mode = getDeliveryMode();

  // alguns HTMLs usam ids modeEntrega/modeRetirar
  const e1 = document.getElementById("modeEntrega");
  const r1 = document.getElementById("modeRetirar");

  // finalizar.html drawer usa ids diferentes
  const e2 = document.getElementById("modeEntregaDrawer");
  const r2 = document.getElementById("modeRetirarDrawer");

  const allE = [e1, e2].filter(Boolean);
  const allR = [r1, r2].filter(Boolean);

  allE.forEach(b=>{
    b.classList.toggle("active", mode === "entrega");
    b.onclick = ()=> setDeliveryMode("entrega");
  });
  allR.forEach(b=>{
    b.classList.toggle("active", mode === "retirar");
    b.onclick = ()=> setDeliveryMode("retirar");
  });
}

function openCart(){
  const d = document.getElementById("cartDrawer");
  if(!d) return;
  d.classList.add("open");
  d.setAttribute("aria-hidden","false");
  renderCartDrawer();
}
function closeCart(){
  const d = document.getElementById("cartDrawer");
  if(!d) return;
  d.classList.remove("open");
  d.setAttribute("aria-hidden","true");
}

function bindCartUI(){
  const openBtn = document.getElementById("openCart");
  const closeBtn = document.getElementById("closeCart");
  const backdrop = document.getElementById("closeCartBackdrop");
  const clearBtn = document.getElementById("clearCart");

  if(openBtn) openBtn.addEventListener("click", openCart);
  if(closeBtn) closeBtn.addEventListener("click", closeCart);
  if(backdrop) backdrop.addEventListener("click", closeCart);
  if(clearBtn) clearBtn.addEventListener("click", clearCart);

  // CTA abre carrinho
  const ctaBtn = document.getElementById("ctaOpenCart");
  if(ctaBtn) ctaBtn.addEventListener("click", openCart);

  document.addEventListener("keydown", (e)=>{
    if(e.key === "Escape") closeCart();
  });
}

function renderStickyCTA(){
  const bar = document.getElementById("stickyCTA");
  if(!bar) return;

  const items = loadCart();
  const show = items.length > 0;
  bar.hidden = !show;

  const t = document.getElementById("ctaTotal");
  if(t) t.textContent = brl(cartTotal(items));
}

function renderCartEverywhere(){
  renderCartDrawer();
  // checkout totals (se existir)
  if(typeof renderCheckoutSummary === "function") renderCheckoutSummary();
  if(typeof renderInfoBar === "function") renderInfoBar();
}

/* util anti XSS básico */
function escapeHtml(s){ return String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function escapeAttr(s){ return escapeHtml(s).replace(/"/g,'&quot;'); }

