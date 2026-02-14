/* =========================
   APP (render + páginas + checkout + admin)
   ========================= */

(function init(){
  renderInfoBar();

  const sn = document.getElementById("storeName");
  if(sn) sn.textContent = window.STORE?.name || "Açaí";

  const wa = document.getElementById("waFloat");
  if(wa){
    const to = window.STORE?.whatsappTo || "553198832407";
    const msg = encodeURIComponent(window.STORE?.welcomeMsg || "Olá! Vim pelo cardápio online 😊");
    wa.href = `https://wa.me/${to}?text=${msg}`;
    wa.target = "_blank";
    wa.rel = "noopener";
  }

  const hs = document.getElementById("homeSearch");
  const hg = document.getElementById("homeGrid");
  if(hs && hg){
    hs.addEventListener("input", ()=>{
      const q = (hs.value||"").toLowerCase().trim();
      hg.querySelectorAll("[data-key]").forEach(a=>{
        const key = (a.getAttribute("data-key")||"").toLowerCase();
        a.style.display = (!q || key.includes(q)) ? "" : "none";
      });
    });
  }

  bindCartUI();
  renderCartEverywhere();

  if(document.getElementById("listAcaisProntos")){
    renderProducts("listAcaisProntos", window.MENU.acaisProntos, "PRONTO");
  }
  if(document.getElementById("listCombos")){
    renderProducts("listCombos", window.MENU.combos, "COMBO");
  }
  if(document.getElementById("listSorvetes")){
    renderProducts("listSorvetes", window.MENU.sorvetes, "SORVETE");
  }
  if(document.getElementById("listVitaminas")){
    renderProducts("listVitaminas", window.MENU.vitaminas, "VITAMINA");
  }

  if(document.getElementById("sizes") && document.getElementById("addons")){
    renderBuilder();
  }

  if(document.getElementById("checkoutItems")){
    renderCheckoutSummary();
    bindCheckout();
  }

  if(document.getElementById("adminList")){
    renderAdmin();
  }
})();

/* =========================
   INFO BAR (todas páginas)
   ========================= */
function renderInfoBar(){
  const el = document.getElementById("infoBar");
  if(!el) return;

  const mode = (typeof getDeliveryMode === "function") ? getDeliveryMode() : "entrega";
  const fee = (typeof getDeliveryFee === "function") ? getDeliveryFee() : (window.STORE?.deliveryFee ?? 5);

  el.innerHTML = `
    <div class="cover-info">
      <div class="pill">🚚 ${mode === "retirar" ? "<strong>Retirar na loja</strong> (taxa R$ 0,00)" : `Taxa: <strong>${brl(fee)}</strong>`}</div>
      <div class="pill">⏱️ Tempo: <strong>${escapeHtml(window.STORE?.eta || "30–60 min")}</strong></div>
      <div class="pill">🕛 <strong>${escapeHtml(window.STORE?.hours || "Sábado até 00:00")}</strong></div>
    </div>
  `;
}

/* =========================
   RENDER PRODUTOS
   ========================= */
function renderProducts(targetId, arr, type){
  const el = document.getElementById(targetId);
  el.innerHTML = arr.map(p => `
    <article class="product">
      <img class="pimg" src="${p.img}" alt="${escapeHtml(p.name)}" onerror="this.src='img/placeholder.png'">
      <div class="pbody">
        <div class="ptitle">
          <div style="min-width:0">
            <strong>${escapeHtml(p.name)}</strong>
          </div>
          <div class="price">${brl(p.price)}</div>
        </div>
        <div class="pdesc">${escapeHtml(p.desc)}</div>
        <div class="pmeta">
          <span class="badge">${escapeHtml(p.badge || type)}</span>
          <button class="btn primary" data-add="${escapeAttr(p.id)}" data-type="${escapeAttr(type)}" type="button">
            + Adicionar
          </button>
        </div>
      </div>
    </article>
  `).join("");

  el.querySelectorAll("[data-add]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.getAttribute("data-add");
      const t = btn.getAttribute("data-type");
      const prod = arr.find(x => x.id === id);
      if(!prod) return;

      addToCart({
        key: `${t}:${prod.id}`,
        name: prod.name,
        desc: prod.badge ? `${prod.badge} • ${prod.desc}` : prod.desc,
        price: Number(prod.price || 0)
      });

      btn.textContent = "✓ Adicionado";
      setTimeout(()=> btn.textContent = "+ Adicionar", 850);
    });
  });
}

