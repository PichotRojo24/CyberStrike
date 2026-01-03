import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  create(data) {
    // ✅ fallback por si no te mandaron originalScene
    const originalSceneKey = data?.originalScene || 'GameScene';

    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

    this.add.text(400, 200, 'Game Paused', {
      fontSize: '64px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const resumeBtn = this.add.text(400, 320, 'Resume', {
      fontSize: '32px',
      color: '#00ff00',
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // ✅ era "pointover" (mal) -> "pointerover"
    resumeBtn.on('pointerover', () => resumeBtn.setColor('#00ff88'));
    resumeBtn.on('pointerout', () => resumeBtn.setColor('#00ff00'));
    resumeBtn.on('pointerdown', () => {
      // Reanudar escena original y cerrar pausa
      this.scene.stop('PauseScene');
      this.scene.resume(originalSceneKey);
    });

    const menuBtn = this.add.text(400, 400, 'Return to Main Menu', {
      fontSize: '32px',
      color: '#ffffff',
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    menuBtn.on('pointerover', () => menuBtn.setColor('#ff8888'));
    menuBtn.on('pointerout', () => menuBtn.setColor('#ffffff'));
    menuBtn.on('pointerdown', () => {
      // ✅ cortar escena original y la pausa
      this.scene.stop(originalSceneKey);
      this.scene.stop('PauseScene');

      // ✅ ir al menú limpio
      this.scene.start('MenuScene');
    });
  }
}
