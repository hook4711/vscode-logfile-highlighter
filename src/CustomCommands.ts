'use strict';

import * as vscode from 'vscode';
import { Range } from 'vscode';
import { REGEX_START, REGEX_STARTED } from './const';
import { LogfileParser } from './LogfileParser';

/**
 * Eigene Kommandos definieren und bekannt machen.
 * 
 * - Finde ersten Start WildFly
 * - Finde naechsten Start WildFly
 * - Springe zu letztem Fehler im Log
 * - Finde Eintrag fuer erfolgreichen Start im Log
 * 
 * @param context Kontext, um die Befehle einfuegen zu koennen.
 */
export function addUserCommands(context: vscode.ExtensionContext) {

	// Ersten Start ab aktueller Position finden
	let findWildflyStart = vscode.commands.registerCommand('LogFileHighlighter.findWildflyStart', () => {
		
        if (!LogfileParser.parseLines(REGEX_START)) {
            vscode.window.setStatusBarMessage("Kein weiterer Start im Log!");
        }
		
	});

	context.subscriptions.push(findWildflyStart);

	// Wildfly gestartet suchen
	let findWildflyStarted = vscode.commands.registerCommand('LogFileHighlighter.findWildflyStarted', () => {
		
        if (!LogfileParser.parseLines(REGEX_STARTED)) {
            vscode.window.setStatusBarMessage("Kein weiterer erfolgreicher Start im Log!");
        }

	});

	context.subscriptions.push(findWildflyStarted);
	
    // Zum letzten Fehler springen (zaehlt gleichzeitig die Fehler im Log)
	let gotoLastError = vscode.commands.registerCommand('LogFileHighlighter.gotoLastError', () => {
		
		if (vscode.window.activeTextEditor) {
			// Anzahl Zeilen im Editor
            let count = vscode.window.activeTextEditor.document.lineCount;
            // Anzahl Fehler im Log
            let countErrors = 0;
            // Zeile merken
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

			vscode.window.setStatusBarMessage(`${countErrors} Fehler in ${count} Zeilen gefunden!`);
		}
	});
	
	context.subscriptions.push(gotoLastError);
}