/* =========================
   BUILDER (Monte seu Açaí)
   ========================= */
let builderState = { size:null, addons:new Set() };

function renderBuilder(){
  const sizesEl = document.getElementById("sizes");
  const addonsEl = document.getElementById("addons");
  const totalEl = document.getElementById("builderTotal");
  const addBtn = document.getElementById("addCustom");

  const sizes = window.MENU.builder.sizes;
  const addons = window.MENU.builder.addons;

   // ✅ TAMANHOS (RADIO) - FUNCIONA EM QUALQUER CELULAR
  sizesEl.innerHTML = sizes.map(s => `
    <label class="size-opt">
      <input class="size-radio" type="radio" name="acaiSize" value="${escapeAttr(s.id)}">
      <span class="size-box" aria-hidden="true"></span>
      <span class="size-text">
        <span class="size-name">${escapeHtml(s.name)}</span>
        <span class="size-price">${brl(s.price)}</span>
      </span>
    </label>
  `).join("");

  // evento por DELEGAÇÃO (mais forte que add em cada item)
  sizesEl.addEventListener("change", (e)=>{
    const radio = e.target.closest?.(".size-radio");
    if(!radio) return;
    builderState.size = radio.value;
    updateBuilderTotal();
  });

    // ✅ pega no celular e no PC
    c.addEventListener("pointerdown", handler, {passive:false});
    c.addEventListener("click", handler);
  });

  addonsEl.innerHTML = addons.map(a => `
    <label class="addon">
      <img src="${a.img}" alt="${escapeHtml(a.name)}" onerror="this.src='img/placeholder.png'">
      <span class="ainfo">
        <span class="aname">${escapeHtml(a.name)}</span>
        <span class="aprice">+ ${brl(a.price)}</span>
      </span>
      <input type="checkbox" data-addon="${escapeAttr(a.id)}">
    </label>
  `).join("");

  addonsEl.querySelectorAll("[data-addon]").forEach(ch=>{
    ch.addEventListener("change", ()=>{
      const id = ch.getAttribute("data-addon");
      if(ch.checked) builderState.addons.add(id);
      else builderState.addons.delete(id);
      updateBuilderTotal();
    });
  });

  function updateBuilderTotal(){
    const sizeObj = sizes.find(s => s.id === builderState.size);
    const base = sizeObj ? Number(sizeObj.price||0) : 0;

    let adds = 0;
    const addNames = [];

    builderState.addons.forEach(id=>{
      const a = addons.find(x => x.id === id);
      if(a){
        adds += Number(a.price||0);
        addNames.push(a.name);
      }
    });

    const total = base + adds;
    totalEl.textContent = brl(total);

    addBtn.disabled = !sizeObj;

    addBtn.onclick = ()=>{
      if(!sizeObj) return;

      const desc = [
        `Tamanho: ${sizeObj.name}`,
        addNames.length ? `Adicionais: ${addNames.join(", ")}` : "Adicionais: nenhum"
      ].join(" | ");

      addToCart({
        key: `CUSTOM:${sizeObj.id}:${Array.from(builderState.addons).sort().join("-") || "none"}`,
        name: `Monte seu Açaí (${sizeObj.name})`,
        desc,
        price: total
      });

      builderState.addons = new Set();
      builderState.size = null;
      sizesEl.querySelectorAll(".choice").forEach(x=> x.classList.remove("active"));
      addonsEl.querySelectorAll("input[type=checkbox]").forEach(x=> x.checked = false);
      totalEl.textContent = brl(0);
      addBtn.disabled = true;

      addBtn.textContent = "✓ Adicionado";
      setTimeout(()=> addBtn.textContent = "Adicionar ao carrinho", 900);
    };
  }

  updateBuilderTotal();
}

/* =========================
   CHECKOUT (Finalizar)
   ========================= */
