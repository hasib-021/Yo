const { GoatWrapper } = require("fca-liane-utils");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "paininfo",
    aliases: ["sixinfo" , " pain"],
    author: "Hasib",
    role: 0,
    shortDescription: "Owner info",
    longDescription: "Owner information with random media attachment",
    category: "info",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {

    const text = `
𝐏𝐀𝐈𝐍 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍
─────────────────

𝐍𝐀𝐌𝐄 : 𝐀𝐳𝐚𝐝 (𝐌𝐮𝐬𝐥𝐢𝐦)
𝐍𝐈𝐂𝐊𝐍𝐀𝐌𝐄 : عبد الله
𝐆𝐄𝐍𝐃𝐄𝐑 : 𝑴𝑨𝑳𝑬
𝐂𝐋𝐀𝐒𝐒 : 𝐇𝐨𝐧𝐨𝐮𝐫𝐬 1𝐬𝐭 𝐲𝐞𝐚𝐫
𝐅𝐀𝐓𝐇𝐄𝐑’𝐒 𝐍𝐀𝐌𝐄 : 𝐀𝐝𝐨𝐦 (আঃ)
𝐂𝐑𝐄𝐀𝐓𝐎𝐑 : 𝐀𝐥𝐥𝐚𝐡 ﷻ
𝐈𝐃𝐄𝐀𝐋 : 𝐌𝐮𝐡𝐚𝐦𝐦𝐚𝐝 (ﷺ)
𝐇𝐎𝐋𝐘 𝐁𝐎𝐎𝐊 : 𝐀𝐥-𝐐𝐮𝐫’𝐚𝐧
𝐑𝐄𝐋𝐈𝐆𝐈𝐎𝐍 : 𝐈𝐬𝐥𝐚𝐦
𝐈𝐃𝐄𝐍𝐓𝐈𝐓𝐘 :
لَا إِلَٰهَ إِلَّا ٱللَّهُ
مُحَمَّدٌ رَّسُولُ ٱللَّهِ

𝐇𝐎𝐁𝐁𝐈𝐄𝐒 : 𝐍𝐚𝐦𝐚𝐳 𝟓 𝐭𝐢𝐦𝐞𝐬 𝐚 𝐝𝐚𝐲
𝐁𝐈𝐑𝐓𝐇𝐃𝐀𝐘 : 03-04-2005
𝐏𝐑𝐄𝐒𝐄𝐍𝐓 𝐀𝐃𝐃𝐑𝐄𝐒𝐒 : 𝐃𝐮𝐧𝐢𝐲𝐚 (𝐆𝐚𝐳𝐢𝐩𝐮𝐫)
𝐏𝐄𝐑𝐌𝐀𝐍𝐄𝐍𝐓 𝐀𝐃𝐃𝐑𝐄𝐒𝐒 : 𝐉𝐚𝐧𝐧𝐚𝐭 (𝐈𝐧 𝐬𝐡𝐚̄’ 𝐀𝐥𝐥𝐚̄𝐡)
𝐑𝐄𝐋𝐀𝐓𝐈𝐎𝐍𝐒𝐇𝐈𝐏 : 𝐏𝐫𝐞𝐦 𝐊𝐨𝐫𝐚 𝐇𝐚𝐫𝐚𝐦 (𝐒𝐈𝐍𝐆𝐋𝐄)

𝐅𝐁 :
https://www.facebook.com/six.pain.448074
`;

    const mediaUrls = [    "https://files.catbox.moe/b5ue9d.jpg"
    ];

    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    try {
      const url = mediaUrls[Math.floor(Math.random() * mediaUrls.length)];
      const ext = url.endsWith(".gif") ? "gif" : "jpg";
      const filePath = path.join(cacheDir, `paininfo.${ext}`);

      const res = await axios.get(url, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, res.data);

      api.sendMessage(
        {
          body: text,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => fs.existsSync(filePath) && fs.unlinkSync(filePath)
      );

      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (e) {
      api.sendMessage(text, event.threadID);
    }
  }
};

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
