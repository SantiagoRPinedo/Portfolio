export function initUI() {
    initMobileNav();
    initScrollAnimations();
    initModalLogic();
}

function initMobileNav() {
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav');
    if (!menuToggle || !mainNav) return;

    menuToggle.addEventListener('click', () => mainNav.classList.toggle('nav-open'));

    mainNav.querySelectorAll('a.nav-link').forEach(link => {
        link.addEventListener('click', (event) => {
            const rawHref = link.getAttribute('href');
            if (rawHref && rawHref.includes('#')) {
                const idPart = rawHref.substring(rawHref.indexOf('#'));
                const targetElement = document.querySelector(idPart);
                if (targetElement) {
                    event.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
            mainNav.classList.remove('nav-open');
        });
    });
}

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.fade-in-element');
    if ('IntersectionObserver' in window && animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        animatedElements.forEach(element => observer.observe(element));
    }
}

function initModalLogic() {
    const modalTriggers = document.querySelectorAll('.proyecto-cuadro, .experiencia-card');
    const closeButtons = document.querySelectorAll('.close-button');

    modalTriggers.forEach(card => {
        card.addEventListener('click', function() {
            const modalId = this.dataset.modalId;
            const modal = document.getElementById('modal-' + modalId);
            if (modal) {
                document.body.style.overflow = 'hidden';
                modal.style.display = 'flex';
                setTimeout(() => modal.classList.add('modal-active'), 10);
            }
        });
    });

    const closeModal = (modal) => {
        if (!modal) return;
        modal.classList.remove('modal-active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    };

    closeButtons.forEach(button => button.addEventListener('click', () => closeModal(button.closest('.modal'))));
    window.addEventListener('click', event => event.target.classList.contains('modal') && closeModal(event.target));
    window.addEventListener('keydown', event => event.key === 'Escape' && closeModal(document.querySelector('.modal.modal-active')));
}