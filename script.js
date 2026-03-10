/* =========================================
LUXE SHOP — script.js
Full shopping website logic
========================================= */

/* ––––– STATE ––––– */
const STATE = {
users: JSON.parse(localStorage.getItem(‘luxe_users’) || ‘[]’),
currentUser: JSON.parse(localStorage.getItem(‘luxe_current’) || ‘null’),
cart: JSON.parse(localStorage.getItem(‘luxe_cart’) || ‘[]’),
lang: localStorage.getItem(‘luxe_lang’) || ‘en’,
pendingUser: null,
demoCode: ‘123456’,
slideIndex: 0,
slideTimer: null,
};

/* ––––– PRODUCTS DATA ––––– */
const PRODUCTS = [
{ id:1, name:‘Silk Evening Gown’, nameKu:‘کراسی ئاوێنەی ئەبریشم’, cat:‘clothing’, price:299, oldPrice:399, emoji:‘👗’, badge:‘sale’, rating:4.8, reviews:124 },
{ id:2, name:‘Leather Oxford Shoes’, nameKu:‘پێڵاوی چەرمی ئۆکسفۆرد’, cat:‘shoes’, price:189, oldPrice:null, emoji:‘👞’, badge:‘new’, rating:4.9, reviews:87 },
{ id:3, name:‘Gold Chain Necklace’, nameKu:‘گەردنبەندی ئەلتوونی’, cat:‘accessories’, price:129, oldPrice:159, emoji:‘📿’, badge:‘sale’, rating:4.7, reviews:203 },
{ id:4, name:‘Designer Handbag’, nameKu:‘جانتای دیزاینەری’, cat:‘bags’, price:449, oldPrice:null, emoji:‘👜’, badge:‘new’, rating:5.0, reviews:56 },
{ id:5, name:‘Cashmere Coat’, nameKu:‘کاپۆتی کاشمیر’, cat:‘clothing’, price:599, oldPrice:799, emoji:‘🧥’, badge:‘sale’, rating:4.9, reviews:91 },
{ id:6, name:‘Stiletto Heels’, nameKu:‘پێڵاوی پشتبەرز’, cat:‘shoes’, price:239, oldPrice:null, emoji:‘👠’, badge:‘new’, rating:4.6, reviews:147 },
{ id:7, name:‘Diamond Bracelet’, nameKu:‘دەستبەندی تاشکراو’, cat:‘accessories’, price:799, oldPrice:999, emoji:‘💍’, badge:‘sale’, rating:5.0, reviews:38 },
{ id:8, name:‘Leather Backpack’, nameKu:‘جانتای پشتەی چەرمی’, cat:‘bags’, price:279, oldPrice:329, emoji:‘🎒’, badge:‘sale’, rating:4.8, reviews:175 },
{ id:9, name:‘Linen Summer Dress’, nameKu:‘کراسی لینی هاوینەوار’, cat:‘clothing’, price:149, oldPrice:null, emoji:‘👒’, badge:‘new’, rating:4.5, reviews:229 },
{ id:10, name:‘Sneakers Luxe’, nameKu:‘سنیکەری لوکس’, cat:‘shoes’, price:319, oldPrice:399, emoji:‘👟’, badge:‘sale’, rating:4.7, reviews:312 },
{ id:11, name:‘Silk Scarf’, nameKu:‘کروات ئەبریشم’, cat:‘accessories’, price:89, oldPrice:null, emoji:‘🧣’, badge:‘new’, rating:4.6, reviews:88 },
{ id:12, name:‘Tote Bag Premium’, nameKu:‘توتبەگی پریمیۆم’, cat:‘bags’, price:199, oldPrice:249, emoji:‘👝’, badge:‘sale’, rating:4.8, reviews:142 },
];

