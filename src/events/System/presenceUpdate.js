const Events = require('../../managers/structures/Events');
const BotMonitoring = require('../../services/System/BotMonitoring');

module.exports = class PresenceUpdate extends Events {
    constructor (client) {
        super(client, 'presenceUpdate')
        this.botMonitoring = new BotMonitoring(this);
    }

    async handle (oldPresence, newPresence) {
        /* Bot monitoring */
        await this.botMonitoring.handle(oldPresence, newPresence);
    }
}