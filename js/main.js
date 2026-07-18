// ===== CART STATE =====
let cart = [];
let selectedPayment = '';

// ===== NAVBAR SCROLL =====
const navbar = document.querySelector('.navbar');
function handleNavScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}
window.addEventListener('scroll', handleNavScroll, { passive: true });
window.addEventListener('load', handleNavScroll);

// ===== ORDER NOW BUTTON =====
document.getElementById('navOrderBtn').addEventListener('click', (e) => {
  e.preventDefault();
  openCart();
});

// ===== SIDEBAR (NAV) =====
const hamburger = document.querySelector('.hamburger');
const sidebar = document.querySelector('.sidebar');
const overlay = document.querySelector('.sidebar-overlay');
const sidebarClose = document.querySelector('.sidebar-close');
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');

function openSidebar() {
  hamburger.classList.add('active');
  sidebar.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = getScrollbarWidth() + 'px';
}
function closeSidebar() {
  hamburger.classList.remove('active');
  sidebar.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}
hamburger.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});
sidebarClose.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);
sidebarLinks.forEach(link => link.addEventListener('click', closeSidebar));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeSidebar(); closeCart(); closeCheckout(); closeSuccess(); }
});

// ===== CART SIDEBAR =====
const cartBtn = document.querySelector('.cart-btn');
const cartSidebar = document.querySelector('.cart-sidebar');
const cartOverlay = document.querySelector('.cart-overlay');
const cartCloseBtn = document.querySelector('.cart-close');

function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = getScrollbarWidth() + 'px';
  renderCart();
}
function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
  if (!document.querySelector('.checkout-overlay').classList.contains('open') &&
      !document.querySelector('.success-screen').classList.contains('show')) {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
}
cartBtn.addEventListener('click', openCart);
cartCloseBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// ===== CART LOGIC =====
function addToCart(name, price, icon) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price, icon, qty: 1 });
  }
  updateCartBadge();
  renderCart();
  showToast(`${name} added to cart`);

  // Animate button
  document.querySelectorAll('.menu-card-add').forEach(btn => {
    if (btn.dataset.name === name) {
      btn.classList.add('added');
      btn.innerHTML = '<span class="add-icon">&#10003;</span> Added';
      setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = '<span class="add-icon">+</span> Add to Cart';
      }, 1200);
    }
  });
}

function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  updateCartBadge();
  renderCart();
}

function changeQty(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(name); return; }
  updateCartBadge();
  renderCart();
}

