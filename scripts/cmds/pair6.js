const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pair6",
    author: "Hasib",
    category: "love",
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      // Get sender info
      const senderData = await usersData.get(event.senderID);
      const senderName = senderData.name;

      // Get all users in the thread
      const threadData = await api.getThreadInfo(event.threadID);
      const users = threadData.userInfo;

      // Check sender gender
      const myData = users.find((user) => user.id === event.senderID);
      if (!myData || !myData.gender) {
        return api.sendMessage(
          "⚠️ Could not determine your gender.",
          event.threadID,
          event.messageID
        );
      }

      const myGender = myData.gender;
      let matchCandidates = [];

      if (myGender === "MALE") {
        matchCandidates = users.filter(
          (user) => user.gender === "FEMALE" && user.id !== event.senderID
        );
      } else if (myGender === "FEMALE") {
        matchCandidates = users.filter(
          (user) => user.gender === "MALE" && user.id !== event.senderID
        );
      } else {
        return api.sendMessage(
          "⚠️ Your gender is undefined. Cannot find a match.",
          event.threadID,
          event.messageID
        );
      }

      if (matchCandidates.length === 0) {
        return api.sendMessage(
          "❌ No suitable match found in the group.",
          event.threadID,
          event.messageID
        );
      }

      // Pick a random match
      const selectedMatch =
        matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
      const matchName = selectedMatch.name;

      // Create canvas
      const width = 800;
      const height = 400;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Background for pair7
      const backgroundUrl = "https://i.imgur.com/753i3RF.jpeg"; // BG3
      const background = await loadImage(backgroundUrl);

      // Load profile pictures
      const sIdImage = await loadImage(
        `https://graph.facebook.com/${event.senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );
      const pairPersonImage = await loadImage(
        `https://graph.facebook.com/${selectedMatch.id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
      );

      // Draw everything
      ctx.drawImage(background, 0, 0, width, height);
      ctx.drawImage(sIdImage, 385, 40, 170, 170);
      ctx.drawImage(pairPersonImage, width - 213, 190, 180, 170);

      // Save to file
      const outputPath = path.join(__dirname, "pair_output.png");
      const out = fs.createWriteStream(outputPath);
      const stream = canvas.createPNGStream();
      stream.pipe(out);

      // Send message when done
      out.on("finish", () => {
        const lovePercent = Math.floor(Math.random() * 31) + 70; // 70-100%
        const fancySender = senderName;
        const fancyMatch = matchName;

        const message = `💞 𝗠𝗮𝘁𝗰𝗵𝗺𝗮𝗸𝗶𝗻𝗴 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲 💞

🎀 ${fancySender} ✨️
🎀 ${fancyMatch} ✨️

🕊️ 𝓓𝓮𝓼𝓽𝓲𝔫𝔂 𝓱𝓪𝓼 𝔀𝓻𝓲𝓽𝓽𝓮𝓷 𝔂𝓸𝓾𝓻 𝓷𝓪𝓶𝓮𝓼 𝓽𝓸𝓰𝓮𝓽𝓱𝓮𝓻 🌹 𝓜𝓪𝔂 𝔂𝓸𝓾𝓻 𝓫𝓸𝓷𝓭 𝓵𝓪𝓼𝓽 𝓯𝓸𝓻𝓮𝓿𝓮𝓻 ✨️  

💘 𝙲𝚘𝚖𝚙𝚊𝚝𝚒𝚋𝚒𝚕𝚒𝚝𝚢: ${lovePercent}% 💘`;

        api.sendMessage(
          { body: message, attachment: fs.createReadStream(outputPath) },
          event.threadID,
          () => fs.unlinkSync(outputPath),
          event.messageID
        );
      });
    } catch (error) {
      api.sendMessage(
        "❌ An error occurred while trying to find a match.\n" + error.message,
        event.threadID,
        event.messageID
      );
    }
  },
};
