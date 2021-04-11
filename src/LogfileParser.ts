'use strict';

import * as vscode from 'vscode';
import { Range } from 'vscode';
import { ItemType, REGEX_DEPLOYED, REGEX_EXCEPTION, REGEX_START, REGEX_STARTED, STD_ERR } from './const';
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

        // Aktuelle Node
        let aktStart: LogTreeItem = null;
        
        // Allgemeine Node (Start, Stop, Deployed, ...)
        let commonRoot: LogTreeItem = root.addChildItem("Allgemein", -1, ItemType.CommonRoot);

        // Exceptions
        let exceptionRoot: LogTreeItem = root.addChildItem("Exceptions", -1, ItemType.ExceptionRoot);

        // Anzahl Zeilen im Editor
        let count = vscode.window.activeTextEditor.document.lineCount;

        // Logdatei auf Start und Ende WildFly pruefen
        for (let i = 0; i < count; i++) {

            // Aktuelle Zeile im Editor
            let text: string = vscode.window.activeTextEditor.document.lineAt(i).text;

            // WildFly start
            if (REGEX_START.test(text)) {
            
                aktStart = commonRoot.addChildItem(text, i, ItemType.Start);
                aktStart.addCommand(editor);

            } else if (REGEX_STARTED.test(text)) {
            
                if (!aktStart) {
                    aktStart = commonRoot.addChildItem("--.--.---- --:--:-- [START]", -1, ItemType.Start);
                }
                
                aktStart.addChildItem(text, i, ItemType.Started, vscode.TreeItemCollapsibleState.None)
                        .addCommand(editor);

            } else if (REGEX_DEPLOYED.test(text)) {
            
                if (!aktStart) {
                    aktStart = commonRoot.addChildItem("--.--.---- --:--:-- [START]", -1, ItemType.Start);
                }
                
                aktStart.addChildItem(text, i, ItemType.Deployed, vscode.TreeItemCollapsibleState.None)
                        .addCommand(editor);

            } else if (REGEX_EXCEPTION.test(text) && !text.includes(STD_ERR)) {
            
                exceptionRoot.addChildItem(text, i, ItemType.Exception, vscode.TreeItemCollapsibleState.None)
                             .addCommand(editor);

            }
        }

        // Root-Node zurueck (enthaelt alle Items)
        return root;
    }


}