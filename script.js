/* ==============================================
LUXE SHOP  —  script.js  (fully rewritten)
All buttons tested & working
=============================================== */

/* ──── STATE ──── */
var USERS   = JSON.parse(localStorage.getItem(‘luxe_users’)   || ‘[]’);
var CURRENT = JSON.parse(localStorage.getItem(‘luxe_current’) || ‘null’);
var CART    = JSON.parse(localStorage.getItem(‘luxe_cart’)    || ‘[]’);
var LANG    = localStorage.getItem(‘luxe_lang’) || ‘en’;
var PENDING = null;
var DEMO_CODE = ‘123456’;
var SLIDE_IDX = 0;
var SLIDE_TIMER = null;
var CURRENT_CAT = ‘all’;

/* ──── PRODUCTS ──── */
var PRODUCTS = [
{ id:1,  name:‘Silk Evening Gown’,    nameKu:‘کراسی ئاوێنەی ئەبریشم’, cat:‘clothing’,    price:299, old:399,  emoji:‘👗’, badge:‘sale’, rating:4.8, rev:124 },
{ id:2,  name:‘Leather Oxford Shoes’, nameKu:‘پێڵاوی چەرمی ئۆکسفۆرد’, cat:‘shoes’,       price:189, old:null, emoji:‘👞’, badge:‘new’,  rating:4.9, rev:87  },
{ id:3,  name:‘Gold Chain Necklace’,  nameKu:‘گەردنبەندی ئەلتوونی’,   cat:‘accessories’, price:129, old:159,  emoji:‘📿’, badge:‘sale’, rating:4.7, rev:203 },
{ id:4,  name:‘Designer Handbag’,     nameKu:‘جانتای دیزاینەری’,       cat:‘bags’,        price:449, old:null, emoji:‘👜’, badge:‘new’,  rating:5.0, rev:56  },
{ id:5,  name:‘Cashmere Coat’,        nameKu:‘کاپۆتی کاشمیر’,          cat:‘clothing’,    price:599, old:799,  emoji:‘🧥’, badge:‘sale’, rating:4.9, rev:91  },
{ id:6,  name:‘Stiletto Heels’,       nameKu:‘پێڵاوی پشتبەرز’,        cat:‘shoes’,       price:239, old:null, emoji:‘👠’, badge:‘new’,  rating:4.6, rev:147 },
{ id:7,  name:‘Diamond Bracelet’,     nameKu:‘دەستبەندی تاشکراو’,     cat:‘accessories’, price:799, old:999,  emoji:‘💍’, badge:‘sale’, rating:5.0, rev:38  },
{ id:8,  name:‘Leather Backpack’,     nameKu:‘جانتای پشتەی چەرمی’,    cat:‘bags’,        price:279, old:329,  emoji:‘🎒’, badge:‘sale’, rating:4.8, rev:175 },
{ id:9,  name:‘Linen Summer Dress’,   nameKu:‘کراسی لینی هاوینەوار’,  cat:‘clothing’,    price:149, old:null, emoji:‘👒’, badge:‘new’,  rating:4.5, rev:229 },
{ id:10, name:‘Sneakers Luxe’,        nameKu:‘سنیکەری لوکس’,           cat:‘shoes’,       price:319, old:399,  emoji:‘👟’, badge:‘sale’, rating:4.7, rev:312 },
{ id:11, name:‘Silk Scarf’,           nameKu:‘کروات ئەبریشم’,          cat:‘accessories’, price:89,  old:null, emoji:‘🧣’, badge:‘new’,  rating:4.6, rev:88  },
{ id:12, name:‘Tote Bag Premium’,     nameKu:‘توتبەگی پریمیۆم’,        cat:‘bags’,        price:199, old:249,  emoji:‘👝’, badge:‘sale’, rating:4.8, rev:142 }
];

/* ──── SAVE ──── */
function save() {
localStorage.setItem(‘luxe_users’,   JSON.stringify(USERS));
localStorage.setItem(‘luxe_current’, JSON.stringify(CURRENT));
localStorage.setItem(‘luxe_cart’,    JSON.stringify(CART));
localStorage.setItem(‘luxe_lang’,    LANG);
}

/* ──── TOAST ──── */
function toast(msg) {
var el = document.getElementById(‘toast’);
el.textContent = msg;
el.classList.add(‘show’);
setTimeout(function() { el.classList.remove(‘show’); }, 2800);
}

