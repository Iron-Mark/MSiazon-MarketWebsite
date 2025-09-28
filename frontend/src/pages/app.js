// Main Application Controller
class App {
    constructor() {
        this.currentPage = 'home';
        this.pages = {
            home: new HomePage(),
            products: new ProductsPage(),
            cart: new CartPage(),
            checkout: new CheckoutPage()
        };

        this.init();
    }

    init() {
        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeRouting();
            cartManager.updateCartCount();
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                this.showPage(event.state.page, false);
            } else {
                // If no state, check hash or default to home
                this.initializeRouting();
            }
        });
    }

    initializeRouting() {
        const hash = window.location.hash.substring(1);

        if (hash && this.pages[hash]) {
            // Load page based on hash
            this.showPage(hash, false);
        } else {
            // No hash or invalid hash, redirect to home
            this.showPage('home');
        }
    }

    async showPage(pageName, addToHistory = true) {
        if (!this.pages[pageName]) {
            console.error(`Page ${pageName} not found`);
            return;
        }

        this.currentPage = pageName;
        const pageContent = document.getElementById('pageContent');

        if (addToHistory) {
            history.pushState({ page: pageName }, '', `#${pageName}`);
        }

        try {
            let content;

            // Handle pages that need async initialization
            if (typeof this.pages[pageName].init === 'function') {
                content = await this.pages[pageName].init();
            } else {
                content = this.pages[pageName].render();
            }

            pageContent.innerHTML = content;

            // Update active navigation
            this.updateNavigation(pageName);

            // Scroll to top
            window.scrollTo(0, 0);

        } catch (error) {
            console.error(`Error loading page ${pageName}:`, error);
            pageContent.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    <h4 class="alert-heading">Error Loading Page</h4>
                    <p>Sorry, there was an error loading this page. Please try again.</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        Refresh Page
                    </button>
                </div>
            `;
        }
    }

    updateNavigation(activePage) {
        // Update navbar active states
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current page nav link
        const activeLink = document.querySelector(`[onclick="showPage('${activePage}')"]`);
        if (activeLink && activeLink.classList.contains('nav-link')) {
            activeLink.classList.add('active');
        }
    }

    // Method to handle API errors globally
    handleApiError(error) {
        console.error('API Error:', error);

        if (error.message.includes('Failed to fetch')) {
            showAlert('Unable to connect to server. Please check your connection.', 'danger');
        } else {
            showAlert('An error occurred. Please try again.', 'danger');
        }
    }
}

// Global instances
let app;
let homePage;
let productPage;
let cartPage;
let checkoutPage;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    homePage = app.pages.home;
    productPage = app.pages.products;
    cartPage = app.pages.cart;
    checkoutPage = app.pages.checkout;
});

// Global function to show pages (called from HTML)
function showPage(pageName) {
    if (app) {
        app.showPage(pageName);
    }
}

// Handle page refresh or direct URL access
window.addEventListener('load', () => {
    if (app) {
        app.initializeRouting();
    }
});