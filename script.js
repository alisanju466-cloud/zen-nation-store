
/* =========================
   ZEN NATION PRODUCTS
========================= */

const products = [
    {
        id: 1,
        name: "ZEN Black T-Shirt",
        category: "Fashion",
        price: 999,
        icon: "👕",
        image: "images/tshirt.png"
    },
    {
        id: 2,
        name: "ZEN White T-Shirt",
        category: "Fashion",
        price: 999,
        icon: "👕",
        image: "images/white-tshirt.png"
    },
    {
        id: 3,
        name: "ZEN Hoodie",
        category: "Fashion",
        price: 1499,
        icon: "🧥",
        image: "images/hoodie.png"
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
    <img src="${product.image}" alt="${product.name}">
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
   ZEN NATION CHECKOUT
========================= */

const zenSupabase = window.supabase.createClient(
    window.ZEN_CONFIG.SUPABASE_URL,
    window.ZEN_CONFIG.SUPABASE_ANON_KEY
);

async function checkout() {

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const customer_name = prompt("Enter your full name:");
    if (!customer_name || !customer_name.trim()) return;

    const phone = prompt("Enter your phone number:");
    if (!phone || !phone.trim()) return;

    const address = prompt("Enter your full delivery address:");
    if (!address || !address.trim()) return;

    const payment = prompt(
        "Choose payment method:\n\n" +
        "1 = Cash on Delivery\n" +
        "2 = UPI Manual Payment"
    );

    if (payment !== "1" && payment !== "2") {
        alert("Invalid payment selection.");
        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    let payment_method = payment === "1" ? "COD" : "UPI";
    let payment_status = "unpaid";
    let utr_number = null;

    if (payment_method === "UPI") {

        const upiLink =
            "upi://pay?pa=sanjuxrich@fam" +
            "&pn=ZEN%20NATION" +
            "&am=" + total.toFixed(2) +
            "&cu=INR" +
            "&tn=ZEN%20NATION%20Order";

        alert(
            "Pay ₹" + total.toLocaleString("en-IN") +
            " to sanjuxrich@fam using your UPI app.\n\n" +
            "After payment, return here and enter your UTR number."
        );

        window.open(upiLink, "_blank");

        utr_number = prompt(
            "Enter your UPI UTR / transaction reference number:"
        );

        if (!utr_number || !utr_number.trim()) {
            alert("UTR number is required for UPI orders.");
            return;
        }

        payment_status = "pending";
    }

    const order = {
        customer_name: customer_name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        total: total,
        payment_method: payment_method,
        payment_status: payment_status,
        utr_number: utr_number,
        order_status: "pending"
    };

    try {

       const { error } = await zenSupabase
    .from("zen_orders")
    .insert([order]);

if (error) throw error;

        alert(
            "ZEN NATION ORDER SUCCESSFUL!\n\n" +
            "Payment: " + payment_method + "\n" +
            "Status: " +
            (payment_method === "UPI"
                ? "Awaiting payment approval"
                : "COD order received") +
            "\n\nWe will contact you on WhatsApp."
        );

        cart = [];
        saveCart();
        updateCart();
        toggleCart();

    } catch (error) {

        console.error("Order error:", error);

        alert(
            "Order could not be submitted.\n\n" +
            error.message
        );

    }
}



/* =========================
   START WEBSITE
========================= */

displayProducts(products);

updateCart();
