import Phaser from 'phaser';


export class MenuControles extends Phaser.Scene {
    constructor() {
        super('MenuControles');
    }

    create() {
        this.add.text(400, 100, 'CONTROLES', {
            fontSize: '50px',
            color: '#ffffff'
        }).setOrigin(0.5);

         this.add.text(200, 200, 'JUGADOR 1', {
            fontSize: '54px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        this.add.text(600, 200, 'JUGADOR 2', {
            fontSize: '54px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(200, 300, 'WAD SALTAR Y MOVERSE', {
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(600, 300, 'FELCHAS SALTAR Y MOVERSE', {
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5);
        this.add.text(200, 400, 'E PARA EMPUJAR', {
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(600, 400, 'M PARA EMPUJAR', {
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5);




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