'use strict';

import * as vscode from 'vscode';
import { Range } from 'vscode';
import { ItemType, REGEXSTART, REGEXSTARTED } from './const';
import { LogTreeItem } from './LogTreeItem';

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

    parseLogFile(editor: vscode.TextEditor): LogTreeItem {
        // Root-Node erzeugen
        let root = new LogTreeItem('root', 0, ItemType.Root);
        root.addCommand(editor);

        // Anzahl Zeilen im Editor
        let count = vscode.window.activeTextEditor.document.lineCount;

        // Aktuelle Node
        let aktStart: LogTreeItem = null;

        // Logdatei auf Start und Ende WildFly pruefen
        for (let i = 0; i < count; i++) {

            if (REGEXSTART.test(vscode.window.activeTextEditor.document.lineAt(i).text)) {
            
                aktStart = root.addChildItem(vscode.window.activeTextEditor.document.lineAt(i).text, i, ItemType.Start);
                aktStart.addCommand(editor);

            } else if (REGEXSTARTED.test(vscode.window.activeTextEditor.document.lineAt(i).text)) {
            
                if (!aktStart) {
                    aktStart = root.addChildItem("--.--.---- --:--:-- [START]", -1, ItemType.Start);
                }
                
                aktStart.addChildItem(vscode.window.activeTextEditor.document.lineAt(i).text, i, ItemType.Started, vscode.TreeItemCollapsibleState.None)
                        .addCommand(editor);
            }
        }

        // Root-Node zurueck (enthaelt alle Items)
        return root;
    }


}