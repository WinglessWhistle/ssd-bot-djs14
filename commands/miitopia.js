//TODO: Make miitopia work with urls

const { exec } = require('child_process');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');
const assets = path.join(__dirname, "..", "assets", "miitopia");
const sounds = path.join(assets, "soundtrack");
const duration = 20;

const durationMap = new Map();

function Main(context, message, args) {
    images = message.attachments.filter(attachment => attachment.contentType.startsWith("image/") || attachment.contentType.startsWith("video/"));

    if (images.size < 1)
        throw Error("No Images provided.")

    images.forEach((value, key, images) => {
        console.log(value);
        // Download the image.
        const image = path.join(assets, "tmp", `${value.id}-${value.name}`);
        exec(`wget -O ${image} ${value.url}`, (error, stdout, stderr) => {
            if (error) {
                throw new Error("wget error: " + error.message);
            }
            processImage(image, message.channel);
        });
    });
}

function processImage(image, channel) {
    const sound = getRandomKey(durationMap);
    const start = Math.random() * (durationMap.get(sound) - duration);
    console.log(`Snippet Start ${start}, End ${start + duration}. Total ${durationMap.get(sound)}`);

    const soundFile = path.join(sounds, sound);
    exec(`ffmpeg -y -i "${image}" -ss ${start} -i "${soundFile}" -t ${duration} -shortest -map 0:v:0 -map 1:a:0 ${image}.webm`, (error, stdout, stderr) => {
        if (error) {
            channel.send("```" + error.toString() + "```");
            console.log(error);
            // throw new Error("ffmpeg was unable to process your 'content'");
        }
        console.log(`Finished processing, Saved to ${image}.webm`);

        const attachment = new MessageAttachment(image + ".webm");
        channel.send({ files: [attachment], content: "done" });

        // Delete the leftovers.
        // fs.unlink(image);
        // fs.unlink(image + ".webm");
    });
}
function getRandomKey(collection) {
    let keys = Array.from(collection.keys());
    return keys[Math.floor(Math.random() * keys.length)];
}
function OnLoad() {
    // Go over each file in the soundtrack directory and get the length of each audio file.
    fs.mkdirSync(path.join(assets, "tmp"), { recursive: true });

    const files = fs.readdirSync(sounds);
    for (const file of files) {
        exec(`ffprobe -v quiet -of json -show_format "${file}"`, { cwd: sounds }, (error, stdout, stderr) => {
            var obj = JSON.parse(stdout);
            // console.log(`${file} duration: ${obj.format.duration}`);
            if (obj.format.duration > duration)
                durationMap.set(file, obj.format.duration);
        });
    }
}
module.exports = {
    name: 'miitopia',
    description: "Replace your image with miitopia",
    execute: Main,
    init: OnLoad,
}