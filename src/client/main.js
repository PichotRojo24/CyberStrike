import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { ConnectionLostScene } from './scenes/ConnectionLostScene.js';
import LobbyScene from './scenes/LobbyScene.js';
import { MultiplayerGameScene } from './scenes/MultiplayerGameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MenuScene, GameScene, PauseScene, ConnectionLostScene, LobbyScene, MultiplayerGameScene],
    backgroundColor: '#1a1a2e',
}

const game = new Phaser.Game(config);