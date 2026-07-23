export function initInstagramModal() {
    const instaPhotos = document.querySelectorAll('.insta-photo');
    const instaModal = document.getElementById('insta-modal');
    const instaModalImg = document.getElementById('insta-modal-img');
    const instaModalCaption = document.getElementById('insta-modal-caption');
    const closeInsta = document.getElementById('close-insta');

    if (!instaModal) return;

    instaPhotos.forEach(photo => {
        photo.addEventListener('click', () => {
            const imgSrc = photo.getAttribute('data-img');
            const captionKey = photo.getAttribute('data-caption-key');
            const captionEs = photo.getAttribute('data-caption-es');
            
            if (instaModalImg) instaModalImg.src = imgSrc;
            
            if (instaModalCaption) {
                instaModalCaption.setAttribute('data-key', captionKey);
                instaModalCaption.textContent = captionEs;
            }
            
            instaModal.style.display = 'flex';
            
            const currentLang = localStorage.getItem('santi_lang') || 'es';
            const activeBtn = document.querySelector(`.lang-btn[data-lang="${currentLang}"]`);
            if (activeBtn) activeBtn.click();
        });
    });

    if (closeInsta) closeInsta.addEventListener('click', () => instaModal.style.display = 'none');
    window.addEventListener('click', e => { if (e.target === instaModal) instaModal.style.display = 'none'; });
}