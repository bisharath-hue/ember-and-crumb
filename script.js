document.addEventListener('DOMContentLoaded', () => {
  // ------------------------------------------------------------------
  // 1. MOBILE NAVIGATION TOGGLE
  // ------------------------------------------------------------------
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ------------------------------------------------------------------
  // 2. CATEGORY FILTERING (DOM Manipulation)
  // ------------------------------------------------------------------
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ------------------------------------------------------------------
  // 3. SHOPPING CART STATE & LOCALSTORAGE
  // ------------------------------------------------------------------
  let cart = JSON.parse(localStorage.getItem('ember_crumb_cart')) || [];

  const cartTrigger = document.getElementById('cart-trigger');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartClose = document.getElementById('cart-close');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalPrice = document.getElementById('cart-total-price');
  const cartBadge = document.getElementById('cart-badge');
  const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');

  function saveCart() {
    localStorage.setItem('ember_crumb_cart', JSON.stringify(cart));
    updateCartUI();
  }

  function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalCount;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your selection is currently empty.</p>';
      cartTotalPrice.textContent = '₹0';
      return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
      total += item.price * item.quantity;
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div>
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-controls">
            <button onclick="changeQuantity(${item.id}, -1)">-</button>
            <span>${item.quantity}</span>
            <button onclick="changeQuantity(${item.id}, 1)">+</button>
          </div>
        </div>
        <div>₹${item.price * item.quantity}</div>
      `;
      cartItemsContainer.appendChild(itemEl);
    });

    cartTotalPrice.textContent = `₹${total}`;
  }

  window.changeQuantity = function(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    saveCart();
  };

  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.getAttribute('data-id'));
      const name = btn.getAttribute('data-name');
      const price = parseInt(btn.getAttribute('data-price'));

      const existingItem = cart.find(i => i.id === id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ id, name, price, quantity: 1 });
      }

      saveCart();
      openCart();
    });
  });

  function openCart() {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
  }

  function closeCart() {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
  }

  if (cartTrigger) cartTrigger.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Initialize UI on startup
  updateCartUI();

  // ------------------------------------------------------------------
  // 4. FORM VALIDATION
  // ------------------------------------------------------------------
  const enquiryForm = document.getElementById('enquiry-form');
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const dateInput = document.getElementById('event-date');

      const nameError = document.getElementById('name-error');
      const emailError = document.getElementById('email-error');
      const dateError = document.getElementById('date-error');
      const successMsg = document.getElementById('form-success');

      nameError.textContent = '';
      emailError.textContent = '';
      dateError.textContent = '';
      successMsg.textContent = '';

      if (!nameInput.value.trim()) {
        nameError.textContent = 'Please provide your name.';
        isValid = false;
      }

      const emailPattern = /^[^s@]+@[^s@]+.[^s@]+$/;
      if (!emailPattern.test(emailInput.value.trim())) {
        emailError.textContent = 'Please enter a valid email address.';
        isValid = false;
      }

      if (!dateInput.value) {
        dateError.textContent = 'Please select a pickup date.';
        isValid = false;
      }

      if (isValid) {
        successMsg.textContent = 'Thank you! Your custom enquiry has been received.';
        enquiryForm.reset();
      }
    });
  }
});