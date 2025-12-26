/**
 * Service para gestionar las conexiones activas de usuarios
 */
export function createConnectionService() {
  // Map para almacenar sesiones conectadas: sessionId -> timestamp de última conexión
  const connectedSessions = new Map();

  const CONNECTION_TIMEOUT = 5000; // 5 segundos sin actividad
  const CLEANUP_INTERVAL = 2000;   // Cada 2 segundos

  // 🔁 Limpiar sesiones inactivas periódicamente
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [sessionId, lastActive] of connectedSessions.entries()) {
      if (now - lastActive > CONNECTION_TIMEOUT) {
        connectedSessions.delete(sessionId);
        console.log(`🧹 Sesión eliminada por inactividad: ${sessionId}`);
      }
    }
  }, CLEANUP_INTERVAL);

  return {
    /**
     * Registrar o actualizar la conexión de una sesión
     * @param {string} sessionId - ID único de la sesión del cliente
     * @returns {number} Número total de sesiones conectadas
     */
    updateConnection(sessionId) {
      connectedSessions.set(sessionId, Date.now());
      return connectedSessions.size;
    },

    /**
     * Obtener el número de sesiones conectadas
     * @returns {number}
     */
    getConnectedCount() {
      return connectedSessions.size;
    },

    /**
     * Forzar eliminación de una sesión (por cierre manual)
     */
    removeSession(sessionId) {
      connectedSessions.delete(sessionId);
      console.log(`❌ Sesión eliminada manualmente: ${sessionId}`);
    },

    /**
     * Detener el cleanup interval (para testing o shutdown)
     */
    stopCleanup() {
      clearInterval(cleanupInterval);
    }
  };
}