function spoonFeeValue(v){
  return (v === "reforcada") ? 1.00 : 0.00;
}
function spoonLabel(v){
  if(v === "descartavel") return "Descartável";
  if(v === "sem") return "Sem colher";
  if(v === "reforcada") return "Reforçada (+1,00)";
  return "-";
}
function money(v){ return (v||0).toFixed(2).replace(".", ","); }
function trunc(s, n){ s = String(s||""); return s.length > n ? s.slice(0, n-1) + "…" : s; }

function renderCheckoutSummary(){
  const items = loadCart();
  const list = document.getElementById("checkoutItems");

  if(list){
    if(items.length === 0){
      list.innerHTML = `<div class="muted">Seu carrinho está vazio. Volte ao menu e adicione itens.</div>`;
    }else{
      list.innerHTML = items.map(i => `
        <div class="itemline">
          <div class="left">
            <strong>${escapeHtml(i.name)} <span class="muted">x${i.qty}</span></strong>
            ${i.desc ? `<div class="mini muted">${escapeHtml(i.desc)}</div>` : ""}
            ${i.note ? `<div class="mini muted"><strong>Obs:</strong> ${escapeHtml(i.note)}</div>` : ""}
          </div>
          <strong>${brl(i.price * i.qty)}</strong>
        </div>
      `).join("");
    }
  }

  const subX = document.getElementById("subTotalX");
  const feeX = document.getElementById("deliveryFeeX");
  const spoonX = document.getElementById("spoonFeeX");
  const totX = document.getElementById("grandTotalX");
  const etaT = document.getElementById("etaText");
  if(etaT) etaT.textContent = window.STORE?.eta || "30–60 min";

  const fee = getDeliveryFee();
  const subtotal = cartSubtotal(items);

  if(subX) subX.textContent = brl(subtotal);
  if(feeX) feeX.textContent = brl(fee);
  if(spoonX) spoonX.textContent = brl(0);
  if(totX) totX.textContent = brl(subtotal + fee);

  renderDeliveryButtons();
  renderStickyCTA();
  renderInfoBar();
}

