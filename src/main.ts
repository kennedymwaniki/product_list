import "./style.css";
import dessertData from "./product-list-with-cart-main/data.json";
import { Cart } from "./Cart";

function init() {
  // Create new cart and load from local storage if available
  const cartManager = new Cart();
  cartManager.loadCart();

  const _isCartEmpty = cartManager.cart.length === 0;

  renderDesserts();

  renderCart();

  // Function to render all desserts
  function renderDesserts() {
    document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
      <h1>Desserts</h1>
      <div class="desserts">
        ${dessertData
          .map(
            (dessert, index) => `
              <div class="dessert" data-id="${index}">
                <img src="${dessert.image.desktop.replace(
                  "../../public",
                  "/public"
                )}" alt="${dessert.name}" />
                <div class="dessert-info">
                  <p class="category">${dessert.category}</p>
                  <h2>${dessert.name}</h2>
                  <p class="price">$${dessert.price.toFixed(2)}</p>
                  <button class="add-to-cart" data-id="${index}">
                    <img src="/public/images/icon-add-to-cart.svg" alt="cart icon" />
                    <span>Add to cart</span>
                  </button>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    `;

    document.querySelectorAll(".add-to-cart").forEach((button) => {
      button.addEventListener("click", handleAddToCart);
    });
  }

  function handleAddToCart(e: Event) {
    e.preventDefault();
    const target = e.currentTarget as HTMLButtonElement;
    const id = target.getAttribute("data-id");
    const dessertElement = target.closest(".dessert");

    if (id && dessertElement) {
      const dessert = dessertData[parseInt(id)];

      cartManager.addItem(
        id,
        dessert.name,
        dessert.category,
        dessert.price,
        dessert.image.thumbnail.replace("../../public", "/public")
      );

      renderCart();

      target.classList.add("added");
      setTimeout(() => {
        target.classList.remove("added");
      }, 500);
    }
  }

  function renderCart() {
    const cartElement = document.querySelector<HTMLDivElement>("#cart")!;

    if (_isCartEmpty) {
      cartElement.innerHTML = `
        <div class="cart-header">
          <h2>Your Cart</h2>
          <span class="cart-count">0</span>
        </div>
        <div class="empty-cart">
          <img src="/public/images/illustration-empty-cart.svg" alt="Empty cart" />
          <p>Your cart is empty</p>
        </div>
      `;
    } else {
      // Cart with items UI
      const totalItems = cartManager.getTotalItems();
      const subtotal = cartManager.getTotalPrice();
      const shipping = subtotal >= 50 ? 0 : 5; // Free shipping over $50
      const tax = subtotal * 0.07; // 7% tax
      const total = subtotal + shipping + tax;

      cartElement!.innerHTML = `
        <div class="cart-header">
          <h2>Your Cart</h2>
          <span class="cart-count">${totalItems}</span>
        </div>
        <div class="cart-items">
          ${cartManager.cart
            .map(
              (item) => `
            <div class="cart-item" data-id="${item.id}">
              <img src="${item.image}" alt="${item.name}" />
              <div class="cart-item-details">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                <div class="cart-item-quantity">
                  <button class="quantity-btn decrease" data-id="${
                    item.id
                  }">-</button>
                  <span>${item.quantity}</span>
                  <button class="quantity-btn increase" data-id="${
                    item.id
                  }">+</button>
                  <button class="remove-item" data-id="${
                    item.id
                  }">Remove</button>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        <div class="cart-summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>$${shipping.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Tax</span>
            <span>$${tax.toFixed(2)}</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
          </div>
          <button class="checkout-btn">Checkout</button>
        </div>
      `;

      // Add event listeners for cart actions
      document.querySelectorAll(".quantity-btn.decrease").forEach((button) => {
        button.addEventListener("click", (e) => {
          const id = (e.currentTarget as HTMLButtonElement).getAttribute(
            "data-id"
          );
          if (id) {
            cartManager.updateQuantity(id, -1);
            renderCart();
          }
        });
      });

      document.querySelectorAll(".quantity-btn.increase").forEach((button) => {
        button.addEventListener("click", (e) => {
          const id = (e.currentTarget as HTMLButtonElement).getAttribute(
            "data-id"
          );
          if (id) {
            cartManager.updateQuantity(id, 1);
            renderCart();
          }
        });
      });

      document.querySelectorAll(".remove-item").forEach((button) => {
        button.addEventListener("click", (e) => {
          const id = (e.currentTarget as HTMLButtonElement).getAttribute(
            "data-id"
          );
          if (id) {
            cartManager.removeItem(id);
            renderCart();
          }
        });
      });

      document.querySelector(".checkout-btn")?.addEventListener("click", () => {
        alert(
          "Thank you for your order! This is just a demo so no actual order will be processed."
        );
        cartManager.clearCart();
        renderCart();
      });
    }
  }
}

init();
