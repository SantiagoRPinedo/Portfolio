export function initWinamp() {
    const playlist = [
        "Daft Punk - Discovery",
        "Gorillaz - Feel Good Inc.",
        "Linkin Park - Numb",
        "Blink-182 - All The Small Things",
        "Eminem - Without Me"
    ];
    let currentSongIndex = 0;
    let isPlaying = true;

    const winampSong = document.getElementById('winamp-song');
    const winampStatus = document.getElementById('winamp-status');
    const vinyl = document.getElementById('winamp-vinyl');
    const needle = document.getElementById('winamp-needle');

    const btnPlay = document.getElementById('winamp-play');
    const btnNext = document.getElementById('winamp-next');
    const btnPrev = document.getElementById('winamp-prev');

    if (!btnPlay) return;

    btnPlay.addEventListener('click', () => {
        isPlaying = !isPlaying;
        const currentLang = localStorage.getItem('santi_lang') || 'es';

        if (isPlaying) {
            vinyl.classList.remove('paused');
            needle.classList.remove('lifted');
            winampStatus.textContent = currentLang === 'en' ? '[Playing...]' : '[Reproduciendo...]';
        } else {
            vinyl.classList.add('paused');
            needle.classList.add('lifted');
            winampStatus.textContent = currentLang === 'en' ? '[Paused]' : '[Pausado]';
        }
    });

    btnNext.addEventListener('click', () => {
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        if (winampSong) winampSong.textContent = playlist[currentSongIndex];
    });

    btnPrev.addEventListener('click', () => {
        currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        if (winampSong) winampSong.textContent = playlist[currentSongIndex];
    });
}