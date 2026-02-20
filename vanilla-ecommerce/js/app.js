// app.js
// ------
// This file contains all the DOM manipulation and cart logic for the page.
//
// High‑level flow:
// 1) Wait for the DOM to finish loading.
// 2) Render product cards into the grid using the "products" array from products.js.
// 3) Set up "Add to Cart" button listeners for each card.
// 4) Store cart items in localStorage so they persist across page refreshes.
// 5) Keep the cart counter in the navbar synchronized with the current cart.

// A string constant for the localStorage key so we don't accidentally typo it.
const CART_STORAGE_KEY = "amen_cart";

// In‑memory representation of the cart.
// It will look like: [{ productId: 1, quantity: 2 }, { productId: 3, quantity: 1 }]
let cart = [];
// Whether the cart preview shows prices/details. Toggled by the 'View Cart' button.
let cartPreviewShowDetails = false;

/**
 * readCartFromStorage
 * -------------------
 * Reads any existing cart data from localStorage and returns it as a JavaScript array.
 * If nothing is stored yet, it returns an empty array instead.
 */
function readCartFromStorage() {
  // localStorage stores only strings.
  // We try to read the string value associated with CART_STORAGE_KEY.
  const stored = window.localStorage.getItem(CART_STORAGE_KEY);

  // If there is no value yet, we return an empty array.
  if (!stored) {
    return [];
  }

  try {
    // If there is a value, we parse the JSON string back into a JavaScript array.
    const parsed = JSON.parse(stored);

    // We add a simple safety check: ensure it's an array.
    if (Array.isArray(parsed)) {
      return parsed;
    }

    // If the parsed result isn't an array for some reason, we ignore it.
    return [];
  } catch (error) {
    console.error("Failed to parse cart from localStorage:", error);
    return [];
  }
}

/**
 * writeCartToStorage
 * ------------------
 * Saves the current `cart` array to localStorage as a JSON string.
 */
function writeCartToStorage() {
  // JSON.stringify turns our cart array into a string so localStorage can store it.
  const serialized = JSON.stringify(cart);
  window.localStorage.setItem(CART_STORAGE_KEY, serialized);
}

/**
 * getCartItemCount
 * ----------------
 * Returns the total number of items in the cart (summing quantities).
 * For example, if the cart is:
 *   [{productId: 1, quantity: 2}, {productId: 2, quantity: 1}]
 * this function returns 3.
 */
function getCartItemCount() {
  return cart.reduce(function (total, item) {
    return total + item.quantity;
  }, 0);
}

/**
 * updateCartCounter
 * -----------------
 * Updates the number inside the navbar cart badge.
 * It reads from the global `cart` variable and uses `getCartItemCount()`.
 */
function updateCartCounter() {
  // We grab the span element in the navbar that shows the count.
  const counterElement = document.getElementById("cart-count");

  if (!counterElement) {
    // If the element isn't found, we log an error and stop.
    console.warn("Cart counter element not found in the DOM.");
    return;
  }

  // Set the textContent to the number of items in the cart.
  counterElement.textContent = String(getCartItemCount());
}

/**
 * findProductById
 * ---------------
 * Helper that looks through the `products` array (from products.js)
 * to find a product with a matching `id`.
 */
function findProductById(productId) {
  // The products array is defined in products.js and loaded before this file.
  return products.find(function (product) {
    return product.id === productId;
  });
}

/**
 * addToCart
 * ---------
 * Adds a product to the cart, or increases its quantity if it already exists.
 * This function updates the in‑memory `cart`, saves it to localStorage,
 * and refreshes the navbar counter.
 */
function addToCart(productId) {
  // First, verify that a product with this id actually exists.
  const product = findProductById(productId);

  if (!product) {
    console.warn("Tried to add missing product with id:", productId);
    return;
  }

  // Look for an existing entry with the same productId.
  const existing = cart.find(function (item) {
    return item.productId === productId;
  });

  if (existing) {
    // If we already have this product in the cart, we just increase its quantity by 1.
    existing.quantity += 1;
  } else {
    // Otherwise, we push a new item into our cart array.
    cart.push({
      productId: productId,
      quantity: 1,
    });
  }

  // Whenever the cart changes, we:
  // 1) save it to localStorage so it persists through refreshes
  // 2) update the UI counter
  writeCartToStorage();
  updateCartCounter();
  renderCartPreview();
}

/**
 * renderCartPreview
 * -----------------
 * Renders the current cart contents inside the preview panel.
 */
