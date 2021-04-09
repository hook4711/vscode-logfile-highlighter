import * as vscode from 'vscode';
import { TreeItem } from 'vscode';

export class LogTreeItem extends TreeItem {
    line: number;

    constructor(label: string, line: number) {
        super(label);
        this.line = line;
    }

    public toString(): string {
        return `Label: ${this.label}, Line: ${this.line}`;
    }
}