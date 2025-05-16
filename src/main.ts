import { CartService, type CartItem } from "./Cart";

interface Dessert {
  name: string;
  category: string;
  price: number;
  image: {
    mobile: string;
    // [key: string]: string;
  };
}

class DesertApp {
  cart: CartItem[] = [];
  allItems: Dessert[] = [];
  totalCost: number = 0;
  cartService: CartService;

  constructor() {
    this.cartService = new CartService();
    window.addEventListener("DOMContentLoaded", () => this.initializeApp());
  }

  async initializeApp(): Promise<void> {
    try {
      await this.cartService.initDatabase();
      const [storedCart, data] = await Promise.all([
        this.cartService.loadCart(),
        fetch("src/data.json").then((res) => res.json()),
      ]);
      this.cart = storedCart;
      this.allItems = data;
      this.renderItems();
      this.cart.forEach((cartItem) => {
        this.updateButton(cartItem.name);
      });
      this.renderCart();
    } catch (error) {
      console.error("Failed to initialize app:", error);
      await this.loadData();
    }
  }

  renderItems(): void {
    const container = document.querySelector<HTMLElement>(
      ".desserts-container"
    );
    if (!container) return;

    container.innerHTML = "";
    this.allItems.forEach((dessert: Dessert) => {
      const elementId = dessert.name.replace(/[^a-zA-Z0-9-_]/g, "");
      container.innerHTML += `<div class="dessert" id='${elementId}'>
            <div class="image-container">
              <img src="${dessert.image.mobile}" alt="${
        dessert.category
      }" class="image">
              <div class="add-to-cart" id='add-to-cart-${elementId}'>
                <button class="add-to-cart-btn" onclick='app.addToCart("${
                  dessert.name
                }")'>
                  <img src="src/public/images/icon-add-to-cart.svg" alt="cart" class="add-to-cart-image">
                  <p>Add to Cart</p>
                </button>
              </div>
            </div>
            <div class="dessert-details">
              <p class="category">${dessert.category}</p>
              <p class="name">${dessert.name}</p>
              <p class="price">$${dessert.price.toFixed(2)}</p>
            </div>
          </div>`;
    });
  }

  async loadData(): Promise<void> {
    try {
      const response = await fetch("src/data.json");
      const data: Dessert[] = await response.json();
      this.allItems = data;
      this.renderItems();
      this.cart.forEach((cartItem) => {
        this.updateButton(cartItem.name);
      });
    } catch (error) {
      console.error("Failed to load data.json:", error);
    }
  }

