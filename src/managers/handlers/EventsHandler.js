const { Collection } = require("discord.js");
const fsJetpack = require('fs-jetpack');
const path = require('path');

module.exports = class EventsHandler {
    constructor(client) {
        this.client = client
        this.events = new Collection()
    }

    async loadEvents () {
        const files = await fsJetpack.findAsync(
            path.join(__dirname, '../../events'),
            { matching: '*.js', directories: false, files: true, ignoreCase: true, recursive: true }
        );

        if (files.length <= 0) return this.client.logger.error('Aucun event trouvé !');
        this.client.logger.log(`${files.length} ${files.length>1?'event ont été chargés':'event a été chargé'} !`);

        for (const file of files) {
            if (file.split(path.sep).pop().startsWith('_')) continue

            const filePath = path.join(process.cwd(), file);
            const fileClass = require(filePath);
            const fileInstance = new fileClass(this.client);
            if (fileInstance.rest) {
                this.client.rest.on(fileInstance.name, fileInstance.handle.bind(fileInstance));
            }
            else {
                this.client.on(fileInstance.name, fileInstance.handle.bind(fileInstance));
            }
            this.events.set(fileInstance.name, fileInstance);
        }
    }
}