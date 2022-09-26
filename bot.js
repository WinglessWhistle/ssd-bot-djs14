const { Discord, Partials, SlashCommandBuilder, ActivityType, GatewayIntentBits, Client } = require('discord.js');
const path = require('path');
const Commands = require('./src/commands.js');
const ErrorMsg = require('./src/reaction_errors.js');
const { token } = require('./config.json');
require('dotenv').config();

// If something is not working correctly, Check that the intents are correct.
// https://discord.com/developers/docs/topics/gateway#gateway-intents
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
    partials: [Partials.Channel],
    presence: {
        activities: [{
          name: "SeeSharpeDen.com",
          type: 3
        }],
        status: 'online'
      }
});

//set prefix
// eventually plan to move it to the config.json file
const prefix = '!';

// Load create our context and load our commands.
const Context = {
    discord: Discord,
    commands: Commands,
    prefix,
    assets: path.join(__dirname, "assets"),
    DoCommand,
    log
}
Commands.LoadCommands(Discord, Context);

//log when bot loaded
client.once('ready', () => {
    log("Bot", 'SSD bot alive and ready. 😌');
})



// events
// welcome user
client.on('guildMemberAdd', guildMember => {

    guildMember.guild.channels.cache.get('756455138977251433').send(`Welcome <@${guildMember.user.id}>!`)
});



// get message
client.on('messageCreate', message => {
    DoCommand(message);
});

function DoCommand(message) {
    // Bail out if a bot is trying to do stuff.
    if (message.author.bot)
        return;

    const args = ParseInput(message.content);
    if (args == false)
        return;

    // Pull the first arg out and use it as our command.
    const command = args.shift().toLowerCase();

    // Attempt to run the command.
    try {
        cmd = Commands.GetSafe(command);
        if (cmd != false)
            cmd.execute(message, args);

        // Throw an exception if the command doesn't exits.
        else {
            throw new Error(`The \`${command}\` command does not exist.`);
        }
    }
    // If there's ANY error. Pass it off the the ErrorMsg module.
    catch (e) {
        ErrorMsg.HandleError(message, e);
        console.log(e);
    }
}

function log(source, msg) {
    console.log(`${source.padEnd(30)}: ${msg}`)
}

function ParseInput(msg) {
    args = null;
    // Remove either the @bot part of the message or exit out when we don't start with !.
    if (msg.startsWith(`<@!${client.user.id}>`))
        msg = msg.slice(client.user.id.length + 4);
    else if (!msg.startsWith(prefix))
        return false
    
    // Split our args up on each space.
    args = msg.split(/ +/);

    // Remove any empty args.
    args = args.filter(function (entry) { return /\S/.test(entry); });

    // Remove our prefix (if it exists) from the first arg.
    if(args[0].startsWith(prefix))
        args[0] = args[0].slice(prefix.length);

    return args;
}

//Must Be Bottom Of File
client.login(token);