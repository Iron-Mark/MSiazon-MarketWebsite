// Cart Page Component
class CartPage {
    constructor() {
        this.cart = [];
    }

    loadCart() {
        this.cart = cartManager.getCart();
    }

    updateQuantity(productId, quantity) {
        cartManager.updateQuantity(productId, quantity);
        this.loadCart();
        this.updateCartDisplay();
    }

    removeItem(productId) {
        cartManager.removeFromCart(productId);
        this.loadCart();
        this.updateCartDisplay();
        showAlert('Item removed from cart', 'info');
    }

    updateCartDisplay() {
        const cartContainer = document.getElementById('cartItemsContainer');
        const cartTotal = document.getElementById('cartTotal');

        if (cartContainer) {
            cartContainer.innerHTML = this.renderCartItems();
        }

        if (cartTotal) {
            cartTotal.textContent = `$${cartManager.getCartTotal().toFixed(2)}`;
        }
    }

    renderCartItem(item) {
        return `
            <li class="list-group-item d-flex justify-content-between align-items-center p-3">
                <div class="d-flex align-items-center flex-grow-1">
                    <div class="cart-item-image-container me-3">
                        <img src="${item.imageUrl || `https://via.placeholder.com/80x80/f8f9fa/6c757d?text=${encodeURIComponent(item.name.split(' ')[0])}`}" 
                             alt="${item.name}" 
                             class="cart-item-image"
                             loading="lazy"
                             onerror="this.onerror=null; this.src='https://via.placeholder.com/80x80/f8f9fa/6c757d?text=No+Image';" />
                    </div>
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${item.name}</h6>
                        <small class="text-muted">$${item.price.toFixed(2)} each</small>
                    </div>
                </div>
                <div class="d-flex align-items-center">
                    <div class="btn-group btn-group-sm me-3" role="group">
                        <button type="button" class="btn btn-outline-secondary" 
                                onclick="cartPage.updateQuantity(${item.id}, ${item.quantity - 1})"
                                ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="btn btn-outline-secondary" style="cursor: default;">
                            ${item.quantity}
                        </span>
                        <button type="button" class="btn btn-outline-secondary" 
                                onclick="cartPage.updateQuantity(${item.id}, ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <strong class="me-3">$${(item.price * item.quantity).toFixed(2)}</strong>
                    <button class="btn btn-sm btn-danger" 
                            onclick="cartPage.removeItem(${item.id})"
                            title="Remove item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `;
    }

    renderCartItems() {
        if (this.cart.length === 0) {
            return `
                <div class="text-center py-5">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <h4>Your cart is empty</h4>
                    <p class="text-muted">Add some delicious macaroons to get started!</p>
                    <button class="btn btn-primary" onclick="showPage('products')">
                        <i class="fas fa-cookie-bite"></i> Browse Products
                    </button>
                </div>
            `;
        }

        return this.cart.map(item => this.renderCartItem(item)).join('');
    }

    render() {
        this.loadCart();
        const total = cartManager.getCartTotal();
        const itemCount = cartManager.getCartItemCount();

        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="mb-0">Your Cart</h1>
                    <p class="text-muted mb-0">${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart</p>
                </div>
                <button class="btn btn-outline-secondary" onclick="showPage('products')">
                    <i class="fas fa-arrow-left"></i> Continue Shopping
                </button>
            </div>

            <div class="row">
                <div class="col-lg-8">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Cart Items</h5>
                        </div>
                        <div class="card-body p-0">
                            <div id="cartItemsContainer">
                                ${this.renderCartItems()}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Order Summary</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span id="cartTotal">$${total.toFixed(2)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Shipping:</span>
                                <span class="text-success">FREE</span>
                            </div>
                            <hr>
                            <div class="d-flex justify-content-between mb-3">
                                <strong>Total:</strong>
                                <strong class="text-primary">$${total.toFixed(2)}</strong>
                            </div>
                            
                            ${this.cart.length > 0 ? `
                                <button class="btn btn-success btn-lg btn-block" 
                                        onclick="showPage('checkout')">
                                    <i class="fas fa-credit-card"></i> Proceed to Checkout
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}