/* ––––– TRANSLATIONS ––––– */
const T = {
en: {
addCart: ‘Add to Cart’,
added: ‘Added to cart!’,
removed: ‘Removed from cart’,
cartEmpty: ‘Your cart is empty’,
cartEmptyP: ‘Start shopping above’,
orderPlaced: ‘Order placed successfully!’,
loggedIn: ‘Welcome back’,
registered: ‘Account created!’,
codeSent: ‘Verification code sent!’,
codeWrong: ‘Wrong code. Try 123456’,
fillAll: ‘Please fill all fields’,
msgSent: ‘Message sent! We'll reply soon.’,
cleared: ‘Cart cleared’,
loggedOut: ‘Logged out’,
resent: ‘Code resent!’,
},
ku: {
addCart: ‘زیادی بکە بۆ سەبەتە’,
added: ‘زیادکرا بۆ سەبەتە!’,
removed: ‘لابرا لە سەبەتە’,
cartEmpty: ‘سەبەتەکەت بەتاڵە’,
cartEmptyP: ‘فرۆشتن دەست پێبکە’,
orderPlaced: ‘داواکاری بە سەرکەوتوویی نێردرا!’,
loggedIn: ‘بەخێربێیتەوە’,
registered: ‘ئەکاونت دروستکرا!’,
codeSent: ‘کۆدی پشتراستکردنەوە نێردرا!’,
codeWrong: ‘کۆدی هەڵە. 123456 تاقی بکەرەوە’,
fillAll: ‘تکایە هەموو خانەکان پڕ بکەرەوە’,
msgSent: ‘پەیام نێردرا! بە زووی وەڵام دەدەینەوە.’,
cleared: ‘سەبەتە پاک بووەوە’,
loggedOut: ‘چووتەدەرەوە’,
resent: ‘کۆد دووبارە نێردرا!’,
}
};

function t(key) { return T[STATE.lang][key] || T.en[key]; }

/* ––––– TOAST ––––– */
function showToast(msg, duration = 2800) {
const el = document.getElementById(‘toast’);
el.textContent = msg;
el.classList.add(‘show’);
setTimeout(() => el.classList.remove(‘show’), duration);
}

/* ––––– SAVE ––––– */
function save() {
localStorage.setItem(‘luxe_users’, JSON.stringify(STATE.users));
localStorage.setItem(‘luxe_current’, JSON.stringify(STATE.currentUser));
localStorage.setItem(‘luxe_cart’, JSON.stringify(STATE.cart));
localStorage.setItem(‘luxe_lang’, STATE.lang);
}

/* ====================================
AUTH SYSTEM
==================================== */
function switchTab(tab) {
document.querySelectorAll(’.auth-tab’).forEach(b => b.classList.remove(‘active’));
document.querySelectorAll(’.auth-form’).forEach(f => f.classList.remove(‘active’));
document.getElementById(‘tab-’ + tab).classList.add(‘active’);
document.getElementById(‘form-’ + tab).classList.add(‘active’);
}

function handleLogin() {
const contact = document.getElementById(‘loginContact’).value.trim();
const password = document.getElementById(‘loginPassword’).value.trim();
if (!contact || !password) { showToast(’⚠️ ’ + t(‘fillAll’)); return; }

const user = STATE.users.find(u =>
(u.email === contact || u.phone === contact) && u.password === password
);
if (!user) { showToast(‘❌ Wrong credentials / زانیاری هەڵە’); return; }

STATE.currentUser = user;
save();
enterSite();
showToast(’👋 ’ + t(‘loggedIn’) + ’, ’ + user.name + ‘!’);
}