function bindCheckout(){
  const btnCopy = document.getElementById("copyOrder");
  const btnSend = document.getElementById("sendWhats");
  const hint = document.getElementById("formHint");

  const deliveryFields = document.getElementById("deliveryFields");
  const retirarHint = document.getElementById("retirarHint");
  const addrReq = document.getElementById("addrReq");
  const refReq = document.getElementById("refReq");

  const f = {
    name: document.getElementById("cName"),
    whats: document.getElementById("cWhats"),
    address: document.getElementById("cAddress"),
    ref: document.getElementById("cRef"),
    pay: document.getElementById("cPay"),
    spoon: document.getElementById("cSpoon"),
    obs: document.getElementById("cObs"),
  };

  function isRetirar(){
    return getDeliveryMode() === "retirar";
  }

  function syncDeliveryVisibility(){
    const retirar = isRetirar();

    // some campos quando retirar
    if(deliveryFields) deliveryFields.style.display = retirar ? "none" : "block";
    if(retirarHint) retirarHint.style.display = retirar ? "block" : "none";
    if(addrReq) addrReq.textContent = retirar ? "" : "*";
    if(refReq) refReq.textContent = retirar ? "" : "*";
  }

  function updateTotalsWithSpoon(){
    const items = loadCart();
    const fee = getDeliveryFee();
    const sp = spoonFeeValue(f.spoon.value);
    const subtotal = cartSubtotal(items);

    const spoonX = document.getElementById("spoonFeeX");
    const totX = document.getElementById("grandTotalX");
    if(spoonX) spoonX.textContent = brl(sp);
    if(totX) totX.textContent = brl(subtotal + fee + sp);

    renderStickyCTA();
  }

  function validate(){
    const items = loadCart();
    const retirar = isRetirar();

    const okBase =
      items.length > 0 &&
      f.name.value.trim() &&
      f.whats.value.trim() &&
      f.pay.value.trim() &&
      f.spoon.value.trim();

    const okEndereco = retirar
      ? true
      : (f.address.value.trim() && f.ref.value.trim());

    const ok = okBase && okEndereco;

    if(hint){
      hint.style.color = ok ? "#16a34a" : "";
      hint.textContent = ok
        ? "✅ Pronto! Pode copiar ou enviar no WhatsApp."
        : "* Só envia se estiver tudo preenchido e com itens no carrinho.";
    }
    return !!ok;
  }

  Object.values(f).forEach(el=>{
    if(!el) return;
    el.addEventListener("input", ()=>{ validate(); updateTotalsWithSpoon(); });
    el.addEventListener("change", ()=>{ validate(); updateTotalsWithSpoon(); });
  });

  function buildReceiptText(){
    const items = loadCart();
    const fee = getDeliveryFee();
    const mode = getDeliveryMode();
    const sp = spoonFeeValue(f.spoon.value);

    const lines = [];
    lines.push("= PEDIDO - CARDÁPIO =");
    lines.push((window.STORE?.name || "LOJA").toUpperCase());
    lines.push("---------------------");
    lines.push(`Modo: ${mode === "retirar" ? "RETIRAR NA LOJA" : "ENTREGA"}`);
    lines.push(`Cliente: ${f.name.value.trim()}`);
    lines.push(`Whats: ${f.whats.value.trim()}`);
    if(mode !== "retirar"){
      lines.push(`End.: ${f.address.value.trim()}`);
      lines.push(`Ref.: ${f.ref.value.trim()}`);
    }
    lines.push("---------------------");
    lines.push("ITENS:");
    items.forEach(i=>{
      lines.push(trunc(`${i.qty}x ${i.name}`, 28));
      if(i.note) lines.push("  " + trunc(`Obs: ${i.note}`, 28));
      lines.push("  " + trunc(`R$ ${money(i.price * i.qty)}`, 28));
    });
    lines.push("---------------------");
    lines.push(`Subtotal: R$ ${money(cartSubtotal(items))}`);
    lines.push(`Taxa:     R$ ${money(fee)}`);
    if(sp > 0) lines.push(`Colher:   R$ ${money(sp)}`);
    lines.push(`TOTAL:    R$ ${money(cartSubtotal(items) + fee + sp)}`);
    lines.push("---------------------");
    lines.push(`Pagamento: ${f.pay.value}`);
    lines.push(`Colher: ${spoonLabel(f.spoon.value)}`);
    lines.push(`Tempo: ${window.STORE?.eta || "30–60 min"}`);
    if(f.obs.value.trim()){
      lines.push("---------------------");
      lines.push("OBS (GERAL):");
      lines.push(trunc(f.obs.value.trim(), 28));
    }
    lines.push("---------------------");
    lines.push("Enviado via Cardápio Online");
    return lines.join("\n");
  }

  btnCopy?.addEventListener("click", async ()=>{
    if(!validate()) return;
    const text = buildReceiptText();
    try{
      await navigator.clipboard.writeText(text);
      btnCopy.textContent = "✓ Copiado";
      setTimeout(()=> btnCopy.textContent = "Copiar pedido", 1000);
    }catch(e){
      alert("Não consegui copiar automaticamente. Selecione e copie:\n\n" + text);
    }
  });

  btnSend?.addEventListener("click", ()=>{
    if(!validate()) return;
    const to = window.STORE?.whatsappTo || "553198832407";
    const text = encodeURIComponent(buildReceiptText());
    window.open(`https://wa.me/${to}?text=${text}`, "_blank", "noopener");
  });

  // Toggle entrega/retirar na tela finalizar
  const eBtn = document.getElementById("modeEntrega");
  const rBtn = document.getElementById("modeRetirar");
  if(eBtn && rBtn){
    eBtn.onclick = ()=>{ setDeliveryMode("entrega"); renderCheckoutSummary(); syncDeliveryVisibility(); validate(); updateTotalsWithSpoon(); };
    rBtn.onclick = ()=>{ setDeliveryMode("retirar"); renderCheckoutSummary(); syncDeliveryVisibility(); validate(); updateTotalsWithSpoon(); };
  }

  // estado inicial correto
  syncDeliveryVisibility();
  validate();
  updateTotalsWithSpoon();
}

