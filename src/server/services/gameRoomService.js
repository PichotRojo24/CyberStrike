/**
 * Game Room service - manages active game rooms and game state
 */
export function createGameRoomService() {
  const rooms = new Map(); // roomId -> room data
  let nextRoomId = 1;

  /**
   * Create a new game room with two players
   * @param {WebSocket} player1Ws - Player 1's WebSocket
   * @param {WebSocket} player2Ws - Player 2's WebSocket
   * @returns {string} Room ID
   */
function createRoom(player1Ws, player2Ws) {
    const roomId = `room_${nextRoomId++}`;

    const room = {
      id: roomId,
      player1: { ws: player1Ws, score: 0, hasPowerUp: false },
      player2: { ws: player2Ws, score: 0, hasPowerUp: false },
      active: true,
      roundActive: true,
      powerUp: null,
      powerUpInterval: null,
      readyCount: 0
    };

    rooms.set(roomId, room);

    player1Ws.roomId = roomId;
    player2Ws.roomId = roomId;

    // ASIGNAR ROLES
    player1Ws.role = 'player1';
    player2Ws.role = 'player2';

    // ENVIAR ROLES AL CLIENTE
    player1Ws.send(JSON.stringify({ type: 'role', role: 'player1' }));
    player2Ws.send(JSON.stringify({ type: 'role', role: 'player2' }));

    return roomId;
}

  function startPowerUpSpawner(room) {
    const spawn = () => {
      if (!room.active) return;
      if (room.powerUp) return;
      const x = Math.floor(100 + Math.random() * 600);
      const y = Math.floor(200 + Math.random() * 300);
      room.powerUp = { x, y };
      room.player1.ws.send(JSON.stringify({ type: 'powerUpSpawn', x, y }));
      room.player2.ws.send(JSON.stringify({ type: 'powerUpSpawn', x, y }));
    };
    spawn();
    room.powerUpInterval = setInterval(spawn, 5000);
  }

  function handlePlayerReady(ws) {
    const roomId = ws.roomId;
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || !room.active) return;
    room.readyCount += 1;
    if (room.readyCount === 2) {
      startPowerUpSpawner(room);
    }
  }

  /**
   * Handle paddle movement from a player
   * @param {WebSocket} ws - Player's WebSocket
   * @param {number} x - Paddle X position
   * @param {number} y - Paddle Y position
   */
  function handlePaddleMove(ws,x, y) {
    console.log("SERVER RECEIVED:", x, y);
    const roomId = ws.roomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room || !room.active) return;

    // Relay to the other player
    const opponent = room.player1.ws === ws ? room.player2.ws : room.player1.ws;

    if (opponent.readyState === 1) { // WebSocket.OPEN
      opponent.send(JSON.stringify({
    type: 'paddleUpdate',
    y:y,
    x: x,
    player: ws.role   
}));

    }
  }

  /**
   * Handle player fell event
   * @param {WebSocket} ws - Player's WebSocket
   * @param {string} fallenPlayerRole - Which player fell ('player1' or 'player2')
   */
  function handlePlayerFell(ws, fallenPlayerRole) {
    const roomId = ws.roomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room || !room.active) return;

    // Prevent duplicate score detection
    if (!room.roundActive) {
      return; 
    }
    room.roundActive = false; 

    // Update scores
    // If player1 fell, player2 scores. If player2 fell, player1 scores.
    if (fallenPlayerRole === 'player1') {
      room.player2.score++;
    } else if (fallenPlayerRole === 'player2') {
      room.player1.score++;
    }

    // Broadcast score update to both players
    const scoreUpdate = {
      type: 'scoreUpdate',
      player1Score: room.player1.score,
      player2Score: room.player2.score
    };

    room.player1.ws.send(JSON.stringify(scoreUpdate));
    room.player2.ws.send(JSON.stringify(scoreUpdate));

    // Check win condition (first to 3)
    if (room.player1.score >= 3 || room.player2.score >= 3) {
      const winner = room.player1.score >= 3 ? 'player1' : 'player2';

      const gameOverMsg = {
        type: 'gameOver',
        winner,
        player1Score: room.player1.score,
        player2Score: room.player2.score
      };

      room.player1.ws.send(JSON.stringify(gameOverMsg));
      room.player2.ws.send(JSON.stringify(gameOverMsg));

      // Mark room as inactive
      room.active = false;
    } else {
      // Start next round after delay
      setTimeout(() => {
        if (room.active) {
          room.roundActive = true;
          // No need to send ballRelaunch, clients handle reset on scoreUpdate or just continue
        }
      }, 1000);
    }
  }

  /**
   * Handle push event (relay to opponent)
   * @param {WebSocket} ws - Pusher's WebSocket
   * @param {Object} data - Push data (angle, force)
   */
  function handlePush(ws, data) {
    const roomId = ws.roomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room || !room.active) return;

    const opponent = room.player1.ws === ws ? room.player2.ws : room.player1.ws;

    if (opponent.readyState === 1) {
        const role = ws.role;
        let force = data.force;
        const player = role === 'player1' ? room.player1 : room.player2;
        if (player.hasPowerUp && force <= 35) {
          force = 100;
          player.hasPowerUp = false;
        }
        opponent.send(JSON.stringify({
            type: 'push',
            angle: data.angle,
            force
        }));
    }
  }

  function handlePowerUpPickup(ws) {
    const roomId = ws.roomId;
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || !room.active) return;
    if (!room.powerUp) return;
    const role = ws.role;
    const player = role === 'player1' ? room.player1 : room.player2;
    player.hasPowerUp = true;
    room.powerUp = null;
    room.player1.ws.send(JSON.stringify({ type: 'powerUpPickup', player: role }));
    room.player2.ws.send(JSON.stringify({ type: 'powerUpPickup', player: role }));
  }

  /**
   * Handle player disconnection
   * @param {WebSocket} ws - Disconnected player's WebSocket
   */
  function handleDisconnect(ws) {
    const roomId = ws.roomId;
    if (!roomId) return;

    const room = rooms.get(roomId);
    if (!room) return;

    // Only notify the other player if the game is still active
    // If the game already ended (room.active = false), don't send disconnect message
    if (room.active) {
      const opponent = room.player1.ws === ws ? room.player2.ws : room.player1.ws;

      if (opponent.readyState === 1) { // WebSocket.OPEN
        opponent.send(JSON.stringify({
          type: 'playerDisconnected'
        }));
      }
    }

    // Clean up room
    room.active = false;
    if (room.powerUpInterval) {
      clearInterval(room.powerUpInterval);
      room.powerUpInterval = null;
    }
    rooms.delete(roomId);
  }

  function handleRequestPowerUpState(ws) {
    const roomId = ws.roomId;
    if (!roomId) return;
    const room = rooms.get(roomId);
    if (!room || !room.active) return;
    if (room.powerUp) {
      try {
        ws.send(JSON.stringify({ type: 'powerUpSpawn', x: room.powerUp.x, y: room.powerUp.y }));
      } catch {}
    }
  }

  /**
   * Get number of active rooms
   * @returns {number} Number of active rooms
   */
  function getActiveRoomCount() {
    return Array.from(rooms.values()).filter(room => room.active).length;
  }

  return {
    createRoom,
    handlePaddleMove,
    handlePlayerFell,
    handlePush,
    handlePowerUpPickup,
    handleRequestPowerUpState,
    handlePlayerReady,
    handleDisconnect,
    getActiveRoomCount
  };
}
