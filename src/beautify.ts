import {
  commands,
  Disposable,
  languages,
  Position,
  Range,
  TextDocument,
  TextEdit,
  TextEditor,
  TextEditorEdit,
  window,
} from 'vscode'

import { isMJMLFile } from './helper'

import prettier from 'prettier'

export default class Beautify {
  constructor(subscriptions: Disposable[]) {
    subscriptions.push(
      languages.registerDocumentFormattingEditProvider(
        {
          language: 'mjml',
          scheme: 'file',
        },
        {
          async provideDocumentFormattingEdits(document: TextDocument): Promise<TextEdit[]> {
            const formattedDocument: string | undefined = await prettier.format(
              document.getText(),
              {
                parser: 'html',
                printWidth: 240,
                singleQuote: true,
              },
            )

            if (formattedDocument) {
              return [TextEdit.replace(getRange(document), formattedDocument)]
            }

            return [TextEdit.replace(getRange(document), document.getText())]
          },
        },
      ),

      commands.registerCommand('mjml.beautify', () => {
        this.beautify()
      }),
    )
  }

  private async beautify(): Promise<void> {
    const activeTextEditor: TextEditor | undefined = window.activeTextEditor

    if (activeTextEditor && isMJMLFile(activeTextEditor.document)) {
      activeTextEditor.edit(async (editBuilder: TextEditorEdit) => {
        const formattedDocument: string | undefined = await prettier.format(
          activeTextEditor.document.getText(),
          {
            parser: 'html',
            printWidth: 240,
            singleQuote: true,
          },
        )

        if (formattedDocument) {
          editBuilder.replace(getRange(activeTextEditor.document), formattedDocument)
        }
      })
    } else {
      window.showWarningMessage('This is not a MJML document!')

      return
    }
  }
}

function getRange(document: TextDocument): Range {
  return new Range(
    new Position(0, 0),
    new Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length),
  )
}
