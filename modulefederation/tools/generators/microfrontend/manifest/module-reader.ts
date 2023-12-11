import {readFileSync} from "fs"
import {createSourceFile, isDecorator, Node, ScriptTarget} from "typescript"

const { find } = require("find-in-files")

export type Modules = {[module: string] : string }

export class ModuleReader {

  // private

  private async findDecorators(text: string, folder: string): Promise<string[]> {
    let matches = await find(text, folder, ".ts$")
      //.filter((file) => !file.includes(".test"))

    return Object.keys(matches)
  }

  private isDecoratorWithName(node: any) {
    return isDecorator(node) && (<any>node.expression).expression.escapedText === "NgModule"
  }

  private parseFile(file: string, matches: Modules) {
    const sourceCode = readFileSync(file, "utf-8")
    const sourceFile = createSourceFile(file, sourceCode, ScriptTarget.Latest, true)

    // local function

    const visit = (node: Node) => {
      if (this.isDecoratorWithName(node)) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const componentName = (<any>node).parent.name.escapedText

        //console.log(`${sourceFile.fileName} line ${line + 1}: @NgModule for ${componentName}`)

        matches[componentName] = sourceFile.fileName
      }
      else node.forEachChild(visit)
    }

    // start traversal

    visit(sourceFile)
  }

  // public

  async readModules(folder: string) :Promise<Modules> {
    let result = {}

    for (let file of await this.findDecorators("NgModule", folder))
      this.parseFile(file, result)

    return result
  }
}
