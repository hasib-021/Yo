const { findUid } = global.utils;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
	config: {
		name: "adduser",
		aliases: ["add"],
		version: "1.8",
		author: "Hasib,
		countDown: 5,
		role: 0,
		description: {
			en: "Add user to group (reply to left message or use uid/link)"
		},
		category: "box chat",
		guide: {
			en: "{pn} [uid | fb link] OR reply to a left message"
		}
	},

	langs: {
		en: {
			successAdd: "✅ User added successfully",
			waitApprove: "⏳ User added to approval list",
			alreadyInGroup: "⚠️ User is already in the group",
			cannotAddUser: "❌ Cannot add this user (blocked or privacy settings)",
			noUserFound: "❌ Cannot detect user from replied message",
			invalidInput: "❌ Invalid UID or Facebook profile link"
		}
	},

	onStart: async function ({ message, api, event, args, threadsData, getLang }) {
		const threadData = await threadsData.get(event.threadID);
		const { members = [], adminIDs = [], approvalMode } = threadData;
		const botID = api.getCurrentUserID();

		let uid = null;

		/* ─────────────────────
		   🔁 REPLY MODE (LEFT USER)
		───────────────────── */
		if (event.type === "message_reply") {
			const replyMsg = event.messageReply;

			if (replyMsg?.logMessageData?.leftParticipantFbId) {
				uid = replyMsg.logMessageData.leftParticipantFbId;
			}

			if (!uid)
				return message.reply(getLang("noUserFound"));
		}

		/* ─────────────────────
		   🧾 NORMAL MODE (UID/LINK)
		───────────────────── */
		else if (args.length) {
			const input = args[0];

			// UID
			if (!isNaN(input)) {
				uid = input;
			}
			// Facebook link
			else {
				let retry = 0;
				while (retry < 5) {
					try {
						uid = await findUid(input);
						break;
					}
					catch (err) {
						if (["SlowDown", "CannotGetData"].includes(err.name)) {
							retry++;
							await sleep(1000);
						}
						else {
							return message.reply(getLang("invalidInput"));
						}
					}
				}
			}
		}
		else {
			return message.reply("⚠️ Reply to a left message or provide UID/link");
		}

		/* ─────────────────────
		   👀 CHECK IF IN GROUP
		───────────────────── */
		if (members.some(m => (m.userID || m.id) == uid && m.inGroup !== false)) {
			return message.reply(getLang("alreadyInGroup"));
		}

		/* ─────────────────────
		   ➕ ADD USER
		───────────────────── */
		try {
			await api.addUserToGroup(uid, event.threadID);

			if (approvalMode && !adminIDs.includes(botID))
				return message.reply(getLang("waitApprove"));

			return message.reply(getLang("successAdd"));
		}
		catch (err) {
			return message.reply(getLang("cannotAddUser"));
		}
	}
};
