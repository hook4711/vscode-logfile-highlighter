'use strict';

import * as vscode from 'vscode';
import { Range } from 'vscode';

export class LogfileParser {

    /**
     * Parsen der Zeilen im Log nach der uebergebenen Expression.
     * 
     * @param regex         Regular Expression, nach der gesucht werden soll
     * @param bFromAktPos   Soll von der aktuellen Position im Editor gesucht werden?
     */
    static parseLines(regex: RegExp): boolean {
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


}