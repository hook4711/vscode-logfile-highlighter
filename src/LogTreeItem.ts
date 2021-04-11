import * as vscode from 'vscode';
import { TreeItem } from 'vscode';
import { ItemType, REGEX_ISO_DATE, REGEX_LOCAL_DATE, REGEX_TIME } from './const';

export class LogTreeItem extends TreeItem {
    public logText: string;
    public line: number;
    public type: ItemType;
    readonly children: LogTreeItem[] = [];

    constructor(logText: string, line: number, type: ItemType = ItemType.Unknown, collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed) {
        super(LogTreeItem.createLabel(logText, type), collapsibleState);
    
        this.logText = logText;
        this.line = line;
        this.type = type;
    }

    addChildItem(label: string, line: number = -1, type: ItemType = ItemType.Unknown, 
        collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed): LogTreeItem {

        let result = new LogTreeItem(label, line, type, collapsibleState);

        this.addChild(result);

        return result;
    }

    addChild(child: LogTreeItem): void {
        this.children.push(child);
    }

    addCommand(editor: vscode.TextEditor) {
        let startPosition = new vscode.Position(this.line, 0);
        let stopPosition = new vscode.Position(this.line, this.logText.length);
        
        this.command = {
            command: 'extension.openLogSelection',
            title: '',
            arguments: [new vscode.Range(startPosition, stopPosition)]
        };
    }

    updateLabel(): void {
        this.label = LogTreeItem.createLabel(this.logText, this.type, this.children.length);
    }

    static createLabel(logText: string, type: ItemType, childCount: number = 0): string {
        
        let date: string = LogTreeItem.extractDateFromLogText(logText);

        switch (type) {
            case ItemType.CommonRoot:
                if (childCount > 0) {
                    return `Allgemein (${childCount})`;
                } else {    
                    return 'Allgemein';
                }    

            case ItemType.ExceptionRoot:
                if (childCount > 0) {
                    return `Exceptions (${childCount})`;
                } else {
                    return 'Exceptions';    
                }    

            case ItemType.Start:
                return '[START WildFly] - ' + date;
        
            case ItemType.Started:
                return '[STARTED WildFly] - ' + date;

            case ItemType.Deployed:
                return '[DEPLOYED WildFly] - ' + date;

            case ItemType.Stopped:
                return '[STOPPED WildFly] - ' + date;
                
            case ItemType.Exception:
                return '[EXCEPTION WildFly] - ' + date;

            default:
                return '[UNKNOWN] - ' + date;
        }
    }

    static extractDateFromLogText(logText: string): string {
        if (REGEX_ISO_DATE.test(logText) && REGEX_TIME.test(logText)) {
            return logText.match(REGEX_ISO_DATE).groups[1];
        } else if(REGEX_LOCAL_DATE.test(logText) && REGEX_TIME.test(logText)) {
            return logText.match(REGEX_LOCAL_DATE).groups[1];
        }

        return logText.slice(0, 19);       
    }

    public toString(): string {
        return `Label: ${this.label}, Line: ${this.line}, Type: ${this.type}, State: ${this.collapsibleState}`;
    }
}