  async addToCart(itemName: string): Promise<void> {
    const item = this.allItems.find((d) => d.name === itemName);
    if (!item) return;

    const existingItem = this.cart.find((ci) => ci.name === itemName);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({
        name: item.name,
        category: item.category,
        price: item.price,
        image: item.image.mobile,
        quantity: 1,
      });
    }
    this.updateButton(itemName);
    this.renderCart();
    try {
      await this.cartService.saveCart(this.cart);
    } catch (error) {
      console.error("failed to save cart after adding item:", error);
    }
  }

  async remove(itemName: string): Promise<void> {
    const cartItemIndex = this.cart.findIndex((ci) => ci.name === itemName);
    if (cartItemIndex > -1) {
      this.cart[cartItemIndex].quantity--;
      if (this.cart[cartItemIndex].quantity <= 0) {
        this.cart.splice(cartItemIndex, 1);
      }
      this.updateButton(itemName);
      this.renderCart();
      try {
        await this.cartService.saveCart(this.cart);
      } catch (error) {
        console.error("failed to save cart after decreasing quantity:", error);
      }
    }
  }

  async add(itemName: string): Promise<void> {
    const cartItem = this.cart.find((ci) => ci.name === itemName);
    if (cartItem) {
      cartItem.quantity++;
      this.updateButton(itemName);
      this.renderCart();
      try {
        await this.cartService.saveCart(this.cart);
      } catch (error) {
        console.error("failed to save cart after increasing quantity:", error);
      }
    }
  }

  async removeFromCart(itemName: string): Promise<void> {
    this.cart = this.cart.filter((ci) => ci.name !== itemName);
    this.updateButton(itemName);
    this.renderCart();
    try {
      await this.cartService.saveCart(this.cart);
    } catch (error) {
      console.error("failed to save cart after removing item:", error);
    }
  }

  async clearCart(): Promise<void> {
    this.cart = [];
    this.allItems.forEach((item: Dessert) => {
      this.updateButton(item.name);
    });
    this.renderCart();
    try {
      await this.cartService.clearCart();
    } catch (error) {
      console.error("failed to clear cart:", error);
    }
  }

  renderCart(): void {
    if (this.cart.length === 0) {
      this.renderEmptyCart();
      return;
    }
    const cntr = document.querySelector<HTMLElement>(".cart-items");
    if (!cntr) return;
    cntr.innerHTML = "";
    const emptyCntr = document.querySelector<HTMLElement>(".empty-cart");
    if (emptyCntr) emptyCntr.innerHTML = "";

    this.cart.forEach((cartItem) => {
      cntr.innerHTML += `<div class="cart-item">
            <div class="details">
              <p id="name">${cartItem.name}</p>
              <div class="calculation-div">
                <p class="count"><span id="count">${
                  cartItem.quantity
                }</span>x</p>
                <p class="price-in-cart">@$<span>${cartItem.price.toFixed(
                  2
                )}</span></p>
                <p class="sub-price">$<span>${(
                  cartItem.quantity * cartItem.price
                ).toFixed(2)}</span></p>
              </div>
            </div>
            <div class="clear">
              <button class="clear-btn" onclick='app.clearItem("${
                cartItem.name
              }")'>
                <img src="src/public/images/icon-remove-item.svg" alt="remove">
              </button>
            </div>
          </div>`;
    });
    this.calcTotal();
    const amountDetails =
      document.querySelector<HTMLElement>(".amount-details");
    if (!amountDetails) return;
    amountDetails.innerHTML = "";
    amountDetails.innerHTML += `<div class="order-total">
          <p>Order Total</p>
          <p id="totalCost">$<span>${this.totalCost.toFixed(2)}</span></p>
        </div>
        <!--Carbon Neutral-->
        <div class="carbon-neutral">
          <img src="src/public/images/icon-carbon-neutral.svg" alt="tree">
          <p>This is a <span class='carb-neu-font'>carbon-neutral</span> delivery</p>
        </div>
      
        <div class="confirm-order">
          <button class="confirm-order-btn" onclick="app.order()">
            <p>Confirm Order</p>
          </button>
        </div>`;
  }

  order(): void {
    const orderConfirmed =
      document.querySelector<HTMLElement>(".order-confirmed");
    if (orderConfirmed) orderConfirmed.style.display = "flex";
    const cntr = document.querySelector<HTMLElement>(".order-details");
    if (!cntr) return;
    cntr.innerHTML = "";
    this.cart.forEach((cartItem) => {
      cntr.innerHTML += `<div class="cart-item">
            <div class="details">
              <p id="name">${cartItem.name}</p>
              <div class="calculation-div">
                <p class="count"><span id="count">${
                  cartItem.quantity
                }</span>x</p>
                <p class="price-in-cart">@$<span>${cartItem.price.toFixed(
                  2
                )}</span></p>
                <p class="sub-price">$<span>${(
                  cartItem.quantity * cartItem.price
                ).toFixed(2)}</span></p>
              </div>
            </div>
          </div>`;
    });
    const orderTotal = document.querySelector<HTMLElement>(
      ".confirm-order-total"
    );
    if (!orderTotal) return;
    orderTotal.innerHTML = "";

    this.calcTotal();
    orderTotal.innerHTML += `<div class="order-total">
          <p>Order Total</p>
          <p id="totalCost">$<span>${this.totalCost.toFixed(2)}</span></p>
        </div>`;
  }

  async startNewOrder(): Promise<void> {
    const orderConfirmed =
      document.querySelector<HTMLElement>(".order-confirmed");
    if (orderConfirmed) orderConfirmed.style.display = "none";
    this.cart = [];
    this.renderCart();
    try {
      await this.cartService.clearCart();
    } catch (error) {
      console.error("Failed to clear cart during new order:", error);
    }
    const totalElement = document.querySelector<HTMLElement>("#total");
    if (totalElement) {
      totalElement.textContent = "0";
    }

    this.renderItems();
    this.allItems.forEach((item) => this.updateButton(item.name));
  }

  renderEmptyCart(): void {
    const cntr = document.querySelector<HTMLElement>(".empty-cart");
    if (cntr) {
      cntr.innerHTML = `<div class="empty-cart">
          <img src="src/public/images/illustration-empty-cart.svg" alt="empty" >
          <p>Your added items will appear here</p>
        </div>`;
    }
    const cartCntr = document.querySelector<HTMLElement>(".cart-items");
    if (cartCntr) cartCntr.innerHTML = "";
    const amountCntr = document.querySelector<HTMLElement>(".amount-details");
    if (amountCntr) amountCntr.innerHTML = "";
  }

  calcTotal(): void {
    this.totalCost = CartService.getTotalPrice(this.cart);
  }

  async clearItem(itemName: string): Promise<void> {
    this.cart = this.cart.filter((ci) => ci.name !== itemName);
    this.updateButton(itemName);
    this.renderCart();
    try {
      await this.cartService.saveCart(this.cart);
    } catch (error) {
      console.error("failed to save cart after clearing item:", error);
    }
  }

  updateButton(itemName: string): void {
    const elementId = itemName.replace(/[^a-zA-Z0-9-_]/g, "");
    const dessertElement = document.getElementById(elementId);
    if (!dessertElement) return;

    const btnContainer =
      dessertElement.querySelector<HTMLElement>(".add-to-cart");
    if (!btnContainer) return;

    const cartItem = this.cart.find((ci) => ci.name === itemName);

    if (cartItem && cartItem.quantity > 0) {
      const imgCntr = dessertElement.querySelector<HTMLElement>(".image");
      if (imgCntr) imgCntr.style.border = "2px solid hsl(14, 86%, 42%)";
      btnContainer.innerHTML = `<div class="control-btn">
            <button class="control" onclick="app.remove('${itemName}')">
              <img src="src/public/images/icon-decrement-quantity.svg" alt="remove">
            </button>
            <p id="quantity-${elementId}" class="quantity">${cartItem.quantity}</p>
            <button class="control" onclick="app.add('${itemName}')">
              <img src="src/public/images/icon-increment-quantity.svg" alt="add">
            </button>
          </div>`;
    } else {
      const imgCntr = dessertElement.querySelector<HTMLElement>(".image");
      if (imgCntr) imgCntr.style.border = "none";
      btnContainer.innerHTML = `<button class="add-to-cart-btn" onclick='app.addToCart("${itemName}")'>
          <img src="src/public/images/icon-add-to-cart.svg" alt="cart" class="add-to-cart-image">
          <p>Add to Cart</p>
        </button>`;
    }
    const totalElement = document.querySelector<HTMLElement>("#total");
    if (totalElement) {
      const totalItems = CartService.getTotalItems(this.cart); // Use static method from CartService
      totalElement.textContent = totalItems.toString();
    }
  }
}

// Create a single instance and expose methods for inline event handlers
const app = new DesertApp();

(window as any).app = app;
