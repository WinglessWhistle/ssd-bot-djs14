module.exports = {
    name: 'urban',
    description: "urban dictionary",
    execute(message, args){
        // Relay exactly what the user sent to us only if they sent us something.
        if(args.length > 0)
            message.channel.send("https://www.urbandictionary.com/define.php?term=
+ args.join(" "))

        // Otherwise just pong them.
        else
            message.channel.send("Silly, you need to tell me what you want defined.");
    }
}
