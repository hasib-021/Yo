const axios = require('axios');

const ownerID = "61557991443492"; // CHANGE TO YOUR UID!

let lastKarimReaction = null; // Not needed now, but kept for future

const triggers = [
    "baby", "bby", "bbe", "babe", "bot", "babu", "janu", "naru", "karim",
    "hinata", "hina", "arafat", "wifey", "sweetie",
    "জান", "জানু", "বেবি", "সোনা","বট"
    "hi", "hello", "hey", "yo","helo"
];

const randomReplies = [
    "𝐇𝐢 😀, 𝐈 𝐚𝐦 𝐡𝐞𝐫𝐞!",
    "𝐖𝐡𝐚𝐭'𝐬 𝐮𝐩?",
    "𝐁𝐨𝐥𝐨 𝐣𝐚𝐚𝐧 𝐤𝐢 𝐤𝐨𝐫𝐭𝐞 𝐩𝐚𝐧𝐦𝐫 𝐣𝐨𝐧𝐧𝐨",
    "𝐜𝐡𝐮𝐩 𝐛𝐞𝐬𝐢 𝐊𝐨𝐭𝐡𝐚 𝐤𝐨𝐬 𝐤𝐞𝐧 😒",
    "𝐣𝐢 𝐛𝐨𝐥𝐞𝐧",
    "𝐚𝐬𝐬𝐚𝐥𝐚𝐦𝐮𝐚𝐥𝐚𝐢𝐤𝐮𝐦 🥰",
    "𝐡𝐲𝐞 🙃",
    "𝐓𝐚𝐤𝐞 𝐜𝐚𝐫𝐞 𝐲𝐨𝐮𝐫𝐬𝐞𝐥𝐟, 𝐚𝐥𝐰𝐚𝐲𝐬 𝐩𝐫𝐚𝐲 𝐭𝐨 𝐀𝐥𝐥𝐚𝐡 𝐚𝐧𝐝 𝐞𝐧𝐣𝐨𝐲 𝐲𝐨𝐮𝐫 𝐥𝐢𝐟𝐞 🥰🥰",
    "𝐃𝐨 𝐘𝐨𝐮 𝐊𝐧𝐨𝐰 𝐖𝐡𝐨 𝐈𝐬 𝐓𝐡𝐞 𝐂𝐮𝐭𝐞𝐬𝐭 𝐏𝐞𝐫𝐬𝐨𝐧 𝐈𝐧 𝐓𝐡𝐞 𝐖𝐨𝐫𝐥𝐝? 𝐍𝐨𝐰 𝐫𝐞𝐚𝐝 𝐭𝐡𝐞 2𝐧𝐝 𝐰𝐨𝐫𝐝 🥰😘",
    "𝐖𝐡𝐞𝐧 𝐆𝐨𝐝 𝐖𝐚𝐧𝐭𝐞𝐝 𝐓𝐨 𝐄𝐱𝐩𝐥𝐚𝐢𝐧 𝐖𝐡𝐚𝐭 𝐁𝐞𝐚𝐮𝐭𝐲 𝐌𝐞𝐚𝐧𝐬, 𝐆𝐨𝐝 𝐂𝐫𝐞𝐚𝐭𝐞𝐝 𝐘𝐨𝐮 🫵🙈",
    "𝐍𝐨 𝐰𝐨𝐫𝐝𝐬 𝐜𝐚𝐧 𝐞𝐱𝐩𝐥𝐚𝐢𝐧 𝐡𝐨𝐰 𝐡𝐚𝐩𝐩𝐲 𝐈 𝐚𝐦, 𝐰𝐡𝐞𝐧 𝐈 𝐚𝐦 𝐰𝐢𝐭𝐡 𝐲𝐨𝐮 😌😌",
    "𝐈𝐟 𝐲𝐨𝐮 𝐰𝐚𝐢𝐭 𝐟𝐨𝐫 𝐦𝐞 🤗🤗 𝐨𝐧𝐞 𝐝𝐚𝐲 𝐈 𝐰𝐢𝐥𝐥 𝐛𝐞 𝐲𝐨𝐮𝐫 😇🫵",
    "𝐀𝐫𝐞 𝐲𝐨𝐮 𝐚 𝐭𝐢𝐦𝐞 𝐭𝐫𝐚𝐯𝐞𝐥𝐞𝐫? 𝐁𝐞𝐜𝐚𝐮𝐬𝐞 𝐈 𝐜𝐚𝐧 𝐬𝐞𝐞 𝐲𝐨𝐮 𝐢𝐧 𝐦𝐲 𝐟𝐮𝐭𝐮𝐫𝐞 🫵😘🥰",
    "𝐈 𝐧𝐞𝐯𝐞𝐫 𝐛𝐞𝐥𝐢𝐞𝐯𝐞𝐝 𝐢𝐧 𝐥𝐨𝐯𝐞 𝐚𝐭 𝐟𝐢𝐫𝐬𝐭 𝐬𝐢𝐠𝐡𝐭… 𝐔𝐧𝐭𝐢𝐥 𝐈 𝐬𝐚𝐰 𝐲𝐨𝐮. 𝐍𝐨𝐰 𝐈 𝐭𝐡𝐢𝐧𝐤 𝐈 𝐦𝐢𝐠𝐡𝐭 𝐧𝐞𝐞𝐝 𝐥𝐞𝐬𝐬𝐨𝐧𝐬… 𝐟𝐫𝐨𝐦 𝐲𝐨𝐮 🙊🫵",
    "𝐈 𝐡𝐚𝐯𝐞 𝐧𝐨 𝐬𝐞𝐜𝐨𝐧𝐝 𝐥𝐨𝐯𝐞 𝐝𝐞𝐚𝐫 - 𝐘𝐨𝐮 𝐰𝐞𝐫𝐞, 𝐲𝐨𝐮 𝐚𝐫𝐞, 𝐲𝐨𝐮 𝐰𝐢𝐥𝐥 𝐛𝐞 🫣🫵",
    "তোমার সাথে কাটানো মুহূর্তগুলো যেমন ভূলতে পারবো না...!! 🙃🙃 তোমাকে নিজের করে পাওয়ার ইচ্ছাও কখনো শেষ হবে না...!! 🙃🥀✨",
    "যুগের পর যুগ চলে যাবে, তবু তোমাকে না পাওয়ার আ`ক্ষেপ আমার ফুরাবে না! তুমি আমার হৃদয়ে থাকবে, আর অন্য কারো ভাগ্যে ⑅⃝✺❥😌🥀✨",
    "ওই বেস্ট ফ্রেন্ড হবি...!! 🤗🌺 বউয়েএর মতো ভালোবাসবো...!! 🥰😇🤭",
    "আমার গল্পে, আমার সাহিত্যে, আমার উপন্যাসে নিঃসন্দেহে তুমি ভীষণ সুন্দর! 🤍🌻😻😫",
    "কিবোর্ডের এই ব্যাকপেস্ট জানে তোমাকে কতকিছু বলতে গিয়েও হয়নি বলা 😅🥀",
    "যদি ফ্লার্ট করা অপরাধ হতো, আমি তোমার জন্য প্রতিদিন দোষী হতাম। I LOVE YOU 🥺🫣🫶🏻",
    "সবকিছুর দাম বাড়ছে.!🙂 শুধু কমছে মানুষের সততা আর বিশ্বাসের দাম.!💔😓",
    "তোমার মুখের দিকে তাকিয়ে! এক সমুদ্র পরিমাণ দুঃখ ভুলে থাকা সম্ভব!🖤💐💫 🐰 𝐘𝐨𝐮 𝐰𝐢𝐥𝐥 𝐚𝐥𝐰𝐚𝐲𝐬 𝐛𝐞 𝐦𝐲 𝐬𝐩𝐞𝐜𝐢𝐚𝐥 𝐩𝐞𝐫𝐬𝐨𝐧 🩵🐰",
    "𝐀𝐤𝐭𝐚 𝐦𝐚𝐲 𝐚𝐬𝐚 𝐠𝐜 𝐭𝐚.... 𝐀𝐭𝐭𝐢𝐭𝐮𝐝𝐞, 𝐥𝐨𝐲𝐚𝐥𝐭𝐲... 𝐀𝐧𝐝 𝐢𝐠𝐧𝐨𝐫𝐞..... 𝐒𝐡𝐨𝐛𝐞 𝐤𝐢𝐬𝐮 𝐦𝐢𝐥𝐚𝐢 𝐚 𝐦𝐚𝐲 𝐭𝐚 𝐤𝐞 𝐛𝐡𝐚𝐥𝐨 𝐥𝐚𝐠𝐬𝐚... 🫵",
    "এই শহরে এখনো একটা মুরগী ও ধরতে পারলাম না.!!🥺 এই শিয়ালের সমাজে আমি মুখ দেখাবো কেমন করে..☹️😞",
    "🦋🪶____𝐓𝐡𝐞 𝐟𝐥𝐨𝐰𝐞𝐫𝐬 𝐚𝐫𝐞 𝐛𝐞𝐚𝐮𝐭𝐢𝐟𝐮𝐥 𝐛𝐮𝐭 𝐛𝐞𝐥𝐨𝐧𝐠 𝐭𝐨 𝐦𝐲 𝐪𝐮𝐞𝐞𝐧 (𝐘𝐨𝐮🫣) 𝐭𝐡𝐞 𝐞𝐲𝐞𝐬 𝐌𝐨𝐫𝐞 𝐛𝐞𝐚𝐮𝐭𝐢𝐟𝐮𝐥 𝐭𝐡𝐚𝐧 𝐟𝐥𝐨𝐰𝐞𝐫𝐬...! 😻🫵",
    "𝐈𝐟 𝐭𝐡𝐞 𝐰𝐨𝐫𝐥𝐝 𝐰𝐚𝐬 𝐞𝐧𝐝𝐢𝐧𝐠, 𝐈 𝐰𝐚𝐧𝐧𝐚 𝐛𝐞 𝐧𝐞𝐱𝐭 𝐭𝐨 𝐲𝐨𝐮 ...😉🤙",
    "কত যুদ্ধ বয়ে গেছি শুধু তোমাকে বলবো বলে 🤒🤒",
    "তুমি আমার মস্তিষ্কে মিশে থাকা এক অদ্ভুত মায়া :) 🌷🌸"
];

