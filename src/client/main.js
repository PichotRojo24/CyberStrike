import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene.js';
import {MenuControles} from './scenes/MenuControles.js';   
import { GameScene } from './scenes/GameScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { ConnectionLostScene } from './scenes/ConnectionLostScene.js';
import LobbyScene from './scenes/LobbyScene.js';
import { MultiplayerGameScene } from './scenes/MultiplayerGameScene.js';
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
    scene: [MenuScene,MenuControles, GameScene, PauseScene, ConnectionLostScene, LobbyScene, MultiplayerGameScene, LeftWinScene, RightWinScene],
    backgroundColor: '#1a1a2e',
}

const game = new Phaser.Game(config);