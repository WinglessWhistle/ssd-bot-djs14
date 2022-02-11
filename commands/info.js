const { exec } = require("child_process");
const { MessageEmbed } = require("discord.js");
const { hostname } = require("os");
const { init } = require("./miitopia.js");
gitDetails = null;
    module.exports = {
        name: 'info',
        description: "displays info for this bot.",
        execute(message, args) {
            const embed = new MessageEmbed()
                .setColor("GREEN")
                .setTitle("info")
                .setDescription(`Latest commit hash: ${gitDetails[0]}
                Latest commit date: ${gitDetails[1]}
                ${gitDetails[2]},${gitDetails[3]}

                Current Hostname: ${hostname}`);
            message.channel.send({ embeds: [embed] });
        },
        init() {
            exec('git log -n 1 --pretty=format:"%h,%cs,%d"', (error, stdout, stderr) => {
                gitDetails = stdout.split(',');
            });
        }
    }