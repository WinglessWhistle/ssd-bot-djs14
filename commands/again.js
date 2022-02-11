const { channel } = require("diagnostics_channel");
const { MessageAttachment } = require("discord.js");
const path = require("path");
module.exports = {
    name: 'again',
    context,
    description: "Attempt to run the previous \"!\" command.",
    execute(message, args) {

        // Get the last 5 messages from the channel.
        message.channel.messages.fetch({ limit: 25 }).then(messages => {

            // Only get messages with the same author as the current message, is not the current message and ones that start with `!`. Oh, and it's not the !again command.
            messages = messages.filter(m => m.author.id === message.author.id && m.id != message.id && m.content.startsWith(context.prefix) && !m.content.startsWith(context.prefix + this.name));

            // Grab the first one and verify we won't be starting an endless loop.
            const cmd = messages.first().content;
            if (cmd.toLowerCase() !== `!${this.name}`) {
                // Re run the command.
                context.DoCommand(messages.first());
                return;
            }
            else {
                let attachment = new MessageAttachment(path.join(context.assets, "misc", "no.png"));
                message.channel.send({ files: [attachment] });
                return;
            }
        });
    }
}