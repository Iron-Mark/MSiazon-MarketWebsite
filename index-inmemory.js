require('dotenv').config(); // Load environment variables from .env

require("reflect-metadata");
const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory storage for development/testing
let products = [
    { id: 1, name: "Strawberry Macaroon", price: 3.00, image: "strawberry.jpg" },
    { id: 2, name: "Chocolate Macaroon", price: 2.50, image: "chocolate.jpg" },
    { id: 3, name: "Candy Macaroon", price: 2.75, image: "candy.jpg" },
    { id: 4, name: "Berry Macaroon", price: 3.00, image: "berry.jpg" },
    { id: 5, name: "Caramel Macaroon", price: 2.50, image: "caramel.jpg" },
    { id: 6, name: "Orange Macaroon", price: 2.50, image: "orange.jpg" }
];

let orders = [];
let orderIdCounter = 1;

// Function to upload all files from the "static" folder to S3 using AWS SDK v3.
function uploadStaticFilesToS3() {
    return new Promise((resolve, reject) => {
        if (!process.env.S3_BUCKET) {
            console.log("S3_BUCKET not set; skipping static file upload.");
            return resolve();
        }

        if (!process.env.S3_REGION) {
            console.log("S3_REGION not set; skipping static file upload.");
            return resolve();
        }

        // Import S3Client and Upload from AWS SDK v3 modules
        const { S3Client } = require("@aws-sdk/client-s3");
        const { Upload } = require("@aws-sdk/lib-storage");

        // Create S3 client with credentials from environment variables
        const s3Client = new S3Client({
            region: process.env.S3_REGION,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY
            }
        });

        const staticFolder = path.join(__dirname, "static");
        if (!fs.existsSync(staticFolder)) {
            console.log("Static folder does not exist; skipping S3 upload.");
            return resolve();
        }

        fs.readdir(staticFolder, (err, files) => {
            if (err) {
                console.error("Error reading static folder:", err);
                return reject(err);
            }
            const uploadPromises = files.map(async (file) => {
                const filePath = path.join(staticFolder, file);
                const fileStream = fs.createReadStream(filePath);
                const uploadParams = {
                    Bucket: process.env.S3_BUCKET,
                    Key: file, // Upload using the file name; adjust for subdirectories if needed
                    Body: fileStream
                    // No ACL is set; files inherit the bucket's default permissions.
                };
                try {
                    const parallelUpload = new Upload({
                        client: s3Client,
                        params: uploadParams
                    });
                    const data = await parallelUpload.done();
                    console.log(`Uploaded ${file} to ${data.Location}`);
                } catch (err) {
                    console.error(`Error uploading ${file}:`, err);
                }
            });
            Promise.all(uploadPromises)
                .then(() => resolve())
                .catch(reject);
        });
    });
}

// Helper function to render a full HTML page with Bootstrap, Font Awesome, and animation CSS.
function renderPage(title, content) {
    return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <title>${title}</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
      <style>
        body { padding-top: 50px; }
        .container { max-width: 800px; }
        /* Fireworks animation styles */
        .fireworks-container {
          position: absolute;
          pointer-events: none;
        }
        .firework {
          position: absolute;
          width: 8px;
          height: 8px;
          background: gold;
          border-radius: 50%;
          opacity: 1;
          animation: firework-animation 0.8s ease-out forwards;
        }
        @keyframes firework-animation {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)); opacity: 0; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${content}
      </div>
      <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js"></script>
      <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
    </body>
  </html>
  `;
}

// Construct the hero image URL using AWS S3 environment variables.
const heroImageUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/shop.jpg`;

// Home route with a hero banner image from AWS S3.
app.get("/", (req, res) => {
    const content = `
    <div class="hero-banner" style="
      position: relative;
      background: url('${heroImageUrl}') no-repeat center center;
      background-size: cover;
      height: 500px;
    ">
      <div style="
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.5);
      ">
        <div class="d-flex h-100 align-items-center justify-content-center">
          <div class="text-center text-white">
            <h1 class="display-3">Welcome to Mike's Macaroon Market!</h1>
            <p class="lead">Delicious macaroons made with love.</p>
            <a class="btn btn-primary btn-lg" href="/products" role="button">View Our Products</a>
          </div>
        </div>
      </div>
    </div>
  `;
    res.send(renderPage("Mike's Macaroon Market", content));
});

