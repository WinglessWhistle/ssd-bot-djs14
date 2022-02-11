module.exports = {
    name: 'help',
    description: "displays this message",
    context,
    execute(message, args) {

        // make some variable names a little shorter.
        const commands = context.commands.List;
        helptext = "";

        // Go over each command say something about each command.
        commands.forEach((value, key, commands) => {
            helptext += context.prefix;
            helptext += key.padEnd(12, ' ');
            helptext += value.description;
            helptext += '\n';
        });
        message.channel.send("```" + helptext + "```");
    }
}