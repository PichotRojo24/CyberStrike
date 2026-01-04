import Phaser from 'phaser';
import { connectionManager } from '../services/ConnectionManager';
import MusicManager from "../services/MusicManager";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  preload() {
    this.load.image('FondoPrincipal', 'assets/Pantallas/Menu Principal.png');

    this.load.audio("MusicaMenu", "assets/Musica y Sonido/Menu.mp3");
    this.load.audio("click", "assets/Musica y Sonido/Seleccion de modo.mp3");

    this.load.image('BotonJugar', 'assets/BotonesUI/Local 2 jugadores.png');
    this.load.image('BotonOpciones', 'assets/BotonesUI/Opciones.png');
    this.load.image('BotonMultijugadorEnLinea', 'assets/BotonesUI/Multijugador en linea.png');
  }

  create() {
    MusicManager.play(this, "MusicaMenu", { volume: 0.3 });

    // Fondo
    this.add.image(400, 300, 'FondoPrincipal')
      .setOrigin(0.5, 0.5)
      .setDisplaySize(800, 600);

    const centerX = this.cameras.main.width / 2;
    const baseY = 520;

    // Botones
    this.BotonJugar = this.add.image(centerX - 200, baseY + 9, "BotonJugar");
    this.BotonMultijugadorEnLinea = this.add.image(centerX, baseY + 9, "BotonMultijugadorEnLinea");
    this.BotonOpciones = this.add.image(centerX + 200, baseY + 9, "BotonOpciones");

    // Interactividad
    this.BotonJugar.setInteractive({ useHandCursor: true });
    this.BotonMultijugadorEnLinea.setInteractive({ useHandCursor: true });
    this.BotonOpciones.setInteractive({ useHandCursor: true });

    // Hover
    const hoverEffect = (btn) => {
      btn.on("pointerover", () => btn.setScale(1.05));
      btn.on("pointerout", () => btn.setScale(1));
    };

    hoverEffect(this.BotonJugar);
    hoverEffect(this.BotonMultijugadorEnLinea);
    hoverEffect(this.BotonOpciones);

    // Clicks (UNO SOLO por botón)
    this.BotonJugar.on("pointerdown", () => {
      this.sound.play("click");
      this.scene.start("GameScene");
    });

    this.BotonOpciones.on("pointerdown", () => {
      this.sound.play("click");
      this.scene.start("MenuOpciones");
    });

    this.BotonMultijugadorEnLinea.on("pointerdown", () => {
      this.sound.play("click");

      // Ir al lobby online (matchmaking)
      this.scene.start("LobbyScene");
    });

    // Indicador de conexión al servidor
    this.connectionText = this.add.text(400, 580, 'Servidor: Comprobando...', {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // Listener para cambios de conexión
    this.connectionListener = (data) => {
      this.updateConnectionDisplay(data);
    };

    connectionManager.addListener(this.connectionListener);
  }

  updateConnectionDisplay(data) {
    // Solo actualizar si el texto existe y la escena está activa
    if (!this.connectionText || !this.scene || !this.scene.isActive('MenuScene')) return;

    try {
      if (data.connected) {
        this.connectionText.setText(`Servidor: ${data.count} usuario(s) conectado(s)`);
        this.connectionText.setColor('#00ff00');
      } else {
        this.connectionText.setText('Servidor: Desconectado');
        this.connectionText.setColor('#ff0000');
      }
    } catch (error) {
      console.error('[MenuScene] Error updating connection display:', error);
    }
  }

  shutdown() {
    if (this.connectionListener) {
      connectionManager.removeListener(this.connectionListener);
    }
  }
}