// Products route: List available products from memory with images.
app.get("/products", async (req, res) => {
    try {
        // Header with a shopping cart icon and a "Cart" button.
        let html = `
      <div class="d-flex justify-content-end align-items-center mb-3" style="position: relative;">
        <button class="btn btn-secondary" onclick="location.href='/cart'" id="cartButton">
          <span id="cartIcon"><i class="fas fa-shopping-cart"></i></span> Cart (<span id="cartCount">0</span>)
        </button>
      </div>
      <h1 class="mb-4">Our Products</h1>
      <div class="list-group">
    `;

        products.forEach(product => {
            // Construct the product image URL using S3 environment variables.
            const imageUrl = `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${product.image}`;
            html += `
        <div class="list-group-item d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <img src="${imageUrl}" alt="${product.name}" style="width:250px; height:250px; object-fit:cover; margin-right:15px;" />
            <div>
              <h5 class="mb-1">${product.name}</h5>
              <p class="mb-1">$${product.price.toFixed(2)}</p>
            </div>
          </div>
          <button class="btn btn-success" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Add to Cart</button>
        </div>`;
        });
        html += `</div>
      <!-- Button at the bottom to go to the shopping cart -->
      <div class="text-center mt-4">
        <button class="btn btn-primary" onclick="location.href='/cart'">Go to Cart</button>
      </div>
      <script>
        function addToCart(id, name, price) {
          let cart = sessionStorage.getItem('cart');
          cart = cart ? JSON.parse(cart) : [];
          const existingItem = cart.find(item => item.id === id);
          if (existingItem) {
            existingItem.quantity += 1;
          } else {
            cart.push({ id, name, price, quantity: 1 });
          }
          sessionStorage.setItem('cart', JSON.stringify(cart));
          updateCartCount();
          showFireworks();
        }

        function updateCartCount() {
          let cart = sessionStorage.getItem('cart');
          cart = cart ? JSON.parse(cart) : [];
          const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
          document.getElementById('cartCount').innerText = totalItems;
        }
        
        // Function to create a fireworks effect around the cart button.
        function showFireworks() {
          const cartButton = document.getElementById('cartButton');
          const rect = cartButton.getBoundingClientRect();
          // Create a container for fireworks positioned over the button.
          const container = document.createElement('div');
          container.className = 'fireworks-container';
          container.style.left = rect.left + 'px';
          container.style.top = rect.top + 'px';
          container.style.width = rect.width + 'px';
          container.style.height = rect.height + 'px';
          document.body.appendChild(container);
          
          // Create multiple sparkles.
          for (let i = 0; i < 10; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'firework';
            // Random angle and distance.
            const angle = Math.random() * 2 * Math.PI;
            const distance = Math.random() * 30;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            sparkle.style.setProperty('--dx', dx + 'px');
            sparkle.style.setProperty('--dy', dy + 'px');
            container.appendChild(sparkle);
          }
          // Remove the container after the animation completes.
          setTimeout(() => {
            container.remove();
          }, 1000);
        }

        document.addEventListener('DOMContentLoaded', updateCartCount);
      </script>
    `;
        res.send(renderPage("Products - Mike's Macaroon Market", html));
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Error fetching products");
    }
});

// Cart route: Display current cart items from sessionStorage.
app.get("/cart", (req, res) => {
    const content = `
    <h1>Your Cart</h1>
    <div id="cartContainer"></div>
    <a class="btn btn-primary mt-3" href="/checkout">Proceed to Checkout</a>
    <script>
      function renderCart() {
        let cart = sessionStorage.getItem('cart');
        let container = document.getElementById('cartContainer');
        if (!cart || JSON.parse(cart).length === 0) {
          container.innerHTML = '<p>Your cart is empty.</p>';
          return;
        }
        cart = JSON.parse(cart);
        let html = '<ul class="list-group">';
        cart.forEach(item => {
          html += '<li class="list-group-item d-flex justify-content-between align-items-center">' +
                    item.name + ' - $' + item.price.toFixed(2) + ' x ' + item.quantity +
                  '</li>';
        });
        html += '</ul>';
        container.innerHTML = html;
      }
      document.addEventListener('DOMContentLoaded', renderCart);
    </script>
  `;
    res.send(renderPage("Your Cart - Mike's Macaroon Market", content));
});

