import Phaser from "phaser";

export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super({ key: "LobbyScene" });
    this.ws = null;
  }

  preload() {
    this.load.image("Lobby", "assets/Pantallas/Pantalla de Lobby.png");
    this.load.image("BotonAtras", "assets/BotonesUI/Atras.png");
    this.load.audio("click", "assets/Musica y Sonido/Seleccion de modo.mp3");
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.image(400, 300, "Lobby").setOrigin(0.5).setDisplaySize(800, 600);

    const centerX = width / 2;
    const baseY = 520;

    this.BotonAtras = this.add.image(centerX, baseY + 20, "BotonAtras");
    this.BotonAtras.setInteractive({ useHandCursor: true });

    this.BotonAtras.on("pointerdown", () => {
      this.sound.play("click");
      this.leaveQueue();
      this.scene.start("MenuScene");
    });

    this.add
      .text(410, 100, "ONLINE MULTIPLAYER", {
        fontFamily: "Orbitron",
        fontSize: "48px",
        color: "#eaeaea",
        letterSpacing: 4,
      })
      .setOrigin(0.5);

    this.statusText = this.add
      .text(width / 2, height / 2 - 50, "Connecting to server...", {
        fontSize: "24px",
        color: "#ffff00",
      })
      .setOrigin(0.5);

    this.playerCountText = this.add
      .text(width / 2, height / 2 + 20, "", {
        fontSize: "20px",
        color: "#00ff00",
      })
      .setOrigin(0.5);

    this.events.once("shutdown", () => this.leaveQueue());
    this.events.once("destroy", () => this.leaveQueue());

    this.connectToServer();
  }

  connectToServer() {
    // si estás entrando desde http://192.168.1.130:8080, esto te da 192.168.1.130
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.hostname;
    const wsUrl = `${proto}://${host}:3000`;

    console.log("[LobbyScene] WS URL:", wsUrl);

    this.statusText.setText("Connecting to server...");
    this.statusText.setColor("#ffff00");

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.statusText.setText("Waiting for opponent...");
      this.ws.send(JSON.stringify({ type: "joinQueue" }));
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleServerMessage(data);
    };

    this.ws.onerror = () => {
      this.statusText.setText("Connection error!");
      this.statusText.setColor("#ff0000");
    };

    this.ws.onclose = () => {
      if (this.scene.isActive("LobbyScene")) {
        this.statusText.setText("Connection lost!");
        this.statusText.setColor("#ff0000");
      }
    };
  }

  handleServerMessage(data) {
    switch (data.type) {
      case "queueStatus":
        // si tu server manda count, cambia data.position por data.count
        this.playerCountText.setText(`Players in queue: ${data.position}/2`);
        break;

      case "matchFound":
      case "gameStart":
        this.scene.start("MultiplayerGameScene", {
          ws: this.ws,
          playerRole: data.role,
          roomId: data.roomId,
          initialBall: data.ball || data.initialBall,
        });
        break;

      default:
        console.log("Unknown message type:", data.type, data);
    }
  }

  leaveQueue() {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "leaveQueue" }));
      }
    } catch (e) {}
    try {
      if (this.ws) this.ws.close();
    } catch (e) {}
    this.ws = null;
  }
}
