const moment = require("moment");

const BASE_COLOR = "\x1b[";
const RESET = BASE_COLOR + "0m";

module.exports = class SlashLogger {
    slashCommand = (inter) => {
        const timestamp = `[${moment().format("DD-MM-YYYY HH:mm:ss")}]:`;
        console.log(RESET + BASE_COLOR + "37m" + `--------------------------------\n${timestamp}
    ${BASE_COLOR + "33m"}User : ${inter.user.displayName}
        ID : ${inter.user.id}
    ${BASE_COLOR + "32m"}Guild : ${inter.guild.name}
        ID : ${inter.guild.id}
    ${BASE_COLOR + "35m"}Channel : ${inter.channel.name}
        ID : ${inter.channel.id}
        Cmd => ${inter.commandName}
    ` + RESET);
    }
}