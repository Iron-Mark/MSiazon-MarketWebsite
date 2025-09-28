// Cart Management Utilities
class CartManager {
    constructor() {
        this.cartKey = 'macaroon_cart';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Update cart count on page load
        document.addEventListener('DOMContentLoaded', () => {
            this.updateCartCount();
        });
    }

    getCart() {
        const cart = sessionStorage.getItem(this.cartKey);
        return cart ? JSON.parse(cart) : [];
    }

    saveCart(cart) {
        sessionStorage.setItem(this.cartKey, JSON.stringify(cart));
        this.updateCartCount();
    }

    addToCart(product) {
        let cart = this.getCart();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }

        this.saveCart(cart);
        this.showFireworks();
        showAlert(`${product.name} added to cart!`, 'success');
    }

    removeFromCart(productId) {
        let cart = this.getCart();
        cart = cart.filter(item => item.id !== productId);
        this.saveCart(cart);
    }

    updateQuantity(productId, quantity) {
        let cart = this.getCart();
        const item = cart.find(item => item.id === productId);

        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = quantity;
                this.saveCart(cart);
            }
        }
    }

    clearCart() {
        sessionStorage.removeItem(this.cartKey);
        this.updateCartCount();
    }

    getCartTotal() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartItemCount() {
        const cart = this.getCart();
        return cart.reduce((count, item) => count + item.quantity, 0);
    }

    updateCartCount() {
        const count = this.getCartItemCount();
        const cartCountElements = document.querySelectorAll('#navCartCount, #cartCount');
        cartCountElements.forEach(element => {
            if (element) {
                element.textContent = count;
            }
        });
    }

    showFireworks() {
        const cartButton = document.getElementById('cartNavLink');
        if (!cartButton) return;

        const rect = cartButton.getBoundingClientRect();
        const container = document.createElement('div');
        container.className = 'fireworks-container';
        container.style.left = rect.left + 'px';
        container.style.top = rect.top + 'px';
        container.style.width = rect.width + 'px';
        container.style.height = rect.height + 'px';
        document.body.appendChild(container);

        // Create multiple sparkles
        for (let i = 0; i < 12; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'firework';

            // Random angle and distance
            const angle = Math.random() * 2 * Math.PI;
            const distance = 20 + Math.random() * 20;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;

            sparkle.style.setProperty('--dx', dx + 'px');
            sparkle.style.setProperty('--dy', dy + 'px');
            sparkle.style.left = (rect.width / 2) + 'px';
            sparkle.style.top = (rect.height / 2) + 'px';

            // Random colors
            const colors = ['gold', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
            sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];

            container.appendChild(sparkle);
        }

        // Remove the container after animation completes
        setTimeout(() => {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }, 1000);
    }
}

// Global cart manager instance
const cartManager = new CartManager();