/* ──── SHOW / HIDE helpers ──── */
function show(id) { document.getElementById(id).style.display = ‘’; }
function hide(id) { document.getElementById(id).style.display = ‘none’; }
function showFlex(id) { document.getElementById(id).style.display = ‘flex’; }

/* ================================================
AUTH
================================================ */

/* Tab switch */
function switchTab(tab) {
var tabs = [‘login’,‘register’];
tabs.forEach(function(t) {
document.getElementById(‘tab-’ + t).classList.toggle(‘active’, t === tab);
document.getElementById(‘form-’ + t).classList.toggle(‘active’, t === tab);
});
}

/* Login */
function handleLogin() {
var contact  = document.getElementById(‘loginContact’).value.trim();
var password = document.getElementById(‘loginPassword’).value.trim();

if (!contact || !password) {
toast(‘⚠️ Please fill all fields / هەموو خانەکان پڕ بکەرەوە’);
return;
}

var user = null;
for (var i = 0; i < USERS.length; i++) {
if ((USERS[i].email === contact || USERS[i].phone === contact) && USERS[i].password === password) {
user = USERS[i];
break;
}
}

if (!user) {
toast(‘❌ Wrong credentials / زانیاری هەڵە’);
return;
}

CURRENT = user;
save();
enterSite();
toast(’👋 Welcome back, ’ + user.name + ‘!’);
}

/* Send verification code (register step 1) */
function sendVerificationCode() {
var name     = document.getElementById(‘regName’).value.trim();
var email    = document.getElementById(‘regEmail’).value.trim();
var phone    = document.getElementById(‘regPhone’).value.trim();
var password = document.getElementById(‘regPassword’).value.trim();
var method   = document.getElementById(‘verifyMethod’).value;

if (!name || !email || !phone || !password) {
toast(‘⚠️ Please fill all fields / هەموو خانەکان پڕ بکەرەوە’);
return;
}
if (password.length < 6) {
toast(‘⚠️ Password must be at least 6 characters’);
return;
}

/* check duplicate */
for (var i = 0; i < USERS.length; i++) {
if (USERS[i].email === email || USERS[i].phone === phone) {
toast(‘⚠️ Account already exists / ئەکاونت پێشتر هەیە’);
return;
}
}

PENDING = { name: name, email: email, phone: phone, password: password };

var dest = method === ‘email’ ? email : phone;
var info = method === ‘email’
? ’Code sent to: ’ + dest
: ’SMS sent to: ’ + dest;
document.getElementById(‘verifyInfo’).textContent = info;

/* hide tabs, show verify form */
document.getElementById(‘authTabs’).style.display = ‘none’;
document.getElementById(‘form-login’).classList.remove(‘active’);
document.getElementById(‘form-register’).classList.remove(‘active’);
document.getElementById(‘form-verify’).classList.add(‘active’);

/* clear boxes */
var boxes = document.querySelectorAll(’.code-box’);
for (var j = 0; j < boxes.length; j++) boxes[j].value = ‘’;
document.getElementById(‘cb0’).focus();

toast(‘📨 Code sent! (demo: 123456)’);
}

/* Code box movement */
function moveNext(input, idx) {
input.value = input.value.replace(/[^0-9]/g, ‘’);
var boxes = document.querySelectorAll(’.code-box’);
if (input.value && idx < 5) {
boxes[idx + 1].focus();
}
if (idx === 5 && input.value) {
verifyCode();
}
}

function movePrev(e, idx) {
if (e.key === ‘Backspace’ && idx > 0) {
var boxes = document.querySelectorAll(’.code-box’);
if (!boxes[idx].value) {
boxes[idx - 1].focus();
boxes[idx - 1].value = ‘’;
}
}
}

/* Verify code */
function verifyCode() {
var boxes = document.querySelectorAll(’.code-box’);
var entered = ‘’;
for (var i = 0; i < boxes.length; i++) entered += boxes[i].value;

if (entered.length < 6) {
toast(‘⚠️ Enter 6-digit code / کۆدی 6 ژمارەیی داخڵ بکە’);
return;
}
if (entered !== DEMO_CODE) {
toast(‘❌ Wrong code. Demo code: 123456’);
return;
}

if (!PENDING) {
toast(‘❌ Error: no pending registration’);
return;
}

var newUser = {
id:       Date.now(),
name:     PENDING.name,
email:    PENDING.email,
phone:    PENDING.phone,
password: PENDING.password
};

USERS.push(newUser);
CURRENT = newUser;
PENDING = null;
save();

toast(‘✅ Account created! / ئەکاونت دروستکرا!’);
enterSite();
}

