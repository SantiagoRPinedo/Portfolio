/**
 * Portafolio Scripts
 * Autor: Santiago Pinedo
 * Descripción: Maneja toda la interactividad del portafolio,
 * incluyendo modales, navegación móvil y animaciones de scroll.
 */
document.addEventListener('DOMContentLoaded', function() {

    /**
     * Inicializa toda la lógica de la aplicación una vez que el DOM está cargado.
     */
    function init() {
        initModalLogic();
        initMobileNav();
        initScrollAnimations();
        initLanguageToggle();
    }

    /**
     * Configura los eventos para abrir y cerrar los modales de los proyectos.
     */
    function initModalLogic() {
        // Seleccionamos TODOS los elementos que pueden activar un modal.
        const modalTriggers = document.querySelectorAll('.proyecto-cuadro, .experiencia-card');
        const closeButtons = document.querySelectorAll('.close-button');

        // Abrir modal al hacer clic en un elemento activador
        modalTriggers.forEach(card => {
            card.addEventListener('click', function() {
                // Usamos el mismo 'data-modal-id' que definimos en el HTML
                const modalId = this.dataset.modalId;
                const modal = document.getElementById('modal-' + modalId);
                if (modal) {
                    document.body.style.overflow = 'hidden';
                    modal.style.display = 'flex';
                    setTimeout(() => modal.classList.add('modal-active'), 10);
                }
            });
        });

        // El resto de la lógica de cierre no necesita cambios y funcionará para todos los modales.
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                closeModal(this.closest('.modal'));
            });
        });

        window.addEventListener('click', function(event) {
            if (event.target.classList.contains('modal')) {
                closeModal(event.target);
            }
        });
        
        window.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                const activeModal = document.querySelector('.modal.modal-active');
                if (activeModal) {
                    closeModal(activeModal);
                }
            }
        });

        function closeModal(modal) {
            if (!modal) return;
            modal.classList.remove('modal-active');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    /**
     * Configura la lógica del menú de navegación móvil (hamburguesa).
     */
    function initMobileNav() {
        const menuToggle = document.getElementById('menu-toggle');
        const mainNav = document.getElementById('main-nav');
        const navLinks = mainNav.querySelectorAll('a.nav-link');

        if (menuToggle && mainNav) {
            menuToggle.addEventListener('click', function() {
                mainNav.classList.toggle('nav-open');
            });
        }

        // Cierra el menú móvil al hacer clic en un enlace y hace scroll suave
        navLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault(); // Prevenimos el salto brusco del ancla
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }

                if (mainNav.classList.contains('nav-open')) {
                    mainNav.classList.remove('nav-open');
                }
            });
        });
    }

    /**
     * Configura la animación de "aparecer" para los elementos al hacer scroll.
     * Utiliza la API Intersection Observer para mayor eficiencia.
     */
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.fade-in-element');

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target); // Dejar de observar una vez animado
                    }
                });
            }, {
                threshold: 0.1 // Activar cuando el 10% del elemento sea visible
            });

            animatedElements.forEach(element => {
                observer.observe(element);
            });
        }
    }

    /**
     * Configura la lógica para el cambio de idioma.
     */
    function initLanguageToggle() {
        const langButtons = document.querySelectorAll('.lang-btn');
        let translations = {};

        // Cargar el archivo JSON con las traducciones
        fetch('/static/data.json')
            .then(response => response.json())
            .then(data => {
                translations = data;
            })
            .catch(error => console.error('Error al cargar las traducciones:', error));

        langButtons.forEach(button => {
            button.addEventListener('click', () => {
                const lang = button.dataset.lang;
                
                // Actualizar clase activa del botón
                document.querySelector('.lang-btn.active').classList.remove('active');
                button.classList.add('active');

                // Traducir todos los elementos con data-key
                translateElements(lang);
            });
        });

        function translateElements(lang) {
            const elementsToTranslate = document.querySelectorAll('[data-key]');
            
            elementsToTranslate.forEach(element => {
                const key = element.dataset.key; // ej: "perfil.titulo"
                const keys = key.split('.'); // ["perfil", "titulo"]
                
                // Navega el objeto JSON para encontrar el texto
                let textObject = keys.reduce((obj, k) => (obj && obj[k] !== 'undefined') ? obj[k] : undefined, translations);
                
                if (textObject && textObject[lang]) {
                    element.textContent = textObject[lang];
                }
            });
        }
    }

    // Llama a la función principal para iniciar todo
    init();

});