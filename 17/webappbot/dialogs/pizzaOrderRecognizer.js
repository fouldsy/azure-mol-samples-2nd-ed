// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { LuisRecognizer } = require('botbuilder-ai');

class PizzaOrderRecognizer {
    constructor(config) {
        const luisIsConfigured = config && config.applicationId && config.endpointKey && config.endpoint;
        if (luisIsConfigured) {
            this.recognizer = new LuisRecognizer(config, {}, true);
        }
    }

    get isConfigured() {
        return (this.recognizer !== undefined);
    }

    /**
     * Returns an object with preformatted LUIS results for the bot's dialogs to consume.
     * @param {TurnContext} context
     */
    async executeLuisQuery(context) {
        return await this.recognizer.recognize(context);
    }

    getPizzaEntities(result) {
        let fromValue;
        if (result.entities.$instance.pizzaType) {
            fromValue = result.entities.$instance.pizzaType[0].text;
        }

        return { pizzaType: fromValue };
    }
}

module.exports.PizzaOrderRecognizer = PizzaOrderRecognizer;