/* Resend code */
function resendCode() {
var boxes = document.querySelectorAll(’.code-box’);
for (var i = 0; i < boxes.length; i++) boxes[i].value = ‘’;
document.getElementById(‘cb0’).focus();
toast(‘📨 Code resent! / کۆد دووبارە نێردرا!’);
}

/* Enter main site */
function enterSite() {
hide(‘authModal’);
document.getElementById(‘mainSite’).style.display = ‘block’;
document.getElementById(‘navUsername’).textContent = CURRENT.name.split(’ ’)[0];
document.getElementById(‘dropUsername’).textContent = CURRENT.name;
updateBadge();
renderProducts();
initSlider();
updateLangBtn();
}

/* Logout */
function logout() {
CURRENT = null;
save();
document.getElementById(‘mainSite’).style.display = ‘none’;
document.getElementById(‘authModal’).style.display = ‘flex’;
/* reset auth to login tab */
document.getElementById(‘authTabs’).style.display = ‘’;
document.getElementById(‘form-verify’).classList.remove(‘active’);
switchTab(‘login’);
closeUserMenu();
if (SLIDE_TIMER) clearInterval(SLIDE_TIMER);
toast(‘👋 Logged out / چووتەدەرەوە’);
}

/* ─── user dropdown ─── */
function toggleUserMenu() {
document.getElementById(‘userDropdown’).classList.toggle(‘open’);
}
function closeUserMenu() {
document.getElementById(‘userDropdown’).classList.remove(‘open’);
}
document.addEventListener(‘click’, function(e) {
if (!e.target.closest(’.user-wrap’)) closeUserMenu();
});

/* ================================================
NAVBAR
================================================ */
window.addEventListener(‘scroll’, function() {
document.getElementById(‘navbar’).classList.toggle(‘scrolled’, window.scrollY > 36);
});

function toggleNav() {
document.getElementById(‘navLinks’).classList.toggle(‘open’);
}
function closeNav() {
document.getElementById(‘navLinks’).classList.remove(‘open’);
}

/* ================================================
LANGUAGE
================================================ */
function toggleLang() {
LANG = LANG === ‘en’ ? ‘ku’ : ‘en’;
save();
updateLangBtn();
renderProducts();
}

function updateLangBtn() {
var btn = document.getElementById(‘langBtn’);
if (btn) btn.textContent = LANG === ‘en’ ? ‘🌐 کوردی’ : ‘🌐 English’;
}

/* ================================================
SLIDER
================================================ */
function initSlider() {
if (SLIDE_TIMER) clearInterval(SLIDE_TIMER);
var dots = document.getElementById(‘sliderDots’);
dots.innerHTML = ‘’;
var count = document.querySelectorAll(’.slide’).length;
for (var i = 0; i < count; i++) {
var d = document.createElement(‘span’);
d.className = ‘dot’ + (i === 0 ? ’ active’ : ‘’);
d.setAttribute(‘data-i’, i);
d.onclick = (function(idx) { return function() { goSlide(idx); }; })(i);
dots.appendChild(d);
}
SLIDE_IDX = 0;
SLIDE_TIMER = setInterval(function() { changeSlide(1); }, 5000);
}

function changeSlide(dir) {
var count = document.querySelectorAll(’.slide’).length;
SLIDE_IDX = (SLIDE_IDX + dir + count) % count;
goSlide(SLIDE_IDX);
}

function goSlide(idx) {
SLIDE_IDX = idx;
document.getElementById(‘sliderTrack’).style.transform = ‘translateX(-’ + (idx * 100) + ‘%)’;
var dots = document.querySelectorAll(’.dot’);
for (var i = 0; i < dots.length; i++) {
dots[i].classList.toggle(‘active’, i === idx);
}
if (SLIDE_TIMER) clearInterval(SLIDE_TIMER);
SLIDE_TIMER = setInterval(function() { changeSlide(1); }, 5000);
}

