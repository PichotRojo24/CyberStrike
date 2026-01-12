// src/client/services/SceneExit.js

/**
 * Cierre "duro" y consistente para volver al menú.
 * - Cierra WS si existe (multiplayer).
 * - Limpia handlers del WS para que no queden callbacks vivos.
 * - Detiene timers/physics/input.
 * - Para música si querés.
 * - Vuelve a MenuScene sin que quede "partida fantasma".
 */
export function hardReturnToMenu(scene, originalSceneKey = null, opts = {}) {
  const {
    closeWs = true,
    stopMusic = false,
    menuSceneKey = 'MenuScene',
    stopAllScenes = false,
  } = opts;

  try {
    // 1) Si me pasan escena original, la buscamos
    const original =
      originalSceneKey && scene.scene.get(originalSceneKey)
        ? scene.scene.get(originalSceneKey)
        : null;

    // 2) Cerrar WS (si existe en la escena original o en la actual)
    const ws =
      (original && original.ws) ? original.ws :
      (scene && scene.ws) ? scene.ws :
      null;

    if (closeWs && ws) {
      try { ws.onopen = null; } catch (e) {}
      try { ws.onmessage = null; } catch (e) {}
      try { ws.onerror = null; } catch (e) {}
      try { ws.onclose = null; } catch (e) {}

      try {
        if (ws.readyState === WebSocket.OPEN) {
          // opcional: avisar al server que te vas
          try { ws.send(JSON.stringify({ type: 'leaveQueue' })); } catch (e) {}
        }
      } catch (e) {}

      try { ws.close(); } catch (e) {}
      if (original) original.ws = null;
      scene.ws = null;
    }

    // 3) Pausar / limpiar cosas comunes
    try { scene.time.removeAllEvents(); } catch (e) {}
    try { scene.tweens.killAll(); } catch (e) {}
    try { scene.input.removeAllListeners(); } catch (e) {}
    try { scene.physics.world.pause(); } catch (e) {}

    if (original) {
      try { original.time.removeAllEvents(); } catch (e) {}
      try { original.tweens.killAll(); } catch (e) {}
      try { original.input.removeAllListeners(); } catch (e) {}
      try { original.physics.world.pause(); } catch (e) {}
    }

    // 4) Música (opcional)
    if (stopMusic) {
      try { scene.sound.stopAll(); } catch (e) {}
      if (original) {
        try { original.sound.stopAll(); } catch (e) {}
      }
    }

    // 5) Stop scenes
    if (stopAllScenes) {
      // DETIENE TODO y arranca menú (si tu juego lo soporta)
      const running = scene.scene.manager.getScenes(true);
      running.forEach(s => {
        try { scene.scene.stop(s.scene.key); } catch (e) {}
      });
    } else {
      if (originalSceneKey) {
        try { scene.scene.stop(originalSceneKey); } catch (e) {}
      }
      try { scene.scene.stop(scene.scene.key); } catch (e) {}
      // PauseScene normalmente se llama a sí misma, igual la frenamos aparte
      try { scene.scene.stop('PauseScene'); } catch (e) {}
    }

    // 6) Volver al menú
    scene.scene.start(menuSceneKey);
  } catch (err) {
    // fallback ultra seguro
    try {
      scene.scene.start('MenuScene');
    } catch (e) {}
    console.error('hardReturnToMenu error:', err);
  }
}
