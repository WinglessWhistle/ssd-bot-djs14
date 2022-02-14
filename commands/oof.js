const { spawnSync, exec } = require('child_process');
const { chown } = require('fs');
const path = require('path');

module.exports = {
    name: 'oof',
    description: "Robux or Minecraft?",
    context,
    assets: "",
    execute(message, args) {
        message.channel.send("oof");
    },
    init() {
        this.assets = path.join(this.context.assets, this.name);
        this.context.log(this.name, "Pre-processing OOFs");

        const child = spawnSync("pre-process.sh", { cwd: this.assets });
        if(child.error)
            throw new Error("Failed to pre-process");
    }
}