module.exports.config = {
    name: "bully",
    version: "1.5",
    role: 0,
    author: "Hasib",
    description: "Auto savage bully loaded with the nastiest, filthiest words – no mercy",
    category: "automation",
    usages: "bully @mention | reply with bully | bully off"
};

const activeThreads = new Map();

const BOT_ADMINS = global.config.ADMINBOT || global.GoatBot?.config?.adminBot || [];

const PROTECTED_UID = "61557991443492";

const bullyMessages = [
    "Ya filthy retarded cunt, brain's a fuckin empty cum dumpster lol 💀",
    "Worthless fuckin bitch, so goddamn dumb mirrors smash when ya stare ya whore 😂",
    "Dumb motherfucking slut, keyboard hangs itself every time ya type ya nasty pig 🤣",
    "Low IQ cocksucking bastard, Google won't touch ur rotten face ya diseased bitch 💀",
    "Cringe ass cumrag, ur posts make IG wanna fuckin vomit ya trash whore lol",
    "Ugly hairy dick-sucking bitch, ur selfies permanently rape cameras ya filthy skank 😂",
    "Pathetic cum-guzzling loser, ur jokes so shit Netflix kills accounts on sight haha",
    "Useless fucking cumstain, WiFi dies screamin the second ya log on ya rotten cunt 💀",
    "Donkey-fucking braindead bitch, GPS short-circuits watchin ya stumble lol",
    "Stupid shit-eating whore, street lights blow up to escape ur hideous mug ya 🤡",
    "Bastard spawn of a crackwhore, ur voice makes Alexa wanna slit its throat ya bitch haha",
    "Dumb fuckin gutter slut, autocorrect suicides when ya butcher words ya illiterate pig 💀",
    "Ur face so goddamn grotesque no filter can hide that demonic shit lol",
    "Ya go live? Everyone logs out faster than ya mum drops panties ya cheap hoe 😂",
    "Ya sing? Spotify crashes harder than a junkie OD ya tone-deaf cum bucket",
    "Ur messages brick phones till they explode ya worthless fuckin parasite 🤣",
    "Ur status drops? Friends ghost quicker than ya dad ran away ya bastard bitch",
    "Ur comment? Whole thread nukes itself in disgust ya toxic cum whore lol",
    "Ya tweet? X burns down cryin from ur radioactive bullshit ya 💀",
    "Internet crawls to 56k the moment ya breathe online ya bandwidth-sucking leech haha",
    "Ur vids get ratio'd by everyone callin ya mum a cum dump ya filthy rat 😂",
    "Ya so fuckin vile even the devil gags watchin ya exist lol",
    "TikTok wants to execute ur dogshit moves permanently ya worthless cunt 🤡",
    "Ur smile spreads STDs to every screen ya infectious whore 😂",
    "Games delete themselves the second ya touch 'em ya game-raping bitch",
    "Like button vomits after seein ur profile ya hideous cum goblin",
    "Ur reply? Convo self-destructs in pure horror ya nasty fuck lol",
    "Calculators error out tryna process ur subzero IQ ya braindead slut 💀",
    "Biggest fuckin waste of oxygen alive, even trash cans reject ya ya pathetic whore haha",
    "Ya tryna act human but comin off as a full-blown cum-soaked retard 😂"
];

function isBotAdmin(userID) {
    return BOT_ADMINS.includes(userID);
}

module.exports.onStart = async function({ api, event, usersData }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const body = event.body?.trim();

    if (!body || !body.toLowerCase().startsWith("bully")) return;

    const args = body.split(/\s+/);

    if (!isBotAdmin(senderID)) {
        return api.sendMessage("⛔ Ya ain't shit ya worthless cunt. Only owners get to bully.", threadID);
    }

    // bully off
    if (args.length === 2 && args[1].toLowerCase() === "off") {
        const data = activeThreads.get(threadID);
        if (!data) {
            return api.sendMessage("❌ Nothin active ya dumb fuck.", threadID);
        }
        api.removeListenMqtt(data.listener);
        activeThreads.delete(threadID);
        const targetName = await usersData.getName(data.targetID);
        return api.sendMessage(`🛑 Bully off for that filthy bitch ${targetName} lol`, threadID);
    }

    // target
    let targetID = null;
    if (Object.keys(event.mentions).length > 0) {
        targetID = Object.keys(event.mentions)[0];
    } else if (event.messageReply) {
        targetID = event.messageReply.senderID;
    }

    if (!targetID) {
        return api.sendMessage("❌ Who the fuck ya bullyin ya retard? Tag or reply bitch!", threadID);
    }

    if (targetID === PROTECTED_UID) {
        return api.sendMessage("🛡️ This motherfucker is untouchable forever — back off ya prick.", threadID);
    }

    if (activeThreads.has(threadID)) {
        return api.sendMessage("⚠️ Already roastin some worthless cunt here! Off first ya fuck 😂", threadID);
    }

    const targetName = await usersData.getName(targetID);

    api.sendMessage(`😈 Bully mode ON for ${targetName}! Every message gettin absolutely fuckin obliterated ya lol 🔥`, threadID);

    const listener = (listenEvent) => {
        if (listenEvent.threadID !== threadID) return;
        if (listenEvent.senderID !== targetID) return;
        if (!listenEvent.body) return;

        const msg = bullyMessages[Math.floor(Math.random() * bullyMessages.length)];
        api.sendMessage(msg, listenEvent.threadID, listenEvent.messageID);
    };

    const mqttListener = api.listenMqtt(listener);

    activeThreads.set(threadID, { targetID, listener: mqttListener });

    // auto off after 10 mins
    setTimeout(() => {
        const data = activeThreads.get(threadID);
        if (data && data.targetID === targetID) {
            api.removeListenMqtt(data.listener);
            activeThreads.delete(threadID);
            api.sendMessage(`⏰ 10 mins up — Bully auto off for that disgusting whore ${targetName} lol 😂`, threadID);
        }
    }, 10 * 60 * 1000);
};

module.exports.onStop = function({ api }) {
    for (const data of activeThreads.values()) {
        if (data.listener) api.removeListenMqtt(data.listener);
    }
    activeThreads.clear();
};
