const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');

const CommandDir = path.join(__dirname, "..", "commands");

cmdList = new Discord.Collection();

// Load all the commands.
function LoadCommands(discord) {
    // Get all .js files in the commands directory and load them.
    const files = fs.readdirSync(CommandDir).filter(file => file.endsWith('.js'));
    for (const file of files) {
        console.log(`Loading ${file} 👌.`);
        Load(`${CommandDir}/${file}`);
    }

    // if the HOT_COMMANDS env var exists, watch the commands directory for changes.
    if (process.env.HOT_COMMANDS) {
        const watch = require('node-watch');

        watch(CommandDir, { filter: /\.js$/ }, function (evt, name) {
            if (evt == "update") {
                const filePath = path.parse(name);
                if (cmdList.has(filePath.name)) {
                    console.log(`reloading ${filePath.base} 😅.`);
                    // Delete the old command.
                    cmdList.delete(command.name, command);

                    // Remove the cached version of our file and re-require it.
                    delete require.cache[name];
                    // Load our new command.
                    Load(name)
                }
            }
        });
        console.log("Watching commands for changes 👀.");
    }
}

// Gets a command from the list. Returns a command if one exists, returns false if none exist.
function GetSafe(command) {
    if (cmdList.has(command)) {
        return cmdList.get(command);
    }
    return false;
}
function Load(file) {
    const command = require(file);
    cmdList.set(command.name, command);
    
    if(command.hasOwnProperty('init')) {
        command.init();
    }
}


module.exports = {
    LoadCommands, GetSafe,
    List: cmdList, Get: cmdList.get(), Has: cmdList.get(),
}