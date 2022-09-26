const { exec } = require("child_process");
const { EmbedBuilder, discord, DiscordAPIError, ContextMenuCommandAssertions } = require("discord.js");
const fs = require('fs');
const commands = context.commands.List;
helptext = "";

commands.forEach((value, key, commands) => {
    helptext += context.prefix;
    helptext += key.padEnd(12, ' ');
    helptext += value.description;
    helptext += '\n';
});

    module.exports = {
        name: 'help',
        description: "Displays all commands",
        execute(message, args) {
            const helpembed = new EmbedBuilder()
                .setColor("0x00FF00")
                .setTitle("Help")
                .setAuthor({ name: 'SeeSharpeDen.com', iconURL: 'https://seesharpeden.com/assets/NVha8dJ4.jpg'})
                .setDescription('All avaliable commands.')
                .setFooter(
                    {  text: helptext }
                )
            message.reply({ embeds: [helpembed] });
        },
    }