function renderCartPreview() {
  const preview = document.getElementById("cart-preview");
  if (!preview) return;

  const itemsEl = preview.querySelector(".cart-items");
  const emptyEl = preview.querySelector(".cart-empty");
  const totalEl = preview.querySelector(".cart-total");

  itemsEl.innerHTML = "";

  if (!cart || cart.length === 0) {
    emptyEl.style.display = "block";
    itemsEl.style.display = "none";
    totalEl.textContent = "Total: ETB 0.00";
    return;
  }

  emptyEl.style.display = "none";
  itemsEl.style.display = "flex";

  let total = 0;

  cart.forEach(function (entry) {
    const product = findProductById(entry.productId) || { name: "Unknown", price: 0 };
    const li = document.createElement("li");
    li.setAttribute("data-product-id", String(entry.productId));
    li.className = "cart-item";

    const nameSpan = document.createElement("span");
    nameSpan.className = "cart-item-name";
    nameSpan.textContent = product.name;

    const qtySpan = document.createElement("span");
    qtySpan.className = "cart-item-qty";
    qtySpan.textContent = `× ${entry.quantity}`;
    // hide quantity when details are not shown
    qtySpan.style.display = cartPreviewShowDetails ? "inline" : "none";

    // price per item (only shown when details enabled)
    const priceSpan = document.createElement("span");
    priceSpan.className = "cart-item-price";
    priceSpan.textContent = cartPreviewShowDetails ? `ETB ${ (product.price * entry.quantity).toFixed(2) }` : "";
    priceSpan.style.display = cartPreviewShowDetails ? "inline" : "none";

    li.appendChild(nameSpan);
    li.appendChild(qtySpan);
    li.appendChild(priceSpan);

    // click/touch selects an item visually and updates the selected list
    li.addEventListener("click", function () {
      li.classList.toggle("selected");
      updateSelectedList(preview);
    });

    itemsEl.appendChild(li);

    total += product.price * entry.quantity;
  });

  // show total only when details are enabled
  if (cartPreviewShowDetails) {
    totalEl.textContent = `Total: ETB ${total.toFixed(2)}`;
    totalEl.style.display = "inline";
  } else {
    totalEl.textContent = "";
    totalEl.style.display = "none";
  }
  // after rendering items, refresh the selected list UI
  updateSelectedList(preview);
}

/**
 * updateSelectedList
 * ------------------
 * Reads current selected items in the preview and displays them in the
 * `.selected-list` area with a 'Deselect' button for each.
 */
function updateSelectedList(preview) {
  if (!preview) return;
  const itemsEl = preview.querySelector(".cart-items");
  const selContainer = preview.querySelector(".selected-container");
  const selList = preview.querySelector(".selected-list");
  if (!selContainer || !selList || !itemsEl) return;

  const selectedItems = Array.from(itemsEl.querySelectorAll("li.selected"));
  selList.innerHTML = "";

  if (selectedItems.length === 0) {
    selContainer.style.display = "none";
    return;
  }

  selContainer.style.display = "block";

  selectedItems.forEach(function (li) {
    const productId = li.getAttribute("data-product-id");
    const product = findProductById(Number(productId)) || { name: "Unknown" };

    const itemLi = document.createElement("li");
    itemLi.className = "selected-item";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = product.name;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "deselect-btn";
    btn.textContent = "Deselect";

    btn.addEventListener("click", function (ev) {
      ev.stopPropagation();
      // Remove the item from the cart array entirely
      const id = Number(productId);
      const idx = cart.findIndex(function (c) {
        return c.productId === id;
      });
      if (idx !== -1) {
        cart.splice(idx, 1);
        writeCartToStorage();
        updateCartCounter();
      }

      // re-render the preview so the item disappears from both lists
      renderCartPreview();
    });

    itemLi.appendChild(nameSpan);
    itemLi.appendChild(btn);
    selList.appendChild(itemLi);
  });
}

/**
 * setupCartPreviewToggle
 * ----------------------
 * Toggle preview on cart indicator click/touch and close when clicking outside.
 */
function setupCartPreviewToggle() {
  const indicator = document.getElementById("cart-indicator");
  const preview = document.getElementById("cart-preview");
  if (!indicator || !preview) return;

  function open() {
    preview.classList.add("open");
    preview.setAttribute("aria-hidden", "false");
  }

  function close() {
    preview.classList.remove("open");
    preview.setAttribute("aria-hidden", "true");
  }

  indicator.addEventListener("click", function (e) {
    e.stopPropagation();
    if (preview.classList.contains("open")) close();
    else {
      renderCartPreview();
      open();
    }
  });

  // attach behavior to 'View Cart' button inside the preview to toggle details
  function attachViewCartToggle() {
    const viewBtn = preview.querySelector('.view-cart');
    if (!viewBtn) return;

    viewBtn.addEventListener('click', function (ev) {
      ev.preventDefault();
      // toggle showing prices/details and re-render
      cartPreviewShowDetails = !cartPreviewShowDetails;
      renderCartPreview();
      // update button label
      viewBtn.textContent = cartPreviewShowDetails ? 'Hide Details' : 'View Cart';
    });
  }

  // call attach after rendering so the button exists
  preview.addEventListener('click', function () {
    // ensure the view button has an event attached after render
    attachViewCartToggle();
  }, { once: true });

  // click outside closes
  document.addEventListener("click", function (e) {
    if (!preview.contains(e.target) && !indicator.contains(e.target)) close();
  });

  // close on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });
}

