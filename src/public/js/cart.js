// Obtención del carrito.
function getCartId() {
    return localStorage.getItem("cartId");
}

function setCartId(id) {
    localStorage.setItem("cartId", id);
}

// Inicialización del carrito.
async function initCart() {
    let cartId = localStorage.getItem("cartId");
    if (!cartId) {
        const res = await fetch("/api/carts", { method: "POST" });
        const data = await res.json();
        cartId = data.payload._id;
        localStorage.setItem("cartId", cartId);
    }
    return cartId;
}

// Añadir un producto al carrito.
async function addToCart(productId, quantity = 1) {
    let cartId = getCartId();
    if (!cartId) {
        cartId = await initCart();
    }
    const res = await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity })
    });
    if (!res.ok) {
        const err = await res.json();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.message || 'No se pudo añadir al carrito',
            toast: true,
            position: 'top-end',
            timer: 3000,
            showConfirmButton: false
        });
        return;
    }
    Swal.fire({
        icon: 'success',
        title: '¡Añadido!',
        text: `${quantity} producto(s) añadido(s) al carrito`,
        toast: true,
        position: 'top-end',
        timer: 2000,
        showConfirmButton: false
    });
    updateCartCounter();
    animateCartIcon();
}



// Eliminar un producto del carrito.
async function removeFromCart(productId) {
    const cartId = getCartId();
    await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: "DELETE"
    });
    location.reload();
}

// Vaciar el carrito.
async function clearCart() {
    const cartId = getCartId();
    await fetch(`/api/carts/${cartId}`, {
        method: "DELETE"
    });
    location.reload();
}

// Helper Functions.
function animateCartIcon() {
    const cartIcon = document.querySelector(".cart-icon");
    if (!cartIcon) return;
    cartIcon.classList.add("cart-bump");
    setTimeout(() => {
        cartIcon.classList.remove("cart-bump");
    }, 300);
}


// Actualizar el contador del carrito en la interfaz.
async function updateCartCounter() {
    const cartId = localStorage.getItem("cartId");
    const counter = document.querySelector(".cart-count");
    if (!counter) return;
    if (!cartId) {
        const guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
        const count = guestCart.reduce((sum, item) => sum + item.quantity, 0);
        counter.textContent = count;
        return;
    }
    try {
        const res = await fetch(`/api/carts/${cartId}`);
        if (!res.ok){
            counter.textContent = 0;
            return;
        }
        const data = await res.json();
        const count = data.payload.products.reduce((sum, p) => sum + p.quantity, 0);
        counter.textContent = count;
    } catch (error) {
        counter.textContent = 0;
    }
}

// Actualizar cantidad de un producto específico.
async function updateProductQuantity(productId, newQuantity) {
    const cartId = getCartId();
    const res = await fetch(`/api/carts/${cartId}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity })
    });
    if (!res.ok) {
        const err = await res.json();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.message,
            toast: true,
            position: 'top-end',
            timer: 3000
        });
        return;
    }
    location.reload();
}

// Event Listeners y funciones para inicializar botones.
function initAddToCartButtons() {
    document.body.addEventListener("click", async (e) => {
        const btn = e.target.closest(".add-to-cart");
        if (!btn) return;
        const productId = btn.dataset.productId;
        const qtyElement = document.querySelector('.qty-value');
        const quantity = qtyElement ? parseInt(qtyElement.textContent) : 1;
        await addToCart(productId, quantity);
    });
}

function initCartPageButtons() {
    document.body.addEventListener("click", async (e) => {
        const removeBtn = e.target.closest(".remove-from-cart");
        if (removeBtn) {
            const productId = removeBtn.dataset.productId;
            await removeFromCart(productId);
        }
        const clearBtn = e.target.closest(".clear-cart");
        if (clearBtn) {
            await clearCart();
        }
    });
}

function initQuantityControls() {
    document.body.addEventListener("click", async (e) => {
        const btn = e.target.closest(".qty-btn");
        if (!btn) return;
        const productId = btn.dataset.productId;
        const action = btn.dataset.action;
        const controls = btn.closest(".quantity-controls");
        const qtyDisplay = controls.querySelector(".qty-display");
        let currentQty = parseInt(qtyDisplay.textContent);
        if (action === "increase" && currentQty < 3) {
            currentQty++;
            await updateProductQuantity(productId, currentQty);
        }
        if (action === "decrease") {
            if (currentQty === 1) {
                // Eliminar producto si llega a 0
                await removeFromCart(productId);
                return;
            } else {
                currentQty--;
                await updateProductQuantity(productId, currentQty);
            }
        }
    });
}

function initProductDetailQuantity() {
    document.body.addEventListener("click", (e) => {
        const btn = e.target.closest(".qty-btn-detail");
        if (!btn) return;
        const qtyValue = document.querySelector(".qty-value");
        let qty = parseInt(qtyValue.textContent);
        if (btn.dataset.action === "increase" && qty < 3) qty++;
        if (btn.dataset.action === "decrease" && qty > 1) qty--;
        qtyValue.textContent = qty;
    });
}

function initPurchaseButton() {
    document.body.addEventListener("click", async (e) => {
        const btn = e.target.closest(".make-purchase");
        if (!btn) return;
        // Validamos primero si el usuario está logueado.
        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('currentUser='));
        if (!token) {
            await Swal.fire({
                icon: 'warning',
                title: 'Inicia sesión',
                text: 'Debes iniciar sesión para realizar la compra!',
                confirmButtonText: 'Ir a Login',
                confirmButtonColor: '#6366f1'
            });
            window.location.href = '/login';
            return;
        }
        // Método para descontar stock de productos al "realizar compra".
        try {
            // 1. Obtenemos carrito con productos.
            const cartId = getCartId();
            const res = await fetch(`/api/carts/${cartId}`);
            const data = await res.json();
            const cart = data.payload;
            // 2. Actualizamos el stock de cada producto.
            for (const item of cart.products) {
                const productId = item.product.id;
                const quantity = item.quantity;
                await fetch(`/api/products/${productId}/purchase`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ quantity })
                });
            }
            // 3. Mostramos confirmación al usuario.
            await Swal.fire({
                icon: 'success',
                title: '¡Gracias por tu compra!',
                text: 'Tu pedido ha sido procesado correctamente',
                confirmButtonText: 'Volver al catálogo',
                confirmButtonColor: '#6366f1'
            });
            // 4. Vaciamos carrito y redirigimos a Productos.
            await clearCart();
            window.location.href = '/products';
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo procesar la compra',
                confirmButtonColor: '#6366f1'
            });
        }
    });
}

// Event Listeners en la carga de página.
document.addEventListener("DOMContentLoaded", async () => {
    await initCart();
    initAddToCartButtons();
    initCartPageButtons();
    initQuantityControls();
    initProductDetailQuantity();
    initPurchaseButton();
    updateCartCounter();
});