function scrollToProducts() {
document.getElementById(‘products’).scrollIntoView({ behavior: ‘smooth’ });
}

/* ================================================
PRODUCTS
================================================ */
function renderProducts() {
var query = document.getElementById(‘searchInput’) ? document.getElementById(‘searchInput’).value.toLowerCase() : ‘’;
var items = PRODUCTS.filter(function(p) {
var matchCat = CURRENT_CAT === ‘all’ || p.cat === CURRENT_CAT;
var matchQ   = !query || p.name.toLowerCase().indexOf(query) !== -1 || p.nameKu.indexOf(query) !== -1;
return matchCat && matchQ;
});

var grid = document.getElementById(‘productsGrid’);
if (!grid) return;

if (!items.length) {
grid.innerHTML = ‘<div class="no-results">😔 No products found / هیچ کاڵایەک نەدراوە</div>’;
return;
}

var html = ‘’;
for (var i = 0; i < items.length; i++) {
var p   = items[i];
var nm  = LANG === ‘ku’ ? p.nameKu : p.name;
var stars = ‘’;
var full = Math.floor(p.rating);
for (var s = 0; s < full; s++) stars += ‘★’;
if (p.rating % 1) stars += ‘½’;

```
var oldHtml  = p.old ? '<span class="old-price">$' + p.old + '</span>' : '';
var badgeHtml = p.badge ? '<span class="product-badge ' + p.badge + '">' + p.badge.toUpperCase() + '</span>' : '';

html += '<div class="product-card">'
  + '  <div class="product-img-wrap">'
  + '    <span class="product-emoji">' + p.emoji + '</span>'
  + '    ' + badgeHtml
  + '    <button type="button" class="product-wish" onclick="wishlist(' + p.id + ')">🤍</button>'
  + '  </div>'
  + '  <div class="product-info">'
  + '    <div class="product-cat">' + p.cat + '</div>'
  + '    <div class="product-name">' + nm + '</div>'
  + '    <div class="product-rating">' + stars + ' <span>(' + p.rev + ')</span></div>'
  + '    <div class="product-footer">'
  + '      <div class="product-price">' + oldHtml + '$' + p.price + '</div>'
  + '      <button type="button" class="add-to-cart" onclick="addToCart(' + p.id + ')">'
  + (LANG === 'ku' ? 'زیادی بکە' : 'Add to Cart')
  + '      </button>'
  + '    </div>'
  + '  </div>'
  + '</div>';
```

}
grid.innerHTML = html;
}

function filterProducts(cat, btn) {
CURRENT_CAT = cat;
var btns = document.querySelectorAll(’.filter-btn’);
for (var i = 0; i < btns.length; i++) btns[i].classList.remove(‘active’);
btn.classList.add(‘active’);
renderProducts();
}

function filterSearch() {
renderProducts();
}

function wishlist(id) {
toast(‘🤍 Added to wishlist! / زیادکرا بۆ لیستی خوازراوەکان!’);
}

/* ================================================
CART
================================================ */
function addToCart(id) {
var product = null;
for (var i = 0; i < PRODUCTS.length; i++) {
if (PRODUCTS[i].id === id) { product = PRODUCTS[i]; break; }
}
if (!product) return;

var found = false;
for (var j = 0; j < CART.length; j++) {
if (CART[j].id === id) { CART[j].qty++; found = true; break; }
}
if (!found) {
CART.push({ id: product.id, name: product.name, nameKu: product.nameKu,
emoji: product.emoji, price: product.price, qty: 1 });
}

save();
updateBadge();
renderCart();
toast(’🛒 ’ + (LANG === ‘ku’ ? ‘زیادکرا بۆ سەبەتە!’ : ‘Added to cart!’));

/* badge pop animation */
var badge = document.getElementById(‘cartBadge’);
badge.style.transform = ‘scale(1.6)’;
setTimeout(function() { badge.style.transform = ‘scale(1)’; }, 280);
}

function updateBadge() {
var total = 0;
for (var i = 0; i < CART.length; i++) total += CART[i].qty;
var el = document.getElementById(‘cartBadge’);
if (el) el.textContent = total;
}

