import Phaser from 'phaser';
import { hardReturnToMenu } from '../services/SceneExit.js';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  preload() {
    this.load.image('Pausa', 'assets/Pantallas/Pausa.png');
    this.load.image('BotonResume', 'assets/BotonesUI/Reanudar.png');
    this.load.image('BotonVolverAlMenu', 'assets/BotonesUI/volver al menu principal.png');

    // Si este audio ya está cargado en otra escena no pasa nada,
    // pero si NO lo está, así evitás errores al play().
    this.load.audio('click', 'assets/Musica y Sonido/Seleccion de modo.mp3');
  }

  create(data) {
    const originalSceneKey = data?.originalScene || 'GameScene';

    this.add.image(400, 300, 'Pausa')
      .setOrigin(0.5, 0.5)
      .setDisplaySize(600, 500);

    const centerX = this.cameras.main.width / 2;
    const baseY = this.cameras.main.height / 2;

    this.BotonResume = this.add.image(centerX - 9, baseY, 'BotonResume');
    this.BotonVolverAlMenu = this.add.image(centerX - 9, baseY + 90, 'BotonVolverAlMenu');

    this.BotonResume.setInteractive({ useHandCursor: true });
    this.BotonVolverAlMenu.setInteractive({ useHandCursor: true });

    this.add.text(392, 200, 'PAUSA', {
      fontFamily: 'Orbitron',
      fontSize: '48px',
      color: '#eaeaea',
      letterSpacing: 4
    }).setOrigin(0.5);

    const hoverEffect = (btn) => {
      btn.on('pointerover', () => btn.setScale(1.05));
      btn.on('pointerout', () => btn.setScale(1));
    };

    hoverEffect(this.BotonResume);
    hoverEffect(this.BotonVolverAlMenu);

    // RESUME
    this.BotonResume.on('pointerdown', () => {
      try { this.sound.play('click'); } catch (e) {}

      // IMPORTANTE: primero cerrar PauseScene, después resumir la original
      this.scene.stop('PauseScene');
      this.scene.resume(originalSceneKey);
    });

    // VOLVER AL MENU (hard reset del estado)
    this.BotonVolverAlMenu.on('pointerdown', () => {
      try { this.sound.play('click'); } catch (e) {}

      // Evita doble click y estados raros
      this.BotonResume.disableInteractive();
      this.BotonVolverAlMenu.disableInteractive();

      // Esto soluciona:
      // - botón que a veces "no responde"
      // - volver a entrar y que quede una partida anterior "enganchada"
      // - errores al cerrar por WS / handlers vivos
      hardReturnToMenu(this, originalSceneKey, {
        closeWs: true,
        stopMusic: false,
        menuSceneKey: 'MenuScene',
        stopAllScenes: false,
      });
    });
  }
}