function sendVerificationCode() {
const name = document.getElementById(‘regName’).value.trim();
const email = document.getElementById(‘regEmail’).value.trim();
const phone = document.getElementById(‘regPhone’).value.trim();
const password = document.getElementById(‘regPassword’).value.trim();
const method = document.getElementById(‘verifyMethod’).value;

if (!name || !email || !phone || !password) { showToast(’⚠️ ’ + t(‘fillAll’)); return; }
if (password.length < 6) { showToast(‘⚠️ Password min 6 chars’); return; }

const exists = STATE.users.find(u => u.email === email || u.phone === phone);
if (exists) { showToast(‘⚠️ Account already exists / ئەکاونت پێشتر هەیە’); return; }

STATE.pendingUser = { name, email, phone, password };

const dest = method === ‘email’ ? email : phone;
const info = method === ‘email’
? `Code sent to email: ${dest}`
: `Code sent via SMS to: ${dest}`;
document.getElementById(‘verifyInfo’).textContent = info;

// Hide tabs, show verify
document.querySelectorAll(’.auth-tab’).forEach(b => b.style.display = ‘none’);
document.querySelectorAll(’.auth-form’).forEach(f => f.classList.remove(‘active’));
document.getElementById(‘form-verify’).classList.add(‘active’);

// Clear code boxes
document.querySelectorAll(’.code-box’).forEach(b => b.value = ‘’);
document.querySelectorAll(’.code-box’)[0].focus();

showToast(‘📨 ’ + t(‘codeSent’));
console.log(’[DEMO] Verification code: 123456’);
}

function moveNext(input, idx) {
input.value = input.value.replace(/\D/g, ‘’);
const boxes = document.querySelectorAll(’.code-box’);
if (input.value && idx < 5) boxes[idx + 1].focus();
if (idx === 5 && input.value) verifyCode();
}

function verifyCode() {
const entered = Array.from(document.querySelectorAll(’.code-box’))
.map(b => b.value).join(’’);
if (entered.length < 6) { showToast(‘⚠️ Enter 6-digit code / کۆدی 6 ژمارەیی داخڵ بکە’); return; }
if (entered !== STATE.demoCode) { showToast(’❌ ’ + t(‘codeWrong’)); return; }

// Register user
const user = { …STATE.pendingUser, id: Date.now() };
STATE.users.push(user);
STATE.currentUser = user;
STATE.pendingUser = null;
save();

showToast(’✅ ’ + t(‘registered’));
enterSite();
}

function resendCode() {
document.querySelectorAll(’.code-box’).forEach(b => b.value = ‘’);
document.querySelectorAll(’.code-box’)[0].focus();
showToast(’📨 ’ + t(‘resent’));
}

function enterSite() {
document.getElementById(‘authModal’).classList.add(‘hidden’);
document.getElementById(‘mainSite’).classList.remove(‘hidden’);
document.getElementById(‘navUsername’).textContent = STATE.currentUser.name.split(’ ’)[0];
document.getElementById(‘dropUsername’).textContent = STATE.currentUser.name;
updateCartBadge();
renderProducts(‘all’);
initSlider();
}

function logout() {
STATE.currentUser = null;
save();
document.getElementById(‘mainSite’).classList.add(‘hidden’);
document.getElementById(‘authModal’).classList.remove(‘hidden’);
document.getElementById(‘authModal’).classList.remove(‘hidden’);
document.querySelectorAll(’.auth-tab’).forEach(b => b.style.display = ‘’);
switchTab(‘login’);
document.getElementById(‘userDropdown’).classList.remove(‘open’);
showToast(’👋 ’ + t(‘loggedOut’));
if (STATE.slideTimer) clearInterval(STATE.slideTimer);
}

function toggleUserMenu() {
document.getElementById(‘userDropdown’).classList.toggle(‘open’);
}
document.addEventListener(‘click’, e => {
if (!e.target.closest(’.user-btn’) && !e.target.closest(’.user-dropdown’)) {
document.getElementById(‘userDropdown’).classList.remove(‘open’);
}
});

/* ====================================
SLIDER
==================================== */
function initSlider() {
const slides = document.querySelectorAll(’.slide’);
const dotsEl = document.getElementById(‘sliderDots’);
dotsEl.innerHTML = ‘’;
slides.forEach((_, i) => {
const d = document.createElement(‘div’);
d.className = ‘dot’ + (i === 0 ? ’ active’ : ‘’);
d.onclick = () => goToSlide(i);
dotsEl.appendChild(d);
});
STATE.slideTimer = setInterval(() => changeSlide(1), 5000);
}

