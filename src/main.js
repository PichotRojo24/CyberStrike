import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { MenuControles } from './scenes/MenuControles.js';
import { PauseScene } from './scenes/PauseScene.js';
import { LeftWinScene } from './scenes/LeftWinScene.js';
import { RightWinScene } from './scenes/RightWinScene.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 3000 },
            debug: false
        }
    },
    scene: [MenuScene, GameScene, MenuControles,PauseScene,LeftWinScene,RightWinScene],
    backgroundColor: '#1a1a2e',
}

// @ts-ignore
const game = new Phaser.Game(config);