function clearCart() {
  cart = [];
  updateCartBadge();
  renderCart();
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartBadge() {
  const badge = document.querySelector('.cart-badge');
  const count = getCartCount();
  badge.textContent = count;
  badge.classList.toggle('show', count > 0);
}

function formatPrice(n) {
  return 'Rp ' + n.toLocaleString('id-ID');
}

function renderCart() {
  const itemsEl = document.querySelector('.cart-items');
  const footerEl = document.querySelector('.cart-footer');
  const checkoutBtn = document.querySelector('.cart-checkout-btn');
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');
  const countEl = document.querySelector('.cart-header .count');

  countEl.textContent = `(${getCartCount()} items)`;

  if (cart.length === 0) {
    itemsEl.innerHTML = '<div class="cart-empty"><span class="cart-empty-icon">&#9749;</span><p>Your cart is empty.<br>Browse the menu and add something delicious!</p></div>';
    footerEl.style.display = 'none';
    checkoutBtn.disabled = true;
    return;
  }

  footerEl.style.display = 'block';
  checkoutBtn.disabled = false;

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">${item.icon}</div>
      <div class="cart-item-body">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
        <div class="cart-item-ctrl">
          <button class="cart-qty-btn" onclick="changeQty('${item.name}', -1)">&minus;</button>
          <span class="cart-qty-val">${item.qty}</span>
          <button class="cart-qty-btn" onclick="changeQty('${item.name}', 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.name}')" title="Remove">&#10005;</button>
    </div>
  `).join('');

  const total = getCartTotal();
  subtotalEl.textContent = formatPrice(total);
  totalEl.textContent = formatPrice(total);
}

// ===== CHECKOUT OVERLAY =====
const checkoutOverlay = document.querySelector('.checkout-overlay');
const checkoutBack = document.querySelector('.checkout-back');
const checkoutSubmit = document.querySelector('.checkout-submit');

function openCheckout() {
  closeCart();
  setTimeout(() => {
    checkoutOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = getScrollbarWidth() + 'px';
    renderCheckoutSummary();
    // Reset scroll position of form
    const formSide = document.querySelector('.checkout-form-card');
    if (formSide) formSide.scrollTop = 0;
  }, 350);
}

function closeCheckout() {
  checkoutOverlay.classList.remove('open');
  if (!document.querySelector('.success-screen').classList.contains('show')) {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
}

// Helper: get scrollbar width to prevent layout shift
function getScrollbarWidth() {
  return window.innerWidth - document.documentElement.clientWidth;
}

checkoutBack.addEventListener('click', () => {
  closeCheckout();
  setTimeout(openCart, 400);
});

// Checkout submit
checkoutSubmit.addEventListener('click', (e) => {
  e.preventDefault();
  if (!validateCheckout()) return;

  checkoutSubmit.disabled = true;
  checkoutSubmit.innerHTML = '<span class="spinner"></span> Processing...';

  setTimeout(() => {
    closeCheckout();
    setTimeout(showSuccess, 300);
  }, 1500);
});

function validateCheckout() {
  const name = document.getElementById('co-name').value.trim();
  const phone = document.getElementById('co-phone').value.trim().replace(/\s/g, '');
  const address = document.getElementById('co-address').value.trim();

  if (!name) { showToast('Please enter your name'); document.getElementById('co-name').focus(); return false; }
  if (!phone) { showToast('Please enter your phone number'); document.getElementById('co-phone').focus(); return false; }

  // Indonesian phone: 08xx (10-12 digits), +62 8xx, or 62 8xx
  const indoPhone = /^(?:\+62|62|0)8[1-9][0-9]{6,9}$/;
  if (!indoPhone.test(phone)) {
    showToast('Invalid Indonesian phone number');
    document.getElementById('co-phone').focus();
    return false;
  }

  if (!address) { showToast('Please enter your delivery address'); document.getElementById('co-address').focus(); return false; }
  if (!selectedPayment) { showToast('Please select a payment method'); return false; }
  if ((selectedPayment === 'transfer' || selectedPayment === 'ewallet') && !selectedSubPayment) {
    showToast('Please select a ' + (selectedPayment === 'transfer' ? 'bank' : 'e-wallet'));
    return false;
  }
  return true;
}

// Render checkout summary
function renderCheckoutSummary() {
  const el = document.getElementById('checkoutSummaryItems');
  el.innerHTML = cart.map(item => `
    <div class="summary-item">
      <div class="summary-item-img">${item.icon}</div>
      <div class="summary-item-info">
        <div class="summary-item-name">${item.name}</div>
        <div class="summary-item-meta">Qty: ${item.qty} &times; ${formatPrice(item.price)}</div>
      </div>
      <div class="summary-item-total">${formatPrice(item.price * item.qty)}</div>
    </div>
  `).join('');

  const total = getCartTotal();
  document.getElementById('coSubtotal').textContent = formatPrice(total);
  document.getElementById('coDelivery').textContent = 'Free';
  document.getElementById('coTotal').textContent = formatPrice(total);
}

// Payment options
document.querySelectorAll('.payment-opt').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.payment-opt').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    opt.querySelector('input').checked = true;
    selectedPayment = opt.dataset.method;
    selectedSubPayment = '';

    // Show/hide sub-options
    document.querySelectorAll('.payment-sub').forEach(s => s.style.display = 'none');
    const sub = document.getElementById('sub-' + opt.dataset.method);
    if (sub) sub.style.display = 'block';

    // Reset sub-selection
    document.querySelectorAll('.payment-sub-opt').forEach(s => s.classList.remove('selected'));
    document.getElementById('bankDetail').style.display = 'none';
    document.getElementById('cardForm').style.display = 'none';
  });
});

// Sub-payment options (bank / ewallet)
let selectedSubPayment = '';
const bankAccounts = {
  'BCA': '123 4567 8901',
  'Mandiri': '9876 5432 1012',
  'BNI': '4567 8901 2345',
  'BRI': '3210 9876 5432'
};

document.querySelectorAll('.payment-sub-opt').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.payment-sub-opt').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    opt.querySelector('input').checked = true;
    selectedSubPayment = opt.dataset.sub;

    // If bank transfer, show account detail
    const bankDetail = document.getElementById('bankDetail');
    if (opt.closest('#sub-transfer')) {
      document.getElementById('bankAccount').textContent = bankAccounts[opt.dataset.sub] || '—';
      document.querySelector('.bank-total').textContent = formatPrice(getCartTotal());
      bankDetail.style.display = 'block';
      document.getElementById('cardForm').style.display = 'none';
    }
    // If card, show card form
    else if (opt.closest('#sub-card')) {
      document.getElementById('cardForm').style.display = 'block';
      bankDetail.style.display = 'none';
    }
    else {
      bankDetail.style.display = 'none';
      document.getElementById('cardForm').style.display = 'none';
    }
  });
});

// Clear form
function resetCheckoutForm() {
  document.getElementById('co-name').value = '';
  document.getElementById('co-phone').value = '';
  document.getElementById('co-address').value = '';
  document.getElementById('co-notes').value = '';
  document.querySelectorAll('.payment-opt').forEach(o => o.classList.remove('selected'));
  document.querySelectorAll('.payment-sub-opt').forEach(o => o.classList.remove('selected'));
  document.querySelectorAll('.payment-sub').forEach(s => s.style.display = 'none');
  document.getElementById('bankDetail').style.display = 'none';
  selectedPayment = '';
  selectedSubPayment = '';
  const submitBtn = document.querySelector('.checkout-submit');
  submitBtn.disabled = false;
  submitBtn.innerHTML = 'Place Order &rarr;';
}

// ===== CART CHECKOUT BUTTON =====
document.querySelector('.cart-checkout-btn').addEventListener('click', openCheckout);

// ===== CLEAR CART =====
document.querySelector('.cart-clear-btn').addEventListener('click', () => {
  if (cart.length === 0) return;
  clearCart();
  showToast('Cart cleared');
});

// ===== SUCCESS SCREEN =====
function showSuccess() {
  const screen = document.querySelector('.success-screen');
  const orderId = document.getElementById('successOrderId');
  const itemsEl = document.getElementById('successItems');
  const totalEl = document.getElementById('successTotal');
  const addrEl = document.getElementById('successAddress');
  const paymentEl = document.getElementById('successPayment');
  const nameEl = document.getElementById('successName');
  const countEl = document.getElementById('successItemCount');

  const id = 'VC-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 3).toUpperCase();
  orderId.textContent = id;

  nameEl.textContent = document.getElementById('co-name').value.trim();
  countEl.textContent = getCartCount();
  totalEl.textContent = formatPrice(getCartTotal());
  addrEl.textContent = document.getElementById('co-address').value.trim();

  const payLabels = { 'cod': 'Cash on Delivery', 'transfer': 'Bank Transfer', 'ewallet': 'E-Wallet', 'card': 'Kartu Kredit / Debit' };
  let payText = payLabels[selectedPayment] || selectedPayment;
  if (selectedSubPayment) payText += ' — ' + selectedSubPayment;
  paymentEl.textContent = payText;

  itemsEl.innerHTML = cart.map(item => `
    <div class="summary-item">
      <div class="summary-item-img">${item.icon}</div>
      <div class="summary-item-info">
        <div class="summary-item-name">${item.name}</div>
        <div class="summary-item-meta">Qty: ${item.qty}</div>
      </div>
      <div class="summary-item-total">${formatPrice(item.price * item.qty)}</div>
    </div>
  `).join('');

  screen.classList.add('show');
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = getScrollbarWidth() + 'px';
  spawnConfetti();

  // Reset
  cart = [];
  updateCartBadge();
  resetCheckoutForm();
}

function closeSuccess() {
  document.querySelector('.success-screen').classList.remove('show');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

document.querySelector('.success-screen .btn').addEventListener('click', () => {
  closeSuccess();
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 200);
});

// ===== CONFETTI =====
function spawnConfetti() {
  const container = document.querySelector('.confetti-container');
  container.innerHTML = '';
  const colors = ['#c8956c', '#ddb892', '#4caf50', '#f5f0eb', '#d4a76a', '#ff7043'];
  const shapes = ['square', 'circle'];

  for (let i = 0; i < 80; i++) {
    const el = document.createElement('div');
    el.className = 'confetti ' + shapes[Math.floor(Math.random() * shapes.length)];
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.width = (Math.random() * 8 + 6) + 'px';
    el.style.height = (Math.random() * 8 + 6) + 'px';
    el.style.animationDuration = (Math.random() * 2 + 2) + 's';
    el.style.animationDelay = (Math.random() * 1.5) + 's';
    el.style.opacity = Math.random() * 0.8 + 0.2;
    container.appendChild(el);
  }

  setTimeout(() => { container.innerHTML = ''; }, 5000);
}

// ===== ADD TO CART BUTTONS =====
document.querySelectorAll('.menu-card-add').forEach(btn => {
  btn.addEventListener('click', () => {
    addToCart(btn.dataset.name, parseInt(btn.dataset.price), btn.dataset.icon);
  });
});

// ===== SIDEBAR NAV LINKS =====
document.querySelectorAll('.sidebar-nav a, .navbar-menu a').forEach(link => {
  link.addEventListener('click', closeSidebar);
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      const y = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});

// ===== SCROLL REVEAL =====
function revealOnScroll() {
  document.querySelectorAll('.reveal').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 60) el.classList.add('visible');
  });
}
window.addEventListener('scroll', revealOnScroll, { passive: true });
window.addEventListener('load', revealOnScroll);

// ===== COUNTER ANIMATION =====
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    if (el.dataset.animated) return;
    if (el.getBoundingClientRect().top > window.innerHeight) return;
    el.dataset.animated = 'true';
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const start = performance.now();
    function update(now) {
      const progress = Math.min((now - start) / 1800, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(target * eased).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}
window.addEventListener('scroll', animateCounters, { passive: true });
window.addEventListener('load', animateCounters);

// ===== NEWSLETTER =====
document.querySelector('.footer-nl-form')?.addEventListener('submit', e => {
  e.preventDefault();
  showToast('Welcome! Check your inbox for a treat.');
  e.target.reset();
});

// ===== CONTACT FORM =====
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  showToast('Message sent! We\'ll get back to you.');
  e.target.reset();
});

// ===== MENU FILTER =====
document.querySelectorAll('.menu-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.menu-filter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.category;
    document.querySelectorAll('.menu-card').forEach((card, i) => {
      const show = cat === 'all' || card.dataset.category === cat;
      card.style.display = show ? 'flex' : 'none';
      if (show) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(16px)';
        setTimeout(() => {
          card.style.transition = 'opacity .4s ease, transform .4s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, i * 40);
      }
    });
  });
});

// ===== TOAST =====
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

// ===== HERO CAROUSEL DOTS =====
const heroTrack = document.querySelector('.hero-carousel-track');
const heroDots = document.querySelectorAll('.carousel-hint span');
if (heroTrack && heroDots.length) {
  heroDots[0].classList.add('active');
  heroTrack.addEventListener('scroll', () => {
    const idx = Math.round(heroTrack.scrollLeft / heroTrack.offsetWidth);
    heroDots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }, { passive: true });

  // Autoplay for mobile only
  let heroTimer = null;
  let resumeTimeout = null;
  let scrollTimeout = null;
  const SLIDE_INTERVAL = 3500;
  const SCROLL_SETTLE = 800;

  function isMobile() { return window.innerWidth <= 768; }

  function nextSlide() {
    if (!isMobile()) return;
    const slides = heroTrack.querySelectorAll('.hero-carousel-slide');
    const idx = Math.round(heroTrack.scrollLeft / heroTrack.offsetWidth);
    const next = (idx + 1) % slides.length;
    heroTrack.scrollTo({ left: next * heroTrack.offsetWidth, behavior: 'smooth' });
  }

  function startAutoplay() {
    stopAutoplay();
    if (isMobile()) heroTimer = setInterval(nextSlide, SLIDE_INTERVAL);
  }

  function stopAutoplay() {
    if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
  }

  function scheduleResume() {
    if (resumeTimeout) clearTimeout(resumeTimeout);
    resumeTimeout = setTimeout(() => { startAutoplay(); }, SCROLL_SETTLE);
  }

  function resetResume() {
    if (resumeTimeout) { clearTimeout(resumeTimeout); resumeTimeout = null; }
  }

  // Stop autoplay on any touch activity
  heroTrack.addEventListener('touchstart', () => {
    stopAutoplay();
    resetResume();
    if (scrollTimeout) { clearTimeout(scrollTimeout); scrollTimeout = null; }
  }, { passive: true });

  // On touchend, wait for scroll to fully settle before resuming
  heroTrack.addEventListener('touchend', () => {
    scheduleResume();
  }, { passive: true });

  // While scrolling keeps happening (smooth scroll momentum), keep resetting the resume timer
  heroTrack.addEventListener('scroll', () => {
    if (!heroTimer) {
      resetResume();
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => { scheduleResume(); }, SCROLL_SETTLE);
    }
  }, { passive: true });

  window.addEventListener('resize', () => { isMobile() ? startAutoplay() : stopAutoplay(); });
  startAutoplay();
}
