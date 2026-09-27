/*
  OWNER SETUP: change the values in this one object to personalise the shop.
  WhatsApp number: include country code, digits only (for India use 91XXXXXXXXXX).
*/
const shopConfig = {
  shopName: 'Shree Ganesh Crackers',
  whatsappNumber: '919876543210', // Replace with the shop owner's WhatsApp number.
  phone: '+91 98765 43210',
  address: 'Main Market Road, Pune, Maharashtra',
  email: 'hello@shreeganeshcrackers.com',
  businessHours: 'Mon–Sun · 9:00 AM – 9:00 PM'
};

// OWNER SETUP: edit, remove, or add products here. Images live in the images folder.
const products = [
  { id: 1, name: 'Golden Flower Pots', price: 150, category: 'Flower Pots', image: 'images/flower-pots.svg', description: 'A colourful golden fountain for a bright celebration.' },
  { id: 2, name: 'Classic Sparklers', price: 100, category: 'Sparklers', image: 'images/sparklers.svg', description: 'A hand-held sparkle made for festive memories.' },
  { id: 3, name: 'Sky Rockets', price: 200, category: 'Rockets', image: 'images/rockets.svg', description: 'A sky-bound burst of colour for open celebrations.' },
  { id: 4, name: 'Rainbow Chakri', price: 80, category: 'Ground Crackers', image: 'images/chakri.svg', description: 'A whirling, colourful ground spinner.' },
  { id: 5, name: 'Ground Spinners', price: 120, category: 'Ground Crackers', image: 'images/spinners.svg', description: 'A lively set of spinning festive lights.' },
  { id: 6, name: 'Atom Bombs', price: 130, category: 'Fancy Crackers', image: 'images/atom-bombs.svg', description: 'A classic celebration sound-effect assortment.' },
  { id: 7, name: 'Fancy Fountain', price: 250, category: 'Fancy Crackers', image: 'images/fancy-fountain.svg', description: 'An elegant fountain with a multi-colour effect.' },
  { id: 8, name: 'Festive Gift Box', price: 499, category: 'Combo Packs', image: 'images/gift-box.svg', description: 'A ready-to-gift selection of celebration favourites.' },
  { id: 9, name: 'Family Celebration Combo', price: 999, category: 'Combo Packs', image: 'images/family-combo.svg', description: 'A generous mix designed for a family celebration.' },
  { id: 10, name: 'Kids Sparkle Combo', price: 399, category: 'Combo Packs', image: 'images/kids-combo.svg', description: 'A cheerful assortment for supervised family fun.' }
];

const categories = ['All', 'Sparklers', 'Rockets', 'Flower Pots', 'Ground Crackers', 'Fancy Crackers', 'Combo Packs'];
const categoryIcons = { All: '✦', Sparklers: '✨', Rockets: '🚀', 'Flower Pots': '🎇', 'Ground Crackers': '🌀', 'Fancy Crackers': '🎆', 'Combo Packs': '🎁' };
let activeCategory = 'All';
let searchTerm = '';
let modalQuantity = 1;
let selectedProductId = null;
let activeOrder = null;

// localStorage keeps the cart after a page refresh.
let cart = JSON.parse(localStorage.getItem('shreeGaneshCart') || '[]');
const money = amount => `₹${Number(amount).toLocaleString('en-IN')}`;
const byId = id => document.getElementById(id);
const productById = id => products.find(product => product.id === Number(id));

function saveCart() { localStorage.setItem('shreeGaneshCart', JSON.stringify(cart)); }
function totalItems() { return cart.reduce((sum, item) => sum + item.quantity, 0); }
function cartTotal() { return cart.reduce((sum, item) => sum + productById(item.id).price * item.quantity, 0); }

function applyShopConfiguration() {
  document.querySelectorAll('[data-shop-name]').forEach(el => el.textContent = shopConfig.shopName);
  document.querySelectorAll('[data-shop-address]').forEach(el => el.textContent = shopConfig.address);
  document.querySelectorAll('[data-shop-hours]').forEach(el => el.textContent = shopConfig.businessHours);
  byId('phoneLink').textContent = shopConfig.phone;
  byId('phoneLink').href = `tel:${shopConfig.phone.replace(/[^+\d]/g, '')}`;
  byId('contactWhatsapp').href = `https://wa.me/${shopConfig.whatsappNumber}?text=${encodeURIComponent(`Hello ${shopConfig.shopName}, I would like to know more about your products.`)}`;
  byId('year').textContent = new Date().getFullYear();
}

