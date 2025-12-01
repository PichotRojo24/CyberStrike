import Phaser from 'phaser';


export class LeftWinScene extends Phaser.Scene {
    constructor() {
        super('LeftWinScene');
    }

    create() {
        this.add.text(400, 100, 'Gana el jugador de la izquierda', {
            fontSize: '34px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const localBtn = this.add.text(400, 320, 'Jugar de nuevo', {
            fontSize: '24px',
            color: '#00ff00',
        }).setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerover', () => localBtn.setColor('#00ff88'))
        .on('pointerout', () => localBtn.setColor('#00ff00'))
        .on('pointerdown', () => {
            this.scene.start('GameScene');
        });
        const localBtn2 = this.add.text(400, 400, 'Menu Principal', {
            fontSize: '24px',
            color: '#00ff00',
        }).setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerover', () => localBtn.setColor('#00ff88'))
        .on('pointerout', () => localBtn.setColor('#00ff00'))
        .on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
//
    }
}