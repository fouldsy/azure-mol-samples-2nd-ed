// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { MessageFactory, InputHints } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');
const { ComponentDialog, DialogSet, DialogTurnStatus, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

class MainDialog extends ComponentDialog {
    constructor(luisRecognizer,orderDialog) {
        super('MainDialog');

        if (!luisRecognizer) throw new Error('[MainDialog]: Missing parameter \'luisRecognizer\' is required');
        this.luisRecognizer = luisRecognizer;

        if (!orderDialog) throw new Error('[MainDialog]: Missing parameter \'orderDialog\' is required');

        // Define the main dialog and its related components.
        // This is a sample "order a pizza" dialog.
        this.addDialog(new TextPrompt('TextPrompt'))
            .addDialog(orderDialog)
            .addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
                this.introStep.bind(this),
                this.actStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    /**
     * The run method handles the incoming activity (in the form of a TurnContext) and passes it through the dialog system.
     * If no dialog is active, it will start the default dialog.
     * @param {*} turnContext
     * @param {*} accessor
     */
    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    /**
     * First step in the waterfall dialog. Prompts the user for a command.
     * Currently, this expects an order request like, "Order a pepperoni pizza".
     * Note that there's no logic to catch additional pizzas not on the menu. The LUIS app returns
     * the requested pizza type based on the entity found.
     */
    async introStep(stepContext) {
        if (!this.luisRecognizer.isConfigured) {
            const messageText = 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.';
            await stepContext.context.sendActivity(messageText, null, InputHints.IgnoringInput);
            return await stepContext.next();
        }

        const messageText = stepContext.options.restartMsg ? stepContext.options.restartMsg : 'Hi! I\'m the Azure Month of Lunches pizza bot. What can I help you with?\nYou can say things like, "Show me the menu", "Order pizza", "What\s the status of my order?"';
        const promptMessage = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
        return await stepContext.prompt('TextPrompt', { prompt: promptMessage });
    }

    /**
     * Second step in the waterfall.  This will use LUIS to attempt to extract the pizza type.
     * Then, it hands off to the orderDialog child dialog to confirm the order.
     */
    async actStep(stepContext) {
        const orderDetails = {};

        if (!this.luisRecognizer.isConfigured) {
            // LUIS is not configured, we just run the orderDialog path.
            return await stepContext.beginDialog('orderDialog', orderDetails);
        }

        // Call LUIS and gather any potential order details. (Note the TurnContext has the response to the prompt)
        const luisResult = await this.luisRecognizer.executeLuisQuery(stepContext.context);
        switch (LuisRecognizer.topIntent(luisResult)) {
            
        case 'showMenu': {
            const getMenuText = 'Here\s what we have on the menu today:\n\n- Pepperoni pizza: $18 \n- Veggie pizza: $15 \n- Hawaiian pizza: $12\n\nYou can order food with, "One pepperoni pizza", or "I\'d like a veggie, please"';
            await stepContext.context.sendActivity(getMenuText, getMenuText, InputHints.IgnoringInput);
            break;
        }
            
        case 'orderFood': {
            const pizzaEntities = this.luisRecognizer.getPizzaEntities(luisResult);

            orderDetails.type = pizzaEntities;
            console.log('LUIS extracted these booking details:', JSON.stringify(orderDetails));

            return await stepContext.beginDialog('orderDialog', orderDetails);
        }

        case 'orderStatus': {
            const getOrderStatusText = 'Your pizza will be ready soon!';
            await stepContext.context.sendActivity(getOrderStatusText, getOrderStatusText, InputHints.IgnoringInput);
            break;
        }
        
        case 'greetings': {
            const getGreetingsText = 'Hi there!';
            await stepContext.context.sendActivity(getGreetingsText, getGreetingsText, InputHints.IgnoringInput);
            break;
        }

        default: {
            // Catch all for unhandled intents
            const didntUnderstandMessageText = `Sorry, I didn't get that. Please try asking in a different way (intent was ${ LuisRecognizer.topIntent(luisResult) })`;
            await stepContext.context.sendActivity(didntUnderstandMessageText, didntUnderstandMessageText, InputHints.IgnoringInput);
        }
        }

        return await stepContext.next();
    }

    /**
     * This is the final step in the main waterfall dialog.
     * It wraps up the sample "order a pizza" interaction with a simple confirmation.
     */
    async finalStep(stepContext) {
        // If the order dialog ("orderDialog") was cancelled or the user failed to confirm, the Result here will be null.
        if (stepContext.result) {
            const result = stepContext.result;
            const msg = `I have your order for a ${ result.type } pizza!`;
            await stepContext.context.sendActivity(msg, msg, InputHints.IgnoringInput);
        }

        // Restart the main dialog with a different message the second time around
        return await stepContext.replaceDialog(this.initialDialogId, { restartMsg: 'What else can I do for you?' });
    }
}

module.exports.MainDialog = MainDialog;
