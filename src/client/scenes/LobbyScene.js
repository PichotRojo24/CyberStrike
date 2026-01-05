export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LobbyScene' });
    this.ws = null;
  }

      preload() {
        this.load.image('Lobby', 'assets/Pantallas/Pantalla de Lobby.png');
        this.load.image('BotonAtras', 'assets/BotonesUI/Atras.png');
        this.load.audio("click", "assets/Musica y Sonido/Seleccion de modo.mp3");
        }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

      this.add.image(400, 300, 'Lobby')
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
      this.scene.start("MenuScene");
    });

    // Title
    this.add.text(410, 100, "ONLINE MULTIPLAYER", {
        fontFamily: "Orbitron",
        fontSize: "48px",
        color: "#eaeaea",
        letterSpacing: 4
      }).setOrigin(0.5);

    // Status text
    this.statusText = this.add.text(width / 2, height / 2 - 50, 'Connecting to server...', {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // Player count text
    this.playerCountText = this.add.text(width / 2, height / 2 + 20, '', {
      fontSize: '20px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // Connect to WebSocket server
    this.connectToServer();
  }

  connectToServer() {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
      // Connect to WebSocket server (same host as web server)
      const wsUrl = `ws://localhost:3000`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('Connected to WebSocket server');
        this.statusText.setText('Waiting for opponent...');

        // Join matchmaking queue
        this.ws.send(JSON.stringify({ type: 'joinQueue' }));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleServerMessage(data);
        } catch (error) {
          console.error('Error parsing server message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.statusText.setText('Connection error!');
        this.statusText.setColor('#ff0000');
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
        if (this.scene.isActive('LobbyScene')) {
          this.statusText.setText('Connection lost!');
          this.statusText.setColor('#ff0000');
        }
      };
    } catch (error) {
      console.error('Error connecting to server:', error);
      this.statusText.setText('Failed to connect!');
      this.statusText.setColor('#ff0000');
    }
  }

  handleServerMessage(data) {
    switch (data.type) {
      case 'queueStatus':
        this.playerCountText.setText(`Players in queue: ${data.position}/2`);
        break;

      case 'gameStart':
  console.log('Game starting (legacy message)!', data);
  this.scene.start('MultiplayerGameScene', {
    ws: this.ws,
    playerRole: data.role,
    roomId: data.roomId,
    initialBall: data.ball || data.initialBall
  });
  break;

case 'matchFound':
  console.log('✅ Match found!', data);
  this.scene.start('MultiplayerGameScene', {
    ws: this.ws,
    playerRole: data.role,
    roomId: data.roomId,
    initialBall: data.ball
  });
  break;



      default:
        console.log('Unknown message type:', data.type);
    }
  }

  leaveQueue() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'leaveQueue' }));
      this.ws.close();
    }
  }

  shutdown() {
    this.leaveQueue();
  }
}