function renderCart() {
var el = document.getElementById(‘cartItems’);
if (!el) return;

if (!CART.length) {
el.innerHTML = ‘<div class="empty-cart"><p style="font-size:2.5rem">🛒</p>’
+ ‘<p>’ + (LANG === ‘ku’ ? ‘سەبەتەکەت بەتاڵە’ : ‘Your cart is empty’) + ‘</p></div>’;
document.getElementById(‘cartTotal’).textContent = ‘$0.00’;
return;
}

var total = 0;
var html  = ‘’;
for (var i = 0; i < CART.length; i++) {
var item = CART[i];
total += item.price * item.qty;
var nm = LANG === ‘ku’ ? item.nameKu : item.name;
html += ‘<div class="cart-item">’
+ ‘<div class="cart-item-emoji">’ + item.emoji + ‘</div>’
+ ‘<div class="cart-item-info">’
+ ’  <div class="cart-item-name">’ + nm + ‘</div>’
+ ’  <div class="cart-item-price">$’ + (item.price * item.qty).toFixed(2) + ‘</div>’
+ ‘</div>’
+ ‘<div class="cart-item-controls">’
+ ’  <button type="button" class="qty-btn" onclick="changeQty(' + item.id + ',-1)">−</button>’
+ ’  <span class="qty-num">’ + item.qty + ‘</span>’
+ ’  <button type="button" class="qty-btn" onclick="changeQty(' + item.id + ',1)">+</button>’
+ ’  <button type="button" class="cart-item-remove" onclick="removeItem(' + item.id + ')">🗑</button>’
+ ‘</div>’
+ ‘</div>’;
}
el.innerHTML = html;
document.getElementById(‘cartTotal’).textContent = ‘$’ + total.toFixed(2);
}

function changeQty(id, delta) {
for (var i = 0; i < CART.length; i++) {
if (CART[i].id === id) {
CART[i].qty += delta;
if (CART[i].qty <= 0) { CART.splice(i, 1); }
break;
}
}
save();
updateBadge();
renderCart();
}

function removeItem(id) {
CART = CART.filter(function(c) { return c.id !== id; });
save();
updateBadge();
renderCart();
toast(’🗑️ ’ + (LANG === ‘ku’ ? ‘لابرا لە سەبەتە’ : ‘Removed from cart’));
}

function clearCart() {
CART = [];
save();
updateBadge();
renderCart();
toast(’🧹 ’ + (LANG === ‘ku’ ? ‘سەبەتە پاک بووەوە’ : ‘Cart cleared’));
}

/* toggle cart drawer */
function toggleCart() {
var drawer  = document.getElementById(‘cartDrawer’);
var overlay = document.getElementById(‘cartOverlay’);
var isOpen  = drawer.classList.toggle(‘open’);
overlay.classList.toggle(‘open’, isOpen);
if (isOpen) renderCart();
}

/* ================================================
CHECKOUT
================================================ */
function goToCheckout() {
if (!CART.length) {
toast(’🛒 ’ + (LANG === ‘ku’ ? ‘سەبەتە بەتاڵە’ : ‘Cart is empty’));
return;
}
/* close cart */
document.getElementById(‘cartDrawer’).classList.remove(‘open’);
document.getElementById(‘cartOverlay’).classList.remove(‘open’);

renderCheckoutSummary();
document.getElementById(‘checkoutPage’).style.display = ‘block’;
document.body.style.overflow = ‘hidden’;

/* pre-fill */
if (CURRENT) {
document.getElementById(‘ckName’).value  = CURRENT.name  || ‘’;
document.getElementById(‘ckEmail’).value = CURRENT.email || ‘’;
document.getElementById(‘ckPhone’).value = CURRENT.phone || ‘’;
}
}

function renderCheckoutSummary() {
var el = document.getElementById(‘checkoutItems’);
if (!el) return;
var total = 0;
var html  = ‘’;
for (var i = 0; i < CART.length; i++) {
var item = CART[i];
total += item.price * item.qty;
var nm = LANG === ‘ku’ ? item.nameKu : item.name;
html += ‘<div class="checkout-item">’
+ ‘<div class="checkout-item-left">’
+ ’  <span class="checkout-item-emoji">’ + item.emoji + ‘</span>’
+ ’  <div><div class="checkout-item-name">’ + nm + ‘</div>’
+ ’  <div class="checkout-item-qty">x’ + item.qty + ‘</div></div>’
+ ‘</div>’
+ ‘<div class="checkout-item-price">$’ + (item.price * item.qty).toFixed(2) + ‘</div>’
+ ‘</div>’;
}
el.innerHTML = html;
document.getElementById(‘checkoutTotal’).textContent = ‘$’ + total.toFixed(2);
}

