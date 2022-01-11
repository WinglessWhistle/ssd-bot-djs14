// This module allows errors to be optionally sent to the user. It uses discord embeds.
const { MessageEmbed } = require("discord.js");

const ErrorEmoji = '⚠️';

async function HandleError(message, e) {
    // React with an emoji and wait until it's finished.
    await message.react(ErrorEmoji);

    // Filter out everything besides ErrorEmoji reaction by the user who caused the error.
    const filter = (reaction, user) => {
        return reaction.emoji.name === ErrorEmoji && user.id === message.author.id;
    };

    // Wait 15 seconds with our filter. If something happened, send the error.
    const collector = message.createReactionCollector({ filter, time: 15_000, max: 1 });
    collector.on('collect', () => PrintError(message.channel, e))
}

// Send an error message to channel.
function PrintError(channel, e) {
    
    // Create the embed.
    const embed = new MessageEmbed()
        .setColor("#FF0000")
        .setTitle("Error: " + e.message)
        .setDescription(e.stack.toString());

    // Send a new message with our embed.
    channel.send({ embeds: [embed] });

    // TODO: Create a web-server with detailed error reports (like stack trace) where
    // details can be found.
}

// Export the functions we want accessible to other modules.
module.exports = { HandleError, PrintError };