function renderCategories() {
  byId('categoryGrid').innerHTML = categories.map(category => `<button class="category-card ${category === activeCategory ? 'active' : ''}" data-category="${category}"><span class="category-icon">${categoryIcons[category]}</span><strong>${category}</strong></button>`).join('');
  byId('filterRow').innerHTML = categories.map(category => `<button class="filter-btn ${category === activeCategory ? 'active' : ''}" data-category="${category}">${category}</button>`).join('');
}

// Renders cards based on the chosen category and the search field.
function renderProducts() {
  const visibleProducts = products.filter(product => (activeCategory === 'All' || product.category === activeCategory) && product.name.toLowerCase().includes(searchTerm.toLowerCase()));
  byId('productCount').textContent = `${visibleProducts.length} product${visibleProducts.length === 1 ? '' : 's'} found`;
  byId('productGrid').innerHTML = visibleProducts.length ? visibleProducts.map(product => `
    <article class="product-card"><button class="product-image-wrap" data-details="${product.id}" aria-label="View ${product.name} details"><img src="${product.image}" alt="${product.name}" /></button>
      <div class="product-body"><span class="product-meta">${product.category}</span><h3 class="product-name" data-details="${product.id}">${product.name}</h3><p class="product-description">${product.description}</p>
        <div class="product-bottom"><span class="price">${money(product.price)}</span><div class="card-add-row"><div class="card-quantity"><button data-card-quantity="-1" data-card-id="${product.id}" aria-label="Decrease ${product.name}">−</button><span class="card-quantity-value">1</span><button data-card-quantity="1" data-card-id="${product.id}" aria-label="Increase ${product.name}">+</button></div><button class="add-product" data-add="${product.id}">Add</button></div></div></div>
    </article>`).join('') : '<div class="empty-cart"><strong>No crackers found.</strong><br>Try another search or category.</div>';
}

// Adds an item, or increases it if it is already in the cart.
function addToCart(id, quantity = 1) {
  const cartItem = cart.find(item => item.id === Number(id));
  if (cartItem) cartItem.quantity += quantity; else cart.push({ id: Number(id), quantity });
  saveCart(); renderCart(); showToast('Added to your cart');
}
// Product-card controls let a customer choose how many to add in one action.
function changeCardQuantity(button, amount) {
  const value = button.parentElement.querySelector('.card-quantity-value');
  value.textContent = Math.max(1, Number(value.textContent) + amount);
}

// Changes cart quantity. Zero removes the item.
function changeCartQuantity(id, amount) {
  const item = cart.find(cartItem => cartItem.id === Number(id));
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) cart = cart.filter(cartItem => cartItem.id !== Number(id));
  saveCart(); renderCart();
}
function removeFromCart(id) { cart = cart.filter(item => item.id !== Number(id)); saveCart(); renderCart(); showToast('Item removed from cart'); }

function renderCart() {
  byId('cartCount').textContent = totalItems();
  const cartItems = byId('cartItems'); const cartFooter = byId('cartFooter');
  if (!cart.length) { cartItems.innerHTML = '<div class="empty-cart">Your cart is waiting for a little sparkle.<br><br><a class="text-link" href="#products" data-close-cart>Browse products →</a></div>'; cartFooter.innerHTML = ''; return; }
  cartItems.innerHTML = cart.map(item => { const product = productById(item.id); const itemTotal = product.price * item.quantity; return `<div class="cart-item"><img src="${product.image}" alt="${product.name}" /><div><h3>${product.name}</h3><p>${money(product.price)} each</p><div class="quantity-control"><button data-cart-change="${product.id}" data-amount="-1" aria-label="Decrease ${product.name}">−</button><b>${item.quantity}</b><button data-cart-change="${product.id}" data-amount="1" aria-label="Increase ${product.name}">+</button></div></div><div class="item-total">${money(itemTotal)}<br><button class="remove-item" data-remove="${product.id}">Remove</button></div></div>`; }).join('');
  cartFooter.innerHTML = `<div class="cart-summary-line"><span>Subtotal</span><b>${money(cartTotal())}</b></div><div class="cart-summary-line"><span>Total items</span><b>${totalItems()}</b></div><div class="cart-summary-line total"><span>Grand total</span><span>${money(cartTotal())}</span></div><button class="button button-primary checkout-button" data-checkout>Proceed to checkout <span>→</span></button>`;
}