/* =========================
   ADMIN
   ========================= */
function renderAdmin(){
  const aStoreName = document.getElementById("aStoreName");
  const aFee = document.getElementById("aFee");
  const aEta = document.getElementById("aEta");
  const aHours = document.getElementById("aHours");

  aStoreName.value = window.STORE?.name || "";
  aFee.value = String(window.STORE?.deliveryFee ?? 5);
  aEta.value = window.STORE?.eta || "";
  aHours.value = window.STORE?.hours || "";

  document.getElementById("saveStore").onclick = ()=>{
    window.__ADMIN.saveStoreOverride({
      name: aStoreName.value.trim() || window.STORE_DEFAULT.name,
      deliveryFee: Number(aFee.value || 0),
      eta: aEta.value.trim() || window.STORE_DEFAULT.eta,
      hours: aHours.value.trim() || window.STORE_DEFAULT.hours
    });
    alert("Configurações salvas neste aparelho.");
    renderInfoBar();
  };

  document.getElementById("resetAll").onclick = ()=>{
    if(!confirm("Resetar TUDO (configurações e produtos)?")) return;
    window.__ADMIN.resetAll();
    location.reload();
  };

  const adminList = document.getElementById("adminList");

  const groups = [
    { key:"acaisProntos", title:"Açaís Prontos", items: window.MENU.acaisProntos },
    { key:"combos", title:"Combos", items: window.MENU.combos },
    { key:"sorvetes", title:"Sorvetes", items: window.MENU.sorvetes },
    { key:"vitaminas", title:"Vitaminas", items: window.MENU.vitaminas },
  ];

  adminList.innerHTML = groups.map(g => `
    <div class="admin-item">
      <div class="head"><strong>${escapeHtml(g.title)}</strong><span class="muted mini">${g.items.length} itens</span></div>
      <div class="admin-list-inner">
        ${g.items.map(p => `
          <div class="admin-item">
            <div class="head">
              <strong>${escapeHtml(p.id)} • ${escapeHtml(p.badge || "")}</strong>
              <span class="muted mini">${brl(p.price)}</span>
            </div>
            <div class="grid">
              <input data-g="${g.key}" data-id="${p.id}" data-f="name" value="${escapeAttr(p.name)}" placeholder="Nome" />
              <input data-g="${g.key}" data-id="${p.id}" data-f="price" value="${escapeAttr(p.price)}" placeholder="Preço" />
              <textarea data-g="${g.key}" data-id="${p.id}" data-f="desc" placeholder="Descrição">${escapeHtml(p.desc)}</textarea>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");

  function collect(){
    const inputs = adminList.querySelectorAll("[data-g][data-id][data-f]");
    const map = new Map();
    inputs.forEach(el=>{
      const g = el.getAttribute("data-g");
      const id = el.getAttribute("data-id");
      const f = el.getAttribute("data-f");
      const k = `${g}:${id}`;
      if(!map.has(k)) map.set(k, { id });
      const obj = map.get(k);
      if(f === "price") obj.price = Number(String(el.value).replace(",", "."));
      else obj[f] = String(el.value || "");
      obj.__group = g;
    });

    const out = { acaisProntos:[], combos:[], sorvetes:[], vitaminas:[], builder:{ sizes:[], addons:[] } };
    map.forEach(v=>{
      const g = v.__group; delete v.__group;
      if(out[g]) out[g].push(v);
    });
    return out;
  }

  document.getElementById("saveMenu").onclick = ()=>{
    const out = collect();
    window.__ADMIN.saveMenuOverride(out);
    alert("Produtos salvos neste aparelho.");
  };

  document.getElementById("resetMenu").onclick = ()=>{
    if(!confirm("Resetar produtos (voltar padrão)?")) return;
    localStorage.removeItem(window.__ADMIN.MENU_KEY);
    alert("Produtos resetados. Recarregando...");
    location.reload();
  };
}

/* =========================
   Helpers
   ========================= */
function escapeHtml(s){ return String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function escapeAttr(s){ return escapeHtml(s).replace(/"/g,'&quot;'); }
