import { OverlayModule } from "@angular/cdk/overlay";
import { CommonModule } from "@angular/common";
import {
    ChangeDetectorRef,
    Component,
    forwardRef,
    Input,
    OnChanges,
    SimpleChanges,
    ViewChild
  } from "@angular/core";
  import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { StringBuilder, TypeParser } from "@modulefederation/common";
import { ObjectTreeComponent } from "@modulefederation/form/designer";
import { ArraySuggestionProvider, NgModelSuggestionsDirective, SuggestionProvider } from "@modulefederation/portal";

interface ChipArgument {
  name?: string,
  type: string
  value: any
}

interface Chip {
   name: string,
   arguments: ChipArgument[]
}

@Component({
    selector: "chips",
    templateUrl: "./chips.component.html",
    styleUrls: ["./chips.component.scss"],
    standalone: true,
    imports: [
      // angular

      CommonModule,
      FormsModule,

      // material

      MatIconModule,
      OverlayModule,

      // portal

      NgModelSuggestionsDirective,
      ObjectTreeComponent
    ],
    providers: [{
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ChipsComponent),
      multi: true
    }],
    //changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class ChipsComponent implements ControlValueAccessor, OnChanges{
    // input

    @Input() type!: string
    @Input() public placeholder = "Add..."
    @Input() public removable = true

    // instance data

    @ViewChild("inputField") public inputField: any

    onChange = (value: string) : void => {}
    onTouched = () : void => {}

    showOverlay = false
    tree?: ObjectTreeComponent

    inputValue = ""
    value = ""
    items: Chip[] = []
    possibleConstraints: string[] = []
    possibleConstraintsObject = {}
    suggestionProvider!: SuggestionProvider;

    // constructor

    constructor(private cd: ChangeDetectorRef) {
    }

    // public

    onCreateOverlay(tree: ObjectTreeComponent) {
      this.tree = tree

      this.suggestionProvider = this.tree.suggestionProvider

      this.tree?.applyFilter(this.inputValue)
    }

    onDestroyOverlay(tree: ObjectTreeComponent) {
      this.tree = undefined

      this.suggestionProvider = new ArraySuggestionProvider([]);
    }

    asObject(constraints: string[]) {
        return constraints.reduce((result : any, constraint) => {
            result[constraint] = true

            return result
        }, {})
    }

    focus(focus: boolean) {
      if ( focus )
        this.showOverlay = focus
      else
        setTimeout(() =>  this.showOverlay = focus, 100) // if we click on the tree it should still be able to emit the selection
    }

    public onChipBarClick(): void {
      //this.inputField.nativeElement.focus();
    }

    public removeItem(i: number): void {
      this.items.splice(i, 1);

      this.updatePossibleConstraints()

      this.triggerChange(); // call trigger method
    }

    public removeAll(): void {
      this.items.length = 0

      this.updatePossibleConstraints()
      this.triggerChange(); // call trigger method
    }

    triggerChange(): void {
      this.onChange(this.value = this.format())
    }

    valueChange(value: string) {
      this.inputValue = value

      this.tree?.applyFilter(this.inputValue)
    }

   addChip(constraint: string) {
      const newChip : Chip = {
        name: constraint,
        arguments: TypeParser.constraintArguments(this.type, constraint).map(argument => { return {
          name: argument,
          type: argument,
          value: argument === "string" ? "" : 0
        }})
  
      }

      this.items = [...this.items, newChip];

      this.updatePossibleConstraints()

      this.inputValue = ""

      this.triggerChange(); // call trigger method

      // we need a new position
      this.showOverlay = false
      setTimeout(() => this.showOverlay = true, 0)
    }

    public onKeyDown(event: KeyboardEvent, value: string): void {
      switch (event.keyCode) {
        case 13:
        case 188: {
          if (value && value.trim() !== ""  && this.possibleConstraints.includes(value.trim()))  {
            const constraint = value.trim()

            this.addChip(constraint)

            this.inputValue = ""
  
            event.preventDefault();
          }
          break;
        }
        case 8: {
          if (!value && this.items.length > 0) {
            this.items.pop();
            this.items = [...this.items];

            this.inputValue = ""

            // we need a new position
            this.showOverlay = false
            setTimeout(() => this.showOverlay = true, 0)

            this.triggerChange(); // call trigger method
          }
          break;
        }
        default:
          break;
      }
    }

   format() : string {
      const builder = new StringBuilder()

      let first = true
      if ( this.items.length > 0) {
        for ( const item of this.items) {
          if (!first)
            builder.append(" ")
          else
            first = false

          builder.append(item.name)

          if ( item.arguments.length > 0) {
            for ( const arg of item.arguments) {
              builder.append(" ")
              builder.append(arg.value)
            }
          } // if
        } // for
      } // if

      return builder.toString()
    }

     private updatePossibleConstraints() {
        this.possibleConstraints = TypeParser.supportedConstraints(this.type)

        for (const item of this.items)
          this.possibleConstraints.splice(this.possibleConstraints.indexOf(item.name), 1)

        this.possibleConstraintsObject = this.asObject(this.possibleConstraints)
      }

    private setup(value: string) {
      this.possibleConstraints = TypeParser.supportedConstraints(this.type)

      this.suggestionProvider = new ArraySuggestionProvider(this.possibleConstraints)


      const constraint = TypeParser.parse(this.type, value)

      this.items = []

      for ( const test of constraint.tests) {
        if ( test.name !== "type") {
          const args : ChipArgument[] = []

          for ( const key of Object.keys(test.params))
            args.push({
              name: key,
              type: typeof test.params[key], // TODO
              value: test.params[key]
            })

          this.items.push({
            name: test.name,
            arguments: args
          })
        }
      }

      this.updatePossibleConstraints()
      this.suggestionProvider = new ArraySuggestionProvider(this.possibleConstraints)
    }

    // implement OnChanges

    ngOnChanges(changes: SimpleChanges): void {
      if ( changes["type"] )
          this.setup(this.value)
    }

    // implement ControlValueAccessor

    writeValue(value: string): void {
      if ( typeof value === "string" ) {
        this.value = value

        this.setup(value)
      } // if

      this.cd.markForCheck()
    }

    registerOnChange(fn: (value: string) => void): void {
      this.onChange = fn
    }

    registerOnTouched(fn: () => void): void {
      this.onTouched = fn
    }
  }
