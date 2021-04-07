'use strict';

import * as vscode from 'vscode';
import CustomPatternController = require('./CustomPatternController');
import CustomPatternDecorator = require('./CustomPatternDecorator');
import TimePeriodCalculator = require('./TimePeriodCalculator');
import TimePeriodController = require('./TimePeriodController');
import { Range } from 'vscode';

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

    addCommands(context);
}

function addCommands(context: vscode.ExtensionContext) {
	let regExStart = new RegExp('^.*\[org\.jboss\.as\].*WildFly Full.*starting$');
    let regExStarted = new RegExp('^.*WildFly Full.*started in.*$');

	// Ersten Start finden
	let findWildflyStart = vscode.commands.registerCommand('LogFileHighlighter.findWildflyStart', () => {
		
		if (vscode.window.activeTextEditor) {
			let count = vscode.window.activeTextEditor.document.lineCount;

			for (let i = 0; i < count; i++) {
				if (regExStart.test(vscode.window.activeTextEditor.document.lineAt(i).text)) {
					const position = vscode.window.activeTextEditor.selection.active;
					var newPos = position.with(i, 0);
					var newSel = new vscode.Selection(newPos, newPos);

					vscode.window.activeTextEditor.selection = newSel;
					vscode.window.activeTextEditor.revealRange(new Range(newPos, newPos), vscode.TextEditorRevealType.InCenter);

					break;
				}
			}
		}	
	});

	context.subscriptions.push(findWildflyStart);

	// Wildfly gestartet suchen
	let findWildflyStarted = vscode.commands.registerCommand('LogFileHighlighter.findWildflyStarted', () => {
		
		if (vscode.window.activeTextEditor) {
			let count = vscode.window.activeTextEditor.document.lineCount;

			for (let i = 0; i < count; i++) {
				if (regExStarted.test(vscode.window.activeTextEditor.document.lineAt(i).text)) {
					const position = vscode.window.activeTextEditor.selection.active;
					var newPos = position.with(i, 0);
					var newSel = new vscode.Selection(newPos, newPos);

					vscode.window.activeTextEditor.selection = newSel;
					vscode.window.activeTextEditor.revealRange(new Range(newPos, newPos), vscode.TextEditorRevealType.InCenter);

					break;
				}
			}
		}	
	});

	context.subscriptions.push(findWildflyStarted);

	// Ersten Start finden
	let findWildflyNextStart = vscode.commands.registerCommand('LogFileHighlighter.findWildflyNextStart', () => {
	
		if (vscode.window.activeTextEditor) {
			let count = vscode.window.activeTextEditor.document.lineCount;
			let aktPos = vscode.window.activeTextEditor.selection.start;
			let found = false;

			for (let i = aktPos.line + 1; i < count; i++) {
				if (regExStart.test(vscode.window.activeTextEditor.document.lineAt(i).text)) {
					const position = vscode.window.activeTextEditor.selection.active;
					var newPos = position.with(i, 0);
					var newSel = new vscode.Selection(newPos, newPos);

					vscode.window.activeTextEditor.selection = newSel;
					vscode.window.activeTextEditor.revealRange(new Range(newPos, newPos), vscode.TextEditorRevealType.InCenter);

					found = true;

					break;
				}
			}

			if (!found) {
				vscode.window.showInformationMessage('Kein weiterer Start im Log!');
			}
		}	
	});
	
	context.subscriptions.push(findWildflyNextStart);
	
	let gotoLastError = vscode.commands.registerCommand('LogFileHighlighter.gotoLastError', () => {
		
		if (vscode.window.activeTextEditor) {
			let count = vscode.window.activeTextEditor.document.lineCount;
			let countErrors = 0;
			let lineNumber = 0;

			for (let i = 0; i < count; i++) {
				if (vscode.window.activeTextEditor.document.lineAt(i).text.includes('ERROR')) {
					
					if (i > lineNumber) {
						lineNumber = i;
					}

					countErrors++;
				}
			}

			const position = vscode.window.activeTextEditor.selection.active;
			var newPos = position.with(lineNumber, 0);
			var newSel = new vscode.Selection(newPos, newPos);

			vscode.window.activeTextEditor.selection = newSel;
			vscode.window.activeTextEditor.revealRange(new Range(newPos, newPos), vscode.TextEditorRevealType.InCenter);

			vscode.window.setStatusBarMessage(`found ${countErrors} errors in ${count} lines`);
		}
	});
	
	context.subscriptions.push(gotoLastError);
}

// this method is called when your extension is deactivated
export function deactivate() {
    // Nothing to do here
}
