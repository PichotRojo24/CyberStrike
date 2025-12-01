import Phaser from 'phaser';

export class PauseScene extends Phaser.Scene {
    constructor() {
        super('PauseScene');
    }

    create() {
        this.add.rectangle(400, 300, 300, 200, 0x000000, 0.8);

        const resumeText = this.add.text(320, 250, 'Seguir jugando', {
            fontSize: '24px',
            color: '#00ff00'
        }).setInteractive();

        const menuText = this.add.text(320, 320, 'Volver al menú', {
            fontSize: '24px',
            color: '#ff0000'
        }).setInteractive();

        resumeText.on('pointerdown', () => {
            this.scene.stop(); // cierra PauseScene
            this.scene.resume('GameScene'); // reanuda GameScene
        });

        menuText.on('pointerdown', () => {
            this.scene.stop('GameScene'); // detiene GameScene
            this.scene.start('MenuScene'); // abre MenuScene
        });
}}