function changeSlide(dir) {
const slides = document.querySelectorAll(’.slide’);
STATE.slideIndex = (STATE.slideIndex + dir + slides.length) % slides.length;
goToSlide(STATE.slideIndex);
}

function goToSlide(idx) {
STATE.slideIndex = idx;
document.getElementById(‘sliderTrack’).style.transform = `translateX(-${idx * 100}%)`;
document.querySelectorAll(’.dot’).forEach((d, i) => d.classList.toggle(‘active’, i === idx));
if (STATE.slideTimer) clearInterval(STATE.slideTimer);
STATE.slideTimer = setInterval(() => changeSlide(1), 5000);
}

function scrollToProducts() {
document.getElementById(‘products’).scrollIntoView({ behavior: ‘smooth’ });
}

/* ====================================
NAVBAR
==================================== */
window.addEventListener(‘scroll’, () => {
const nav = document.getElementById(‘navbar’);
nav?.classList.toggle(‘scrolled’, window.scrollY > 40);
});

function toggleNav() {
document.getElementById(‘navLinks’).classList.toggle(‘open’);
}
function closeNav() {
document.getElementById(‘navLinks’).classList.remove(‘open’);
}

/* ====================================
LANGUAGE
==================================== */
function toggleLang() {
STATE.lang = STATE.lang === ‘en’ ? ‘ku’ : ‘en’;
save();
const btn = document.getElementById(‘langBtn’);
btn.textContent = STATE.lang === ‘en’ ? ‘🌐 کوردی’ : ‘🌐 English’;
document.documentElement.lang = STATE.lang === ‘ku’ ? ‘ckb’ : ‘en’;
renderProducts(document.querySelector(’.filter-btn.active’)?.dataset.cat || ‘all’);
}

/* ====================================
PRODUCTS
==================================== */
function renderProducts(cat, query = ‘’) {
const grid = document.getElementById(‘productsGrid’);
let items = PRODUCTS.filter(p => (cat === ‘all’ || p.cat === cat));
if (query) {
const q = query.toLowerCase();
items = items.filter(p =>
p.name.toLowerCase().includes(q) ||
p.nameKu.includes(q) ||
p.cat.includes(q)
);
}
if (!items.length) {
grid.innerHTML = `<div class="no-results">😔 No products found / هیچ کاڵایەک نەدراوە</div>`;
return;
}
grid.innerHTML = items.map(p => {
const nm = STATE.lang === ‘ku’ ? p.nameKu : p.name;
const stars = ‘★’.repeat(Math.floor(p.rating)) + (p.rating % 1 ? ‘½’ : ‘’);
const oldP = p.oldPrice ? `<span class="old-price">$${p.oldPrice}</span>` : ‘’;
const badge = p.badge ? `<span class="product-badge ${p.badge}">${p.badge.toUpperCase()}</span>` : ‘’;
return ` <div class="product-card" data-id="${p.id}"> <div class="product-img-wrap"> <span class="product-emoji">${p.emoji}</span> ${badge} <button class="product-wish" onclick="event.stopPropagation(); addWish(${p.id})">🤍</button> </div> <div class="product-info"> <div class="product-cat">${p.cat}</div> <div class="product-name">${nm}</div> <div class="product-rating">${stars} <span>(${p.reviews})</span></div> <div class="product-footer"> <div class="product-price">${oldP}$${p.price}</div> <button class="add-to-cart" onclick="event.stopPropagation(); addToCart(${p.id})"> ${t('addCart')} </button> </div> </div> </div>`;
}).join(’’);
}

function filterProducts(cat, btn) {
document.querySelectorAll(’.filter-btn’).forEach(b => b.classList.remove(‘active’));
btn.classList.add(‘active’);
btn.dataset.cat = cat;
const q = document.getElementById(‘searchInput’).value;
renderProducts(cat, q);
}

