/* =========================
   DADOS BASE (EDITÁVEL)
   + SUPORTE A OVERRIDE (ADMIN)
   ========================= */

window.STORE_DEFAULT = {
  name: "LP Grill Açaí",
  whatsappTo: "553198832407", // +55 31 9883-2407
  deliveryFee: 5.00,
  eta: "30–60 min",
  hours: "segunda a Sábado até 00:00",
  welcomeMsg: "Olá! Vim pelo cardápio online 😊"
};

window.MENU_DEFAULT = {
  acaisProntos: [
    { id:"ap1", name:"Açaí Tradicional 300ml", desc:"Açaí cremoso + banana + granola (opcional).", price:16.90, badge:"300ml", img:"img/acai_tradicional_300.png" },
    { id:"ap2", name:"Açaí Tradicional 500ml", desc:"O clássico mais pedido. Energia e or.", price:24.90, badge:"500ml", img:"img/acai_tradicional_500.png" },
    { id:"ap3", name:"Açaí Tradicional 700ml", desc:"Para quem quer caprichar de verdade.", price:32.90, badge:"700ml", img:"img/acai_tradicional_700.png" },
    { id:"ap4", name:"Açaí Especial Ninho 500ml", desc:"Leite Ninho + leite condensado (equilíbrio perfeito).", price:29.90, badge:"500ml", img:"img/acai_ninho_500.png" },
    { id:"ap5", name:"Açaí Especial Morango 500ml", desc:"Morango + chantilly (suave e refrescante).", price:29.90, badge:"500ml", img:"img/acai_morango_500.png" },
    { id:"ap6", name:"Açaí Premium Ninho + Nutella 500ml", desc:"Ninho + Nutella + granulado (top da casa).", price:34.90, badge:"500ml", img:"img/acai_premium_500.png" }
  ],

  builder: {
    sizes: [
      { id:"s300", name:"300ml", price:15.90 },
      { id:"s500", name:"500ml", price:23.90 },
      { id:"s700", name:"700ml", price:31.90 },
      { id:"s1l",  name:"1L",   price:44.90 }
    ],
    addons: [
      { id:"ad1", name:"Leite Ninho", price:4.00, img:"img/add_ninho.png" },
      { id:"ad2", name:"Nutella", price:6.00, img:"img/add_nutella.png" },
      { id:"ad3", name:"Paçoca", price:2.50, img:"img/add_pacoca.png" },
      { id:"ad4", name:"Morango", price:4.50, img:"img/add_morango.png" },
      { id:"ad5", name:"Banana", price:3.00, img:"img/add_banana.png" },
      { id:"ad6", name:"Granola", price:2.50, img:"img/add_granola.png" },
      { id:"ad7", name:"Ovomaltine", price:4.50, img:"img/add_ovomaltine.png" },
      { id:"ad8", name:"Confete", price:2.50, img:"img/add_confete.png" },
      { id:"ad9", name:"Castanha", price:4.00, img:"img/add_castanha.png" },
      { id:"ad10", name:"Coco", price:2.50, img:"img/add_coco.png" },
      { id:"ad11", name:"Leite Condensado", price:3.50, img:"img/add_condensado.png" },
      { id:"ad12", name:"Chantilly", price:3.50, img:"img/add_chantilly.png" }
    ]
  },

  combos: [
    { id:"cb1", name:"Combo 2x Açaí 500ml", desc:"Leve 2 açaís de 500ml e pague menos.", price:44.90, badge:"Promo", img:"img/combo_2x500.png" },
    { id:"cb2", name:"Combo Açaí 500ml + Sorvete 300ml", desc:"Perfeito para dividir (ou não 😄).", price:34.90, badge:"Top", img:"img/combo_acai_sorvete.png" },
    { id:"cb3", name:"Combo Família 2x 700ml", desc:"2 copos grandes pra matar a vontade.", price:59.90, badge:"Família", img:"img/combo_familia.png" },
    { id:"cb4", name:"Combo Kids 300ml + 2 adicionais", desc:"Açaí 300ml com 2 adicionais inclusos.", price:22.90, badge:"Kids", img:"img/combo_kids.png" }
  ],

  sorvetes: [
    { id:"sv1", name:"Sorvete Copo 300ml", desc:"Cremoso e bem gelado.", price:14.90, badge:"300ml", img:"img/sorvete_300.png" },
    { id:"sv2", name:"Sorvete Copo 500ml", desc:"Tamanho ideal para matar a vontade.", price:19.90, badge:"500ml", img:"img/sorvete_500.png" },
    { id:"sv3", name:"Sorvete Premium 300ml", desc:"Com calda + granulado.", price:17.90, badge:"Premium", img:"img/sorvete_premium.png" },
    { id:"sv4", name:"Milkshake 500ml", desc:"Cremoso e potente.", price:22.90, badge:"500ml", img:"img/milkshake_500.png" }
  ],

  vitaminas: [
    { id:"vt1", name:"Vitamina de Banana 500ml", desc:"Banana + leite (bem gelada).", price:14.90, badge:"500ml", img:"img/vit_banana.png" },
    { id:"vt2", name:"Vitamina de Morango 500ml", desc:"Morango + leite (suave).", price:16.90, badge:"500ml", img:"img/vit_morango.png" },
    { id:"vt3", name:"Vitamina de Abacate 500ml", desc:"Abacate + leite (energia).", price:17.90, badge:"500ml", img:"img/vit_abacate.png" },
    { id:"vt4", name:"Vitamina Mista 500ml", desc:"Banana + morango (queridinha).", price:18.90, badge:"500ml", img:"img/vit_mista.png" }
  ]
};

/* ============ OVERRIDES (ADMIN) ============ */
const STORE_KEY = "store_override_v1";
const MENU_KEY  = "menu_override_v1";

function safeParse(raw, fallback){
  try{ return raw ? JSON.parse(raw) : fallback; }catch(e){ return fallback; }
}

function mergeById(baseArr, overrideArr){
  const map = new Map();
  (overrideArr || []).forEach(o => map.set(o.id, o));
  return (baseArr || []).map(b => map.has(b.id) ? { ...b, ...map.get(b.id) } : b);
}

function loadStore(){
  const o = safeParse(localStorage.getItem(STORE_KEY), {});
  window.STORE = { ...window.STORE_DEFAULT, ...o };
}
function loadMenu(){
  const o = safeParse(localStorage.getItem(MENU_KEY), {});
  const base = window.MENU_DEFAULT;

  window.MENU = {
    acaisProntos: mergeById(base.acaisProntos, o.acaisProntos),
    builder: {
      sizes: mergeById(base.builder.sizes, o.builder?.sizes),
      addons: mergeById(base.builder.addons, o.builder?.addons),
    },
    combos: mergeById(base.combos, o.combos),
    sorvetes: mergeById(base.sorvetes, o.sorvetes),
    vitaminas: mergeById(base.vitaminas, o.vitaminas),
  };
}

/* Carrega já */
loadStore();
loadMenu();

/* Expor para admin */
window.__ADMIN = {
  STORE_KEY, MENU_KEY,
  saveStoreOverride(obj){ localStorage.setItem(STORE_KEY, JSON.stringify(obj || {})); loadStore(); },
  saveMenuOverride(obj){ localStorage.setItem(MENU_KEY, JSON.stringify(obj || {})); loadMenu(); },
  resetAll(){ localStorage.removeItem(STORE_KEY); localStorage.removeItem(MENU_KEY); loadStore(); loadMenu(); }
};

