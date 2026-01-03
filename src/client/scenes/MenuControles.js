import Phaser from 'phaser';


export class MenuControles extends Phaser.Scene {
    constructor() {
        super('MenuControles');
    }

        preload() {
        this.load.image('Controles', 'assets/Pantallas/Pantalla de controles.png');
        this.load.image('BotonAtras', 'assets/BotonesUI/Atras.png');
        this.load.audio("click", "assets/Musica y Sonido/Seleccion de modo.mp3");
        }

    create() {

      this.add.image(400, 300, 'Controles')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(800, 600);

    const centerX = this.cameras.main.width / 2;
    const baseY = 520;

    this.BotonAtras = this.add.image(centerX, baseY + 28, "BotonAtras");

    // Interactividad
    this.BotonAtras.setInteractive({ useHandCursor: true });

    // Hover
    const hoverEffect = (btn) => {
      btn.on("pointerover", () => btn.setScale(1.05));
      btn.on("pointerout", () => btn.setScale(1));
    };

    hoverEffect(this.BotonAtras);

    // Clicks (UNO SOLO por botón)
    this.BotonAtras.on("pointerdown", () => {
      this.sound.play("click");
      this.scene.start("MenuScene");
    });

    }
}