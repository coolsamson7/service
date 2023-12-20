import { readFileSync } from "fs"
import { createPrinter, createSourceFile, isDecorator, ListFormat, NewLineKind, Node, ScriptTarget } from "typescript"
import { ApplyDecorator } from "./manifest-generator"

export class DecoratorReader {
  // instance data

  // constructor

  constructor(private file : string, private decoratorName : string, private multiple : boolean = false) {
  }

  // public

  read(apply : ApplyDecorator) : void {
    const sourceCode = readFileSync(this.file, "utf-8")
    const sourceFile = createSourceFile(this.file, sourceCode, ScriptTarget.Latest, true)
    const printer = createPrinter({newLine: NewLineKind.LineFeed})

    let match = false

    // local function

    const visit = (node : Node) => {
      if (this.isDecoratorWithName(node)) {
        const {line} = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const componentName = (<any>node).parent.name.escapedText

        //console.log(`${sourceFile.fileName} line ${line + 1}: ${this.decoratorName} for ${componentName}`)

        const argumentObject = (<any>node).expression.arguments[0]
        const {properties} = argumentObject

        const output = printer.printList(ListFormat.ObjectLiteralExpressionProperties, properties, sourceFile)

        const data = {...eval(`(${output})`)}

        if (match && !this.multiple)
          throw new Error(`expected @${this.decoratorName} only once`)

        match = true

        apply({
          decorator: this.decoratorName,
          file: this.file,
          lineNumber: line,
          decorates: componentName,
          data: data
        })
      }
      else node.forEachChild(visit)
    }

    // start traversal

    visit(sourceFile)
  }

  isDecoratorWithName(node : any) {
    return isDecorator(node) && (<any>node.expression).expression.escapedText === this.decoratorName
  }
}
