// Products Page Component
class ProductsPage {
    constructor() {
        this.products = [];
    }

    async loadProducts() {
        try {
            showLoading();
            const response = await apiClient.get('/products');

            if (response.success) {
                this.products = response.data;
                return this.products;
            } else {
                throw new Error(response.message || 'Failed to load products');
            }
        } catch (error) {
            console.error('Error loading products:', error);
            showAlert('Failed to load products. Please try again.', 'danger');
            return [];
        } finally {
            hideLoading();
        }
    }

    renderProduct(product) {
        return `
            <div class="list-group-item product-card d-flex justify-content-between align-items-center p-3">
                <div class="d-flex align-items-center">
                    <div class="product-image-container">
                        <img src="${product.imageUrl || `https://via.placeholder.com/250x250/f8f9fa/6c757d?text=${encodeURIComponent(product.name)}`}" 
                             alt="${product.name}" 
                             class="product-image"
                             loading="lazy"
                             onerror="this.onerror=null; this.src='https://via.placeholder.com/250x250/f8f9fa/6c757d?text=No+Image'; this.classList.add('placeholder-image');" />
                    </div>
                    <div class="ms-3">
                        <h5 class="mb-1 text-primary">${product.name}</h5>
                        <p class="mb-1 h4 text-success">$${product.price.toFixed(2)}</p>
                        <small class="text-muted">Handcrafted with premium ingredients</small>
                    </div>
                </div>
                <button class="btn btn-success btn-lg" 
                        onclick="productPage.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                    <i class="fas fa-cart-plus"></i> Add to Cart
                </button>
            </div>
        `;
    }

    addToCart(product) {
        cartManager.addToCart(product);
    }

    render() {
        if (this.products.length === 0) {
            return `
                <div class="text-center">
                    <h2>Our Delicious Products</h2>
                    <p>Loading our amazing macaroons...</p>
                    <div class="spinner-border text-primary" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
            `;
        }

        const productsHtml = this.products.map(product => this.renderProduct(product)).join('');

        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 class="mb-0">Our Products</h1>
                    <p class="text-muted mb-0">Discover our delicious macaroon collection</p>
                </div>
                <button class="btn btn-secondary btn-lg" onclick="showPage('cart')" id="cartButton">
                    <i class="fas fa-shopping-cart"></i> Cart (<span id="cartCount">${cartManager.getCartItemCount()}</span>)
                </button>
            </div>
            
            <div class="list-group">
                ${productsHtml}
            </div>
            
            <div class="text-center mt-5">
                <button class="btn btn-primary btn-lg" onclick="showPage('cart')">
                    <i class="fas fa-shopping-cart"></i> Go to Cart (${cartManager.getCartItemCount()})
                </button>
            </div>
        `;
    }

    async init() {
        await this.loadProducts();
        return this.render();
    }
}