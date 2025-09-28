// Home Page Component
class HomePage {
    constructor() {
        this.heroImageUrl = 'https://msiazon-assets.s3.ap-southeast-1.amazonaws.com/shop.jpg';
    }

    render() {
        return `
            <div class="hero-banner" style="background-image: url('${this.heroImageUrl}');">
                <div class="hero-overlay">
                    <div class="hero-content">
                        <h1 class="display-3">Welcome to Mark Siazon's Macaroon Market!</h1>
                        <p class="lead">Delicious macaroons made with love and crafted to perfection.</p>
                        <button class="btn btn-primary btn-lg" onclick="showPage('products')">
                            <i class="fas fa-cookie-bite"></i> View Our Products
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-4 mb-4">
                    <div class="card h-100 text-center">
                        <div class="card-body">
                            <i class="fas fa-cookie fa-3x text-primary mb-3"></i>
                            <h5 class="card-title">Fresh Daily</h5>
                            <p class="card-text">All our macaroons are baked fresh daily using premium ingredients.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="card h-100 text-center">
                        <div class="card-body">
                            <i class="fas fa-truck fa-3x text-primary mb-3"></i>
                            <h5 class="card-title">Fast Delivery</h5>
                            <p class="card-text">Quick and reliable delivery straight to your doorstep.</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <div class="card h-100 text-center">
                        <div class="card-body">
                            <i class="fas fa-heart fa-3x text-primary mb-3"></i>
                            <h5 class="card-title">Made with Love</h5>
                            <p class="card-text">Every macaroon is crafted with passion and attention to detail.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="text-center mt-5">
                <h3>Ready to taste heaven?</h3>
                <p class="lead">Browse our delicious selection and place your order today!</p>
                <button class="btn btn-success btn-lg" onclick="showPage('products')">
                    Shop Now <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;
    }
}