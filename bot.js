const Discord = require('discord.js');
const Commands = require('./src/commands.js');
const ErrorMsg = require('./src/reaction_errors.js');
require('dotenv').config();

// If something is not working correctly, Check that the intents are correct.
// https://discord.com/developers/docs/topics/gateway#gateway-intents
const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_MEMBERS",
        "GUILD_MESSAGE_REACTIONS"
    ]
});

const prefix = '!';

// Load create our context and load our commands.
const Context = {
    discord: Discord,
    commands: Commands,
    prefix
}
Commands.LoadCommands(Discord);


client.once('ready', () => {
    console.log('SSD bot alive and ready. 😌');
})

// TODO: Can this be moved into another file or directory like events? What does it do @wingless?
client.on('guildMemberAdd', guildMember => {

    guildMember.guild.channels.cache.get('756455138977251433').send(`Welcome <@${guildMember.user.id}>!`)
});


client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    // Split the message on each space character, drop the first arg and use it as our command.
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    // Attempt to run the command.
    try {
        cmd = Commands.GetSafe(command);
        if (cmd != false)
            cmd.execute(Context, message, args);

        // Throw an exception if the command doesn't exits.
        else {
            throw new Error(`The \`${prefix}${command}\` command does not exist.`);
        }
    }
    // If there's ANY error. Pass it off the the ErrorMsg module.
    catch (e) {
        ErrorMsg.HandleError(message, e);
    }
});

//Must Be Bottom Of File
client.login(process.env.BOT_TOKEN);