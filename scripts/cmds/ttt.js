const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");

let games = {};

// Render the Tic Tac Toe board
function renderBoard(board, playerXName, playerOName) {
  const canvas = createCanvas(400, 460);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#0f0f1a";
  ctx.fillRect(0, 0, 400, 460);

  // Title bar
  ctx.fillStyle = "#8e44ad";
  ctx.fillRect(0, 0, 400, 60);
  ctx.fillStyle = "#fff";
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "center";
  ctx.fillText(`${playerXName} (X) 🆚 ${playerOName} (O)`, 200, 35);

  // Grid lines
  ctx.strokeStyle = "#9b59b6";
  ctx.shadowColor = "#9b59b6";
  ctx.shadowBlur = 15;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(133, 70); ctx.lineTo(133, 430);
  ctx.moveTo(266, 70); ctx.lineTo(266, 430);
  ctx.moveTo(0, 170); ctx.lineTo(400, 170);
  ctx.moveTo(0, 300); ctx.lineTo(400, 300);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Draw X and O
  ctx.font = "bold 80px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (let i = 0; i < 9; i++) {
    const x = (i % 3) * 133 + 67;
    const y = Math.floor(i / 3) * 130 + 120;

    if (board[i] === "X") {
      ctx.fillStyle = "#3498db";
      ctx.shadowColor = "#2980b9";
      ctx.shadowBlur = 20;
      ctx.fillText("X", x, y);
      ctx.shadowBlur = 0;
    } else if (board[i] === "O") {
      ctx.fillStyle = "#e67e22";
      ctx.shadowColor = "#e74c3c";
      ctx.shadowBlur = 20;
      ctx.fillText("O", x, y);
      ctx.shadowBlur = 0;
    }
  }

  return canvas.toBuffer();
}

// Check for winner or draw
function checkWinner(board) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let line of wins) {
    const [a,b,c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every(cell => cell)) return "draw";
  return null;
}

// Timer reset function
function resetTimer(gameId, message) {
  const game = games[gameId];
  if (!game) return;

  if (game.timeout) clearTimeout(game.timeout);

  game.timeout = setTimeout(() => {
    delete games[gameId];
    message.reply("⏰ Time is up! Game cancelled.");
  }, 120000); // 2 minutes
}

module.exports = {
  config: {
    name: "ttt",
    aliases: ["tic-tac-toe"],
    version: "3.6",
    author: "ＴＡＮＪＩＬ 🎀",
    category: "game",
    shortDescription: "Play Tic Tac Toe",
    longDescription: "Play neon Tic Tac Toe by replying 1-9",
    guide: { en: "(prefix)ttt @mention or reply → start game\nThen reply with 1-9 to play" }
  },

  // Start game
  onStart: async function ({ message, event, usersData }) {
    let playerO;

    // If the command is a reply
    if (event.messageReply) {
      playerO = event.messageReply.senderID;
    } else {
      const mentions = Object.keys(event.mentions);
      if (mentions.length === 0) 
        return message.reply("❌ Please mention someone or reply to their message to start the game!");
      playerO = mentions[0];
    }

    const playerX = event.senderID;
    if (playerX === playerO) return message.reply("❌ You cannot play with yourself!");

    const playerXName = await usersData.getName(playerX);
    const playerOName = await usersData.getName(playerO);

    const gameId = `${event.threadID}`;
    if (games[gameId]) return message.reply("⚠️ A game is already running in this group!");

    games[gameId] = {
      board: Array(9).fill(null),
      players: { X: playerX, O: playerO },
      names: { X: playerXName, O: playerOName },
      turn: "X",
      timeout: null
    };

    resetTimer(gameId, message);

    const img = renderBoard(games[gameId].board, playerXName, playerOName);
    const filePath = path.join(__dirname, "ttt.png");
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    fs.writeFileSync(filePath, img);

    message.reply({
      body: `🎮 Tic Tac Toe Started!\n\n👉 ${playerXName} = X\n👉 ${playerOName} = O\n\nFirst turn: X\nReply with 1-9 to play!`,
      attachment: fs.createReadStream(filePath)
    });
  },

  // Handle moves by chat reply
  onChat: async function ({ message, event }) {
    if (event.senderID === global.botID) return;

    const gameId = `${event.threadID}`;
    const game = games[gameId];
    if (!game) return;

    const move = parseInt(event.body);
    if (isNaN(move) || move < 1 || move > 9) return;

    const player = Object.keys(game.players).find(key => game.players[key] === event.senderID);
    if (!player) return;
    if (game.turn !== player) return message.reply("⏳ It's not your turn!");

    const index = move - 1;
    if (game.board[index]) return message.reply("❌ This cell is already filled!");

    game.board[index] = player;
    game.turn = game.turn === "X" ? "O" : "X";

    resetTimer(gameId, message);

    const winner = checkWinner(game.board);
    const img = renderBoard(game.board, game.names.X, game.names.O);
    const filePath = path.join(__dirname, "ttt.png");
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    fs.writeFileSync(filePath, img);

    if (winner) {
      clearTimeout(game.timeout);
      delete games[gameId];

      if (winner === "draw") {
        return message.reply({ body: "🤝 It's a draw!", attachment: fs.createReadStream(filePath) });
      } else {
        return message.reply({ body: `🏆 Winner: ${game.names[winner]} (${winner})`, attachment: fs.createReadStream(filePath) });
      }
    } else {
      return message.reply({
        body: `👉 Now it's ${game.names[game.turn]}'s (${game.turn}) turn\nReply with 1-9 to play!`,
        attachment: fs.createReadStream(filePath)
      });
    }
  }
};
