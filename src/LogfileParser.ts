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

        // Anzahl Zeilen im Editor
        let count = vscode.window.activeTextEditor.document.lineCount;

        // Aktuelle Node
        let aktStart: LogTreeItem = null;

        // Exceptions
        let exceptionNode: LogTreeItem = null;

        // Logdatei auf Start und Ende WildFly pruefen
        for (let i = 0; i < count; i++) {

            let text = vscode.window.activeTextEditor.document.lineAt(i).text;
            if (text.length > 0 && (text.includes('ERROR') || text.includes('SEVERE')) && !text.includes(STD_ERR)) {
                console.log(vscode.window.activeTextEditor.document.lineAt(i).text);
            }    

            if (REGEX_START.test(vscode.window.activeTextEditor.document.lineAt(i).text)) {
            
                aktStart = root.addChildItem(vscode.window.activeTextEditor.document.lineAt(i).text, i, ItemType.Start);
                aktStart.addCommand(editor);

            } else if (REGEX_STARTED.test(vscode.window.activeTextEditor.document.lineAt(i).text)) {
            
                if (!aktStart) {
                    aktStart = root.addChildItem("--.--.---- --:--:-- [START]", -1, ItemType.Start);
                }
                
                aktStart.addChildItem(vscode.window.activeTextEditor.document.lineAt(i).text, i, ItemType.Started, vscode.TreeItemCollapsibleState.None)
                        .addCommand(editor);

            } else if (REGEX_DEPLOYED.test(vscode.window.activeTextEditor.document.lineAt(i).text)) {
            
                if (!aktStart) {
                    aktStart = root.addChildItem("--.--.---- --:--:-- [START]", -1, ItemType.Start);
                }
                
                aktStart.addChildItem(vscode.window.activeTextEditor.document.lineAt(i).text, i, ItemType.Deployed, vscode.TreeItemCollapsibleState.None)
                        .addCommand(editor);

            } else if (REGEX_EXCEPTION.test(vscode.window.activeTextEditor.document.lineAt(i).text) && !text.includes(STD_ERR)) {
            
                if (!exceptionNode) {
                    exceptionNode = root.addChildItem("Exceptions", -1, ItemType.Exception);
                }
                
                exceptionNode.addChildItem(vscode.window.activeTextEditor.document.lineAt(i).text, i, ItemType.Exception, vscode.TreeItemCollapsibleState.None)
                        .addCommand(editor);

            }
        }

        // Root-Node zurueck (enthaelt alle Items)
        return root;
    }


}