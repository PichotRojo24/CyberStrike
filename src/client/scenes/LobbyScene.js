import Phaser from 'phaser';

export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LobbyScene' });
    this.ws = null;
    this.isStartingMatch = false; // 🔥 clave: evita cerrar WS al pasar al game
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

    const centerX = width / 2;
    const baseY = 520;

    this.BotonAtras = this.add.image(centerX, baseY + 20, "BotonAtras");
    this.BotonAtras.setInteractive({ useHandCursor: true });

    const hoverEffect = (btn) => {
      btn.on("pointerover", () => btn.setScale(1.05));
      btn.on("pointerout", () => btn.setScale(1));
    };
    hoverEffect(this.BotonAtras);

    this.BotonAtras.on("pointerdown", () => {
      this.sound.play("click");
      this.isStartingMatch = false; // vuelve a modo normal
      this.leaveQueueAndClose();     // acá SÍ cerramos WS
      this.scene.start("MenuScene");
    });

<<<<<<< HEAD
    this.add.text(410, 100, "MULTIJUGADOR EN LINEA", {
        fontFamily: "Orbitron",
        fontSize: "48px",
        color: "#eaeaea",
        letterSpacing: 4
      }).setOrigin(0.5);
=======
    this.add.text(410, 100, "ONLINE MULTIPLAYER", {
      fontFamily: "Orbitron",
      fontSize: "48px",
      color: "#eaeaea",
      letterSpacing: 4
    }).setOrigin(0.5);
>>>>>>> fea24887f448598562c145cbcededfea529a460b

    this.statusText = this.add.text(width / 2, height / 2 - 50, 'Conectando al servidor...', {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);

    this.playerCountText = this.add.text(width / 2, height / 2 + 20, '', {
      fontSize: '20px',
      color: '#00ff00'
    }).setOrigin(0.5);

    this.connectToServer();
  }

  getServerHost() {
    // ✅ si abrís el juego desde http://192.168.1.130:8080, esto devuelve 192.168.1.130
    return window.location.hostname || 'localhost';
  }

  connectToServer() {
    try {
      if (this.ws) {
        try { this.ws.close(); } catch (e) {}
        this.ws = null;
      }

      const host = this.getServerHost();
      const wsUrl = `ws://${host}:3000`; // ✅ NO localhost
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ Connected to WebSocket server:', wsUrl);
        this.statusText.setText('Waiting for opponent...');
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

<<<<<<< HEAD
        const wsUrl = `ws://localhost:3000`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('conectado al servidor WebSocket');
            this.statusText.setText('Esperando oponente...');
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
            console.error('Error WebSocket:', error);
            this.statusText.setText('Connection error!');
            this.statusText.setColor('#ff0000');
        };

        this.ws.onclose = () => {
            console.log('conexión WebSocket cerrada');
            if (this.scene.isActive('LobbyScene')) {
                this.statusText.setText('Conexión perdida!');
                this.statusText.setColor('#ff0000');
            }
        };

    } catch (error) {
        console.error('Error al conectar al servidor:', error);
        this.statusText.setText('Fallo la conexión!');
=======
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.statusText.setText('Connection error!');
>>>>>>> fea24887f448598562c145cbcededfea529a460b
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

      case 'matchFound':
      case 'gameStart':
<<<<<<< HEAD
  console.log('Game starting (legacy message)!', data);
  this.scene.start('MultiplayerGameScene', {
    ws: this.ws,
    playerRole: data.role,
    roomId: data.roomId,
    initialBall: data.ball || data.initialBall
  });
  break;

case 'matchFound':
  console.log('✅ Partida Encontrada!', data);
  this.scene.start('MultiplayerGameScene', {
    ws: this.ws,
    playerRole: data.role,
    roomId: data.roomId,
    initialBall: data.ball
  });
  break;
=======
        console.log('✅ Match found / Game start:', data);
>>>>>>> fea24887f448598562c145cbcededfea529a460b

        // 🔥 Importantísimo: marcamos que vamos al game para NO cerrar WS en shutdown()
        this.isStartingMatch = true;

        this.scene.start('MultiplayerGameScene', {
          ws: this.ws,
          playerRole: data.role,
          roomId: data.roomId,
          initialBall: data.ball || data.initialBall
        });
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  }

  leaveQueueAndClose() {
    if (this.ws) {
      try {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'leaveQueue' }));
        }
      } catch (e) {}
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }
  }

  shutdown() {
    // ✅ Si estamos yendo al game: NO tocamos el WS
    if (!this.isStartingMatch) {
      this.leaveQueueAndClose();
    }
  }
}
