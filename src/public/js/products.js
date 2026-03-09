document.addEventListener('DOMContentLoaded', () => {
    // Creamos un carrito si no existe.
    let cartId = localStorage.getItem('cartId');
    if (!cartId) {
        fetch('/api/carts', { method: 'POST' })
            .then(r => r.json())
            .then(data => {
                localStorage.setItem('cartId', data.payload._id);
            });
    }

    // Agregar al carrito.
    document.querySelectorAll('[data-id]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const productId = e.target.dataset.id;
            const cartId = localStorage.getItem('cartId');
            await fetch(`/api/carts/${cartId}/products/${productId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: 1 })
            });
            Swal.fire({
                toast: true,
                position: "top-left",
                icon: "success",
                title: "Producto agregado al carrito!",
                showConfirmButton: false,
                timer: 3000
            });
        });
    });

    // Actualizar link del carrito
    const cartLink = document.getElementById('cart-link');
    if (cartLink) {
        const cartId = localStorage.getItem('cartId');
        if (cartId) {
            cartLink.href = `/carts/${cartId}`;
        }
    }

    // Botones de ProductDetail.
    let quantity = 1;
    const qtyValue = document.querySelector('.qty-value');
    const minusBtn = document.querySelector('.qty-btn.minus');
    const plusBtn = document.querySelector('.qty-btn.plus');

    if (plusBtn) {
        plusBtn.addEventListener('click', () => {
            if (quantity < 3) {  // Límite de 3
                quantity++;
                qtyValue.textContent = quantity;
            }
        });
    }

    if (minusBtn) {
        minusBtn.addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                qtyValue.textContent = quantity;
            }
        });
    }

    const addBtn = document.getElementById('add-to-cart-btn');
    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            const productId = addBtn.dataset.productId;
            const cartId = localStorage.getItem('cartId');
            await fetch(`/api/carts/${cartId}/products/${productId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity })
            });
            Swal.fire({
                toast: true,
                position: "top-left",
                icon: "success",
                title: "Producto agregado al carrito!",
                showConfirmButton: false,
                timer: 3000
            });
        });
    }
});

