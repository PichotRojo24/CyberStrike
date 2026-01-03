import Phaser from 'phaser';
import { Paddle } from '../entities/Paddle';
import { CommandProcessor } from '../commands/CommandProcessor';
import { MovePaddleCommand } from '../commands/MovePaddleCommand';
import { PauseGameCommand } from '../commands/PuaseGameCommand';
import MusicManager from "../services/MusicManager";

export class GameScene extends Phaser.Scene {

 constructor() {
        super('GameScene');
    }
preload() {

  this.load.image('Robot1', 'assets/Jugadores/Robot1.png');
  this.load.image('Robot2', 'assets/Jugadores/Robot2.png');
  this.load.image('Escenario', 'assets/Escenarios/Escenario1.png');
  this.load.image('Plataforma', 'assets/Plataformas/Plataforma.png'); 
  this.load.image('LeftImgScore', 'assets/Marcadores/LeftImgScore.png');   
  this.load.image('RightOmgScore', 'assets/Marcadores/RightOmgScore.png');
  this.load.image('PowerUp', 'assets/Power-ups/Boost.png');

  this.load.audio("MusicaJuego", "assets/Musica y Sonido/Musica en combate.mp3");
  this.load.audio("MusicaBoton", "assets/Musica y Sonido/Flecha Sobre Boton.mp3");
  this.load.audio("loseMusic", "assets/Musica y Sonido/Seleccion de modo.mp3");

}

    init() {
        this.players = new Map();
        this.inputMappings = [];
        this.floor = null;
        this.isPaused = false;
        this.escWasDown = false;
        this.processor = new CommandProcessor();
        this.powerUp = null;
        this.powerUpTimer = 0;
        this.playersPower = 
        {
        player1: false,
         player2: false
        };
    }

    create() {
        MusicManager.play(this, "MusicaJuego", { volume: 0.3 });
      this.add.image(400, 300, 'Escenario')
      .setOrigin(0.5, 0.5)
      .setDisplaySize(800, 600); // ajusta al tamaño de tu juego

      this.add.image(80, 70, 'LeftImgScore')
      .setOrigin(0.5, 0.5)
      .setDisplaySize(150, 100); // ajusta al tamaño de tu juego

      this.add.image(720, 65, 'RightOmgScore')
      .setOrigin(0.5, 0.5)
      .setDisplaySize(150, 100); // ajusta al tamaño de tu juego
      
        // Marcadores
        this.scoreLeft = this.add.text(100, 50, '0', {
            fontSize: '48px',
            color: '#00ff00'
        });

        this.rightScore = this.add.text(670, 50, '0', {
            fontSize: '48px',
            color: '#00ff00'
        });

        this.createBounds();
        this.createFloor();

       
        this.setUpPlayers();
        this.players.forEach(paddle => {
            this.physics.add.collider(this.floor, paddle.sprite);
        });

          this.physics.add.overlap(this.players.get('player1').sprite, this.outsideMap, this.scoreRightGoal, null, this);
        this.physics.add.overlap(this.players.get('player2').sprite, this.outsideMap, this.scoreLeftGoal, null, this);


        this.time.addEvent({
         delay: 5000,
        loop: true,
        callback: () => this.spawnPowerUp()
        });

        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);


    }
    spawnPowerUp() {
    // Si ya hay uno, no generes otro
    if (this.powerUp) return;

    const x = Phaser.Math.Between(100, 700);
    const y = Phaser.Math.Between(200, 500);

    this.powerUp = this.physics.add.sprite(x, y, 'PowerUp');
    this.powerUp.setScale(0.5);
    this.powerUp.body.allowGravity = false;

    // Detectar recogida por cada jugador
    this.players.forEach((paddle, id) => {
        this.physics.add.overlap(
            paddle.sprite,
            this.powerUp,
            () => this.collectPowerUp(id),
            null,
            this
        );
    });
}
collectPowerUp(playerId) {
    console.log(playerId + " recogió el power up!");

    this.playersPower[playerId] = true;

    this.powerUp.destroy();
    this.powerUp = null;
}

      setUpPlayers() {
        
        const leftPaddle = new Paddle(this, 'player1', 150, 300);
        const rightPaddle = new Paddle(this, 'player2', 600, 300);

        this.players.set('player1', leftPaddle);
        this.players.set('player2', rightPaddle);

        const player1 = this.players.get('player1').sprite;
        const player2 = this.players.get('player2').sprite;


        leftPaddle.id = 'player1';
        rightPaddle.id = 'player2';
        this.physics.add.collider(player1, player2);

        const InputConfig = [
            {
                playerId: 'player1',
                LeftKey: 'A',
                RightKey: 'D',
                JumpKey: 'W',
                ActionKey: 'E',
            },
            {
                playerId: 'player2',
                LeftKey: 'LEFT',
                RightKey: 'RIGHT',
                JumpKey: 'UP',
                ActionKey: 'M',
            }
        ];

        this.inputMappings = InputConfig.map(config => {
            return {
                playerId: config.playerId,
                LeftKeyObj: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[config.LeftKey]),
                RightKeyObj: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[config.RightKey]),
                JumpKeyObj: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[config.JumpKey]),
                ActionKeyObj: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[config.ActionKey]),
            };
        });
    }

    scoreLeftGoal() {
        console.log("Left Goal Scored");
        this.resetPlayer();
        
        const currentScore = parseInt(this.scoreLeft.text);
        this.scoreLeft.setText((currentScore + 1).toString());
        if(currentScore == 2 ){
            this.scene.start('LeftWinScene');
        }

    }

    scoreRightGoal() {
        console.log("Right Goal Scored");
        this.resetPlayer();
        const currentScore = parseInt(this.rightScore.text);
        this.rightScore.setText((currentScore + 1).toString());
               if(currentScore == 2 ){
            this.scene.start('RightWinScene');
        }
    }
    resetPlayer() {
        const leftPaddle = this.players.get('player1').sprite;
        const rightPaddle = this.players.get('player2').sprite;

        leftPaddle.setVelocity(0, 0);
        leftPaddle.setPosition(150, 300);

        rightPaddle.setVelocity(0, 0);
        rightPaddle.setPosition(600, 300);
    }

        createFloor() {
    this.add.image(400, 300, 'Plataforma')
      .setOrigin(0.5, -1.95)
      .setDisplaySize(525, 100);
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
    }

    createBounds() {
        this.outsideMap = this.physics.add.sprite(400, 600, null);
        this.outsideMap.setDisplaySize(800, 25);
        this.outsideMap.body.setSize(800, 25);
        this.outsideMap.setImmovable(true);
        this.outsideMap.setVisible(false);
        this.outsideMap.body.allowGravity = false;
    }
