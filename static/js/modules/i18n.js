export function initLanguageAndPersistence() {
    const langButtons = document.querySelectorAll('.lang-btn');
    let translations = {};

    const savedLang = localStorage.getItem('santi_lang') || 'es';

    langButtons.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.lang-btn[data-lang="${savedLang}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    fetch('/api/data')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            translations = data;
            translateElements(savedLang);
        })
        .catch(error => console.error('Error al cargar la API de traducciones:', error));

    langButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedLang = button.dataset.lang;
            if (!translations) return;

            localStorage.setItem('santi_lang', selectedLang);

            document.documentElement.lang = selectedLang;
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            button.classList.add('active');

            translateElements(selectedLang);
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

        const winampStatus = document.getElementById('winamp-status');
        const vinyl = document.getElementById('winamp-vinyl');
        if (winampStatus && vinyl) {
            const isPaused = vinyl.classList.contains('paused');
            winampStatus.textContent = isPaused 
                ? (lang === 'en' ? '[Paused]' : '[Pausado]')
                : (lang === 'en' ? '[Playing...]' : '[Reproduciendo...]');
        }
    };
}