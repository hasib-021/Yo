const { getPrefix } = global.utils;

const DEFAULT_RULES = [
    "𝐆𝐮𝐲𝐬 𝐘𝐨𝐮𝐫 𝐠𝐫𝐨𝐮𝐩 𝐫𝐮𝐥𝐞𝐬:",
    "𝟏. 𝐁𝐞 𝐫𝐞𝐬𝐩𝐞𝐜𝐭𝐟𝐮𝐥 𝐭𝐨 𝐚𝐥𝐥 𝐦𝐞𝐦𝐛𝐞𝐫𝐬🎀",
    "𝟐. 𝐃𝐨𝐧'𝐭 𝐬𝐩𝐚𝐦 𝐦𝐞𝐬𝐬𝐚𝐠𝐞 𝐢𝐧 𝐠𝐫𝐨𝐮𝐩❌",
    "𝟑. 𝐁𝐭𝐬 𝐭𝐨𝐩𝐢𝐜 & 𝟏𝟖+ 𝐜𝐨𝐧𝐭𝐞𝐧𝐭 𝐭𝐨𝐭𝐚𝐥𝐥𝐲 𝐨𝐟𝐟",
    "𝟒. 𝐠𝐫𝐨𝐮𝐩 𝐩𝐫𝐨𝐦𝐨𝐭𝐢𝐨𝐧 𝐚𝐧𝐝 𝐨𝐭𝐡𝐞𝐫 𝐠𝐫𝐨𝐮𝐩 𝐭𝐨𝐩𝐢𝐜 𝐧𝐨𝐭 𝐚𝐥𝐥𝐨𝐰❌",
    "𝟓. 𝐧𝐨 𝐡𝐚𝐭𝐞 𝐬𝐩𝐞𝐞𝐜𝐡 𝐨𝐫 𝐛𝐮𝐥𝐥𝐲𝐢𝐧𝐠",
    "𝟔. 𝐖𝐢𝐭𝐡𝐨𝐮𝐭 𝐚𝐝𝐦𝐢𝐧 𝐩𝐞𝐫𝐦𝐢𝐬𝐬𝐢𝐨𝐧, 𝐧𝐨 𝐨𝐧𝐞 𝐢𝐧 𝐭𝐡𝐞 𝐠𝐫𝐨𝐮𝐩 𝐜𝐚𝐧 𝐛𝐞 𝐜𝐨𝐧𝐭𝐚𝐜𝐭𝐞𝐝 𝐢𝐧 𝐢𝐧𝐛𝐨𝐱.",
    "𝟕. 𝐀𝐝𝐦𝐢𝐧𝐬 𝐝𝐞𝐜𝐢𝐬𝐢𝐨𝐧𝐬 𝐚𝐫𝐞 𝐟𝐢𝐧𝐚𝐥."
];

const OWNER_UID = ["61557991443492"]; // bot owner/admin in config

