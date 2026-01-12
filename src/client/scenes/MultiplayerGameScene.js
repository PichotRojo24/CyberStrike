import Phaser from 'phaser';
import { Paddle } from '../entities/Paddle';
import { CommandProcessor } from '../commands/CommandProcessor';
import { PauseGameCommand } from '../commands/PuaseGameCommand';
import MusicManager from '../services/MusicManager';
import { hardReturnToMenu } from '../services/SceneExit.js';

export class MultiplayerGameScene extends Phaser.Scene {
  constructor() {
    super('MultiplayerGameScene');
  }

  preload() {
    this.load.image('Robot1', 'assets/Jugadores/Robot1.png');
    this.load.image('Robot2', 'assets/Jugadores/Robot2.png');
    this.load.image('Escenario', 'assets/Escenarios/Escenario1.png');
    this.load.image('Plataforma', 'assets/Plataformas/Plataforma.png');
    this.load.image('LeftImgScore', 'assets/Marcadores/LeftImgScore.png');
    this.load.image('RightOmgScore', 'assets/Marcadores/RightOmgScore.png');
    this.load.image('PowerUp', 'assets/Power-ups/Boost.png');

    this.load.audio('MusicaJuego', 'assets/Musica y Sonido/Musica en combate.mp3');
    this.load.audio('MusicaBoton', 'assets/Musica y Sonido/Flecha Sobre Boton.mp3');
    this.load.audio('loseMusic', 'assets/Musica y Sonido/Seleccion de modo.mp3');

    // por si lo usan en pausa / UI
    this.load.audio('click', 'assets/Musica y Sonido/Seleccion de modo.mp3');
  }

  init(data) {
    this.ws = data.ws;
    this.playerRole = data.playerRole;
    this.roomId = data.roomId;
    this.initialBall = data.initialBall;

    this.ball = null;
    this.isPaused = false;
    this.processor = new CommandProcessor();
    this.gameEnded = false;

    this.localPaddle = null;
    this.remotePaddle = null;

    this.localScore = 0;
    this.remoteScore = 0;
    this.lastRemoteX = null;

    this.powerUp = null;

    // anti doble ejecución
    this._goingToMenu = false;
    this._discoUIShown = false;
  }

  create() {
    MusicManager.play(this, 'MusicaJuego', { volume: 0.3 });

    this.add.image(400, 300, 'Escenario').setOrigin(0.5).setDisplaySize(800, 600);
    this.add.image(80, 70, 'LeftImgScore').setOrigin(0.5).setDisplaySize(150, 100);
    this.add.image(720, 65, 'RightOmgScore').setOrigin(0.5).setDisplaySize(150, 100);

    this.scoreLeft = this.add.text(100, 50, '0', { fontSize: '48px', color: '#00ff00' });
    this.scoreRight = this.add.text(670, 50, '0', { fontSize: '48px', color: '#00ff00' });

    const roleText = this.playerRole === 'player1' ? 'Jugador 1 (Left)' : 'Jugador 2 (Right)';
    this.add.text(400, 20, roleText, { fontSize: '16px', color: '#ffff00' }).setOrigin(0.5);

    this.createBounds();
    this.setUpPlayers();
    this.createFloor();

    this.physics.add.overlap(this.localPaddle.sprite, this.outsideMap, this.handlePlayerFall, null, this);
    this.physics.add.collider(this.localPaddle.sprite, this.remotePaddle.sprite, this.handlePaddleCollision, null, this);

    this.setupWebSocketListeners();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.canPush = true;

    this.time.addEvent({
      delay: 1500,
      loop: true,
      callback: () => {
        if (!this.powerUp && !this.gameEnded) {
          this.sendMessage({ type: 'requestPowerUpState' });
        }
      },
    });
  }