// Checkout page: Show order form and populate cart details from sessionStorage.
app.get("/checkout", (req, res) => {
    const content = `
    <h1>Checkout</h1>
    <div id="cartSummary"></div>
    <form method="POST" action="/checkout" onsubmit="return prepareOrder()">
      <div class="form-group">
        <label for="name">Name:</label>
        <input type="text" class="form-control" id="name" name="name" required>
      </div>
      <div class="form-group">
        <label for="address">Address:</label>
        <textarea class="form-control" id="address" name="address" rows="3" required></textarea>
      </div>
      <input type="hidden" id="cartData" name="cartData">
      <button type="submit" class="btn btn-success">Place Order</button>
    </form>
    <script>
      function renderCartSummary() {
        let cart = sessionStorage.getItem('cart');
        let summary = document.getElementById('cartSummary');
        if (!cart || JSON.parse(cart).length === 0) {
          summary.innerHTML = '<p>Your cart is empty.</p>';
          return;
        }
        cart = JSON.parse(cart);
        let html = '<ul class="list-group mb-3">';
        let total = 0;
        cart.forEach(item => {
          total += item.price * item.quantity;
          html += '<li class="list-group-item d-flex justify-content-between align-items-center">' +
                    item.name + ' - $' + item.price.toFixed(2) + ' x ' + item.quantity +
                  '</li>';
        });
        html += '</ul>';
        html += '<h4>Total: $' + total.toFixed(2) + '</h4>';
        summary.innerHTML = html;
      }
      
      function prepareOrder() {
        let cart = sessionStorage.getItem('cart');
        if (!cart || JSON.parse(cart).length === 0) {
          alert('Your cart is empty!');
          return false;
        }
        document.getElementById('cartData').value = cart;
        return true;
      }
      
      document.addEventListener('DOMContentLoaded', renderCartSummary);
    </script>
  `;
    res.send(renderPage("Checkout - Mike's Macaroon Market", content));
});

// Process checkout: Save the order to memory.
app.post("/checkout", async (req, res) => {
    const { name, address, cartData } = req.body;
    let cartItems;
    try {
        cartItems = JSON.parse(cartData);
    } catch (error) {
        return res.status(400).send("Invalid cart data");
    }
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
        const order = {
            id: orderIdCounter++,
            name,
            address,
            total,
            createdAt: new Date(),
            orderItems: cartItems.map(item => ({
                productName: item.name,
                productPrice: item.price,
                quantity: item.quantity
            }))
        };
        orders.push(order);

        console.log('New order received:', order);

        const content = `
      <div class="text-center">
        <h1>Thank you for your order!</h1>
        <p>Your order ID is ${order.id}.</p>
        <p>We appreciate your business. Your delicious macaroons are on their way!</p>
        <a class="btn btn-primary" href="/" onclick="clearCart()">Back to Home</a>
      </div>
      <script>
        function clearCart() {
          sessionStorage.removeItem('cart');
        }
        clearCart();
      </script>
    `;
        res.send(renderPage("Order Confirmation - Mike's Macaroon Market", content));
    } catch (error) {
        console.error("Error processing order:", error);
        res.status(500).send("Error processing order");
    }
});

// Upload static files to S3, then start the server.
uploadStaticFilesToS3()
    .then(() => {
        console.log("Using in-memory storage for development");
        app.listen(port, () => {
            console.log(`🚀 Server is running on http://localhost:${port}`);
            console.log(`📝 Note: Using in-memory storage. Orders and data will not persist after restart.`);
            console.log(`📸 Product images are loaded from S3: ${process.env.S3_BUCKET}`);
        });
    })
    .catch(error => {
        console.log("Error uploading to S3:", error);
        // Start server anyway, even if S3 upload fails
        app.listen(port, () => {
            console.log(`🚀 Server is running on http://localhost:${port}`);
            console.log(`⚠️  S3 upload failed, but server started with local image fallback`);
        });
    });