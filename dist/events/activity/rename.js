import { Colors, EmbedBuilder, time, } from "discord.js";
import { GUILD as guildId } from "../../resources/configuration.js";
import escapeMarkdown from "../../utils/escapeMarkdown.js";
import isNotMakeshiftEvent from "../../functions/isNotMakeshiftEvent.js";
import announce from "../../functions/announce.js";
export default function (client) {
    client.on("guildMemberUpdate", handleMemberUpdate);
    client.on("userUpdate", handleUserUpdate);
}
const handleMemberUpdate = function (oldMember, newMember) {
    // Check if Makeshift member
    if (isNotMakeshiftEvent(newMember.guild))
        return;
    // Check if member changed old displayname
    if (oldMember.displayName === newMember.displayName)
        return;
    // Member has changed nickname, announce
    announceMemberDisplayNameChange(oldMember.displayName, newMember.displayName, newMember.user);
};
const handleUserUpdate = async function (oldUser, newUser) {
    // Check if user changed displayName
    if (oldUser.displayName === newUser.displayName)
        return;
    // Check if user is Makeshift member
    const guild = await newUser.client.guilds.fetch(guildId).catch(console.error);
    if (guild === undefined)
        return;
    const member = await guild.members.fetch(newUser.id).catch(console.error);
    if (member === undefined)
        return;
    // Check if member already has a nickname
    if (member.nickname !== null)
        return;
    announceMemberDisplayNameChange(oldUser.username, newUser.username, newUser);
};
function announceMemberDisplayNameChange(oldName, newName, user) {
    console.log(`guildMemberDisplaynameUpdate: ${user.id} alias ${oldName} to ${newName}`);
    // Attempt announcement
    const channel = "1008538549529878679" /* Channels.LOGS_ACTIVITY */;
    const content = `📝 ${user.toString()} changed their name`;
    const embed = new EmbedBuilder()
        .setColor(Colors.Blue)
        .addFields({ name: "New alias", value: escapeMarkdown(newName), inline: true }, { name: "ID", value: user.id, inline: true }, { name: "Date", value: time(new Date()), inline: true });
    if (oldName !== null) {
        embed.addFields({
            name: "Old alias",
            value: escapeMarkdown(oldName),
            inline: true,
        });
    }
    announce(user.client, channel, content, embed).catch(() => {
        console.error("Failed to announce member rename");
    });
}