function showProductModal(id) {
  const product = productById(id); selectedProductId = product.id; modalQuantity = 1;
  byId('productModalContent').innerHTML = `<div class="product-detail"><img src="${product.image}" alt="${product.name}" /><div class="product-detail-copy"><span class="product-meta">${product.category}</span><h2>${product.name}</h2><p>${product.description}</p><p>Use only as directed on the manufacturer’s packaging and in compliance with local regulations.</p><div class="detail-price">${money(product.price)}</div><div class="detail-add-row"><div class="large-quantity"><button data-modal-quantity="-1">−</button><span id="modalQuantity">1</span><button data-modal-quantity="1">+</button></div><button class="button button-primary" data-modal-add>Add to cart <span>+</span></button></div></div></div>`;
  toggleModal('productModal', true);
}

function renderCheckout() {
  if (!cart.length) { closeCart(); showToast('Your cart is empty'); return; }
  const summary = cart.map(item => { const product = productById(item.id); return `<div class="summary-product"><span>${product.name} <b>× ${item.quantity}</b></span><strong>${money(product.price * item.quantity)}</strong></div>`; }).join('');
  byId('checkoutContent').innerHTML = `<div class="checkout-layout"><div><p class="eyebrow">CHECKOUT</p><h2>Almost there.</h2><p class="checkout-intro">Share your details and we’ll prepare a WhatsApp order message for you to send.</p><form class="checkout-form" id="checkoutForm" novalidate><label>Customer name *<input name="name" required placeholder="Your full name" /></label><label>Mobile number *<input name="mobile" required inputmode="numeric" placeholder="10-digit mobile number" /></label><label>Delivery address *<textarea name="address" required placeholder="House / street / area / city"></textarea></label><label>Additional note <textarea name="note" placeholder="Any delivery preference or note?"></textarea></label><p class="form-error" id="formError"></p><button class="button button-primary" type="submit">Place order on WhatsApp <span>↗</span></button></form></div><aside class="order-summary"><h3>Order summary</h3>${summary}<div class="summary-total"><span>Total</span><span>${money(cartTotal())}</span></div><p class="checkout-intro">Delivery arrangements will be confirmed by the shop.</p></aside></div>`;
  toggleModal('checkoutModal', true);
}

// Combines prefix, date and random digits so every order has a readable identifier.
function generateOrderId() { const date = new Date(); const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`; const randomPart = `${Math.floor(1000 + Math.random() * 9000)}${Date.now().toString().slice(-2)}`; return `CRK-${datePart}-${randomPart}`; }

// Builds a clean plain-text message then URL-encodes it for WhatsApp click-to-chat.
function createWhatsappMessage(order) {
  const lines = ['🎆 NEW CRACKER ORDER 🎆', '', `Order ID: ${order.id}`, '', 'Customer Details:', `Name: ${order.customer.name}`, `Mobile: ${order.customer.mobile}`, `Address: ${order.customer.address}`, '', 'Order Details:', ''];
  order.items.forEach((item, index) => { const product = productById(item.id); lines.push(`${index + 1}. ${product.name}`, `Quantity: ${item.quantity}`, `Price: ${money(product.price)}`, `Total: ${money(product.price * item.quantity)}`, ''); });
  lines.push('-------------------------', `Subtotal: ${money(order.total)}`, 'Delivery: To be discussed', `Grand Total: ${money(order.total)}`, '-------------------------');
  if (order.customer.note) lines.push('', 'Customer Note:', order.customer.note);
  lines.push('', 'Please confirm this order.'); return lines.join('\n');
}

function submitCheckout(form) {
  const data = new FormData(form); const name = data.get('name').trim(); const mobile = data.get('mobile').replace(/\D/g, ''); const address = data.get('address').trim(); const note = data.get('note').trim(); const error = byId('formError');
  if (!name || !address) { error.textContent = 'Please enter your name and delivery address.'; return; }
  if (!/^\d{10,15}$/.test(mobile)) { error.textContent = 'Please enter a valid mobile number (10–15 digits).'; return; }
  const order = { id: generateOrderId(), customer: { name, mobile, address, note }, items: cart.map(item => ({ ...item })), total: cartTotal() };
  activeOrder = order; const whatsappUrl = `https://wa.me/${shopConfig.whatsappNumber}?text=${encodeURIComponent(createWhatsappMessage(order))}`;
  window.open(whatsappUrl, '_blank', 'noopener'); cart = []; saveCart(); renderCart(); renderConfirmation(whatsappUrl); }