pushOpponent(pusher, target) {
        const distance = Phaser.Math.Distance.Between(
            pusher.sprite.x,
            pusher.sprite.y,
            target.sprite.x,
            target.sprite.y
        );

        const angle = Phaser.Math.Angle.Between(
            pusher.sprite.x,
            pusher.sprite.y,
            target.sprite.x,
            target.sprite.y
        );

        if (distance < 100) {
            let force = 35;

        // Si el jugador tiene power-up, empuja más fuerte
        if (this.playersPower[pusher.id]) 
        {
        force = 100; // fuerza aumentada
         this.playersPower[pusher.id] = false; // se consume el power-up
}

const offsetX = Math.cos(angle) * force;
const offsetY = Math.sin(angle) * force;


            target.sprite.x += offsetX;
            target.sprite.y += offsetY;
        }
    }

    endGame(winnerId) {

        this.physics.pause();

        const winnerText = winnerId === 'player1' ? 'Player 1 Wins!' : 'Player 2 Wins!';
        this.add.text(400, 250, winnerText, {
            fontSize: '64px',
            color: '#00ff00'
        }).setOrigin(0.5);

        const menuBtn = this.add.text(400, 350, 'Return to Main Menu', {
            fontSize: '32px',
            color: '#ffffff',
        }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => menuBtn.setColor('#cccccc'))
        .on('pointerout', () => menuBtn.setColor('#ffffff'))
        .on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }




    setPauseState(isPaused) {
        this.isPaused = isPaused;
        if (isPaused) {
            this.scene.launch('PauseScene', { originalScene: 'GameScene' });
            this.scene.pause();
        } 
    }

    resume() {
        this.isPaused = false;
    }

    togglePause() {
        const newPauseState = !this.isPaused;
        this.processor.process(
            new PauseGameCommand(this, newPauseState)
        );
    }

    update() {
        // --- Lógica de jugadores ---
        this.inputMappings.forEach(mapping => {
            const paddle = this.players.get(mapping.playerId);

            if (mapping.LeftKeyObj.isDown) {
    paddle.sprite.setVelocityX(-paddle.baseSpeed);
    paddle.sprite.setFlipX(true);   // voltea hacia la izquierda
} else if (mapping.RightKeyObj.isDown) {
    paddle.sprite.setVelocityX(paddle.baseSpeed);
    paddle.sprite.setFlipX(false);  // voltea hacia la derecha
}else {
                paddle.sprite.setVelocityX(0);
            }

            if (mapping.JumpKeyObj.isDown) {
                if (paddle.sprite.body.touching.down) {
                    paddle.sprite.setVelocityY(-1500);
                }
            }

            if (mapping.ActionKeyObj.isDown && paddle.boolCanPush) {
                const pusher = this.players.get(mapping.playerId);
                const targetId = mapping.playerId === 'player1' ? 'player2' : 'player1';
                const target = this.players.get(targetId);
                this.pushOpponent(pusher, target);
                paddle.boolCanPush = false;
            }

            if (mapping.ActionKeyObj.isUp) {
                paddle.boolCanPush = true;
            }
        });

        // --- Pausa con ESC ---
        if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
                  this.scene.launch('PauseScene');
                this.scene.pause('GameScene');
        }
    }
}