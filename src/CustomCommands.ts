'use strict';

import * as vscode from 'vscode';
import { Range } from 'vscode';

/**
 * Parsen der Zeilen im Log nach der uebergebenen Expression.
 * 
 * @param regex         Regular Expression, nach der gesucht werden soll
 * @param bFromAktPos   Soll von der aktuellen Position im Editor gesucht werden?
 */
function parseLines(regex: RegExp): boolean {
    if (vscode.window.activeTextEditor) {
        // Anzahl Zeilen im Editor
        let count = vscode.window.activeTextEditor.document.lineCount;
        // Aktuelle Position im Editor
        let start = vscode.window.activeTextEditor.selection.start.line + 1;

        // Ab aktueller Position im Editor alle Zeilen durchlaufen und auf regex pruefen
        for (let i = start; i < count; i++) {
            if (regex.test(vscode.window.activeTextEditor.document.lineAt(i).text)) {
                const position = vscode.window.activeTextEditor.selection.active;
                var newPos = position.with(i, 0);
                var newSel = new vscode.Selection(newPos, newPos);

                vscode.window.activeTextEditor.selection = newSel;
                vscode.window.activeTextEditor.revealRange(new Range(newPos, newPos), vscode.TextEditorRevealType.InCenter);

                return true;
            }
        }
    }	

    return false;
}

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
	let regExStart = new RegExp('^.*\[org\.jboss\.as\].*WildFly Full.*starting$');
    let regExStarted = new RegExp('^.*WildFly Full.*started in.*$');

	// Ersten Start ab aktueller Position finden
	let findWildflyStart = vscode.commands.registerCommand('LogFileHighlighter.findWildflyStart', () => {
		
        if (!parseLines(regExStart)) {
            vscode.window.setStatusBarMessage("Kein weiterer Start im Log!");
        }
		
	});

	context.subscriptions.push(findWildflyStart);

	// Wildfly gestartet suchen
	let findWildflyStarted = vscode.commands.registerCommand('LogFileHighlighter.findWildflyStarted', () => {
		
        if (!parseLines(regExStarted)) {
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
