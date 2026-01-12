import Phaser from 'phaser';


export class RightWinSceneMultiplayer extends Phaser.Scene {
    constructor() {
        super('RightWinSceneMultiplayer');
    }

        preload() {
        this.load.image('RightWinMultiplayer', 'assets/Pantallas/Victoria Jug2.png');
        this.load.image('BotonJugarDeNuevo', 'assets/BotonesUI/Jugar de nuevo.png');
        this.load.image('BotonMenuPrincipal', 'assets/BotonesUI/volver al menu principal.png');
        }

    create() {
        this.add.image(400, 300, 'RightWinMultiplayer')
                .setOrigin(0.5, 0.5)
                .setDisplaySize(800, 600);
            
            const centerX = this.cameras.main.width / 2;
            const baseY = 520;
            const spacing = 90;

            this.BotonJugarDeNuevo = this.add.image(centerX - 133, baseY + 9, "BotonJugarDeNuevo");
            this.BotonMenuPrincipal = this.add.image(centerX + 110, baseY + 9, "BotonMenuPrincipal");

            this.BotonJugarDeNuevo.setInteractive({ useHandCursor: true });
              this.BotonJugarDeNuevo.on("pointerdown", () => {
                const ms = this.scene.get('MultiplayerGameScene');
                if (ms && ms.ws && ms.ws.readyState === WebSocket.OPEN) {
                  ms.ws.close();
                }
                this.scene.start("LobbyScene");
            });

            this.BotonMenuPrincipal.setInteractive({ useHandCursor: true });
            this.BotonMenuPrincipal.on("pointerdown", () => {
                this.scene.start("MenuScene");
            });

             const hoverEffect = (btn) => {
               btn.on("pointerover", () => btn.setScale(1.05));
               btn.on("pointerout", () => btn.setScale(1));
             };

             hoverEffect(this.BotonJugarDeNuevo);
             hoverEffect(this.BotonMenuPrincipal);

             this.BotonJugarDeNuevo.on("pointerdown", () => {
             this.sound.play("click");
              const ms = this.scene.get('MultiplayerGameScene');
              if (ms && ms.ws && ms.ws.readyState === WebSocket.OPEN) {
                ms.ws.close();
              }
              this.scene.start("LobbyScene");
            });

            this.BotonMenuPrincipal.on("pointerdown", () => {
              this.sound.play("click");
              this.scene.start("MenuScene");
            });
    }
}
