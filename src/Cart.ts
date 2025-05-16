export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  image: string;
}

export class Cart {
  public cart: CartItem[] = [];

  addItem(
    id: string,
    name: string,
    category: string,
    price: number,
    image: string
  ) {
    const existingItemIndex = this.cart.findIndex((item) => item.id === id);

    if (existingItemIndex !== -1) {
      this.cart[existingItemIndex].quantity += 1;
    } else {
      this.cart.push({ id, name, category, price, quantity: 1, image });
    }

    this.saveCart();

    return this.cart;
  }

  getItems() {
    return this.cart;
  }

  getTotalPrice() {
    return this.cart.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  getTotalItems() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  removeItem(id: string) {
    this.cart = this.cart.filter((item) => item.id !== id);
    this.saveCart();
    return this.cart;
  }

  updateQuantity(id: string, change: number) {
    const itemIndex = this.cart.findIndex((item) => item.id === id);

    if (itemIndex !== -1) {
      const newQuantity = this.cart[itemIndex].quantity + change;

      if (newQuantity <= 0) {
        this.removeItem(id);
      } else {
        this.cart[itemIndex].quantity = newQuantity;
      }

      this.saveCart();
    }

    return this.cart;
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
    return this.cart;
  }

  private saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.cart));
  }

  loadCart() {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
    }
    return this.cart;
  }
}
