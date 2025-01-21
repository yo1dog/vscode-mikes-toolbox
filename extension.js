const vscode = require('vscode');

module.exports = {
  /** @param {vscode.ExtensionContext} context */
  activate(context) {
    Object.entries({
      'encodeURI': () => transformSelectedText(text => encodeURIComponent(text)),
      'decodeURI': () => transformSelectedText(text => decodeURIComponent(text)),
      'encodeBase64': () => transformSelectedText(text => btoa(text)),
      'decodeBase64': () => transformSelectedText(text => atob(text)),
      'escapeSH': () => transformSelectedText(text => `'${text.replaceAll(`'`, `'\\''`)}'`),
    }).forEach(([key, cmd]) =>
      context.subscriptions.push(vscode.commands.registerTextEditorCommand(`yo1dog.mikes-toolbox.${key}`, cmd))
    );
  },
  
  deactivate() {},
};

/** @param fn {(text: string) => string} */
function transformSelectedText(fn) {
  const textEditor = vscode.window.activeTextEditor;
  if (!textEditor) return;
  
  /** @type {[vscode.Selection, string][]} */
  const updates = [];
  for (const selection of textEditor.selections) {
    if (selection.isEmpty) continue;
    const text = textEditor.document.getText(selection);
    
    let newText;
    try {
      newText = fn(text);
    } catch(err) {
      vscode.window.showErrorMessage(
        `Selection at Ln ${selection.start.line + 1}, Char ${selection.start.character + 1} failed: ${/**@type {Error}*/(err).message}`,
      );
      return;
    }
    if (newText === undefined) continue;
    
    updates.push([selection, newText]);
  }
  
  if (updates.length === 0) return;
  
  textEditor.edit(textEditorEdit => {
    for (const [range, newText] of updates) {
      textEditorEdit.replace(range, newText);
    }
  });
}
