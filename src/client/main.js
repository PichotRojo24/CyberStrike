import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene.js';
import {MenuControles} from './scenes/MenuControles.js';   
import { GameScene } from './scenes/GameScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { MenuOpciones } from './scenes/MenuOpciones.js';
import { ConnectionLostScene } from './scenes/ConnectionLostScene.js';
import LobbyScene from './scenes/LobbyScene.js';
import { CreditsScene } from './scenes/CreditsScene.js';
import { MultiplayerGameScene } from './scenes/MultiplayerGameScene.js';
import { LeftWinSceneMultiplayer } from './scenes/LeftWinSceneMultiplayer.js';
import { RightWinSceneMultiplayer } from './scenes/RightWinSceneMultiplayer.js';
import { LeftLoseSceneMultiplayer } from './scenes/LeftLoseSceneMultiplayer.js';
import { RightLoseSceneMultiplayer } from './scenes/RightLoseSceneMultiplayer.js';
import { LeftWinScene } from './scenes/LeftWinScene.js';
import { RightWinScene } from './scenes/RightWinScene.js';
let savedVolume = localStorage.getItem("musicVolume");
let musicVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;

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
    scene: [MenuScene,MenuControles, GameScene, PauseScene, MenuOpciones, ConnectionLostScene, LobbyScene, CreditsScene, MultiplayerGameScene, LeftWinSceneMultiplayer, RightWinSceneMultiplayer, LeftLoseSceneMultiplayer, RightLoseSceneMultiplayer, LeftWinScene, RightWinScene],
    backgroundColor: '#1a1a2e',
}

const game = new Phaser.Game(config);
