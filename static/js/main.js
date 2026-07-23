// --- IMPORTACIONES DE LOS MÓDULOS ---
import { initLanguageAndPersistence } from './modules/i18n.js';
import { initUI } from './modules/ui.js';
import { initWinamp } from './modules/winamp.js';
import { initInstagramModal } from './modules/instagram.js';
import { initArcadeManager } from './modules/arcade.js';

/**
 * Portafolio Scripts - Orquestador Principal (Modular)
 * Autor: Santiago Pinedo
 * * Nota: Como usamos type="module" en el HTML, este archivo ya es diferido por el navegador.
 * No necesitamos usar 'DOMContentLoaded', podemos inicializar directamente.
 */

document.addEventListener('DOMContentLoaded', () => {
    initUI();
    initLanguageAndPersistence();
    initWinamp();
    initInstagramModal();
    initArcadeManager();
});