const baseApiUrl = "https://baby-apisx.vercel.app/baby";

const send = (api, event, text) => {
    api.sendMessage(text, event.threadID, (err, info) => {
        if (!err && info) {
            global.GoatBot.onReply.set(info.messageID, {
                commandName: module.exports.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID
            });
        }
    }, event.messageID);
};

module.exports.config = {
    name: "bby",
    aliases: ["baby"],
    version: "1.0",
    author: "Hasib",
    countDown: 0,
    role: 0,
    description: "Flirty baby chatbot with teach system by Hasib",
    category: "chat",
    guide: { en: "{pn} <message> | teach | remove | etc." }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
    const realAuthor = String.fromCharCode(72, 97, 115, 105, 98);
    if (module.exports.config.author !== realAuthor) {
        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
    }

    const text = args.join(" ").trim();
    const uid = event.senderID;

    try {
        if (!text) {
            return send(api, event, randomReplies[Math.floor(Math.random() * randomReplies.length)]);
        }

        const res = await axios.get(`\( {baseApiUrl}?text= \){encodeURIComponent(text)}&senderID=${uid}&font=1`);
        send(api, event, res.data.reply || "🥰");
    } catch (e) {
        send(api, event, "Baby is busy... try again 🥱");
    }
};

module.exports.onChat = async ({ api, event }) => {
    const body = (event.body || "").toLowerCase().trim();
    if (!body) return;

    const uid = event.senderID;

    // Owner special triggers
    if (uid === ownerID) {
        const ownerWords = ["bou", "bow", "jaan"];
        const angryWords = ["kire"];
        const saliWords = ["sali"];

        let match = ownerWords.find(w => body === w || body.startsWith(w + " "));
        if (!match) match = angryWords.find(w => body === w || body.startsWith(w + " "));
        if (!match) match = saliWords.find(w => body === w || body.startsWith(w + " "));

        if (match) {
            const msg = body.slice(match.length).trim();
            if (!msg) {
                if (ownerWords.includes(match)) {
                    const sweet = ["হ্যাঁ, বলো জান শুনছি তোমার কথা 😘😘", "এইতো আমি এখনো 🙈🙈", "আমি তোমার জন্যই অপেক্ষা করেছিলাম 🙈😘"];
                    return send(api, event, sweet[Math.floor(Math.random() * sweet.length)]);
                }
                if (angryWords.includes(match)) {
                    const playful = ["Yes jaan😘😘", "হ্যাঁ বলো 🙂", "আছি আমি 🙊"];
                    return send(api, event, playful[Math.floor(Math.random() * playful.length)]);
                }
                if (saliWords.includes(match)) {
                    const angry = ["গালি দাও কেন 😾😾", "আমি তোমার বউ সালি না 😒😒", "এতো রাগ দেখাও কেন ☹️☹️"];
                    return send(api, event, angry[Math.floor(Math.random() * angry.length)]);
                }
            }
            try {
                const res = await axios.get(`\( {baseApiUrl}?text= \){encodeURIComponent(msg)}&senderID=${uid}&font=1`);
                return send(api, event, res.data.reply);
            } catch {}
        }
    }

    // Block owner words for others
    if (["bou", "bow", "jaan", "kire", "oi", "sali"].some(w => body === w || body.startsWith(w + " ")) && uid !== ownerID) return;

    const trigger = triggers.find(t => body.startsWith(t.toLowerCase()));
    if (!trigger) return;

    // Reaction system
    if (trigger.toLowerCase() === "karim") {
        api.setMessageReaction("😗", event.messageID, () => {}, true);
    } else {
        api.setMessageReaction("🍂", event.messageID, () => {}, true);
    }

    const userText = body.slice(trigger.length).trim();

    if (!userText) {
        return send(api, event, randomReplies[Math.floor(Math.random() * randomReplies.length)]);
    }

    try {
        const res = await axios.get(`\( {baseApiUrl}?text= \){encodeURIComponent(userText)}&senderID=${uid}&font=1`);
        send(api, event, res.data.reply || "😘");
    } catch {}
};

module.exports.onReply = async ({ api, event }) => {
    if (event.type !== "message_reply") return;
    try {
        const res = await axios.get(`\( {baseApiUrl}?text= \){encodeURIComponent(event.body)}&senderID=${event.senderID}&font=1`);
        send(api, event, res.data.reply || "💕");
    } catch {}
};