/**
 * createProductCardElement
 * ------------------------
 * Given a single product object, this function builds the DOM structure
 * for one product card and returns the top‑level DOM element.
 *
 * We use `document.createElement` and `appendChild` so you can see how
 * amen DOM manipulation works without any frameworks.
 */
function createProductCardElement(product) {
  // Create the outer card container.
  const card = document.createElement("article");
  card.className = "product-card";

  // --- Image wrapper and image element ---
  const imageWrapper = document.createElement("div");
  imageWrapper.className = "product-image-wrapper";

  const img = document.createElement("img");
  img.className = "product-image";
  img.src = product.image;
  img.alt = product.name;

  imageWrapper.appendChild(img);
  card.appendChild(imageWrapper);

  // open image in full-size modal on click or Enter/Space
  img.tabIndex = 0;
  img.style.cursor = "zoom-in";
  img.addEventListener("click", function () {
    openProductModal(product.image, product.name);
  });
  img.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openProductModal(product.image, product.name);
    }
  });

  // --- Info container ---
  const info = document.createElement("div");
  info.className = "product-info";

  const nameEl = document.createElement("h3");
  nameEl.className = "product-name";
  nameEl.textContent = product.name;
  info.appendChild(nameEl);

  const priceEl = document.createElement("p");
  priceEl.className = "product-price";
  priceEl.textContent = "ETB " + product.price.toFixed(2);
  info.appendChild(priceEl);

  const metaEl = document.createElement("p");
  metaEl.className = "product-meta";
  metaEl.textContent = "Ships in 2–3 business days.";
  info.appendChild(metaEl);

  // --- Actions row with Add to Cart button ---
  const actions = document.createElement("div");
  actions.className = "product-actions";

  const addButton = document.createElement("button");
  addButton.className = "add-to-cart-btn";
  addButton.type = "button";
  addButton.textContent = "Add to Cart";

  // Here we attach a click listener that calls addToCart with this product's id.
  // Notice how we close over "product" so we know which id to use.
  addButton.addEventListener("click", function () {
    addToCart(product.id);
  });

  actions.appendChild(addButton);
  info.appendChild(actions);

  card.appendChild(info);

  return card;
}

/**
 * renderProducts
 * --------------
 * Renders all products into the grid container in the HTML.
 * It:
 * 1) Finds the grid element by id.
 * 2) Clears out any existing children (so we can re‑render safely).
 * 3) Loops over the `products` array and adds a card for each product.
 */
function renderProducts() {
  // Find the grid container in index.html
  const grid = document.getElementById("products-grid");

  if (!grid) {
    console.error("No #products-grid element found in the DOM.");
    return;
  }

  // Remove any existing products (useful if we re‑render later).
  grid.innerHTML = "";

  // Loop over each product and create a DOM node for it.
  products.forEach(function (product) {
    const cardElement = createProductCardElement(product);
    grid.appendChild(cardElement);
  });
}

/**
 * setupHeroCta
 * ------------
 * Adds a click handler to the "Shop Now" button that scrolls
 * smoothly down to the products section.
 */
function setupHeroCta() {
  const heroButton = document.getElementById("hero-cta");
  const productsSection = document.querySelector(".products-section");

  if (!heroButton || !productsSection) {
    return;
  }

  heroButton.addEventListener("click", function () {
    // `scrollIntoView` tells the browser to scroll so the section becomes visible.
    productsSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  });
}

/**
 * setupContactForm
 * ----------------
 * Attaches a basic submit handler to the contact form. For this demo the
 * message is saved to localStorage under `amen_contact_messages` and a
 * transient success notice is shown. The user can later replace this with
 * an integration to `email.js` or a backend endpoint.
 */
function setupContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = (form.querySelector("#contact-name") || {}).value || "";
    const email = (form.querySelector("#contact-email") || {}).value || "";
    const message = (form.querySelector("#contact-message") || {}).value || "";

    // store locally so developers can inspect submissions during development
    const key = "amen_contact_messages";
    let stored = [];
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) stored = JSON.parse(raw) || [];
    } catch (err) {
      stored = [];
    }

    stored.push({ name: name.trim(), email: email.trim(), message: message.trim(), time: new Date().toISOString() });
    window.localStorage.setItem(key, JSON.stringify(stored));

    // show transient success notice
    const existing = document.getElementById("contact-success-msg");
    if (existing) existing.remove();
    const notice = document.createElement("div");
    notice.id = "contact-success-msg";
    notice.className = "contact-success";
    notice.textContent = "Message received — thank you! (demo only)";
    form.appendChild(notice);

    form.reset();

    // auto-remove with a small fade
    setTimeout(() => {
      notice.classList.add("hide");
      setTimeout(() => notice.remove(), 300);
    }, 2200);

    // helpful dev log
    console.log("Contact message stored (demo):", { name, email, message });
  });
}

/**
 * setupMobileMenu
 * ---------------
 * Handles the small-screen menu toggle and accessibility states.
 */
function setupMobileMenu() {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add("open");
    menu.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    menu.classList.remove("open");
    menu.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", function () {
    if (menu.classList.contains("open")) closeMenu();
    else openMenu();
  });

  // close when a link inside the mobile menu is clicked
  menu.addEventListener("click", function (e) {
    if (e.target && e.target.tagName === "A") {
      closeMenu();
    }
  });

  // close on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  // ensure menu closes when resizing to large screens
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) closeMenu();
  });
}

/**
 * setCurrentYear
 * --------------
 * Simple helper that puts the current year into the footer span.
 */
function setCurrentYear() {
  const yearSpan = document.getElementById("year");
  if (!yearSpan) return;

  yearSpan.textContent = String(new Date().getFullYear());
}

/**
 * Product modal: open/close logic
 */
function openProductModal(src, caption) {
  const modal = document.getElementById("product-modal");
  const img = document.getElementById("product-modal-img");
  const cap = document.getElementById("product-modal-caption");
  if (!modal || !img) return;

  img.src = src;
  img.alt = caption || "";
  if (cap) cap.textContent = caption || "";

  modal.setAttribute("aria-hidden", "false");

  // focus trap: move focus to close button
  const closeBtn = modal.querySelector(".modal-close");
  if (closeBtn) closeBtn.focus();
}

function closeProductModal() {
  const modal = document.getElementById("product-modal");
  const img = document.getElementById("product-modal-img");
  if (!modal || !img) return;

  modal.setAttribute("aria-hidden", "true");
  img.src = "";
}

function setupProductModal() {
  const modal = document.getElementById("product-modal");
  if (!modal) return;

  // close elements (backdrop and close button)
  modal.addEventListener("click", function (e) {
    const action = e.target.getAttribute && e.target.getAttribute("data-action");
    if (action === "close" || e.target.classList.contains("modal-close")) {
      closeProductModal();
    }
  });

  // close on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeProductModal();
  });
}

function setupFeaturedImageModal() {
  const featuredImg = document.querySelector('.featured-image img');
  if (!featuredImg) return;

  // make it keyboard focusable and hint interaction
  featuredImg.setAttribute('tabindex', '0');
  featuredImg.style.cursor = 'zoom-in';

  const openFromImage = () => openProductModal(featuredImg.src, featuredImg.alt || 'Featured product');

  featuredImg.addEventListener('click', openFromImage);
  featuredImg.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFromImage();
    }
  });
}

/**
 * init
 * ----
 * This is the main initialization function for the page.
 * It runs once after the DOM has loaded.
 */
function init() {
  // 1) Load any existing cart from localStorage into our in‑memory `cart`.
  cart = readCartFromStorage();

  // 2) Render all product cards.
  renderProducts();

  // 3) Sync the navbar counter with the current cart contents.
  updateCartCounter();

  // 4) Wire up the hero CTA scroll behavior.
  setupHeroCta();

  // 4.5) Wire up contact form handling
  setupContactForm();

  // 4.75) Wire up mobile menu toggle for small screens
  setupMobileMenu();

  // 4.9) Wire up cart preview toggle
  setupCartPreviewToggle();

  // initial render of cart preview
  renderCartPreview();

  // product modal setup
  setupProductModal();

  // featured banner image: open in product modal on click/keyboard
  setupFeaturedImageModal();

  // 5) Set the footer year.
  setCurrentYear();
}

// We wait until the DOM is fully parsed before running init.
// This ensures that all the elements we query (like #products-grid)
// are already present in the document.
document.addEventListener("DOMContentLoaded", init);

