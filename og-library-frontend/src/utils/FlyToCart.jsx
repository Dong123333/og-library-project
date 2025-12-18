export const flyToCart = (sourceEl) => {
    const cart = document.getElementById('cart-icon');
    if (!cart || !sourceEl) return;

    const sourceRect = sourceEl.getBoundingClientRect();
    const cartRect = cart.getBoundingClientRect();

    const clone = sourceEl.cloneNode(true);

    Object.assign(clone.style, {
        position: 'fixed',
        left: `${sourceRect.left}px`,
        top: `${sourceRect.top}px`,
        width: `${sourceRect.width}px`,
        height: `${sourceRect.height}px`,
        borderRadius: '8px',
        zIndex: 9999,
        pointerEvents: 'none',
        transition: 'all 0.65s cubic-bezier(.4,0,.2,1)',
    });

    document.body.appendChild(clone);

    requestAnimationFrame(() => {
        clone.style.left = `${cartRect.left}px`;
        clone.style.top = `${cartRect.top}px`;
        clone.style.width = '18px';
        clone.style.height = '18px';
        clone.style.opacity = '0.3';
        clone.style.transform = 'scale(0.4)';
    });

    clone.addEventListener('transitionend', () => {
        clone.remove();
        cart.classList.add('animate-cart');
        setTimeout(() => cart.classList.remove('animate-cart'), 300);
    });
};
