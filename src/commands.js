const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');

const CommandDir = path.join(__dirname, "..", "commands");

cmdList = new Discord.Collection();

// Load all the commands.
function LoadCommands(discord) {
    console.log(`Loading commands from ${CommandDir}`);

    // Get all .js files in the commands directory
    const files = fs.readdirSync(CommandDir).filter(file => file.endsWith('.js'));


    for (const file of files) {
        // Import our command and add it to the list.
        const command = require(`${CommandDir}/${file}`);
        cmdList.set(command.name, command);

        // Look cool and tell the world about our newly added command.
        console.log(`\t ${file} Loaded`)
    }
}

// Gets a command from the list. Returns a command if one exists, returns false if none exist.
function GetSafe(command) {
    if (cmdList.has(command)) {
        return cmdList.get(command);
    }
    return false;
}


module.exports = {
    LoadCommands, GetSafe,
    List: cmdList, Get: cmdList.get(), Has: cmdList.get(),
}