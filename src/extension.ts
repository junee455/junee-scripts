// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { emitKeypressEvents } from 'readline';
import { KeyObject } from 'crypto';
import { eventNames } from 'cluster';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let currentSelection: vscode.Selection | undefined;

let isStickySelectionActive = false;

let eventHandlerDisposer: vscode.Disposable | undefined;

let charBeingRevealed = false;

export function activate(context: vscode.ExtensionContext) {
	
	let findCharInLine = vscode.commands.registerTextEditorCommand('junee.findCharInLine', (ed, edit, args) => {
		
		if(ed) {
			let cursor = ed.selection.active;
			let line = ed.document.lineAt(cursor.line).text;
			line = line.slice(cursor.character);
			
			let typeCommand = vscode.commands.registerCommand('type', (char) => {
				let charPosition = 0;
				if(char.text == line[0]) {
					line = line.slice(1);
					charPosition += 1;
				}
				charPosition += line.indexOf(char.text);
				cursor = cursor.translate(0, charPosition);
				ed.selection = new vscode.Selection(cursor, cursor)
				ed.revealRange(ed.selection);
				typeCommand.dispose();
			});
			

		}
	});	
	
	let findCharInLineBackward = vscode.commands.registerTextEditorCommand('junee.findCharInLineBackward', (ed) => {
		if(ed) {
			let cursor = ed.selection.active;
			let line = ed.document.lineAt(cursor.line).text;
			line = line.split('').splice(0, cursor.character).join('');
			
			let typeCommand = vscode.commands.registerCommand('type', (char) => {
				let charPosition = 0;
				charPosition -= line.split('').reverse().join('').indexOf(char.text);
				cursor = cursor.translate(0, charPosition - 1);
				ed.selection = new vscode.Selection(cursor, cursor)
				ed.revealRange(ed.selection);
				typeCommand.dispose();
			});
		}	
		
		
	});
	
	let toggleStickySelection = vscode.commands.registerTextEditorCommand('junee.toggleStickySelection', (ed) => {

		if(ed && !isStickySelectionActive) {
			// init sticky selection
			isStickySelectionActive = true;
			console.log("sticky inited");
			eventHandlerDisposer = vscode.window.onDidChangeTextEditorSelection((e) => {
				let selection = e.selections[0];
				if(!currentSelection) {
					currentSelection = new vscode.Selection(selection.anchor, selection.active);
					console.log("new currentSelection");
				}
				
				
				currentSelection.active = new vscode.Position(selection.active.line, selection.active.character);
				

				console.log("move event");

			});
		} else {
			isStickySelectionActive = false;
			currentSelection = undefined;
			eventHandlerDisposer?.dispose();
			console.log("sticky disposed");
		}
	});	
	
	// done
	let swapCursorPosition = vscode.commands.registerCommand('junee.swapCursorPosition', () => {
		
		let activeTextEditor = vscode.window.activeTextEditor;
		if(activeTextEditor) {
			let end = activeTextEditor.selection.end;
			let start = activeTextEditor.selection.start;
			let anchor = activeTextEditor.selection.anchor;
			
			if(anchor.compareTo(end)) {
				anchor = end;
				end = start;
			}
			else {
				anchor = start;
			}
			
			let newSelection = new vscode.Selection(anchor, end);
			
			activeTextEditor.selection = newSelection;
			activeTextEditor.revealRange(activeTextEditor.selection);
		}
	});
	
	context.subscriptions.push(findCharInLine);
	context.subscriptions.push(findCharInLineBackward);
	context.subscriptions.push(toggleStickySelection);
	context.subscriptions.push(swapCursorPosition);
}

// this method is called when your extension is deactivated
export function deactivate() {}
