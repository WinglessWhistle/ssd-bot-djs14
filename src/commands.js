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
        command = require(`${CommandDir}/${file}`);
        cmdList.set(command.name, command);

        // Look cool and tell the world about our newly added command.
        console.log(`\t ${file} Loaded`)
    }

    // if the HOT_COMMANDS env var exists, watch the commands directory for changes.
    if (process.env.HOT_COMMANDS) {
        const watch = require('node-watch');

        watch(CommandDir, { filter: /\.js$/ }, function (evt, name) {
            if (evt == "update") {
                const filePath = path.parse(name);
                if (cmdList.has(filePath.name))
                    console.log(`${filePath.base} has changed.`);
                delete require.cache[name];
                command = require(name);
                cmdList.delete(command.name, command);
                cmdList.set(command.name, command);
                console.log(`${filePath.base} reloaded.`);
            }
        });
        console.log(`Watching ${CommandDir} for changes to commands.`);
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