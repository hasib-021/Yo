const { GoatWrapper } = require("fca-liane-utils");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "owner",
    aliases: ["info","ownerinfo"],
    author: "Hasib",
    role: 0,
    shortDescription: "Owner info",
    longDescription: "Owner information (Hasib) with random GIF attachment",
    category: "info",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {

    // -------- TEXT --------
    const text = `
𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍
─────────────────

𝐍𝐀𝐌𝐄 : 𝐇𝐚𝐬𝐢𝐛 (𝐌𝐮𝐬𝐥𝐢𝐦)
𝐍𝐈𝐂𝐊𝐍𝐀𝐌𝐄 : عبد الله 
𝐆𝐄𝐍𝐃𝐄𝐑 : 𝑴𝑨𝑳𝑬
𝐅𝐀𝐓𝐇𝐄𝐑’𝐒 𝐍𝐀𝐌𝐄 : 𝐀𝐝𝐨𝐦 (আঃ)
𝐂𝐑𝐄𝐀𝐓𝐎𝐑 : 𝐀𝐥𝐥𝐚𝐡 ﷻ
𝐈𝐃𝐄𝐀𝐋 : 𝐌𝐮𝐡𝐚𝐦𝐦𝐚𝐝 (ﷺ)
𝐇𝐎𝐋𝐘 𝐁𝐎𝐎𝐊 : 𝐀𝐥-𝐐𝐮𝐫’𝐚𝐧
𝐑𝐄𝐋𝐈𝐆𝐈𝐎𝐍 : 𝐈𝐬𝐥𝐚𝐦
𝐈𝐃𝐄𝐍𝐓𝐈𝐓𝐘 : لَا إِلَٰهَ إِلَّا ٱللَّهُ مُحَمَّدٌ رَّسُولُ ٱللَّهِ
𝐇𝐎𝐁𝐁𝐈𝐄𝐒 : 𝐍𝐚𝐦𝐚𝐳 𝟓 𝐭𝐢𝐦𝐞𝐬 𝐚 𝐝𝐚𝐲
𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 : 17-03-2008
𝐏𝐑𝐄𝐒𝐄𝐍𝐓 𝐀𝐃𝐃𝐑𝐄𝐒𝐒 : 𝐃𝐮𝐧𝐢𝐲𝐚
𝐏𝐄𝐑𝐌𝐀𝐍𝐄𝐍𝐓 𝐀𝐃𝐃𝐑𝐄𝐒𝐒 : 𝐉𝐚𝐧𝐧𝐚𝐭 (𝐈𝐧 𝐬𝐡𝐚̄’ 𝐀𝐥𝐥𝐚̄𝐡)
𝐑𝐄𝐋𝐀𝐓𝐈𝐎𝐍𝐒𝐇𝐈𝐏 : 𝐏𝐫𝐞𝐦 𝐊𝐨𝐫𝐚 𝐇𝐚𝐫𝐚𝐦 (𝐒𝐈𝐍𝐆𝐋𝐄)
𝐅𝐁 : https://www.facebook.com/karim.benzima.246709
`;

    // -------- GIF URLS --------
    const gifUrls = [
      "https://files.catbox.moe/g66l39.gif",
      "https://files.catbox.moe/adc9o7.gif",
      "https://files.catbox.moe/zmrwnb.gif",
      "https://files.catbox.moe/xxxudb.gif"
    ];

    // -------- CACHE DIR --------
    const CACHE_DIR = path.join(__dirname, "cache");
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR);

    try {
      // Pick a random GIF
      const randomIndex = Math.floor(Math.random() * gifUrls.length);
      const selectedGif = gifUrls[randomIndex];
      const tempFile = path.join(CACHE_DIR, `owner_random.gif`);

      // Download GIF
      const res = await axios.get(selectedGif, {
        responseType: "arraybuffer",
        timeout: 10000
      });
      fs.writeFileSync(tempFile, Buffer.from(res.data));

      // Send message with GIF
      api.sendMessage(
        {
          body: text,
          attachment: fs.createReadStream(tempFile)
        },
        event.threadID,
        () => {
          // Cleanup temp file
          if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        }
      );

      // Add reaction
      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      // Fallback: send text only
      api.sendMessage(text, event.threadID);
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
