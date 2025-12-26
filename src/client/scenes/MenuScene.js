import Phaser from 'phaser';
import { connectionManager } from '../services/ConnectionManager';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    preload() {
        this.load.image('background', 'assets/background.png');
    }

    create() {
        this.add.text(400, 100, 'CYBER STRIKE', {
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const localBtn = this.add.text(400, 320, 'Local 2 Player', {
            fontSize: '24px',
            color: '#00ff00',
        }).setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerover', () => localBtn.setColor('#00ff88'))
        .on('pointerout', () => localBtn.setColor('#00ff00'))
        .on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        const onlineBtn = this.add.text(400, 390, 'Online Multiplayer', {
            fontSize: '24px',
            color: '#1ffb02ff',
        }).setOrigin(0.5);

         const ControlBtn = this.add.text(400, 460, 'Controles', {
            fontSize: '24px',
            color: '#00ff00',
        }).setOrigin(0.5)
        .setInteractive({useHandCursor: true})
        .on('pointerover', () => localBtn.setColor('#00ff88'))
        .on('pointerout', () => localBtn.setColor('#00ff00'))
        .on('pointerdown', () => {
            this.scene.start('MenuControles');
        });

         // Indicador de conexión al servidor
        this.connectionText = this.add.text(400, 500, 'Servidor: Comprobando...', {
            fontSize: '18px',
            color: '#ffff00'
        }).setOrigin(0.5);
         // Listener para cambios de conexión
        this.connectionListener = (data) => {
            this.updateConnectionDisplay(data);
        };
        connectionManager.addListener(this.connectionListener);
    }

    updateConnectionDisplay(data) {
        // Solo actualizar si el texto existe (la escena está creada)
        if (!this.connectionText || !this.scene || !this.scene.isActive('MenuScene')) {
            return;
        }

        try {
            if (data.connected) {
                this.connectionText.setText(`Servidor: ${data.count} usuario(s) conectado(s)`);
                this.connectionText.setColor('#00ff00');
            } else {
                this.connectionText.setText('Servidor: Desconectado');
                this.connectionText.setColor('#ff0000');
            }
        } catch (error) {
            console.error('[MenuScene] Error updating connection display:', error);
        }
    }

    shutdown() {
        // Remover el listener
        if (this.connectionListener) {
            connectionManager.removeListener(this.connectionListener);
        }
    }
}