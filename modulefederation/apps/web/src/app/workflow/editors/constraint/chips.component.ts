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
import { StringBuilder, Type, TypeParser } from "@modulefederation/common";
import { ArraySuggestionProvider, NgModelSuggestionsDirective } from "@modulefederation/portal";
  

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

      // portal

      NgModelSuggestionsDirective
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

    value = ""
    items: Chip[] = []
    possibleConstraints: string[] = []
    suggestionProvider!: ArraySuggestionProvider;

    // constructor
  
    constructor(private cd: ChangeDetectorRef) {
    }

    // public
  
    public onChipBarClick(): void {
      //this.inputField.nativeElement.focus();
    }
  
    public removeItem(i: number): void {
      this.possibleConstraints.push(this.items[i].name)

      this.items.splice(i, 1);

      this.triggerChange(); // call trigger method
    }
  
    public removeAll(): void {
      while (this.items.length > 0) {
        this.possibleConstraints.push(this.items[0].name)
        this.items.splice(0, 1);
      }

      this.triggerChange(); // call trigger method
    }

    triggerChange(): void {
      this.onChange(this.value = this.format())
    }
  
    public onKeyDown(event: KeyboardEvent, value: string): void {
      switch (event.keyCode) {
        case 13:
        case 188: {
          if (value && value.trim() !== ""  && this.possibleConstraints.includes(value.trim()))  {
            const constraint = value.trim()
            
            const newChip : Chip = {
              name: constraint,
              arguments: TypeParser.constraintArguments(this.type, constraint).map(argument => { return {
                name: argument,
                type: argument,
                value: argument === "string" ? "" : 0
              }})
              
            }

            this.possibleConstraints.splice(this.possibleConstraints.indexOf(constraint), 1)
        
            this.items = [...this.items, newChip];
            this.triggerChange(); // call trigger method
            
            this.inputField.nativeElement.value = "";

            event.preventDefault();
          }
          break;
        }
        case 8: {
          if (!value && this.items.length > 0) {
            this.items.pop();
            this.items = [...this.items];
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

    private setup(value: string) {
      this.possibleConstraints = TypeParser.supportedConstraints(this.type)

      this.suggestionProvider = new ArraySuggestionProvider(this.possibleConstraints)


      const constraint = TypeParser.parse(this.type, value)

      this.items = []

      for ( const test of constraint.tests) {
        if ( test.name !== "type") {
          const args : ChipArgument[] = []

          for ( const key of Object.keys(test.params)) {
            // remove from possible constraints

            this.possibleConstraints.splice(this.possibleConstraints.indexOf(key), 1)

            args.push({
              name: key,
              type: typeof test.params[key], // TODO
              value: test.params[key]
            })
          } // for
          
          this.items.push({
            name: test.name,
            arguments: args
          })
        }
      } 
    }

    // implement OnChanges

    ngOnChanges(changes: SimpleChanges): void {
      if ( changes["type"] && !changes["type"].isFirstChange()) {
        if ( changes["type"].currentValue !== this.type)
          this.setup(this.value)
      }
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