import Phaser from 'phaser';
export class CreditsScene extends Phaser.Scene {
    constructor() {
        super('CreditsScene');
    }

        preload() {
        this.load.image('Creditos', 'assets/Pantallas/Pantalla de Lobby.png');
        this.load.image('BotonAtras', 'assets/BotonesUI/Atras.png');
        this.load.audio("click", "assets/Musica y Sonido/Seleccion de modo.mp3");
        }

    create() {

      this.add.image(400, 300, 'Creditos')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(800, 600);

    const centerX = this.cameras.main.width / 2;
    const baseY = 520;

    this.BotonAtras = this.add.image(centerX, baseY + 20, "BotonAtras");

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
      this.scene.start("MenuOpciones");
    });

    this.add.text(400, 100, "CREDITOS", {
        fontFamily: "Orbitron",
        fontSize: "48px",
        color: "#eaeaea",
        letterSpacing: 4
      }).setOrigin(0.5);

    this.add.text(400, 400, "MAURICIO PUCCIARIELLO", {
        fontFamily: "Orbitron",
        fontSize: "32px",
        color: "#eaeaea",
        letterSpacing: 6
      }).setOrigin(0.5);

      this.add.text(400, 300, "LUCIANO PICHOLIS", {
        fontFamily: "Orbitron",
        fontSize: "32px",
        color: "#eaeaea",
        letterSpacing: 6
      }).setOrigin(0.5);

      this.add.text(400, 200, "JAIRO TORRIJO", {
        fontFamily: "Orbitron",
        fontSize: "32px",
        color: "#eaeaea",
        letterSpacing: 6
      }).setOrigin(0.5);
    }
}