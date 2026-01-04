import Phaser from 'phaser';
const VOLUME_KEY = "musicVolume";

export class MenuOpciones extends Phaser.Scene {
    constructor() {
        super('MenuOpciones');
    }

        preload() {
        this.load.image('Fondo', 'assets/Pantallas/Pantalla de Lobby.png');
        this.load.image('BotonAtras', 'assets/BotonesUI/Atras.png');
        this.load.image('BotonControles', 'assets/BotonesUI/Controles.png');
        this.load.audio("click", "assets/Musica y Sonido/Seleccion de modo.mp3");
        this.load.image('BotonAudio', 'assets/BotonesUI/Boton.png');
        this.load.image('Barra', 'assets/BotonesUI/Barra.png');
        this.load.image('BarraMovediza', 'assets/BotonesUI/Barra movediza.png');
        }

    create() {

      this.add.image(400, 300, 'Fondo')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(800, 600);

      this.add.text(400, 100, "OPCIONES", {
        fontFamily: "Orbitron",
        fontSize: "48px",
        color: "#eaeaea",
        letterSpacing: 4
      }).setOrigin(0.5);

    const centerX = this.cameras.main.width / 2;
    const baseY = this.cameras.main.height / 2;

    this.Barra = this.add.image(centerX, baseY - 60, "Barra");

    // Knob
    this.BotonAudio = this.add.image(
    centerX,
    baseY - 60,
    "BotonAudio"
    ).setInteractive({ draggable: true });

    const minX = this.Barra.x - this.Barra.width / 2;
    const maxX = this.Barra.x + this.Barra.width / 2;

    this.input.setDraggable(this.BotonAudio);

    this.BotonAudio.on("drag", (pointer, dragX) => {

    // Limitar movimiento
    dragX = Phaser.Math.Clamp(dragX, minX, maxX);
    this.BotonAudio.x = dragX;

    // Convertir posición a volumen (0 - 1)
    const volume = Phaser.Math.Percent(dragX, minX, maxX);

    // Aplicar volumen
    this.sound.volume = volume;
     });

    const currentVolume = this.sound.volume;

    this.BotonAudio.x = Phaser.Math.Linear(minX, maxX, currentVolume);


    this.BotonAtras = this.add.image(centerX, baseY + 240, "BotonAtras");
    this.BotonControles = this.add.image(centerX, baseY + 60, "BotonControles");

    // Interactividad
    this.BotonAtras.setInteractive({ useHandCursor: true });
    this.BotonControles.setInteractive({ useHandCursor: true });


    // Hover
    const hoverEffect = (btn) => {
      btn.on("pointerover", () => btn.setScale(1.05));
      btn.on("pointerout", () => btn.setScale(1));
    };

    hoverEffect(this.BotonAtras);
    hoverEffect(this.BotonControles);

    // Clicks (UNO SOLO por botón)
    this.BotonAtras.on("pointerdown", () => {
      this.sound.play("click");
      this.scene.start("MenuScene");
    });

      // Clicks (UNO SOLO por botón)
    this.BotonControles.on("pointerdown", () => {
      this.sound.play("click");
      this.scene.start("MenuControles");
    });

    this.BotonAudio.on("dragend", () => {
      localStorage.setItem("volume", this.sound.volume.toString());
    });

    const savedVolume = localStorage.getItem("volume");
    if (savedVolume !== null) {
      this.sound.volume = parseFloat(savedVolume);
    }

    }
}