const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function fetchStream(url) {
  const res = await axios({ url, responseType: "stream", timeout: 10000 });
  return res.data;
}

module.exports = {
  config: {
    name: "sing",
    aliases: ["song", "music"],
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    description: { en: "Search and download MP3 from YouTube" },
    category: "music",
    guide: { en: "{pn} <song name>" }
  },

  onStart: async function ({ api, args, event, commandName }) {
    try {
      const query = args.join(" ");
      
      if (!query) {
        return api.sendMessage(
          "❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐚 𝐬𝐨𝐧𝐠 𝐧𝐚𝐦𝐞!",
          event.threadID,
          event.messageID
        );
      }

      const apiURL = `https://xsaim8x-xxx-api.onrender.com/api/youtube?query=${encodeURIComponent(query)}`;
      const res = await axios.get(apiURL, { timeout: 15000 });

      if (!res.data || !res.data.data || res.data.data.length === 0) {
        return api.sendMessage(
          "❌ 𝐍𝐨 𝐬𝐨𝐧𝐠𝐬 𝐟𝐨𝐮𝐧𝐝!",
          event.threadID,
          event.messageID
        );
      }

      const videos = res.data.data.slice(0, 6);

      let msg = "🎵 𝐘𝐨𝐮𝐓𝐮𝐛𝐞 𝐌𝐮𝐬𝐢𝐜 𝐑𝐞𝐬𝐮𝐥𝐭𝐬\n\n";
      videos.forEach((v, i) => {
        msg += `${i + 1}. ${v.title}\n`;
        msg += `   👤 ${v.channel} | ⏱ ${v.duration}\n\n`;
      });
      msg += "📌 𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐧𝐮𝐦𝐛𝐞𝐫 (𝟏-𝟔) 𝐭𝐨 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐌𝐏𝟑";

      const attachments = await Promise.all(
        videos.map(v => fetchStream(v.thumbnail).catch(() => null))
      ).then(arr => arr.filter(Boolean));

      api.sendMessage(
        { body: msg, attachment: attachments },
        event.threadID,
        (err, sent) => {
          if (err) return console.error(err);
          
          global.GoatBot.onReply.set(sent.messageID, {
            commandName,
            videos: videos,
            messageID: sent.messageID,
            threadID: event.threadID
          });
        },
        event.messageID
      );

    } catch (err) {
      console.error("[SING] onStart error:", err);
      api.sendMessage(
        `❌ 𝐒𝐞𝐚𝐫𝐜𝐡 𝐟𝐚𝐢𝐥𝐞𝐝: ${err.message}`,
        event.threadID,
        event.messageID
      );
    }
  },

  onReply: async function ({ event, api, Reply }) {
    try {
      const { videos, messageID } = Reply;
      const choice = parseInt(event.body);

      if (isNaN(choice) || choice < 1 || choice > videos.length) {
        return api.sendMessage(
          `❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐜𝐡𝐨𝐢𝐜𝐞! 𝐓𝐲𝐩𝐞 𝟏-${videos.length}`,
          event.threadID,
          event.messageID
        );
      }

      await api.unsendMessage(messageID).catch(() => {});

      const selected = videos[choice - 1];

      try {
        const downloadApi = `https://azadx69x-ytb-api.vercel.app/download?url=${encodeURIComponent(selected.url)}&type=mp3`;
        
        console.log("Downloading from:", downloadApi);

        const mp3Res = await axios({
          url: downloadApi,
          responseType: "stream",
          timeout: 120000
        });

        const fileName = `song_${Date.now()}.mp3`;
        const filePath = path.join(__dirname, fileName);
        
        const writer = fs.createWriteStream(filePath);
        mp3Res.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
        });

        const stats = fs.statSync(filePath);
        if (stats.size < 1000) {
          throw new Error("Downloaded file too small");
        }

        await api.sendMessage(
          {
            attachment: fs.createReadStream(filePath)
          },
          event.threadID,
          () => {
            try { fs.unlinkSync(filePath); } catch (e) {}
          },
          event.messageID
        );

      } catch (err) {
        console.error("[SING] Download error:", err);
        api.sendMessage(
          `❌ 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐟𝐚𝐢𝐥𝐞𝐝!\n📝 ${err.message}\n💡 𝐓𝐫𝐲 𝐚𝐧𝐨𝐭𝐡𝐞𝐫 𝐬𝐨𝐧𝐠`,
          event.threadID,
          event.messageID
        );
      }

    } catch (err) {
      console.error("[SING] onReply error:", err);
      api.sendMessage(
        "❌ 𝐄𝐫𝐫𝐨𝐫 𝐩𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 𝐬𝐞𝐥𝐞𝐜𝐭𝐢𝐨𝐧.",
        event.threadID,
        event.messageID
      );
    }
  }
};