  setUpPlayers() {
    if (this.playerRole === 'player1') {
      this.localPaddle = new Paddle(this, 'player1', 250, 300);
      this.remotePaddle = new Paddle(this, 'player2', 550, 300);
    } else {
      this.localPaddle = new Paddle(this, 'player2', 550, 300);
      this.remotePaddle = new Paddle(this, 'player1', 250, 300);
    }

    this.localPaddle.sprite.body.allowGravity = true;

    // el remoto no es “jugador real” local, así que lo fijamos
    this.remotePaddle.sprite.body.allowGravity = false;
    this.remotePaddle.sprite.setImmovable(true);
    this.remotePaddle.sprite.setVelocity(0, 0);

    this.lastRemoteX = this.remotePaddle.sprite.x;
  }

  createFloor() {
    this.add.image(400, 300, 'Plataforma').setOrigin(0.5, -1.95).setDisplaySize(525, 100);

    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00);
    graphics.fillRect(0, 0, 500, 100);
    graphics.generateTexture('floor', 500, 300);
    graphics.destroy();

    this.floor = this.physics.add.sprite(400, 650, 'floor');
    this.floor.setDisplaySize(500, 300);
    this.floor.body.setSize(500, 300);
    this.floor.setImmovable(true);
    this.floor.setVisible(false);
    this.floor.body.allowGravity = false;

    this.physics.add.collider(this.floor, this.localPaddle.sprite);
  }

  setupWebSocketListeners() {
    // IMPORTANTÍSIMO: en Multiplayer NO vuelvas a setear onopen si ya venís conectado.
    // Pero lo dejamos safe: si ya está open, pedimos ready en create().
    if (!this.ws) return;

    // Mensajes entrantes
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleServerMessage(data);
      } catch (error) {
        console.error('Error parsing server message:', error);
      }
    };

    // Cierre
    this.ws.onclose = () => {
      if (!this.gameEnded) this.handleDisconnection();
    };

    // Error
    this.ws.onerror = () => {
      if (!this.gameEnded) this.handleDisconnection();
    };

    // Si ya está conectado, mandamos ready ahora
    if (this.ws.readyState === WebSocket.OPEN) {
      this.sendMessage({ type: 'requestPowerUpState' });
      this.sendMessage({ type: 'playerReady' });
    } else {
      // si todavía no abrió, esperamos
      this.ws.onopen = () => {
        this.sendMessage({ type: 'requestPowerUpState' });
        this.sendMessage({ type: 'playerReady' });
      };
    }
  }

  handleServerMessage(data) {
    switch (data.type) {
      case 'paddleUpdate': {
        if (data.player !== this.playerRole) {
          const prevX = this.lastRemoteX ?? this.remotePaddle.sprite.x;
          const newX = data.x;

          this.remotePaddle.sprite.x = newX;
          this.remotePaddle.sprite.y = data.y;

          const dx = newX - prevX;
          if (Math.abs(dx) > 1) this.remotePaddle.sprite.setFlipX(dx < 0);
          this.lastRemoteX = newX;
        }
        break;
      }

      case 'scoreUpdate': {
        this.scoreLeft.setText(String(data.player1Score));
        this.scoreRight.setText(String(data.player2Score));
        this.resetPlayers();
        break;
      }

      case 'push':
        this.handlePush(data);
        break;

      case 'powerUpSpawn':
        this.spawnPowerUp(data.x, data.y);
        break;

      case 'powerUpPickup':
        this.removePowerUp();
        break;

      case 'gameOver':
        this.endGame(data.winner, data.player1Score, data.player2Score);
        break;

      case 'playerDisconnected':
        this.handleDisconnection();
        break;

      default:
        break;
    }
  }

  endGame(winner) {
    this.gameEnded = true;
    this.physics.pause();

    const isWinner =
      (winner === 'player1' && this.playerRole === 'player1') ||
      (winner === 'player2' && this.playerRole === 'player2');

    // Cerramos WS para que no quede colgado
    try {
      if (this.ws) {
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onerror = null;
        this.ws.onclose = null;
        if (this.ws.readyState === WebSocket.OPEN) this.ws.close();
      }
    } catch (e) {}

    if (isWinner) {
      this.scene.start(this.playerRole === 'player1' ? 'LeftWinSceneMultiplayer' : 'RightWinSceneMultiplayer');
    } else {
      this.scene.start(this.playerRole === 'player1' ? 'LeftLoseSceneMultiplayer' : 'RightLoseSceneMultiplayer');
    }
  }

  handlePaddleCollision(localPlayer, remotePlayer) {
    const now = this.time.now;
    const angle = Phaser.Math.Angle.Between(localPlayer.x, localPlayer.y, remotePlayer.x, remotePlayer.y);

    const movingHorizontally = Math.abs(localPlayer.body.velocity.x) > 0;
    const fallingFast = localPlayer.body.velocity.y > 400;
    const above = localPlayer.y < remotePlayer.y - 10;

    if (fallingFast && above) {
      if (!this.lastStompPush || now - this.lastStompPush > 300) {
        this.lastStompPush = now;
        this.sendMessage({ type: 'push', angle, force: 80 });
        localPlayer.setVelocityY(-800);
      }
      return;
    }

    if (movingHorizontally) {
      if (!this.lastBodyPush || now - this.lastBodyPush > 200) {
        this.lastBodyPush = now;
        this.sendMessage({ type: 'push', angle, force: 20 });
      }
    }
  }

  handlePush(data) {
    const velocityMagnitude = data.force * 8;

    this.localPaddle.sprite.setVelocity(
      Math.cos(data.angle) * velocityMagnitude,
      Math.sin(data.angle) * velocityMagnitude
    );

    this.localPaddle.isKnockedBack = true;
    this.time.delayedCall(300, () => {
      if (this.localPaddle) this.localPaddle.isKnockedBack = false;
    });
  }

  attemptPush() {
    const distance = Phaser.Math.Distance.Between(
      this.localPaddle.sprite.x,
      this.localPaddle.sprite.y,
      this.remotePaddle.sprite.x,
      this.remotePaddle.sprite.y
    );

    if (distance < 100) {
      const angle = Phaser.Math.Angle.Between(
        this.localPaddle.sprite.x,
        this.localPaddle.sprite.y,
        this.remotePaddle.sprite.x,
        this.remotePaddle.sprite.y
      );
      this.sendMessage({ type: 'push', angle, force: 35 });
    }
  }

  handleDisconnection() {
  if (this._discoUIShown) return;
  this._discoUIShown = true;

  this.gameEnded = true;

  // Frenamos físicas, pero NO tocamos this.scene.pause()
  try { this.physics.pause(); } catch (e) {}

  // Por si quedó la PauseScene arriba
  try { this.scene.stop('PauseScene'); } catch (e) {}

  // MUY IMPORTANTE: re-habilitar input por si quedó bloqueado
  this.input.enabled = true;
  if (this.input.mouse) this.input.mouse.enabled = true;

  // Asegura que SOLO lo de arriba reciba clicks
  this.input.setTopOnly(true);

  const msg = this.add.text(400, 250, 'Opponent Disconnected', {
    fontSize: '48px',
    color: '#ff0000',
  }).setOrigin(0.5);
  msg.setDepth(9999);

  this.createMenuButton(); // ahora crea overlay clickeable
}

