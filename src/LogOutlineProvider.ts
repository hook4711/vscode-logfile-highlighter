import * as vscode from 'vscode';
import { TreeItem } from 'vscode';
import { LogTreeItem } from './LogTreeItem';

export class LogOutlineProvider implements vscode.TreeDataProvider<LogTreeItem> {

	private _onDidChangeTreeData: vscode.EventEmitter<LogTreeItem | null> = new vscode.EventEmitter<LogTreeItem | null>();
	readonly onDidChangeTreeData: vscode.Event<LogTreeItem | null> = this._onDidChangeTreeData.event;

	private editor: vscode.TextEditor;
	private autoRefresh = true;

    private root: LogTreeItem[];

	constructor(private context: vscode.ExtensionContext) {
        console.log('constructor');

		vscode.window.onDidChangeActiveTextEditor(() => this.onActiveEditorChanged());
		vscode.workspace.onDidChangeTextDocument(e => this.onDocumentChanged(e));
		
        this.parseTree();
		
        this.autoRefresh = vscode.workspace.getConfiguration('logFileHighlighter').get('autorefresh');
		vscode.workspace.onDidChangeConfiguration(() => {
			this.autoRefresh = vscode.workspace.getConfiguration('logFileHighlighter').get('autorefresh');
		});
		
        this.onActiveEditorChanged();
	}

	refresh(offset?: LogTreeItem): void {
        console.log('refresh');

		this.parseTree();

		if (offset) {
			this._onDidChangeTreeData.fire(offset);
		} else {
			this._onDidChangeTreeData.fire(undefined);
		}
	}

	private onActiveEditorChanged(): void {
        console.log('onActiveEditorChanged');

		if (vscode.window.activeTextEditor) {
			if (vscode.window.activeTextEditor.document.uri.scheme === 'file') {
				
                const enabled = vscode.window.activeTextEditor.document.languageId === 'log' || 
                                vscode.window.activeTextEditor.document.languageId === 'logfile';
				
                vscode.commands.executeCommand('setContext', 'logOutlineEnabled', enabled);
				console.log('onActiveEditorChanged => ' + enabled);

                if (enabled) {
					this.refresh();
				}
			}
		} else {
			vscode.commands.executeCommand('setContext', 'logOutlineEnabled', false);
		}
	}

	private onDocumentChanged(changeEvent: vscode.TextDocumentChangeEvent): void {
        console.log('onDocumentChanged');

		if (this.autoRefresh && changeEvent.document.uri.toString() === this.editor.document.uri.toString()) {
			for (const change of changeEvent.contentChanges) {

            }
		}
	}

	private parseTree(): void {
        console.log('parseTree!');

		this.editor = vscode.window.activeTextEditor;

        if (this.editor && this.editor.document) {
			this.root = [];
            this.root.push(new LogTreeItem('root', -1));
		}
	}

	getChildren(parent?: LogTreeItem): LogTreeItem[] {

		if (parent) {
			console.log('getChildren => ' + parent.toString());
            
			//return Promise.resolve(this.getChildrenOffsets(node));
		} else {
            console.log('getChildren => nix');
            
            return this.root;
			//return Promise.resolve(this.tree ? this.getChildrenOffsets(this.tree) : []);
		}

        return undefined;
	}

	getTreeItem(element: LogTreeItem): LogTreeItem {
        console.log(element.toString());
		return new LogTreeItem("my first item", vscode.TreeItemCollapsibleState.Collapsed);
	}

	select(range: vscode.Range) {
        console.log('select');
		this.editor.selection = new vscode.Selection(range.start, range.end);
	}
}