import { readFileSync } from 'fs';
import { createSourceFile, isDecorator, Node, ScriptTarget } from 'typescript';

import { find } from 'find-in-files'

export type Modules = { [module: string]: string };

export class ModuleReader {
  // private

  async readModules(folder: string): Promise<Modules> {
    const result = {};

    for (const file of await this.findDecorators('NgModule', folder))
      this.parseFile(file, result);

    return result;
  }

  private async findDecorators(
    text: string,
    folder: string
  ): Promise<string[]> {
    const matches = await find(text, folder, '.ts$');
    //.filter((file) => !file.includes(".test"))

    return Object.keys(matches);
  }

  private isDecoratorWithName(node: any) {
    return (
      isDecorator(node) &&
      (<any>node.expression).expression.escapedText === 'NgModule'
    );
  }

  // public

  private parseFile(file: string, matches: Modules) {
    const sourceCode = readFileSync(file, 'utf-8');
    const sourceFile = createSourceFile(
      file,
      sourceCode,
      ScriptTarget.Latest,
      true
    );

    // local function

    const visit = (node: Node) => {
      if (this.isDecoratorWithName(node)) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(
          node.getStart()
        );

        //console.log(`${sourceFile.fileName} line ${line + 1}: @NgModule`)

        const componentName = (<any>node).parent.name.escapedText;

        matches[componentName] = sourceFile.fileName;
      } else node.forEachChild(visit);
    };

    // start traversal

    visit(sourceFile);
  }
}