createMenuButton() {
  // Overlay invisible que captura click en TODA la pantalla
  const overlay = this.add.zone(0, 0, 800, 600)
    .setOrigin(0, 0)
    .setInteractive({ useHandCursor: true });
  overlay.setDepth(10000);

  const label = this.add.text(400, 380, 'Return to Main Menu', {
    fontSize: '32px',
    color: '#ffffff',
  }).setOrigin(0.5);
  label.setDepth(10001);

  // Feedback visual al hover (sobre overlay)
  overlay.on('pointerover', () => label.setColor('#cccccc'));
  overlay.on('pointerout', () => label.setColor('#ffffff'));

  overlay.on('pointerdown', () => {
    // anti doble click
    if (this._goingToMenu) return;
    this._goingToMenu = true;

    try { this.sound.play('click'); } catch (e) {}

    // Cierre prolijo y volver al menu
    // (si no querés usar hardReturnToMenu, lo hago directo acá)
    try {
      if (this.ws) {
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onerror = null;
        this.ws.onclose = null;
        if (this.ws.readyState === WebSocket.OPEN) {
          // opcional: avisar abandono
          try { this.ws.send(JSON.stringify({ type: 'leaveRoom', roomId: this.roomId })); } catch (e) {}
          this.ws.close();
        }
      }
    } catch (e) {}

    // Limpieza de escenas
    try { this.scene.stop('MultiplayerGameScene'); } catch (e) {}
    try { this.scene.stop('LobbyScene'); } catch (e) {}
    try { this.scene.stop('PauseScene'); } catch (e) {}

    this.scene.start('MenuScene');
  });
}


  createBounds() {
    this.outsideMap = this.physics.add.sprite(400, 600, null);
    this.outsideMap.setDisplaySize(800, 25);
    this.outsideMap.body.setSize(800, 25);
    this.outsideMap.setImmovable(true);
    this.outsideMap.setVisible(false);
    this.outsideMap.body.allowGravity = false;
  }

  handlePlayerFall() {
    if (this.gameEnded) return;
    this.sendMessage({ type: 'playerFell', player: this.playerRole });
    this.localPaddle.sprite.setVelocity(0, 0);
  }

  resetPlayers() {
    if (this.playerRole === 'player1') {
      this.localPaddle.sprite.setPosition(250, 450);
      this.remotePaddle.sprite.setPosition(550, 450);
    } else {
      this.localPaddle.sprite.setPosition(550, 450);
      this.remotePaddle.sprite.setPosition(250, 450);
    }

    this.localPaddle.sprite.body.checkCollision.none = false;
    this.localPaddle.sprite.setVelocity(0, 0);
    this.remotePaddle.sprite.setVelocity(0, 0);
    this.lastRemoteX = this.remotePaddle.sprite.x;
  }

  spawnPowerUp(x, y) {
    if (this.powerUp) return;

    this.powerUp = this.physics.add.sprite(x, y, 'PowerUp');
    this.powerUp.setScale(0.5);
    this.powerUp.body.allowGravity = false;
    this.powerUp.setDepth(100);

    this.physics.add.overlap(this.localPaddle.sprite, this.powerUp, () => this.collectPowerUp(), null, this);
  }

  collectPowerUp() {
    if (!this.powerUp) return;
    this.sendMessage({ type: 'powerUpPickup' });
    this.removePowerUp();
  }

  removePowerUp() {
    if (this.powerUp) {
      this.powerUp.destroy();
      this.powerUp = null;
    }
  }

  sendMessage(message) {
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(message));
      }
    } catch (e) {}
  }

  update() {
    if (this.gameEnded || !this.localPaddle || !this.remotePaddle) return;

    const isPushDown = Phaser.Input.Keyboard.JustDown(this.keyE);
    if (isPushDown && this.canPush) {
      this.attemptPush();
      this.canPush = false;
      this.time.delayedCall(500, () => (this.canPush = true));
    }

    if (!this.localPaddle.isKnockedBack) {
      const speed = 300;

      if ((this.cursors.up.isDown || this.wasd.up.isDown) && this.localPaddle.sprite.body.touching.down) {
        this.localPaddle.sprite.setVelocityY(-1500);
      } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
        this.localPaddle.sprite.setVelocityX(speed);
        this.localPaddle.sprite.setFlipX(false);
      } else if (this.cursors.left.isDown || this.wasd.left.isDown) {
        this.localPaddle.sprite.setVelocityX(-speed);
        this.localPaddle.sprite.setFlipX(true);
      } else {
        this.localPaddle.sprite.setVelocityX(0);
      }
    }

    this.sendMessage({
      type: 'paddleMove',
      x: this.localPaddle.sprite.x,
      y: this.localPaddle.sprite.y,
    });

    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.scene.launch('PauseScene', { originalScene: 'MultiplayerGameScene' });
      this.scene.pause('MultiplayerGameScene');
      this.scene.bringToTop('PauseScene');
    }
  }

  shutdown() {
    // Si salís desde acá (no desde hardReturnToMenu), cerramos prolijo
    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
    } catch (e) {}
  }
}
