import { TestBed } from '@angular/core/testing';
import { StateManagerModule } from './state.module';
import { RestoreState, State, Stateful } from './stateful.decorator';
import { StateManager } from './state-manager';




@Stateful()
class Bar {
    @State()
    name="bar"

    @RestoreState()
    restore(state: any) {
        console.log(state)
    }
}

@Stateful()
class Foo {
    @State()
    name = "foo"
    @State({recursive: true})
    bar : Bar = new Bar()

    @State({recursive: true})
    bars : Bar[] = [new Bar()]

    @RestoreState()
    restore(state: any) {
        console.log(state)
    }
}

describe('StateManagerModule', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StateManagerModule.forRoot()],
    });
  });

  it('initializes', () => {
    const module = TestBed.inject(StateManagerModule);

    const foo = new Foo()

    const state = StateManager.fetch(foo)

    console.log(state)

    StateManager.restore(foo, state)

    expect(module).toBeTruthy();
  });
});