function filterSearch() {
const q = document.getElementById(‘searchInput’).value;
const cat = document.querySelector(’.filter-btn.active’)?.dataset.cat || ‘all’;
renderProducts(cat, q);
}

function addWish(id) { showToast(‘🤍 Added to wishlist!’); }

/* ====================================
CART
==================================== */
function addToCart(id) {
const product = PRODUCTS.find(p => p.id === id);
if (!product) return;
const existing = STATE.cart.find(i => i.id === id);
if (existing) { existing.qty++; }
else { STATE.cart.push({ …product, qty: 1 }); }
save();
updateCartBadge();
renderCart();
showToast(’🛒 ’ + t(‘added’));
animateBadge();
}

function animateBadge() {
const badge = document.getElementById(‘cartBadge’);
badge.style.transform = ‘scale(1.5)’;
setTimeout(() => badge.style.transform = ‘scale(1)’, 300);
}

function updateCartBadge() {
const total = STATE.cart.reduce((s, i) => s + i.qty, 0);
document.getElementById(‘cartBadge’).textContent = total;
}

function renderCart() {
const el = document.getElementById(‘cartItems’);
if (!STATE.cart.length) {
el.innerHTML = `<div class="empty-cart"><div>🛒</div><p>${t('cartEmpty')}</p><p>${t('cartEmptyP')}</p></div>`;
document.getElementById(‘cartTotal’).textContent = ‘$0.00’;
return;
}
let total = 0;
el.innerHTML = STATE.cart.map(item => {
total += item.price * item.qty;
const nm = STATE.lang === ‘ku’ ? item.nameKu : item.name;
return ` <div class="cart-item"> <div class="cart-item-emoji">${item.emoji}</div> <div class="cart-item-info"> <div class="cart-item-name">${nm}</div> <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div> </div> <div class="cart-item-controls"> <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button> <span class="qty-num">${item.qty}</span> <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button> <button class="cart-item-remove" onclick="removeFromCart(${item.id})">🗑️</button> </div> </div>`;
}).join(’’);
document.getElementById(‘cartTotal’).textContent = ‘$’ + total.toFixed(2);
}

function changeQty(id, delta) {
const item = STATE.cart.find(i => i.id === id);
if (!item) return;
item.qty += delta;
if (item.qty <= 0) removeFromCart(id);
else { save(); updateCartBadge(); renderCart(); }
}

function removeFromCart(id) {
STATE.cart = STATE.cart.filter(i => i.id !== id);
save();
updateCartBadge();
renderCart();
showToast(’🗑️ ’ + t(‘removed’));
}

function clearCart() {
STATE.cart = [];
save();
updateCartBadge();
renderCart();
showToast(’🧹 ’ + t(‘cleared’));
}

function toggleCart() {
const drawer = document.getElementById(‘cartDrawer’);
const overlay = document.getElementById(‘cartOverlay’);
const open = drawer.classList.toggle(‘open’);
overlay.classList.toggle(‘open’, open);
if (open) renderCart();
}

/* ====================================
CHECKOUT
==================================== */
function goToCheckout() {
if (!STATE.cart.length) { showToast(‘🛒 Cart is empty / سەبەتە بەتاڵە’); return; }
toggleCart();
renderCheckoutSummary();
document.getElementById(‘checkoutPage’).classList.remove(‘hidden’);
document.body.style.overflow = ‘hidden’;

// Pre-fill with user data
if (STATE.currentUser) {
document.getElementById(‘ckName’).value = STATE.currentUser.name;
document.getElementById(‘ckEmail’).value = STATE.currentUser.email;
document.getElementById(‘ckPhone’).value = STATE.currentUser.phone;
}

// Payment method toggle
document.querySelectorAll(’[name=“pay”]’).forEach(r => {
r.addEventListener(‘change’, () => {
document.getElementById(‘cardFields’).style.display =
r.value === ‘card’ ? ‘block’ : ‘none’;
});
});
}

