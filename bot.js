const Discord = require('discord.js');
require('dotenv').config();
const ErrorMsg = require('./src/reaction_errors.js');
const fs = require('fs');


const prefix = '!';

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


// TODO: Move command code into separate file.
// Create a collection for all our commands.
client.commands = new Discord.Collection();

// Go through each .js file inside our commands directory and add each on to ur collection.
const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    console.log(`Found command ${file}`);
    client.commands.set(command.name, command);
}

// When the client is ready.
client.once('ready', () => {
    console.log('SSD bot alive and ready. 😌');
})

// TODO: Can this be moved into another file? What does it do @wingless ?
client.on('guildMemberAdd', guildMember => {

    guildMember.guild.channels.cache.get('756455138977251433').send(`Welcome <@${guildMember.user.id}>!`)
});

// When a chat message is received process it.
client.on('message', message => {
    // Bail out if the message isn't for us.
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    // FEATURE: Maybe @tting the bot would work too?

    // Split the message on each space character, drop the first arg and use it as our command.
    // BUG: What about whitespace characters like newlines and tab.
    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    // Attempt to run the command.
    try {
        // Check to see if the command exists and execute it.
        // BUG: Un-sanitised user input. See if it's a problem here.
        if (client.commands.has(command)) {
            client.commands.get(command).execute(message, args);
        }
        // Throw an exception if the command doesn't exits.
        // TODO: Add a ❓reaction so the user can get help? (Like the errors).
        else {
            throw new Error(`The \`${command}\` command does not exist.`);
        }
    }
    // If there's ANY error. Pass it off the the ErrorMsg module.
    catch (e) {
        ErrorMsg.HandleError(message, e);
    }
});

//Must Be Bottom Of File
client.login(process.env.BOT_TOKEN);