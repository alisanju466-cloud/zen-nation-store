/* =========================
   ZEN NATION PRODUCTS
========================= */

const products = [

    {
        id: 1,
        name: "Royal Black Hoodie",
        category: "Fashion",
        price: 2499,
        icon: "🖤"
    },

    {
        id: 2,
        name: "Luxury Gold Watch",
        category: "Accessories",
        price: 5999,
        icon: "⌚"
    },

    {
        id: 3,
        name: "Premium Wireless Headphones",
        category: "Electronics",
        price: 7999,
        icon: "🎧"
    },

    {
        id: 4,
        name: "Signature Perfume",
        category: "Beauty",
        price: 3499,
        icon: "🧴"
    },

    {
        id: 5,
        name: "Minimal Black Sneakers",
        category: "Fashion",
        price: 4499,
        icon: "👟"
    },

    {
        id: 6,
        name: "Golden Sunglasses",
        category: "Accessories",
        price: 2999,
        icon: "🕶️"
    },

    {
        id: 7,
        name: "Smart Phone Pro",
        category: "Electronics",
        price: 49999,
        icon: "📱"
    },

    {
        id: 8,
        name: "Luxury Home Lamp",
        category: "Home",
        price: 3999,
        icon: "💡"
    },

    {
        id: 9,
        name: "Premium Leather Bag",
        category: "Fashion",
        price: 6999,
        icon: "👜"
    },

    {
        id: 10,
        name: "Gold Bracelet",
        category: "Accessories",
        price: 1999,
        icon: "✨"
    },

    {
        id: 11,
        name: "Aroma Candle",
        category: "Home",
        price: 1299,
        icon: "🕯️"
    },

    {
        id: 12,
        name: "Luxury Face Serum",
        category: "Beauty",
        price: 2499,
        icon: "💎"
    }

];


/* =========================
   CART
========================= */

let cart = JSON.parse(localStorage.getItem("zenNationCart")) || [];


/* =========================
   DISPLAY PRODUCTS
========================= */

function displayProducts(list) {

    const grid = document.getElementById("product-grid");

    grid.innerHTML = "";

    if (list.length === 0) {

        grid.innerHTML = `
            <p style="
                color:#888;
                grid-column:1/-1;
                text-align:center;
                padding:50px;
            ">
                No products found.
            </p>
        `;

        return;
    }


    list.forEach(product => {

        const card = document.createElement("div");

        card.className = "product";

        card.innerHTML = `

            <div class="product-image">
                ${product.icon}
            </div>

            <div class="product-info">

                <div class="product-category">
                    ${product.category}
                </div>

                <div class="product-name">
                    ${product.name}
                </div>

                <div class="product-price">
                    ₹${product.price.toLocaleString("en-IN")}
                </div>

                <button
                    class="add-cart"
                    onclick="addToCart(${product.id})"
                >
                    ADD TO CART
                </button>

            </div>

        `;

        grid.appendChild(card);

    });

}


/* =========================
   CATEGORY FILTER
========================= */

function filterProducts(category) {

    if (category === "All") {

        displayProducts(products);

        return;

    }

    const filtered = products.filter(
        product => product.category === category
    );

    displayProducts(filtered);

}


/* =========================
   SEARCH
========================= */

function searchProducts() {

    const search =
        document
        .getElementById("search")
        .value
        .toLowerCase();


    const results = products.filter(product => {

        return (
            product.name.toLowerCase().includes(search) ||
            product.category.toLowerCase().includes(search)
        );

    });


    displayProducts(results);

}


/* =========================
   ADD TO CART
========================= */

function addToCart(id) {

    const product = products.find(
        product => product.id === id
    );


    const existing = cart.find(
        item => item.id === id
    );


    if (existing) {

        existing.quantity++;

    } else {

        cart.push({
            ...product,
            quantity: 1
        });

    }


    saveCart();

    updateCart();

    toggleCart();

}


/* =========================
   CHANGE QUANTITY
========================= */

function changeQuantity(id, amount) {

    const item = cart.find(
        item => item.id === id
    );


    if (!item) return;


    item.quantity += amount;


    if (item.quantity <= 0) {

        cart = cart.filter(
            item => item.id !== id
        );

    }


    saveCart();

    updateCart();

}


/* =========================
   REMOVE ITEM
========================= */

function removeFromCart(id) {

    cart = cart.filter(
        item => item.id !== id
    );


    saveCart();

    updateCart();

}


/* =========================
   UPDATE CART
========================= */

function updateCart() {

    const cartItems =
        document.getElementById("cart-items");


    const cartCount =
        document.getElementById("cart-count");


    const cartTotal =
        document.getElementById("cart-total");


    cartItems.innerHTML = "";


    let total = 0;

    let count = 0;


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                Your cart is empty.
                <br><br>
                Start shopping at ZEN NATION.
            </div>
        `;

    }


    cart.forEach(item => {

        total += item.price * item.quantity;

        count += item.quantity;


        const element =
            document.createElement("div");


        element.className = "cart-item";


        element.innerHTML = `

            <div class="cart-item-image">
                ${item.icon}
            </div>

            <div>

                <div class="cart-item-name">
                    ${item.name}
                </div>

                <div class="cart-item-price">
                    ₹${item.price.toLocaleString("en-IN")}
                </div>

                <div class="quantity">

                    <button
                        onclick="changeQuantity(${item.id}, -1)"
                    >
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        onclick="changeQuantity(${item.id}, 1)"
                    >
                        +
                    </button>

                </div>

            </div>

            <button
                class="remove"
                onclick="removeFromCart(${item.id})"
            >
                REMOVE
            </button>

        `;


        cartItems.appendChild(element);

    });


    cartCount.textContent = count;


    cartTotal.textContent =
        "₹" + total.toLocaleString("en-IN");

}


/* =========================
   SAVE CART
========================= */

function saveCart() {

    localStorage.setItem(
        "zenNationCart",
        JSON.stringify(cart)
    );

}


/* =========================
   OPEN / CLOSE CART
========================= */

function toggleCart() {

    const overlay =
        document.getElementById("cart-overlay");

    overlay.classList.toggle("active");

}


function closeCartOutside(event) {

    if (event.target.id === "cart-overlay") {

        toggleCart();

    }

}


/* =========================
   CHECKOUT
========================= */

function checkout() {

    if (cart.length === 0) {

        alert("Your cart is empty.");

        return;

    }


    alert(
        "ZEN NATION checkout is ready for integration. " +
        "Connect a payment provider to accept real payments."
    );

}


/* =========================
   START WEBSITE
========================= */

displayProducts(products);

updateCart();
