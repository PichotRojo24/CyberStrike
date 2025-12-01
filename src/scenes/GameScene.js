import Phaser from 'phaser';
import { Paddle } from '../entities/Paddle';

export class GameScene extends Phaser.Scene {

    constructor() {
        super('GameScene');
    }
preload() {
  this.load.image('Robot1', 'assets/Robot1.png');
  this.load.image('Robot2', 'assets/Robot2.png');
  this.load.image('Escenario', 'assets/Escenario.jpg');
  this.load.image('Plataforma', 'assets/Plataforma.png'); 
  this.load.image('LeftImgScore', 'assets/LeftImgScore.png');   
  this.load.image('RightOmgScore', 'assets/RightOmgScore.png');     
}



    init() {
        this.players = new Map();
        this.inputMappings = [];
        this.floor = null;
        this.isPaused = false;
    }

    create() {

         this.add.image(400, 300, 'Escenario')
      .setOrigin(0.5, 0.5)
      .setDisplaySize(800, 600); // ajusta al tamaño de tu juego


      this.add.image(80, 70, 'LeftImgScore')
      .setOrigin(0.5, 0.5)
      .setDisplaySize(150, 100); // ajusta al tamaño de tu juego

      this.add.image(720, 65, 'RightOmgScore')
      .setOrigin(0.5, 0.5)
      .setDisplaySize(150, 100); // ajusta al tamaño de tu juego

        // Línea discontinua central
        for (let i = 0; i < 12; i++) {
            this.add.rectangle(400, i * 50 + 25, 10, 30, 0x444444);
        }

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

        // Capturar tecla ESC (global)
        this.pauseKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

        
    }

    setUpPlayers() {
        const leftPaddle = new Paddle(this, 'player1', 150, 300);
        const rightPaddle = new Paddle(this, 'player2', 600, 300);

        this.players.set('player1', leftPaddle);
        this.players.set('player2', rightPaddle);

        const player1 = this.players.get('player1').sprite;
        const player2 = this.players.get('player2').sprite;


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
            const offsetX = Math.cos(angle) * 35;
            const offsetY = Math.sin(angle) * 35;

            target.sprite.x += offsetX;
            target.sprite.y += offsetY;
        }
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
        if (Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
                  this.scene.launch('PauseScene');
                this.scene.pause('GameScene');
        }
    }
}