import { randomFill } from 'crypto';
import * as vscode from 'vscode';
import { TreeItem } from 'vscode';
import { ItemType, REGEX_ISO_DATE, REGEX_LOCAL_DATE, REGEX_TIME } from './const';

export class LogTreeItem extends TreeItem {
    public logText: string;
    public line   : number;
    public type   : ItemType;

    readonly children: LogTreeItem[] = [];

    constructor(logText: string, line: number, type: ItemType = ItemType.Unknown, collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.Collapsed) {
        super("unknown", collapsibleState);
    
        this.logText = logText;
        this.line    = line;
        this.type    = type;
        this.label   = this.createLabel();
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
        this.label = this.createLabel();
    }

    createLabel(): string {
        
        let date: string = this.extractDateFromLogText(this.logText);

        switch (this.type) {
            case ItemType.CommonRoot:
                if (this.children.length > 0) {
                    return `Allgemein (${this.children.length})`;
                } else {    
                    return 'Allgemein';
                }    

            case ItemType.ExceptionRoot:
                if (this.children.length > 0) {
                    return `Exceptions (${this.children.length})`;
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
                return '[EXCEPTION WildFly] - ' + date + ' -> ' + this.getExceptionFromLine();

            default:
                return '[UNKNOWN] - ' + date;
        }
    }

    extractDateFromLogText(logText: string): string {
        if (REGEX_ISO_DATE.test(logText) && REGEX_TIME.test(logText)) {
            return logText.match(REGEX_ISO_DATE).groups[1];
        } else if(REGEX_LOCAL_DATE.test(logText) && REGEX_TIME.test(logText)) {
            return logText.match(REGEX_LOCAL_DATE).groups[1];
        }

        return logText ? logText.slice(0, 19) : '';       
    }

    getExceptionFromLine(): string {
        let match = this.logText.match('.*:\\s(.*xception).*');

        if (match && match.length > 0) {
            return match[1];
        }

        return "<unknown>";
    }

    toString(): string {
        return `Label: ${this.label}, Line: ${this.line}, Type: ${this.type}, State: ${this.collapsibleState}`;
    }
}