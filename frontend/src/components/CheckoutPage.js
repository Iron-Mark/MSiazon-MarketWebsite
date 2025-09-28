// Checkout Page Component
class CheckoutPage {
    constructor() {
        this.cart = [];
        this.isSubmitting = false;
    }

    loadCart() {
        this.cart = cartManager.getCart();
    }

    async submitOrder(event) {
        event.preventDefault();

        if (this.isSubmitting) return;

        const formData = new FormData(event.target);
        const name = formData.get('name');
        const address = formData.get('address');

        if (!name || !address) {
            showAlert('Please fill in all required fields.', 'warning');
            return;
        }

        if (this.cart.length === 0) {
            showAlert('Your cart is empty!', 'warning');
            return;
        }

        this.isSubmitting = true;
        const submitButton = document.getElementById('submitOrderButton');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitButton.disabled = true;

        try {
            showLoading();

            const orderData = {
                name: name.trim(),
                address: address.trim(),
                cartItems: this.cart
            };

            const response = await apiClient.post('/orders', orderData);

            if (response.success) {
                cartManager.clearCart();
                showAlert('Order placed successfully!', 'success');
                this.showOrderConfirmation(response.data);
            } else {
                throw new Error(response.message || 'Failed to place order');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            showAlert('Failed to place order. Please try again.', 'danger');
        } finally {
            this.isSubmitting = false;
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            hideLoading();
        }
    }

    showOrderConfirmation(order) {
        const content = `
            <div class="text-center">
                <div class="mb-4">
                    <i class="fas fa-check-circle fa-5x text-success"></i>
                </div>
                <h1 class="text-success">Thank you for your order!</h1>
                <p class="lead">Your order has been placed successfully.</p>
                <div class="card mt-4">
                    <div class="card-body">
                        <h5 class="card-title">Order Details</h5>
                        <p><strong>Order ID:</strong> #${order.id}</p>
                        <p><strong>Name:</strong> ${order.name}</p>
                        <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                    </div>
                </div>
                <p class="mt-4">We appreciate your business. Your delicious macaroons are on their way!</p>
                <button class="btn btn-primary btn-lg" onclick="showPage('home')">
                    <i class="fas fa-home"></i> Back to Home
                </button>
            </div>
        `;

        document.getElementById('pageContent').innerHTML = content;
    }

    renderOrderItem(item) {
        return `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-0">${item.name}</h6>
                    <small class="text-muted">$${item.price.toFixed(2)} × ${item.quantity}</small>
                </div>
                <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
            </li>
        `;
    }

    render() {
        this.loadCart();

        if (this.cart.length === 0) {
            return `
                <div class="text-center">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to your cart before checking out.</p>
                    <button class="btn btn-primary" onclick="showPage('products')">
                        <i class="fas fa-cookie-bite"></i> Browse Products
                    </button>
                </div>
            `;
        }

        const total = cartManager.getCartTotal();
        const orderItemsHtml = this.cart.map(item => this.renderOrderItem(item)).join('');

        return `
            <div class="row">
                <div class="col-lg-8">
                    <div class="card">
                        <div class="card-header">
                            <h4 class="mb-0">
                                <i class="fas fa-credit-card"></i> Checkout
                            </h4>
                        </div>
                        <div class="card-body">
                            <form id="checkoutForm" onsubmit="checkoutPage.submitOrder(event)">
                                <div class="form-group">
                                    <label for="name">
                                        <i class="fas fa-user"></i> Full Name *
                                    </label>
                                    <input type="text" 
                                           class="form-control" 
                                           id="name" 
                                           name="name" 
                                           required
                                           placeholder="Enter your full name">
                                </div>
                                
                                <div class="form-group">
                                    <label for="address">
                                        <i class="fas fa-map-marker-alt"></i> Delivery Address *
                                    </label>
                                    <textarea class="form-control" 
                                              id="address" 
                                              name="address" 
                                              rows="3" 
                                              required
                                              placeholder="Enter your complete delivery address"></textarea>
                                </div>
                                
                                <div class="form-group">
                                    <label for="notes">
                                        <i class="fas fa-sticky-note"></i> Order Notes (Optional)
                                    </label>
                                    <textarea class="form-control" 
                                              id="notes" 
                                              name="notes" 
                                              rows="2" 
                                              placeholder="Any special instructions for your order"></textarea>
                                </div>
                                
                                <button type="submit" 
                                        class="btn btn-success btn-lg btn-block"
                                        id="submitOrderButton">
                                    <i class="fas fa-credit-card"></i> Place Order ($${total.toFixed(2)})
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                
                <div class="col-lg-4">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Order Summary</h5>
                        </div>
                        <div class="card-body">
                            <ul class="list-group list-group-flush">
                                ${orderItemsHtml}
                            </ul>
                            <hr>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Subtotal:</span>
                                <span>$${total.toFixed(2)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Shipping:</span>
                                <span class="text-success">FREE</span>
                            </div>
                            <div class="d-flex justify-content-between mb-2">
                                <span>Tax:</span>
                                <span>$0.00</span>
                            </div>
                            <hr>
                            <div class="d-flex justify-content-between">
                                <strong>Total:</strong>
                                <strong class="text-success">$${total.toFixed(2)}</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-3">
                        <button class="btn btn-outline-secondary btn-block" onclick="showPage('cart')">
                            <i class="fas fa-arrow-left"></i> Back to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}