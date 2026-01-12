// src/client/services/ConnectionManager.js
/**
 * Servicio para gestionar la conexión con el servidor.
 * - Hace polling al endpoint /api/connected
 * - NO usa localhost (sirve para 2 PCs en la misma red)
 * - Asume que el SERVER corre en el puerto 3000
 */
export class ConnectionManager {
  constructor() {
    this.connectedCount = 0;
    this.isConnected = false;
    this.lastCheckTime = 0;
    this.checkInterval = 2000; // cada 2s
    this.listeners = [];
    this.sessionId = this.generateSessionId();
    this.intervalId = null;

    // ✅ URL real del servidor (mismo hostname del navegador, puerto 3000)
    this.serverBaseUrl = this.getServerBaseUrl();

    // Iniciar polling automático
    this.startPolling();
  }

  /**
   * Construye la base URL del server para que funcione en LAN:
   * - Si entrás al juego por http://192.168.x.x:3000 -> usa ese host
   * - Si entrás por http://192.168.x.x:8080 -> igual apunta a 192.168.x.x:3000
   */
  getServerBaseUrl() {
    const hostname = window.location.hostname; // IP o dominio actual (no incluye puerto)
    const protocol = window.location.protocol; // http: o https:
    return `${protocol}//${hostname}:3000`;
  }

  /**
   * Generar un ID único de sesión para este cliente
   * @returns {string}
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Comprobar conexión con el servidor
   * @returns {Promise<{connected: number, success: boolean}>}
   */
  async checkConnection() {
    try {
      const response = await fetch(`${this.serverBaseUrl}/api/connected`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: this.sessionId
        })
      });

      if (response.ok) {
        const data = await response.json();

        this.connectedCount = data.connected ?? 0;
        this.isConnected = true;
        this.lastCheckTime = Date.now();

        // Notificar a los listeners
        this.notifyListeners({ connected: true, count: this.connectedCount });

        return { connected: this.connectedCount, success: true };
      } else {
        this.handleDisconnection();
        return { connected: 0, success: false };
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      this.handleDisconnection();
      return { connected: 0, success: false };
    }
  }

  /**
   * Manejar desconexión
   */
  handleDisconnection() {
    this.isConnected = false;
    this.connectedCount = 0;
    this.notifyListeners({ connected: false, count: 0 });
  }

  /**
   * Registrar un listener para cambios de conexión
   * @param {Function} callback
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Eliminar un listener
   * @param {Function} callback
   */
  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notificar a todos los listeners
   * @param {{connected: boolean, count: number}} data
   */
  notifyListeners(data) {
    this.listeners.forEach(listener => listener(data));
  }

  /**
   * Obtener el estado actual de conexión
   * @returns {{isConnected: boolean, connectedCount: number, lastCheckTime: number}}
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      connectedCount: this.connectedCount,
      lastCheckTime: this.lastCheckTime
    };
  }

  /**
   * Iniciar el polling automático de conexión
   */
  startPolling() {
    if (this.intervalId) return;

    // Comprobar inmediatamente
    this.checkConnection();

    // Luego comprobar cada X segundos
    this.intervalId = setInterval(() => {
      this.checkConnection();
    }, this.checkInterval);
  }

  /**
   * Detener el polling automático
   */
  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// ✅ Singleton
export const connectionManager = new ConnectionManager();
