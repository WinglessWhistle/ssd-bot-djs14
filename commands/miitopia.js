//TODO: Make miitopia work with urls
const { spawnSync, exec } = require('child_process');
const { MessageAttachment } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Set our assets and sounds directories.
let assets = path.join(__dirname, "..", "assets", "miitopia");
let sounds = path.join(assets, "soundtrack");

// The duration of each clip.
const duration = 20;

// Phrases the bot will use when posting the meme.
const phrases = [
    "I reckon [song] matches this nicely.",
    "[song] works so well with.",
    "Check out this one, it's [song] by the way.",
    "Love [song]'s tune.",
    "[song] or GTFO.",
    "[song] is great.",
    "your meme sir, piping hot with [song] all over it.",
    "I'm sure you'll agree, [song] with this sounds fantastic.",
    "This is from my soundcloud, called [song]. Check it out dude!",
]

// A list of all files and their durations.
let durationMap = new Map();

function execute(message, args) {

    // Get only images and videos from the message attachments.
    attachments = message.attachments.filter(
        attachment => attachment.contentType.startsWith("image/") ||
            attachment.contentType.startsWith("video/")
    );

    // Exit if we got no attachments.
    if (attachments.size < 1)
        throw Error("No Images or Videos provided.")

    // React with some emoji to let the user know we are processing stuff.
    message.react('⏳');

    this.context.log(this.name, `Processing ${attachments.length}`);

    // Process each attachment.
    attachments.forEach((value, key, attachments) => {
        processAttachment(value, message.channel);
    });
}

function processAttachment(attachment, channel) {

    // Pick a random sound and a duration.
    const sound = getRandomKey(durationMap);
    const soundFile = path.join(sounds, sound);
    const start = Math.random() * (durationMap.get(sound) - duration);

    // Create our temp directory.
    const tmpDir = path.join(assets, "tmp", attachment.id);
    fs.mkdirSync(tmpDir, { recursive: true });

    // the path to our new temp files.
    const image = path.join(tmpDir, attachment.name);
    const output = path.join(tmpDir, path.parse(attachment.name).name);

    // Slightly different things need to happen depending on the type of attachment we are processing.
    let command = '';
    if (attachment.contentType == "image/gif")
        command = `ffmpeg -y -stream_loop -1 -i "${image}" -ss ${start} -i "${soundFile}" -t ${duration} -c:v libvpx-vp9 -c:v libvpx-vp9 -vf format=yuv420p -crf 30 -b:v 0 -map 0:v:0 -map 1:a:0 ${output}.webm`;
    else if (attachment.contentType.startsWith("image/"))
        command = `ffmpeg -y -i "${image}" -ss ${start} -i "${soundFile}" -t ${duration} -c:v libvpx-vp9 -vf format=yuv420p -crf 30 -b:v 0 -map 0:v:0 -map 1:a:0 ${output}.webm`;
    else if (attachment.contentType.startsWith("video/"))
        command = `ffmpeg -y -i "${image}" -ss ${start} -i "${soundFile}" -t ${duration} -shortest -c:v libvpx-vp9 -vf format=yuv420p -crf 30 -b:v 0 -map 0:v:0 -map 1:a:0 ${output}.webm`;
    else
        throw Error(`Attachment type ${$attachment.contentType} not supported.`);

    // Download the image.
    exec(`wget -O ${image} ${attachment.url}`, (error, stdout, stderr) => {
        if (error) {
            throw new Error("wget error: " + error.message);
        }
        else {
            // Once the image has downloaded, run our ffmpeg command.
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    channel.send("FFMPEG error: " + error.toString());
                    throw new Error("ffmpeg was unable to process your 'content'");
                }
                else {
                    // Once the image has been processed by ffmpeg.
                    console.log(`Finished processing, Saved to ${output}.webm`);

                    // Pick a random phrase and replace [song] with the name of the song.
                    const index = Math.floor(Math.random() * phrases.length);
                    const response = phrases[index].replace("[song]", `*${sound}*`);

                    // Create our attachment and send it along with our message back to the channel. Then, delete our temp dir.
                    const attachment = new MessageAttachment(output + ".webm");
                    channel.send({ files: [attachment], content: response }).then(fs.rmdir(tmpDir, { recursive: true }, (error) => {
                        if (error)
                            console.log("Miitopia failed to clean up. " + error)
                    }));
                }
            });
        }
    });
}

// Grab a random key form a collection.
function getRandomKey(collection) {
    let keys = Array.from(collection.keys());
    return keys[Math.floor(Math.random() * keys.length)];
}
function init() {
    // Define the path to our durations file.
    const durationsFile = path.join(sounds, "durations.json");

    // Read the file, if we have an issue, just re-san and create a new one.
    if (fs.readFileSync(durationsFile, (err, data) => {
        if (err) {
            ScanDuration();
            // Write our updated durationMap to a file.
            fs.writeFileSync(durationsFile, JSON.stringify(Array.from(durationMap.entries())), (err) => {
                if (err) {
                    this.context.log(this.name, "Unable to save durations.json")
                    throw err;
                }
                this.context.log(this.name, `${durationMap.size} durations saved to durations.json.`);
            });
        }
        // So, we opened our duration file just fine. Let's attempt to read it.
        else {
            durationMap = new Map(JSON.parse(data));
            this.context.log(this.name, `${durationMap.size} durations loaded from durations.json`);
        }
    }));
}
function ScanDuration() {
    const files = fs.readdirSync(sounds);
    for (const file of files) {
        try {
            const child = spawnSync("ffprobe", ["-v", "quiet", "-of", "json", "-show_format", file], { cwd: sounds });
            var obj = JSON.parse(child.stdout.toString());
            this.context.log(this.name, `${file} = ${obj.format.duration}s`);
            if (obj.format.duration > duration)
                durationMap.set(file, obj.format.duration);
        } catch (error) {
        }
    };
}
module.exports = {
    name: 'miitopia',
    description: "Replace your image with miitopia",
    context,
    execute,
    init,
}