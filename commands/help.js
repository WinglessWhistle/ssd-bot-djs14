module.exports = {
    name: 'help',
    description: "displays this message",
    execute(message, args){
        message.channel.send("Hello, This IS the help message.");
    }
}