import { AfterViewInit, Component, Directive, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { ApplicationVersion, AssignedMicrofrontend, Microfrontend } from "../../model";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { NG_VALIDATORS, Validator, AbstractControl, NgControl, AbstractControlDirective, FormsModule } from "@angular/forms";
import { MatFormField, MatFormFieldModule } from "@angular/material/form-field";
import { ArraySuggestionProvider, NgModelSuggestionsDirective, SuggestionProvider, VersionRange } from "@modulefederation/portal";
import { MatIconModule } from "@angular/material/icon";
import { CommonModule } from "@angular/common";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";


@Directive({
    selector: '[versionValidator]',
    standalone: true,
    providers: [{
      provide: NG_VALIDATORS,
      useExisting: VersionValidatorDirective,
      multi: true
    }]
  })
  export class VersionValidatorDirective implements Validator {
    // implement Validator

    validate(control: AbstractControl) : {[key: string]: any} | null {
        try {
            new VersionRange(control.value)

            return null
        }
        catch(e) {
            return {
                'versionInvalid': true
            };
        }
    }
  }

  @Directive({
    selector: '[microfrontendValidator]',
    standalone: true,
    providers: [{
      provide: NG_VALIDATORS,
      useExisting: MicrofrontendValidatorDirective,
      multi: true
    }]
  })
  export class MicrofrontendValidatorDirective implements Validator {
    // constructor

    constructor() {
    }

    // implement Validator

    validate(control: AbstractControl) : {[key: string]: any} | null {
     /*TODO if (this.feature!.microfrontends.find(mfe => mfe.name === control.value) === undefined)
        return {
            'microfrontendInvalid': true
        };*/

      return null;
    }
  }

@Component({
    standalone: true,
    selector: '[showErrors]',
    template: '{{ error }}'
})
export class MatErrorMessagesComponent implements AfterViewInit {
    // instance data

    public error = ''
    private control: NgControl | AbstractControlDirective | null = null

    // constructor

    constructor(private formField: MatFormField, private feature: AssignedMicrofrontendsComponent) {
    }

    /// implement AfterViewInit

    public ngAfterViewInit(): void {
        this.control = this.formField._control.ngControl;

        // sub to the control's status stream

        this.control?.statusChanges!.subscribe(this.updateErrors);
    }

    // private

    private updateErrors = (state: 'VALID' | 'INVALID'): void => {
        this.feature.state((<any>this.control)["name"], state)

        if (state === 'INVALID') {
            // active errors on the FormControl

            const controlErrors = this.control!.errors!

            // just grab one error

            const firstError = Object.keys(controlErrors)[0]

            if (firstError === 'required')
                this.error = 'This field is required.'

            else if (firstError === 'versionInvalid')
                this.error = "invalid version specifier"

            else if (firstError === 'microfrontendInvalid')
                this.error = "unknown microfrontend"
        }
    };
}

export interface AssignedMicrofrontendRow {
    isSelected: boolean;
    isEdit: boolean;

    data: AssignedMicrofrontend
  }

export const Columns = [
    {
      key: 'isSelected',
      type: 'isSelected',
      label: '',
    },
    {
      key: 'microfrontend',
      type: 'mfe',
      label: 'Name',
      required: true,
    },
    {
        key: 'version',
        type: 'text',
        label: 'Version',
        required: true,
      },
      {
        key: 'isEdit',
        type: 'isEdit',
        label: '',
      },
]

@Component({
    standalone: true,
    selector: 'assigned-microfrontends',
    templateUrl: "./assigned-microfrontends.component.html",
    styleUrls: ["./assigned-microfrontends.component.scss"],
    imports: [
        CommonModule,

        FormsModule,

        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatCheckboxModule,
        MatTableModule,


        NgModelSuggestionsDirective,
        MatErrorMessagesComponent,
        MicrofrontendValidatorDirective,
        VersionValidatorDirective
    ]
})
export class AssignedMicrofrontendsComponent  implements OnInit, OnChanges {
   // inputs

    @Input() applicationVersion! : ApplicationVersion
    @Input() microfrontends! : Microfrontend[]

    // outputs

    @Output() dirty = new EventEmitter<boolean>();

    // instance data

    dataSource! : MatTableDataSource<AssignedMicrofrontendRow>

    errors : any = {}
    suggestionProvider : SuggestionProvider = new ArraySuggestionProvider([])

   setDirty(dirty = true) {
    this.dirty.emit(dirty)
   }

   // NEW TODO

   state(control: string, state: 'VALID' | 'INVALID') {
       if (state == "INVALID")
          this.errors[control] = true
       else
           delete this.errors[control]
   }

   canFinishEdit() {
       return Object.getOwnPropertyNames(this.errors).length == 0
   }

   displayedColumns: string[] = Columns.map((col) => col.key)
     columnsSchema: any = Columns

     finishEdit(row: AssignedMicrofrontendRow) {
       row.isEdit = false

       this.setDirty()
     }

     addRow() {
       const newRow: AssignedMicrofrontendRow = {
         isEdit: true,
         isSelected: false,
         data: {
           microfrontend: "",
           version: ""
         }
       }
       this.applicationVersion?.assignedMicrofrontends.push(newRow.data)
       this.dataSource.data = [newRow, ...this.dataSource.data]

       this.setDirty()
     }

     removeRow(row: AssignedMicrofrontendRow) {
       this.dataSource.data.splice(this.dataSource.data.indexOf(row), 1)
       this.applicationVersion?.assignedMicrofrontends.splice(this.applicationVersion?.assignedMicrofrontends.indexOf(row.data), 1)

       this.dataSource.data = [...this.dataSource.data]

       this.setDirty()
     }

     removeSelectedRows() {
       //const users = this.dataSource.data.filter((u: AssignedMicrofrontend) => u.isSelected)
       /*this.dialog
         .open(ConfirmDialogComponent)
         .afterClosed()
         .subscribe((confirm) => {
           if (confirm) {
             this.userService.deleteUsers(users).subscribe(() => {
               this.dataSource.data = this.dataSource.data.filter(
                 (u: User) => !u.isSelected,
               )
             })
           }
         })*/
     }

     /*
     isAllSelected() {
       return this.dataSource.data.every((item) => item.isSelected)
     }

     isAnySelected() {
       return this.dataSource.data.some((item) => item.isSelected)
     }

     selectAll(event: any) {
       this.dataSource.data = this.dataSource.data.map((item) => ({
         ...item,
         isSelected: event.checked,
       }))
     }*/

       // NEW TODO

  // implement OnChanges

  ngOnChanges(changes: SimpleChanges): void {
    this.dataSource = new MatTableDataSource<AssignedMicrofrontendRow>(
      this.applicationVersion.assignedMicrofrontends.map(assigned => {
          return {
              isSelected: false,
              isEdit: false,
              data: assigned
          }
      })
  )

 this.suggestionProvider = new ArraySuggestionProvider(this.microfrontends.map(microfrontend => microfrontend.name))
  }

   // implement OnInit

   ngOnInit(): void {
     this.dataSource = new MatTableDataSource<AssignedMicrofrontendRow>(
             this.applicationVersion.assignedMicrofrontends.map(assigned => {
                 return {
                     isSelected: false,
                     isEdit: false,
                     data: assigned
                 }
             })
         )

        this.suggestionProvider = new ArraySuggestionProvider(this.microfrontends.map(microfrontend => microfrontend.name))
   }
}