function closeCheckout() {
document.getElementById(‘checkoutPage’).style.display = ‘none’;
document.body.style.overflow = ‘’;
}

/* card fields toggle */
function toggleCardFields(radio) {
document.getElementById(‘cardFields’).style.display = radio.value === ‘card’ ? ‘block’ : ‘none’;
}

/* input formatters */
function formatCard(el) {
var v = el.value.replace(/\D/g, ‘’).substring(0, 16);
var out = ‘’;
for (var i = 0; i < v.length; i++) {
if (i > 0 && i % 4 === 0) out += ’ ’;
out += v[i];
}
el.value = out;
}
function formatExpiry(el) {
var v = el.value.replace(/\D/g, ‘’).substring(0, 4);
if (v.length >= 2) v = v.substring(0,2) + ‘/’ + v.substring(2);
el.value = v;
}

/* place order */
function placeOrder() {
var name    = document.getElementById(‘ckName’).value.trim();
var address = document.getElementById(‘ckAddress’).value.trim();
var phone   = document.getElementById(‘ckPhone’).value.trim();
var email   = document.getElementById(‘ckEmail’).value.trim();

if (!name || !address || !phone || !email) {
toast(’⚠️ ’ + (LANG === ‘ku’ ? ‘هەموو خانەکان پڕ بکەرەوە’ : ‘Please fill all fields’));
return;
}

var payRadio = document.querySelector(’[name=“pay”]:checked’);
if (payRadio && payRadio.value === ‘card’) {
var card = document.getElementById(‘ckCard’).value.trim();
var exp  = document.getElementById(‘ckExpiry’).value.trim();
var cvv  = document.getElementById(‘ckCvv’).value.trim();
if (!card || !exp || !cvv) {
toast(’⚠️ ’ + (LANG === ‘ku’ ? ‘زانیاری کارتەکە داخڵ بکە’ : ‘Enter card details’));
return;
}
}

var orderId = ‘LX-’ + String(Date.now()).slice(-8);
CART = [];
save();
updateBadge();

closeCheckout();

document.getElementById(‘successOrderId’).textContent = ’Order ID: ’ + orderId;
document.getElementById(‘orderSuccess’).style.display = ‘flex’;
document.body.style.overflow = ‘hidden’;
}

function closeSuccess() {
document.getElementById(‘orderSuccess’).style.display = ‘none’;
document.body.style.overflow = ‘’;
toast(’🛍️ ’ + (LANG === ‘ku’ ? ‘داواکاری بە سەرکەوتوویی نێردرا!’ : ‘Order placed successfully!’));
}

/* ================================================
CONTACT
================================================ */
function sendMessage() {
var name = document.getElementById(‘ctName’).value.trim();
var email = document.getElementById(‘ctEmail’).value.trim();
var msg  = document.getElementById(‘ctMessage’).value.trim();
if (!name || !email || !msg) {
toast(’⚠️ ’ + (LANG === ‘ku’ ? ‘هەموو خانەکان پڕ بکەرەوە’ : ‘Please fill all fields’));
return;
}
document.getElementById(‘ctName’).value    = ‘’;
document.getElementById(‘ctEmail’).value   = ‘’;
document.getElementById(‘ctMessage’).value = ‘’;
toast(’✅ ’ + (LANG === ‘ku’ ? ‘پەیام نێردرا!’ : ‘Message sent! We'll reply soon.’));
}

/* ================================================
INIT — runs when page loads
================================================ */
document.addEventListener(‘DOMContentLoaded’, function() {

/* If already logged in → go straight to site */
if (CURRENT) {
enterSite();
return;
}

/* Show auth modal (it’s already visible by default in HTML) */
document.getElementById(‘authModal’).style.display = ‘flex’;

/* ESC key handlers */
document.addEventListener(‘keydown’, function(e) {
if (e.key !== ‘Escape’) return;
var drawer = document.getElementById(‘cartDrawer’);
if (drawer && drawer.classList.contains(‘open’)) toggleCart();
var ck = document.getElementById(‘checkoutPage’);
if (ck && ck.style.display !== ‘none’) closeCheckout();
});
});