function renderConfirmation(whatsappUrl) { byId('checkoutContent').innerHTML = `<div class="confirmation"><div class="confirmation-mark">🎉</div><h2>Order created successfully!</h2><p>Your order details have been prepared for WhatsApp.</p><p class="confirmation-id">${activeOrder.id}</p><p>Total amount</p><p class="confirmation-total">${money(activeOrder.total)}</p><p>Please send the WhatsApp message to confirm your order.</p><div class="confirmation-actions"><a class="button button-primary" target="_blank" rel="noopener" href="${whatsappUrl}">Open WhatsApp again <span>↗</span></a><button class="button button-primary" data-continue-shopping>Continue shopping</button></div></div>`; }

function toggleModal(id, open) { byId(id).classList.toggle('show', open); byId(id).setAttribute('aria-hidden', String(!open)); }
function openCart() { byId('cartDrawer').classList.add('open'); byId('cartDrawer').setAttribute('aria-hidden', 'false'); byId('overlay').classList.add('show'); }
function closeCart() { byId('cartDrawer').classList.remove('open'); byId('cartDrawer').setAttribute('aria-hidden', 'true'); byId('overlay').classList.remove('show'); }
function showToast(message) { const toast = byId('toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timeout); showToast.timeout = setTimeout(() => toast.classList.remove('show'), 2200); }

document.addEventListener('click', event => {
  const target = event.target.closest('[data-category], [data-add], [data-details], [data-cart-change], [data-remove], [data-open-cart], [data-close-cart], [data-checkout], [data-close-modal], [data-close-checkout], [data-modal-quantity], [data-modal-add], [data-continue-shopping], [data-filter-link], [data-card-quantity]'); if (!target) return;
  if (target.dataset.category) { activeCategory = target.dataset.category; renderCategories(); renderProducts(); document.querySelector('#products').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  if (target.dataset.filterLink) { activeCategory = target.dataset.filterLink; renderCategories(); renderProducts(); }
  if (target.dataset.add) { const quantity = Number(target.closest('.product-card').querySelector('.card-quantity-value').textContent); addToCart(target.dataset.add, quantity); }
  if (target.dataset.cardQuantity) changeCardQuantity(target, Number(target.dataset.cardQuantity));
  if (target.dataset.details) showProductModal(target.dataset.details);
  if (target.dataset.cartChange) changeCartQuantity(target.dataset.cartChange, Number(target.dataset.amount));
  if (target.dataset.remove) removeFromCart(target.dataset.remove);
  if (target.hasAttribute('data-open-cart')) openCart(); if (target.hasAttribute('data-close-cart')) closeCart();
  if (target.hasAttribute('data-checkout')) { closeCart(); renderCheckout(); }
  if (target.hasAttribute('data-close-modal')) toggleModal('productModal', false); if (target.hasAttribute('data-close-checkout')) toggleModal('checkoutModal', false);
  if (target.dataset.modalQuantity) { modalQuantity = Math.max(1, modalQuantity + Number(target.dataset.modalQuantity)); byId('modalQuantity').textContent = modalQuantity; }
  if (target.hasAttribute('data-modal-add')) { addToCart(selectedProductId, modalQuantity); toggleModal('productModal', false); }
  if (target.hasAttribute('data-continue-shopping')) { toggleModal('checkoutModal', false); byId('products').scrollIntoView({ behavior: 'smooth' }); }
});
byId('overlay').addEventListener('click', closeCart);
byId('productSearch').addEventListener('input', event => { searchTerm = event.target.value; renderProducts(); });
document.addEventListener('submit', event => { if (event.target.id === 'checkoutForm') { event.preventDefault(); submitCheckout(event.target); } });
document.querySelector('.menu-toggle').addEventListener('click', event => { const links = document.querySelector('.nav-links'); links.classList.toggle('open'); event.currentTarget.setAttribute('aria-expanded', links.classList.contains('open')); });
document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => document.querySelector('.nav-links').classList.remove('open')));

applyShopConfiguration(); renderCategories(); renderProducts(); renderCart();
