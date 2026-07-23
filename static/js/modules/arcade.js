import { CyberRunner } from '../games/cyber_runner.js';
import { GalaxyShooter } from '../games/galaxy_shooter.js';
import { Breakout } from '../games/breakout.js';

export function initArcadeManager() {
    const insertCoinBtns = document.querySelectorAll('.insert-coin-btn');
    let currentGameInstance = null;

    if (insertCoinBtns.length === 0) return;

    insertCoinBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
        e.preventDefault(); 
        
        const arcadeModal = document.getElementById('arcade-modal');
        const closeBtn = document.querySelector('.close-arcade');
        const gameId = btn.getAttribute('data-game-id');
        const controlesData = btn.getAttribute('data-controles'); // Capturamos los controles

        if (!arcadeModal) return;

        // 1. SOLUCIÓN AL FANTASMA: Detener el juego anterior si existe ANTES de hacer nada
        if (currentGameInstance) {
            currentGameInstance.stop(); // Esto apaga los event listeners
            currentGameInstance = null; // Vaciamos la memoria
        }

        // 2. ACTUALIZAR LOS CONTROLES DINÁMICAMENTE
        const controlsTextElement = document.getElementById('game-controls-text');
        if (controlsTextElement && controlesData) {
            controlsTextElement.innerHTML = `Controles: ${controlesData}`;
        }

        // FORZAMOS TODAS LAS PROPIEDADES DE VISIBILIDAD
        arcadeModal.style.display = 'flex';
        arcadeModal.style.visibility = 'visible';
        arcadeModal.style.opacity = '1';
        arcadeModal.style.zIndex = '9999'; 
        
        // INICIALIZACIÓN DE JUEGOS
        if (gameId === 'cyber_runner') { 
            document.getElementById('arcade-game-title').textContent = 'Cyber_Runner.exe';
            try {
                currentGameInstance = new CyberRunner();
                currentGameInstance.start();
            } catch (error) { console.error("Error:", error); }
        } 
        else if (gameId === 'galaxy_shooter') {
            document.getElementById('arcade-game-title').textContent = 'Galaxy_Shooter.exe';
            try {
                currentGameInstance = new GalaxyShooter();
                currentGameInstance.start();
            } catch (error) { console.error("Error:", error); }
        }
        else if (gameId === 'breakout') {
            document.getElementById('arcade-game-title').textContent = 'Data_Stream_breaker.exe';
            try {
                currentGameInstance = new Breakout();
                currentGameInstance.start();
            } catch (error) { console.error("Error:", error); }
        }  

            const closeGame = () => {
                arcadeModal.style.display = 'none';
                arcadeModal.style.visibility = 'hidden';
                arcadeModal.style.opacity = '0';
                if (currentGameInstance) {
                    currentGameInstance.stop();
                }
            };

            if (closeBtn) closeBtn.onclick = closeGame;
            window.onclick = (event) => {
                if (event.target === arcadeModal) closeGame();
            };
        });
    });
}