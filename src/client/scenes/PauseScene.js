import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

   preload() {
        this.load.image('Pausa', 'assets/Pantallas/Pausa.png');
        this.load.image('BotonResume', 'assets/BotonesUI/Reanudar.png');
        this.load.image('BotonVolverAlMenu', 'assets/BotonesUI/volver al menu principal.png');
        }

  create(data) {
    // ✅ fallback por si no te mandaron originalScene
    const originalSceneKey = data?.originalScene || 'GameScene';

    this.add.image(400, 300, 'Pausa')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(600, 500);

    const centerX = this.cameras.main.width / 2;
    const baseY = this.cameras.main.height / 2;

    // Botones
    this.BotonResume = this.add.image(centerX - 9, baseY , "BotonResume");
    this.BotonVolverAlMenu = this.add.image(centerX - 9 , baseY + 90, "BotonVolverAlMenu");

    this.BotonResume.setInteractive({ useHandCursor: true });
    this.BotonVolverAlMenu.setInteractive({ useHandCursor: true });

    this.add.text(392, 200, "PAUSA", {
        fontFamily: "Orbitron",
        fontSize: "48px",
        color: "#eaeaea",
        letterSpacing: 4
      }).setOrigin(0.5);


     const hoverEffect = (btn) => {
      btn.on("pointerover", () => btn.setScale(1.05));
      btn.on("pointerout", () => btn.setScale(1));
    };

    hoverEffect(this.BotonResume);
    hoverEffect(this.BotonVolverAlMenu);

    // Clicks (UNO SOLO por botón)
    this.BotonResume.on("pointerdown", () => {
      this.sound.play("click");
      this.scene.stop('PauseScene');
      this.scene.resume(originalSceneKey);
    });

    this.BotonVolverAlMenu.on("pointerdown", () => {
      this.sound.play("click");
      this.scene.stop(originalSceneKey);
      this.scene.stop('PauseScene');
      this.scene.start('MenuScene');
    });

  }
}
