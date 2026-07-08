import React, { useState, useEffect } from 'react';
import CartItem from './CartItem';
import { CartManager } from '../utils/cartManager';

/**
 * Shopping cart component
 * Can be used as a standalone component or embedded in other pages
 */
const Cart = ({ onClose, isModal = false }) => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Load cart data on component mount
  useEffect(() => {
    loadCartData();

    // Add event listener for cart updates
    window.addEventListener('cartUpdated', loadCartData);

    return () => {
      window.removeEventListener('cartUpdated', loadCartData);
    };
  }, []);

  // Load cart data from CartManager
  const loadCartData = () => {
    const items = CartManager.getCart();
    setCartItems(items);

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(totalAmount);
  };

  // Handle quantity changes
  const handleUpdateQuantity = (index, newQuantity) => {
    const updatedCart = [...cartItems];
    const itemId = updatedCart[index].id;

    CartManager.updateQuantity(itemId, newQuantity);
    loadCartData();
  };

  // Handle item removal
  const handleRemoveItem = (index) => {
    const itemId = cartItems[index].id;
    CartManager.removeItem(itemId);
    loadCartData();
  };

  // Clear the entire cart
  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro que deseas vaciar el carrito?')) {
      CartManager.clearCart();
      loadCartData();
    }
  };

  // Prepare WhatsApp checkout message
  const handleWhatsAppCheckout = () => {
    if (cartItems.length === 0) return;

    // Get WhatsApp number from the environment or use a default
    const whatsappNumber = '+51987654321'; // Should be replaced with your actual WhatsApp number

    // Prepare WhatsApp message
    let message = `*Nuevo pedido desde FluentReads*\n\n*Productos:*\n`;

    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.title} (${item.quantity}x) - S/${(
        item.price * item.quantity
      ).toFixed(2)}\n`;
    });

    message += `\n*Total: S/${total.toFixed(
      2
    )}*\n\nPor favor, confirmame este pedido para enviarte los datos de pago. ¡Gracias!`;

    // Open WhatsApp with the message
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Render empty state if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className={`cart-container ${isModal ? 'is-modal' : ''}`}>
        <div className="py-8 text-center">
          <div className="mb-4 text-5xl">🛒</div>
          <h3 className="mb-3 text-xl font-bold text-gray-700">Tu carrito está vacío</h3>
          <p className="mb-4 text-gray-500">
            Explora nuestro catálogo y añade productos a tu carrito
          </p>
          <a
            href="/catalogo"
            className="bg-primary hover:bg-primary-dark inline-block rounded px-4 py-2 font-medium text-white transition-colors"
          >
            Ver Catálogo
          </a>
        </div>
        {isModal && (
          <div className="mt-4 text-center">
            <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
              Cerrar
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`cart-container ${isModal ? 'is-modal' : ''}`}>
      {/* Cart header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Tu Carrito</h2>
        {isModal && (
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            aria-label="Cerrar carrito"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Cart items list */}
      <div className="mb-6 space-y-4">
        {cartItems.map((item, index) => (
          <CartItem
            key={`${item.id}-${index}`}
            item={item}
            index={index}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveItem}
          />
        ))}
      </div>

      {/* Order summary */}
      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="text-primary-dark mb-4 flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span>S/{total.toFixed(2)}</span>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            className="bg-accent hover:bg-accent-dark flex w-full items-center justify-center rounded px-4 py-2 font-medium text-white"
            onClick={handleWhatsAppCheckout}
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Realizar pedido
          </button>

          {isModal ? (
            <a
              href="/checkout"
              className="bg-primary hover:bg-primary-dark block w-full rounded px-4 py-2 text-center font-medium text-white"
            >
              Ver carrito completo
            </a>
          ) : (
            <button
              className="w-full rounded border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100"
              onClick={handleClearCart}
            >
              Vaciar carrito
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
