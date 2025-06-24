/**
 * Portafolio Scripts
 * Autor: Santiago Pinedo
 * Descripción: Maneja toda la interactividad del portafolio.
 */
document.addEventListener('DOMContentLoaded', function() {

    /**
     * Función principal que inicializa todos los módulos.
     */
    function init() {
        initModalLogic();
        initMobileNav();
        initScrollAnimations();
        initLanguageToggle();
    }

    /**
     * Configura la lógica para los modales de proyectos y experiencia.
     */
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

    /**
     * Configura la lógica del menú de navegación móvil (hamburguesa).
     */
    function initMobileNav() {
        const menuToggle = document.getElementById('menu-toggle');
        const mainNav = document.getElementById('main-nav');
        if (!menuToggle || !mainNav) return;

        const navLinks = mainNav.querySelectorAll('a.nav-link');

        menuToggle.addEventListener('click', () => mainNav.classList.toggle('nav-open'));

        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    event.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                if (mainNav.classList.contains('nav-open')) {
                    mainNav.classList.remove('nav-open');
                }
            });
        });
    }

    /**
     * Configura la animación de "aparecer" al hacer scroll.
     */
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

    /**
     * Configura la lógica para el cambio de idioma.
     */
    function initLanguageToggle() {
        const langButtons = document.querySelectorAll('.lang-btn');
        let translations = {};

        // CORRECCIÓN CLAVE: Usamos una ruta estática que el navegador entiende.
        fetch('/api/data')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                translations = data;
            })
            .catch(error => console.error('Error al cargar el archivo de traducciones (data.json):', error));

        langButtons.forEach(button => {
            button.addEventListener('click', () => {
                const lang = button.dataset.lang;
                if (!translations) return; // No hacer nada si las traducciones no han cargado

                document.documentElement.lang = lang;
                document.querySelector('.lang-btn.active').classList.remove('active');
                button.classList.add('active');
                translateElements(lang);
            });
        });

        const translateElements = (lang) => {
            document.querySelectorAll('[data-key]').forEach(element => {
                const key = element.dataset.key;
                const keys = key.split('.');
                
                const text = keys.reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : null, translations);
                
                if (text && text[lang] !== undefined) {
                    element.textContent = text[lang];
                }
            });
        };
    }

    // Iniciar todo
    init();
});