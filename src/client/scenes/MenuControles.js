import Phaser from 'phaser';


export class MenuControles extends Phaser.Scene {
    constructor() {
        super('MenuControles');
    }

        preload() {
        this.load.image('Controles', 'assets/Pantallas/Pantalla de controles.png');
        }

    create() {

      this.add.image(400, 300, 'Controles')
        .setOrigin(0.5, 0.5)
        .setDisplaySize(800, 600);

        const localBtn = this.add.text(75, 75, 'Atras', {
            fontSize: '24px',
            color: '#ff0000db',
        }).setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerover', () => localBtn.setColor('#00ff88'))
        .on('pointerout', () => localBtn.setColor('#00ff00'))
        .on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}