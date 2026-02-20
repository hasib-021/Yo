const { getTime } = global.utils;

module.exports = {
	config: {
		name: "user",
		version: "1.5",
		author: "Hasib",
		countDown: 5,
		role: 2, 
		description: {
			en: "Manage users in bot system"
		},
		category: "owner",
		guide: {
			en: "   {pn} [find | -f | search | -s] <name>: search user"
				+ "\n\n   {pn} [ban | -b] [uid | @tag | reply] <reason>: ban user"
				+ "\n\n   {pn} unban [uid | @tag | reply]: unban user"
		}
	},

	langs: {
		en: {
			noUserFound: "❌ No user found: \"%1\"",
			userFound: "🔎 Found %1 user \"%2\":\n%3",
			uidRequired: "UID required to ban user",
			reasonRequired: "Ban reason required",
			userHasBanned: "User [%1 | %2] already banned:\nReason: %3\nDate: %4",
			userBanned: "User [%1 | %2] banned:\nReason: %3\nDate: %4",
			uidRequiredUnban: "UID required to unban",
			userNotBanned: "User [%1 | %2] not banned",
			userUnbanned: "User [%1 | %2] unbanned"
		}
	},

	onStart: async function ({ args, usersData, message, event, prefix, getLang }) {

		// ✅ First, check if the user is banned
		const senderData = await usersData.get(event.senderID);
		if (senderData?.banned?.status) {
			return message.reply(
				`❌ Why are you trying to use the bot?\nYou are banned because ${senderData.banned.reason}!`
			);
		}

		const type = args[0];

		switch (type) {

			// FIND USER
			case "find":
			case "-f":
			case "search":
			case "-s": {
				const allUser = await usersData.getAll();
				const keyWord = args.slice(1).join(" ");
				const result = allUser.filter(item =>
					(item.name || "").toLowerCase().includes(keyWord.toLowerCase())
				);

				const msg = result.reduce((i, user) =>
					i += `\n╭Name: ${user.name}\n╰ID: ${user.userID}`, "");

				message.reply(
					result.length == 0
						? getLang("noUserFound", keyWord)
						: getLang("userFound", result.length, keyWord, msg)
				);
				break;
			}

			// BAN USER
			case "ban":
			case "-b": {
				let uid, reason;

				if (event.type == "message_reply") {
					uid = event.messageReply.senderID;
					reason = args.slice(1).join(" ");
				}
				else if (Object.keys(event.mentions).length > 0) {
					const { mentions } = event;
					uid = Object.keys(mentions)[0];
					reason = args.slice(1).join(" ").replace(mentions[uid], "");
				}
				else if (args[1]) {
					uid = args[1];
					reason = args.slice(2).join(" ");
				}
				else return message.SyntaxError();

				if (!uid)
					return message.reply(getLang("uidRequired"));

				if (!reason)
					return message.reply(getLang("reasonRequired"));

				reason = reason.replace(/\s+/g, ' ');

				const protectedUIDs = ["61587417024496", "61557991443492"];
				if (protectedUIDs.includes(uid))
					return message.reply("You cannot ban this user!");

				const userData = await usersData.get(uid);
				const name = userData?.name || "Unknown";
				const status = userData?.banned?.status || false;

				if (status)
					return message.reply(
						getLang("userHasBanned", uid, name, userData.banned.reason, userData.banned.date)
					);

				const time = getTime("DD/MM/YYYY HH:mm:ss");

				await usersData.set(uid, {
					banned: {
						status: true,
						reason,
						date: time
					}
				});

				message.reply(getLang("userBanned", uid, name, reason, time));
				break;
			}

			// UNBAN USER
			case "unban":
			case "-u": {
				let uid;

				if (event.type == "message_reply")
					uid = event.messageReply.senderID;
				else if (Object.keys(event.mentions).length > 0)
					uid = Object.keys(event.mentions)[0];
				else if (args[1])
					uid = args[1];
				else
					return message.SyntaxError();

				if (!uid)
					return message.reply(getLang("uidRequiredUnban"));

				const userData = await usersData.get(uid);
				const name = userData?.name || "Unknown";
				const status = userData?.banned?.status || false;

				if (!status)
					return message.reply(getLang("userNotBanned", uid, name));

				await usersData.set(uid, { banned: {} });

				message.reply(getLang("userUnbanned", uid, name));
				break;
			}

			default:
				return message.SyntaxError();
		}
	}
};
