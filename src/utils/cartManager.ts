/**
 * Shopping Cart Manager
 * Handles all shopping cart operations: add, remove, update items and localStorage management
 *
 * The cart only persists productId/productType/quantity — never price or
 * title. Anything display-worthy (title, image, price) is resolved from the
 * canonical build-time catalog at checkout (see src/utils/catalogPricing.ts),
 * so tampering with localStorage can't change what a customer is charged.
 */

export type ProductType = 'book' | 'exam' | 'pack' | 'offer';

export interface CartItem {
  id: string;
  type: ProductType;
  quantity: number;
}

const VALID_TYPES: ProductType[] = ['book', 'exam', 'pack', 'offer'];
const MAX_QUANTITY = 99;

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.type === 'string' &&
    VALID_TYPES.includes(item.type as ProductType) &&
    typeof item.quantity === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0 &&
    item.quantity <= MAX_QUANTITY
  );
}

export class CartManager {
  private static STORAGE_KEY = 'shoppingCart';
  static readonly MAX_QUANTITY = MAX_QUANTITY;

  /**
   * Initialize the shopping cart in localStorage if it doesn't exist
   */
  static initializeCart(): void {
    try {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify([]));
      }
    } catch (e) {
      console.warn('LocalStorage error during cart initialization:', e);
    }
  }

  /**
   * Get all items from the cart. Entries that are malformed, corrupted, or
   * have an out-of-range quantity are silently dropped rather than trusted.
   */
  static getCart(): CartItem[] {
    try {
      const cart = localStorage.getItem(this.STORAGE_KEY);
      if (!cart) return [];
      const parsed = JSON.parse(cart);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isValidCartItem);
    } catch (e) {
      console.error('Error parsing cart from localStorage:', e);
      return [];
    }
  }

  private static persist(cart: CartItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
      this.showNotification('No se pudo guardar en el carrito. Espacio insuficiente.', 'error');
    }
  }

  /**
   * Add a product to the cart by id/type. Only identity is persisted —
   * price and title are resolved from the canonical catalog when needed.
   */
  static addItem(id: string, type: ProductType): void {
    const cart = this.getCart();
    const existingIndex = cart.findIndex((item) => item.id === id && item.type === type);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity = Math.min(cart[existingIndex].quantity + 1, MAX_QUANTITY);
    } else {
      cart.push({ id, type, quantity: 1 });
    }

    this.persist(cart);
  }

  /**
   * Remove an item from the cart. `type` disambiguates in the (unlikely but
   * possible) case a book/pack/exam/offer id collides across types.
   */
  static removeItem(id: string, type: ProductType): void {
    const cart = this.getCart();
    const updatedCart = cart.filter((item) => !(item.id === id && item.type === type));
    this.persist(updatedCart);
  }

  /**
   * Update quantity of an item in the cart. Non-integer, non-positive, or
   * excessive quantities are ignored rather than applied.
   */
  static updateQuantity(id: string, type: ProductType, quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return;

    const cart = this.getCart();
    const itemIndex = cart.findIndex((item) => item.id === id && item.type === type);

    if (itemIndex !== -1) {
      cart[itemIndex].quantity = quantity;
      this.persist(cart);
    }
  }

  /**
   * Clear the entire cart
   */
  static clearCart(): void {
    this.persist([]);
  }

  /**
   * Get the count of items in the cart
   */
  static getItemCount(): number {
    return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
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
