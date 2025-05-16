export interface CartItem {
  name: string;
  category: string;
  price: number;
  image: string;
  quantity: number;
}

export class CartService {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = "dessertCartDB";
  private readonly STORE_NAME = "desserts";

  constructor() {
    this.initDatabase().catch((err) =>
      console.error("failed to initialize database on construction", err)
    );
  }

  public initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve();
        return;
      }
      const request = indexedDB.open(this.DB_NAME, 1);

      request.onerror = () => {
        console.error("Database error:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log("Database initialized successfully");
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, {
            keyPath: "name",
          });
        }
      };
    });
  }

  async saveCart(cart: CartItem[]): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not available"));
        return;
      }
      const transaction = this.db.transaction([this.STORE_NAME], "readwrite");
      const store = transaction.objectStore(this.STORE_NAME);
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        if (cart.length === 0) {
          resolve();
          return;
        }
        let itemsProcessed = 0;
        cart.forEach((item) => {
          const request = store.put(item);
          request.onerror = () => {
            reject(request.error);
          };
          request.onsuccess = () => {
            itemsProcessed++;
            if (itemsProcessed === cart.length) {
              resolve();
            }
          };
        });
        transaction.oncomplete = () => {
          resolve();
        };
        transaction.onerror = () => {
          reject(transaction.error);
        };
      };
      clearRequest.onerror = () => {
        reject(clearRequest.error);
      };
    });
  }

  async loadCart(): Promise<CartItem[]> {
    if (!this.db) {
      await this.initDatabase();
    }
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not available"));
        return;
      }
      const transaction = this.db.transaction([this.STORE_NAME], "readonly");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result as CartItem[]);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async clearCart(): Promise<void> {
    if (!this.db) {
      await this.initDatabase();
    }
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("Database not available"));
        return;
      }
      const transaction = this.db.transaction([this.STORE_NAME], "readwrite");
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  public static getTotalItems(cart: CartItem[]): number {
    return cart.reduce((total, item) => total + (item.quantity || 0), 0);
  }

  public static getTotalPrice(cart: CartItem[]): number {
    return cart.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 1),
      0
    );
  }
}
