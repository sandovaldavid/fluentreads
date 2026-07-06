/**
 * Shopping Cart Manager
 * Handles all shopping cart operations: add, remove, update items and localStorage management
 */

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  type: 'book' | 'exam' | 'pack';
  quantity: number;
}

export class CartManager {
  private static STORAGE_KEY = 'shoppingCart';

  /**
   * Initialize the shopping cart in localStorage if it doesn't exist
   */
  static initializeCart(): void {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
    }
  }

  /**
   * Get all items from the cart
   */
  static getCart(): CartItem[] {
    const cart = localStorage.getItem(this.STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  }

  /**
   * Add an item to the cart
   */
  static addItem(item: Omit<CartItem, 'quantity'>): void {
    const cart = this.getCart();

    // Check if product is already in cart
    const existingProductIndex = cart.findIndex((cartItem) => cartItem.id === item.id);

    if (existingProductIndex >= 0) {
      // Update quantity if product exists
      cart[existingProductIndex].quantity += 1;
    } else {
      // Add new product to cart
      cart.push({
        ...item,
        quantity: 1,
      });
    }

    // Update cart in localStorage
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
  }

  /**
   * Remove an item from the cart
   */
  static removeItem(id: string): void {
    const cart = this.getCart();
    const updatedCart = cart.filter((item) => item.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedCart));
  }

  /**
   * Update quantity of an item in the cart
   */
  static updateQuantity(id: string, quantity: number): void {
    if (quantity < 1) return;

    const cart = this.getCart();
    const itemIndex = cart.findIndex((item) => item.id === id);

    if (itemIndex !== -1) {
      cart[itemIndex].quantity = quantity;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
    }
  }

  /**
   * Clear the entire cart
   */
  static clearCart(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
  }

  /**
   * Get the count of items in the cart
   */
  static getItemCount(): number {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
  }

  /**
   * Calculate the cart total price
   */
  static getCartTotal(): number {
    return this.getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  /**
   * Show a notification when items are added or modified in the cart
   */
  static showNotification(message: string, type: 'success' | 'error' = 'success'): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `cart-notification fixed top-20 right-4 
      ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} 
      text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full opacity-0`;
    notification.textContent = message;

    // Add to DOM
    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => {
      notification.classList.remove('translate-x-full', 'opacity-0');
    }, 10);

    // Remove after delay
    setTimeout(() => {
      notification.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Initialize cart on module import
if (typeof window !== 'undefined') {
  CartManager.initializeCart();
}
