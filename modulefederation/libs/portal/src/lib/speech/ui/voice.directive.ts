import { Directive, ElementRef, Input, OnDestroy, OnInit } from "@angular/core"
import { MicrofoneComponent } from "./microfone.component"
import { SpeechRecognitionManager } from "../speech-recognition-manager"

export interface VoiceInputOption {
    icon: MicrofoneComponent
}

@Directive({
    selector: '[voiceInput]',
    standalone: true
})
export class VoiceInputDirective implements OnInit, OnDestroy {
    // input

    @Input('voiceInput') options!: VoiceInputOption;

    // instance data

    input: HTMLInputElement
    icon!: MicrofoneComponent
    isFocused = false
    subscription : (() => void) | undefined

    // constructor

    constructor(private speechRecognitionManager: SpeechRecognitionManager, private elementRef : ElementRef<HTMLInputElement>) {
        this.input =  this.elementRef.nativeElement

      this.input.addEventListener('focus', (_: Event) => this.focus(true))
      this.input.addEventListener('blur', (_: Event) => this.focus(false))
    }

    // private

    private handleResult(result: string) :boolean {
        if ( result == "")
            return false

        const start = this.input.selectionStart || 0
        const end   = this.input.selectionEnd || 0

        const prefix =  this.input.value.substring(0, start)
        const suffix =  this.input.value.substring(end)

        this.elementRef.nativeElement.value = prefix + result + suffix

        // replace or insert

        if (end -  start > 0)
            this.input.setSelectionRange(start +  result.length, start + result.length)
        else
            this.input.setSelectionRange(start + result.length, end + result.length)

        this.input.dispatchEvent(new InputEvent('input', { bubbles: true }));

        return true
    }

    private focus(focus: boolean) {
        this.isFocused = focus

        this.icon.visibility(focus)

        if ( focus )
            this.subscription = this.speechRecognitionManager.addListener(result => this.handleResult(result.result!), 10)
        
        else {
            if ( this.subscription) {
                this.subscription();
                this.subscription = undefined
            }
        }
    }

    // implement OnInit

    ngOnInit(): void {
        this.icon = this.options.icon
    }

    // implement OnDestroy

    ngOnDestroy(): void {
        if ( this.subscription) {
            this.subscription();
            this.subscription = undefined
        }
    }
  }
