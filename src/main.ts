import "./style.css";
import dessertData from "./product-list-with-cart-main/data.json";
import { Cart } from "./Cart";

function init() {
  // Create new cart and load from local storage if available
  const cartManager = new Cart();
  cartManager.loadCart();

  // Add event listeners to static HTML add to cart buttons
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", handleStaticAddToCart);
  });

  // Initialize cart display
  renderCart();

  // Function to handle adding items to cart from static HTML
  function handleStaticAddToCart(e: Event) {
    e.preventDefault();
    const target = e.currentTarget as HTMLButtonElement;
    const id = target.closest(".dessert")?.getAttribute("data-id") || "";
    const dessertElement = target.closest(".dessert");

    if (id && dessertElement) {
      const dessertName = dessertElement.querySelector("h2")?.textContent || "";
      const dessertCategory =
        dessertElement.querySelector("p")?.textContent || "";
      const priceString =
        dessertElement.querySelector("p:nth-of-type(2)")?.textContent || "0";
      const dessertPrice = parseFloat(priceString);
      const dessertImage =
        dessertElement.querySelector("img")?.getAttribute("src") || "";

      // Add item to cart
      cartManager.addItem(
        id,
        dessertName,
        dessertCategory,
        dessertPrice,
        dessertImage
      );

      // Update cart UI
      renderCart();

      // Add animation or feedback
      target.classList.add("added");
      setTimeout(() => {
        target.classList.remove("added");
      }, 500);
    }
  }

  // We're working with static HTML only, so no need for the handleAddToCart function

  function renderCart() {
    const cartElement = document.querySelector<HTMLDivElement>("#cart")!;

    if (cartManager.cart.length === 0) {
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
