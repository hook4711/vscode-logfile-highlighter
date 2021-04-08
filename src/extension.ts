'use strict';

import * as vscode from 'vscode';
import CustomPatternController = require('./CustomPatternController');
import CustomPatternDecorator = require('./CustomPatternDecorator');
import TimePeriodCalculator = require('./TimePeriodCalculator');
import TimePeriodController = require('./TimePeriodController');
import { Range } from 'vscode';
import { addUserCommands as addUserCommands } from './CustomCommands';

// this method is called when the extension is activated
export function activate(context: vscode.ExtensionContext) {

    // create a new time calculator and controller
    const timeCalculator = new TimePeriodCalculator();
    const timeController = new TimePeriodController(timeCalculator);

    // create log level colorizer and -controller
    const customPatternDecorator = new CustomPatternDecorator();
    const customPatternController = new CustomPatternController(customPatternDecorator);

    // Add to a list of disposables which are disposed when this extension is deactivated.
    context.subscriptions.push(timeController, customPatternController);

	// Eigene Commands erzeugen
    addUserCommands(context);
}

// this method is called when your extension is deactivated
export function deactivate() {
    // Nothing to do here
}
