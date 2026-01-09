const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

// Offline font mapping
const fontMap = require("./font.json");

// Convert text to fancy font
const toFancy = text => text.split("").map(c => fontMap[c] || c).join("");

module.exports = {
  config: {
    name: "myqueen",
    aliases:["myking"]
    author: "Hasib",
    category: "love",
    version: "3.5",
    role: 0,
    shortDescription: { en: "💘 Pair with reply or mention in a styled message" },
    longDescription: { en: "Pairs with replied or mentioned user and shows a styled fancy love message with avatars." },
    guide: { en: "{p}{n} (reply to a message or mention someone)" }
  },

  onStart: async function({ api, event, usersData }) {
    let outputPath;

    try {
      // ---------------- TARGET USER ----------------
      let targetID = null;

      // Reply-based
      if (event.type === "message_reply" && event.messageReply?.senderID) {
        targetID = event.messageReply.senderID;
      } 
      // Mention-based
      else if (event.mentions && Object.keys(event.mentions).length) {
        targetID = Object.keys(event.mentions)[0];
      }

      if (!targetID) {
        return api.sendMessage(
          "⚠️ Reply to a message or mention someone to pair.",
          event.threadID,
          event.messageID
        );
      }

      if (targetID === event.senderID) {
        return api.sendMessage(
          "❌ You cannot pair with yourself.",
          event.threadID,
          event.messageID
        );
      }

      // ---------------- USER DATA ----------------
      const [senderData, targetData] = await Promise.all([
        usersData.get(event.senderID),
        usersData.get(targetID)
      ]);

      const fancySender = toFancy(senderData?.name || "You");
      const fancyMatch = toFancy(targetData?.name || "Partner");

      // ---------------- GENDER CHECK ----------------
      const threadInfo = await api.getThreadInfo(event.threadID);
      const me = threadInfo.userInfo.find(u => u.id === event.senderID);
      const partner = threadInfo.userInfo.find(u => u.id === targetID);

      if (!me?.gender || !partner?.gender) {
        return api.sendMessage(
          "⚠️ Unable to determine gender for one of the users.",
          event.threadID,
          event.messageID
        );
      }

      if (me.gender === partner.gender) {
        return api.sendMessage(
          "❌ Same gender pairing is not allowed.",
          event.threadID,
          event.messageID
        );
      }

      // ---------------- CANVAS ----------------
      const canvas = createCanvas(960, 547);
      const ctx = canvas.getContext("2d");

      const background = await loadImage("https://i.postimg.cc/dQgn42LC/IMG-20260109-WA0000.jpg");
      ctx.drawImage(background, 0, 0, 960, 547);

      const drawAvatar = (img, x, y, size = 255) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
      };

      const [myAvatar, partnerAvatar] = await Promise.all([
        loadImage(`https://graph.facebook.com/${event.senderID}/picture?width=720&height=720`),
        loadImage(`https://graph.facebook.com/${targetID}/picture?width=720&height=720`)
      ]);

      drawAvatar(myAvatar, 105, 162);
      drawAvatar(partnerAvatar, 599, 162);

      // ---------------- SAVE IMAGE ----------------
      outputPath = path.join(__dirname, `pair_${Date.now()}.png`);
      const stream = fs.createWriteStream(outputPath);
      canvas.createPNGStream().pipe(stream);

      stream.on("finish", () => {

        // ---------------- FANCY MESSAGE TEMPLATE ----------------
        const message = `🌸💞 Cᴏɴɢʀᴀᴛs 💞🌸
${fancySender} ＆ ${fancyMatch} ✨
     🌷 𝓛𝓸𝓿𝓮𝓵𝔂 𝓝𝓸𝓽𝓮 🌷
❝ 𝗜𝗻 𝘆𝗼𝘂𝗿 𝘀𝗺𝗶𝗹𝗲, 𝗜 𝘀𝗲𝗲 𝘀𝗼𝗺𝗲𝘁𝗵𝗶𝗻𝗴 𝗺𝗼𝗿𝗲 𝗯𝗲𝗮𝘂𝘁𝗶𝗳𝘂𝗹 𝘁𝗵𝗮𝗻 𝘁𝗵𝗲 𝘀𝘁𝗮𝗿𝘀.❞

💫 𝒀𝒐𝒖 𝒂𝒓𝒆 𝒎𝒚 𝒔𝒖𝒏𝒔𝒉𝒊𝒏𝒆.𝑶𝒘𝒏𝒆𝒓 𝒐𝒇 𝒎𝒚 𝒉𝒆𝒂𝒓𝒕! 💫`;

        api.sendMessage(
          {
            body: message,
            attachment: fs.createReadStream(outputPath)
          },
          event.threadID,
          () => fs.existsSync(outputPath) && fs.unlinkSync(outputPath),
          event.messageID
        );
      });

    } catch (err) {
      if (outputPath && fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

      api.sendMessage(
        "❌ An unexpected error occurred.\n" + err.message,
        event.threadID,
        event.messageID
      );
    }
  }
};