module.exports = {
    config: {
        name: "rules",
        version: "1.7",
        author: "Hasib",
        countDown: 5,
        role: 0,
        description: {
            vi: "Tạo/xem/thêm/sửa/đổi vị trí/xóa nội quy nhóm của bạn",
            en: "Create/view/add/edit/change position/delete group rules of you"
        },
        category: "box chat",
        guide: {
            vi: "{pn}: xem nội quy nhóm\n"
                + "{pn} add <nội quy>: thêm nội quy (admin/bot owner only)\n"
                + "{pn} edit <n> <nội dung>: chỉnh sửa nội quy thứ n (admin/bot owner only)\n"
                + "{pn} move <stt1> <stt2>: hoán đổi vị trí nội quy (admin/bot owner only)\n"
                + "{pn} delete <n>: xóa nội quy thứ n (admin/bot owner only)\n"
                + "{pn} remove: reset toàn bộ nội quy về mặc định (admin/bot owner only)",
            en: "{pn}: view group rules\n"
                + "{pn} add <rule>: add a rule (admin/bot owner only)\n"
                + "{pn} edit <n> <content>: edit rule number n (admin/bot owner only)\n"
                + "{pn} move <stt1> <stt2>: swap rules (admin/bot owner only)\n"
                + "{pn} delete <n>: delete rule number n (admin/bot owner only)\n"
                + "{pn} remove: reset all rules to default (admin/bot owner only)"
        }
    },

    langs: {
        vi: {
            yourRules: "Nội quy nhóm bạn:\n%1",
            noRules: "Nhóm hiện tại chưa có nội quy, mặc định là:\n%1",
            noPermission: "Chỉ admin nhóm hoặc bot owner mới có quyền thay đổi nội quy",
            success: "Đã thực hiện thành công",
            invalidNumber: "Vui lòng nhập số thứ tự hợp lệ",
        },
        en: {
            yourRules: "Your group rules:\n%1",
            noRules: "Your group has no rules, default rules are:\n%1",
            noPermission: "Only group admins or bot owner can change rules",
            success: "Action completed successfully",
            invalidNumber: "Please enter a valid rule number",
        }
    },

    onStart: async function ({ role, args, message, event, threadsData, getLang }) {
        const { threadID, senderID } = event;

        // Load rules or set default
        let rulesOfThread = await threadsData.get(threadID, "data.rules", DEFAULT_RULES);

        const type = args[0];
        const isOwner = OWNER_UID.includes(senderID);
        const isAdmin = role >= 1;
        const canEdit = isOwner || isAdmin;

        if (!type) {
            // View rules
            return message.reply(rulesOfThread.join("\n"));
        }

        // ADD
        if (["add", "-a"].includes(type)) {
            if (!canEdit) return message.reply(getLang("noPermission"));
            if (!args[1]) return message.reply("❌ Please provide rule content to add");
            rulesOfThread.push(args.slice(1).join(" "));
            await threadsData.set(threadID, rulesOfThread, "data.rules");
            return message.reply(getLang("success"));
        }

        // EDIT
        if (["edit", "-e"].includes(type)) {
            if (!canEdit) return message.reply(getLang("noPermission"));
            const idx = parseInt(args[1]) - 1;
            if (isNaN(idx) || !rulesOfThread[idx]) return message.reply(getLang("invalidNumber"));
            if (!args[2]) return message.reply("❌ Please provide new content for the rule");
            rulesOfThread[idx] = args.slice(2).join(" ");
            await threadsData.set(threadID, rulesOfThread, "data.rules");
            return message.reply(getLang("success"));
        }

        // MOVE
        if (["move", "-m"].includes(type)) {
            if (!canEdit) return message.reply(getLang("noPermission"));
            const idx1 = parseInt(args[1]) - 1;
            const idx2 = parseInt(args[2]) - 1;
            if (isNaN(idx1) || isNaN(idx2) || !rulesOfThread[idx1] || !rulesOfThread[idx2])
                return message.reply(getLang("invalidNumber"));
            [rulesOfThread[idx1], rulesOfThread[idx2]] = [rulesOfThread[idx2], rulesOfThread[idx1]];
            await threadsData.set(threadID, rulesOfThread, "data.rules");
            return message.reply(getLang("success"));
        }

        // DELETE
        if (["delete", "-d"].includes(type)) {
            if (!canEdit) return message.reply(getLang("noPermission"));
            const idx = parseInt(args[1]) - 1;
            if (isNaN(idx) || !rulesOfThread[idx]) return message.reply(getLang("invalidNumber"));
            rulesOfThread.splice(idx, 1);
            await threadsData.set(threadID, rulesOfThread, "data.rules");
            return message.reply(getLang("success"));
        }

        // REMOVE / RESET
        if (["remove", "-r"].includes(type)) {
            if (!canEdit) return message.reply(getLang("noPermission"));
            rulesOfThread = [...DEFAULT_RULES];
            await threadsData.set(threadID, rulesOfThread, "data.rules");
            return message.reply(getLang("success"));
        }

        return message.SyntaxError();
    }
};
