module.exports = class MessageFormatter {
    constructor (client) {
        this.client = client
        this.config = client.config
    }

     /**
     * Format message with custom emote
     * @param {string} message The message
     * @param {string || null} prefix
     * @return {*}
     */
    custom (message, prefix = null) {
        return (prefix ? `${prefix} ` : '') + message
    }

     /**
     * Format message with success
     * @param {string} message The message
     * @return {*}
     */
    success (message) {
        return this.custom(message, this.client.emojiSuccess)
    }

     /**
     * Format message with error
     * @param {string} message The message
     * @return {*}
     */
    error (message) {
        return this.custom(message, this.client.emojiError)
    }

     /**
     * Get components to display pages
     * @param {string} label The label for middle page
     * @param {Number} page The current page
     * @param {Number} pages The number of total pages
     * @param {Boolean} off Disable the buttons
     * @return {[{components: [{emoji: string, custom_id, style: number, disabled: boolean, type: number},{custom_id, style: number, disabled: boolean, label, type: number},{emoji: string, custom_id, style: number, disabled: boolean, type: number}], type: number}]}
     */
    pages = (label, page, pages, off = false) => {
        return [{
            type: 1,
            components: [{
                custom_id: "left",
                style: 2,
                emoji: '⬅️',
                type: 2,
                disabled: page === 1 || off
            },
                {
                    custom_id: "middle",
                    style: 3,
                    label: label,
                    type: 2,
                    disabled: true
                },
                {
                    custom_id: "right",
                    style: 2,
                    emoji: '➡️',
                    type: 2,
                    disabled: page === pages || off
                }]
        }]
    }
}