function renderCheckoutSummary() {
const el = document.getElementById(‘checkoutItems’);
let total = 0;
el.innerHTML = STATE.cart.map(item => {
total += item.price * item.qty;
const nm = STATE.lang === ‘ku’ ? item.nameKu : item.name;
return ` <div class="checkout-item"> <div class="checkout-item-left"> <span class="checkout-item-emoji">${item.emoji}</span> <div> <div class="checkout-item-name">${nm}</div> <div class="checkout-item-qty">x${item.qty}</div> </div> </div> <div class="checkout-item-price">$${(item.price * item.qty).toFixed(2)}</div> </div>`;
}).join(’’);
document.getElementById(‘checkoutTotal’).textContent = ‘$’ + total.toFixed(2);
}

function closeCheckout() {
document.getElementById(‘checkoutPage’).classList.add(‘hidden’);
document.body.style.overflow = ‘’;
}

function formatCard(el) {
let v = el.value.replace(/\D/g, ‘’).slice(0, 16);
el.value = v.match(/.{1,4}/g)?.join(’ ’) || v;
}
function formatExpiry(el) {
let v = el.value.replace(/\D/g, ‘’).slice(0, 4);
if (v.length >= 2) v = v.slice(0,2) + ‘/’ + v.slice(2);
el.value = v;
}

function placeOrder() {
const name = document.getElementById(‘ckName’).value.trim();
const address = document.getElementById(‘ckAddress’).value.trim();
const phone = document.getElementById(‘ckPhone’).value.trim();
const email = document.getElementById(‘ckEmail’).value.trim();
if (!name || !address || !phone || !email) {
showToast(’⚠️ ’ + t(‘fillAll’)); return;
}

const payMethod = document.querySelector(’[name=“pay”]:checked’).value;
if (payMethod === ‘card’) {
const card = document.getElementById(‘ckCard’).value.trim();
const exp = document.getElementById(‘ckExpiry’).value.trim();
const cvv = document.getElementById(‘ckCvv’).value.trim();
if (!card || !exp || !cvv) { showToast(’⚠️ ’ + t(‘fillAll’)); return; }
}

const orderId = ‘LX-’ + Date.now().toString().slice(-8);
STATE.cart = [];
save();
updateCartBadge();

closeCheckout();
document.getElementById(‘successOrderId’).textContent = ’Order ID: ’ + orderId;
document.getElementById(‘orderSuccess’).classList.remove(‘hidden’);
document.body.style.overflow = ‘hidden’;
}

function closeSuccess() {
document.getElementById(‘orderSuccess’).classList.add(‘hidden’);
document.body.style.overflow = ‘’;
showToast(’🛍️ ’ + t(‘orderPlaced’));
}

/* ====================================
CONTACT
==================================== */
function sendMessage() {
const name = document.getElementById(‘ctName’).value.trim();
const email = document.getElementById(‘ctEmail’).value.trim();
const msg = document.getElementById(‘ctMessage’).value.trim();
if (!name || !email || !msg) { showToast(’⚠️ ’ + t(‘fillAll’)); return; }
document.getElementById(‘ctName’).value = ‘’;
document.getElementById(‘ctEmail’).value = ‘’;
document.getElementById(‘ctMessage’).value = ‘’;
showToast(’✅ ’ + t(‘msgSent’));
}

/* ====================================
INIT
==================================== */
document.addEventListener(‘DOMContentLoaded’, () => {
// If user already logged in, skip auth
if (STATE.currentUser) {
enterSite();
}

// Lang button initial
const btn = document.getElementById(‘langBtn’);
if (btn) btn.textContent = STATE.lang === ‘en’ ? ‘🌐 کوردی’ : ‘🌐 English’;

// Keyboard: ESC closes cart
document.addEventListener(‘keydown’, e => {
if (e.key === ‘Escape’) {
const drawer = document.getElementById(‘cartDrawer’);
if (drawer?.classList.contains(‘open’)) toggleCart();
if (!document.getElementById(‘checkoutPage’)?.classList.contains(‘hidden’)) closeCheckout();
}
});
});
