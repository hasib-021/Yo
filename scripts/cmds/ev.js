const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "ev",
    aliases:["emoji_voice"],
    version: "1.4",
    author: "Hasib",
    countDown: 3,
    role: 1,
    shortDescription: "Voice responder for emojis/words (admin toggle)",
    longDescription: "Sends audio for specific emojis or words. Only admins can enable/disable with !ev on/off.",
    category: "noprefix",
    guide: {
      en: "Send supported emojis or words to get voices after admin enables !ev on. Admin can disable with !ev off."
    }
  },

  // === Emoji → Audio Map ===
  emojiAudioMap: {
    "🥱": "https://files.catbox.moe/9pou40.mp3",
    "😁": "https://files.catbox.moe/60cwcg.mp3",
    "😌": "https://files.catbox.moe/epqwbx.mp3",
    "🥺": "https://files.catbox.moe/wc17iq.mp3",
    "🤭": "https://files.catbox.moe/cu0mpy.mp3",
    "😅": "https://files.catbox.moe/jl3pzb.mp3",
    "😏": "https://files.catbox.moe/z9e52r.mp3",
    "😞": "https://files.catbox.moe/tdimtx.mp3",
    "🤫": "https://files.catbox.moe/0uii99.mp3",
    "🍼": "https://files.catbox.moe/p6ht91.mp3",
    "🤔": "https://files.catbox.moe/hy6m6w.mp3",
    "🥰": "https://files.catbox.moe/dv9why.mp3",
    "🤦": "https://files.catbox.moe/ivlvoq.mp3",
    "😘": "https://files.catbox.moe/sbws0w.mp3",
    "😑": "https://files.catbox.moe/p78xfw.mp3",
    "😢": "https://files.catbox.moe/shxwj1.mp3",
    "🙊": "https://files.catbox.moe/3bejxv.mp3",
    "🤨": "https://files.catbox.moe/4aci0r.mp3",
    "😡": "https://files.catbox.moe/shxwj1.mp3",
    "🙈": "https://files.catbox.moe/3qc90y.mp3",
    "😍": "https://files.catbox.moe/qjfk1b.mp3",
    "😭": "https://files.catbox.moe/itm4g0.mp3",
    "😱": "https://files.catbox.moe/mu0kka.mp3",
    "😻": "https://files.catbox.moe/y8ul2j.mp3",
    "😿": "https://files.catbox.moe/tqxemm.mp3",
    "💔": "https://files.catbox.moe/6yanv3.mp3",
    "🤣": "https://files.catbox.moe/2sweut.mp3",
    "🥹": "https://files.catbox.moe/jf85xe.mp3",
    "😩": "https://files.catbox.moe/b4m5aj.mp3",
    "🫣": "https://files.catbox.moe/ttb6hi.mp3",
    "🐸": "https://files.catbox.moe/utl83s.mp3",
    "👀": "https://files.catbox.moe/ytxilu.mp3",
    "☠️": "https://files.catbox.moe/ghtir4.mp3"
  },

  // === Word → Audio Map (lowercase) ===
  wordAudioMap: {
    "bou": "https://files.catbox.moe/s4u1f9.ogg",
    "jaan": "https://files.catbox.moe/s4u1f9.ogg",
    "bby": "https://files.catbox.moe/s4u1f9.ogg",
    "baby": "https://files.catbox.moe/s4u1f9.ogg"
  },

  // === Admin IDs ===
  admins: ["61557991443492", "61587417024496"],

  // === Toggle flag ===
  enabled: false,

  onChat: async function ({ api, event }) {
    try {
      const { threadID, messageID, body, senderID } = event;
      if (!body) return;

      const text = body.trim();
      const lowerText = text.toLowerCase();

      // === Admin toggles ===
      if (this.admins.includes(senderID)) {
        if (lowerText === "!ev on") {
          this.enabled = true;
          return;
        } else if (lowerText === "!ev off") {
          this.enabled = false;
          return;
        }
      }

      // Do nothing if not enabled
      if (!this.enabled) return;

      // === Check emoji first ===
      let audioUrl = this.emojiAudioMap[text];

      // Check word if no emoji matched
      if (!audioUrl) audioUrl = this.wordAudioMap[lowerText];

      if (!audioUrl) return;

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const safeName = encodeURIComponent(text);
      const ext = audioUrl.endsWith(".ogg") ? ".ogg" : ".mp3";
      const filePath = path.join(cacheDir, `${safeName}${ext}`);

      const response = await axios({
        method: "GET",
        url: audioUrl,
        responseType: "stream"
      });

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      writer.on("finish", () => {
        try {
          api.sendMessage(
            { attachment: fs.createReadStream(filePath) },
            threadID,
            () => fs.unlink(filePath, () => {}),
            messageID
          );
        } catch {}
      });

    } catch {
      // Completely silent on error
    }
  },

  onStart: async function () {}
};
