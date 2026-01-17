!cmd install myqueen.js const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

const baseUrl = "https://raw.githubusercontent.com/Saim12678/Saim69/1a8068d7d28396dbecff28f422cb8bc9bf62d85f/font";

module.exports = {
  config: {
    name: "myqueen",
    author: "Hasib",
    category: "love",
    version: "2.2",
    role: 0,
    shortDescription: { en: "💘 Generate a love match with someone by reply or mention" },
    longDescription: { en: "Calculates a love match between you and a replied or mentioned member. Shows circular avatars, background, and love percentage." },
    guide: { en: "{p}{n} — Reply to someone's message or mention them to find a love match" }
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      // ------------------ GET SENDER ------------------
      const senderData = await usersData.get(event.senderID);
      const senderName = senderData.name;

      // ------------------ DETERMINE TARGET ------------------
      let targetID;

      // If reply
      if (event.messageReply && event.messageReply.senderID) {
        targetID = event.messageReply.senderID;
      } 
      // If mention
      else if (event.mentions && Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0]; // take the first mention
      } 
      else {
        return api.sendMessage("⚠️ Please reply to someone's message or mention a user to find a match.", event.threadID, event.messageID);
      }

      if (targetID === event.senderID) {
        return api.sendMessage("❌ You cannot match with yourself!", event.threadID, event.messageID);
      }

      // ------------------ GET TARGET DATA ------------------
      const threadData = await api.getThreadInfo(event.threadID);
      const targetData = threadData.userInfo.find(u => u.id === targetID);

      if (!targetData) return api.sendMessage("❌ Could not find the user in this group.", event.threadID, event.messageID);

      // ------------------ LOAD FONT ------------------
      let fontMap;
      try {
        const { data } = await axios.get(`${baseUrl}/21.json`);
        fontMap = data;
      } catch (e) {
        fontMap = {};
      }

      const convertFont = text => text.split("").map(ch => fontMap[ch] || ch).join("");
      const displaySender = convertFont(senderName);
      const displayTarget = convertFont(targetData.name);

      // ------------------ CREATE CANVAS ------------------
      const width = 960, height = 547;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      const background = await loadImage("https://i.postimg.cc/dQgn42LC/IMG-20260109-WA0000.jpg");
      ctx.drawImage(background, 0, 0, width, height);

      const size = 255;
      const avatarPositions = { sender: { x: 105, y: 162, size }, partner: { x: 599, y: 162, size } };

      function drawCircle(ctx, img, x, y, size) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      }

      const senderImg = await loadImage(
        `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );
      const targetImg = await loadImage(
        `https://graph.facebook.com/${targetID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );

      drawCircle(ctx, senderImg, avatarPositions.sender.x, avatarPositions.sender.y, avatarPositions.sender.size);
      drawCircle(ctx, targetImg, avatarPositions.partner.x, avatarPositions.partner.y, avatarPositions.partner.size);

      // ------------------ OUTPUT IMAGE ------------------
      const outputPath = path.join(__dirname, "pair_output.png");
      const out = fs.createWriteStream(outputPath);
      canvas.createPNGStream().pipe(out);

      out.on("finish", () => {
        const lovePercent = Math.floor(Math.random() * 31) + 70;
        const message = `💘𝐅𝐮𝐭𝐮𝐫𝐞 𝐥𝐢𝐟𝐞 𝐩𝐚𝐫𝐭𝐧𝐞𝐫 💍
${senderName} ❤️ ${targetName}

𝐘𝐨𝐮 𝐛𝐨𝐭𝐡 𝐥𝐨𝐨𝐤 𝐬𝐨 𝐛𝐞𝐚𝐮𝐭𝐢𝐟𝐮𝐥 𝐭𝐨𝐠𝐞𝐭𝐡𝐞𝐫 ✨
𝐋𝐨𝐯𝐞 𝐩𝐞𝐫𝐜𝐞𝐧𝐭𝐚𝐠𝐞: ${love}%`;

        api.sendMessage(
          { body: message, attachment: fs.createReadStream(outputPath) },
          event.threadID,
          () => fs.unlinkSync(outputPath),
          event.messageID
        );
      });

    } catch (error) {
      api.sendMessage("❌ An error occurred: " + error.message, event.threadID, event.messageID);
    }
  },
};
