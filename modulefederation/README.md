# Module Federation

## Motivation & Goals

So, why do we need another microfrontend project? The low-level technology ( e.g. module federation ) is pretty much established and there are lots of GitHub projects that demonstrate the basic features...

Well... the most use-cases you can find apply remote configuration during compile-time and only lately so called "_dynamic_ module federation" at least show how to get rid of this restriction.
Those example usually end with a sentence "and here you will get a dynamic configuration from somewhere"

This is exactly where we start here. This project is about a completely dynamic setup and infrastructure for microfrontend based applications including administration possibilities that allow you define what a specific user will actually see as an application.
The project is split in an Angular part, that defines the basic building bocks for client artifacts, starting with the logic required for the microservice part, but also covering a lot of other areas that are typically touched in any client-side project ( e.g. i18n, authentication, authorization, etc. )  

A server-side part is implemented as a Kotlin based Spring-Boot application, that acts as a central portal server that will take care of maintaining and distributing dynamic deployment information to the clients.

## Basic idea

### Portal Server

The basic idea is to have a central "portal server", that maintains ( either by pull or push-mechanisms ) meta-data of different microfrontends that can be combined in form of one or more applications.
The meta-data will cover several aspects
* basic connectivity information ( of course )
* additional meta-data on a microfrontend level ( enabled status, required permissions, etc.)
* full meta-data of all routable components including information on 
  * required permissions
  * required feature flags
  * categories and tags that can be interpreted during the runtime

With this information, and an appropriate administrative tool, administrators are able to configure appropriate combinations of microservices and features that are visible in a portal.

When a client boots, it will get a tailored deployment configuration in a first step, appropriate for an application in combination with a specific user, that will be interpreted by the runtime by
* setting up the microfrontend remoting configuration, and
* setting up the resulting router configuration

Tailored means, that different dynamic aspects - such as the current authorization context, feature flags, etc. ) are used to filter the set of available features / microfrontends.
Since we usually have a certain login-logic, this process is executed twice for the initial portal and the portal after successful login.

![img.png](img.png)

## Meta-Data

The overall logic is based on meta-data that describes the internal setup of a microfrontend.
Since we don't want to duplicate data ( e.g. typescript code and json configuration files ), a nx plugin has been implemented that is able to parse angular files and extract the corresponding information in form of a `manifest.json`
The basis for the extraction process are specific decorators, that are associated with feature components.

**Example**:

Given this component

```ts
@Feature({
   id: 'public-portal',
   visibility: ["public"],
   tags: ["portal"]
})
@Component({
   selector: 'public-portal',
   templateUrl: './public-portal-component.html',
   styleUrls: ["./public-portal-component.scss"]
})
export class PublicPortalComponent extends AbstractFeature {
   ...
}
```

the decorator `@Feature` is applied to extract its properties that end up in the `manifest.json`

```json
{
  "name": "my-microfrontend",
  "version": "0.1",
  "commitHash": "253c108b3fc289605e96fd654b99c7ab34c348fb",
  "module": "RemoteEntryModule",
  "features": [
    ...
    {
      "id": "public-portal",
      "label": "public-portal",
      "component": "PublicPortalComponent",
      "tags": ["portal"],
      "visibility": ["public"],
      "module": "PublicPortalModule"
    }
  ]
}
```
If you are wondering about that properties....
A standard logic of the microfrontend shell component is to render the portal frame based as well on meta-data.
In this case depending on an (non)existing user-session, a feature will be rendered, that defines that tag "portal" and has a corresponding visibility property which is either "public" ( user is _not yet_ logged in ) or "private" ( user _is_ logged in )

This file - as part of the microfrontend assets - is exactly the information read and maintained by the portal server.

Since we have already parsed and extracted meta-data from Angular code we can implement additional generators, that help to avoid writing boilerplate code. As part of the nx plugin, that primarily extracts the manifest.json, it will also
* create a `webpack.config.js`
* extract Angular routes, including the corresponding
* Router modules for both the top-level application and all lazy child components.

Especially hardcoded routes where always a pain in my eyes, since they are hard to read and error-prone to write and completely
contradict the idea of distributed components. Finally gone, puuu :-)

### Generic Portal

In order to allow maximum flexibility in providing and supporting completely different clients, it is essential, that the main application frame ( or usually in technical terms, the shell ) is a purely technical component without knowing,
what components it will exactly host. Required dependencies only relate to cross-functional topics suchs as authentication, i18n, etc.  

As a consequence the ui frame is also a dynamic component, that will be supplied in form of a particular microfrontend.
While the particular component will of course include some hardcoded logic, it makes sense to benefit as much as possible by utilizing metadata.
For example the display of navigation items can be easily abstracted by iterating over the existing features according to some logic ( e.f. features with the tag "navigation" should appear in a navigation component )

### Shared Portal Components

I never was a friend of using module federation just in order to allow guys to do whatever they want in a team ( starting with completely different technology stacks ). This is
pure anarchy in my eyes and especially a waste of time and money.
But there is more... Even with a single technology stack there are so many cross-functional use-cases that need to be solved in different areas, that it definitely makes sense to offer
a framework layer on top of the low-level solutions in order to streamline, simplify and most importantly increase developer productivity and raise code quality.
Part of the ( shared ) "portal" library deals with those use-cases by providing numerous solutions like
* i18n solution
* command pattern & command interceptors
* shortcut handling
* saving and restoring of states
* online help
* error handling
* communication 
* speech recognition
* tracing
* etc.

We will cover some of the topics in the following chapters...

# Roadmap

As long as not used and requested, or i can apply the code in a project, none... :-)

What comes to my mind is at least:

* migration to standalone components
* adding i18n and a more sophisticed ui ( searching, chapters, etc. ) to the help mechanism

# Reference

## @Feature

The decorator `@Feature` marks components as feature elements. It defines the following properties

* `id` the unique id within the microfrontend
* `parent` the optional parent id in case of hierarchical components / routes
* `router` additional hints for the router. The embedded object can override the route path via the `path` property.
* `label` optional label of the feature ( will defualt to the id if not provided )
* `labelKey` optional i18n resource key that will be used to retrieve a localized label.
* `description` optional description of the feature
* `icon` optional icon name tha can be used to render naviagtion entries
* `i18n` optional array of i18n namespaces that will be loaded before rendering the component
* `visibility` optional array of visibility properties ("private" and "public") that will control, if a feature should be available with or without a session. 
* `tags` optional array of tags that can be interpreted by the runtime
* `categories` optional array of categories that can be interpreted by teh runtime
* `permissions` optional array of permissions that are required to activate this feature
* `featureToggles` optional array of feature toggles that are required to activate this feature

The backend currently doesn't interpret the last three properties!

The corresponding nx plugin will find the decorators and extract the embedded properties.

## AbstractFeature

All features must derive from a base class `AbstractFeature`. While it adds some lifecycle methods and stores the injector , its main purpose is to be able to identify access all active features
during the runtime by linking features with their parents ( and vice versa ) resulting in an overall tree of features with one feature ( the portal itself ) as a root.

In order to be able to inject the direct parent, the decorator `@Feature` additionally adds the necessary injector information.

The implementation of features follow regular angular logic. In order to easily access common framework logic but avoid ugly class hierarchies, i have adopted mixins heavily.
A mixin is a typescript mechanism helping to write reusable logic by achieving a kind of multiple inheritance.
Mixins are functions that can be included in the extends clause and more or less add a base class that is a result of the function call.
The charm is that you can compose mixins by simpyl chaining the calls.

**Example**:

```
export class TranslationEditorComponent extends WithState<TranslationState>()(WithDialogs(WithSpeechCommands(WithCommands(AbstractFeature)))) {
   ...
}
```

This is really cool! :smile:

In the following sections a numebr of mixins will be introduced, that can be applied to features. 

## Feature-Outlet

The component `<feature-outlet>` is used to render a named feature by passing teh filly qualified name

Example:
```html
<feature-outlet [feature]="portal.path"></feature-outlet>
```

## FeatureRegistry

The singleton `FeatureRegistry` maintains all registered features during the runtime and can be used to find specific features by
* `getFeature(id: string) : FeatureData` 
* `findFeature(id: string): FeatureData | undefined`

or the most flexible method `find() : FeatureFinder` that offers a fluent interface to filter features.

Example:

```ts
const portals = featureRegistry.finder()
  .withTag('portal')
  .withVisibility('private')
  .find()
```
### Security Module

The module `SecurityModule` is used to configure three different aspects

* **authentication**<br>takes care of the authentication process to the system
* **authorization**<br>answers questions about assigned permissions of the current user
* **session management**<br>maintains the state of a session once a user is logged in.

#### Authentication

The class `Authentication` covers the authentication process
```ts
/**
 * an authentication request consisting of - at least - the user and password
 */
export interface AuthenticationRequest {
    /**
     * the user name
     */
    user : string;
    /**
     * the password
     */
    password : string;

    /**
     * any other parameters
     */
    [prop : string] : any;
}

export interface Ticket {
    /**
     * any ticket properties
     */
    [prop : string] : any;
}

export class Authentication<U = any, T extends Ticket = Ticket> {
    /**
     * return a combination of a user and ticket related to the specified authentication request.
     * @param request the authentication request
     */
    authenticate(request : AuthenticationRequest) : Observable<Session<U, T>> {
        return throwError(new AuthenticationException(request.user, 'no authentication configured'));
    }
}
```
A successful login will return a session object containing the user information and a ticket ( e.g. storing tokens ). 
Subclasses will add the corresponding generic parameters.

In the context of OIDC ( OpenID Connect ) , the class `OIDCAuthentication` is implemented, that also specifies the user
```ts
export interface OIDCUser {
    given_name : string
    family_name : string
    email : string
    email_verified : string
    name : string
    preferred_username : string
    sub : string

    // did we forget something?

    [prop : string] : any;
}
```
and the ticket information
```ts
export interface OIDCTicket extends Ticket {
    token : string
    refreshToken : string
}
```

#### Authorization

The class `Authorization` answers questions related to assigned permissions.
```ts
/**
 * authorization answers questions about granted permissions
 */
export class Authorization {
    /**
     * return true, if the current session has access to a specific permission, false otherwise.
     * @param permission the permission object
     */
    hasPermission(permission : string) : boolean {
        return true; // that's easy :-)
    }
}
```

The default always returns true.

#### Session management

Once a user has logged in, a session is created that captures the relevant data in form of the user information and any other aspects.

```ts
export interface Session<U = any, T extends Ticket = Ticket> {
    /**
     * the user object
     */
    user : U;
    /**
     * the ticket
     */
    ticket : T;
    /**
     * the session locale
     */
    locale? : string;

    /**
     * any other properties
     */
    [prop : string] : any;
}
```
The singleton `SessionManager` maintains the corresponding object.
The main methods are

* `start()`<br>execute any startup login ( e.g. required for teh derived OIDC class ) 
* `login()`<br>trigger the login process
* `logout()`<br>trigger the logout process
* `hasSession() : boolean`<br>return true, if a session is established
* `currentSession() : Session<U, T>`<br>return the current session
* `getUser() : U`<br>return the current user

A number of subjects can be subscribed to

* `authenticated$ = new BehaviorSubject<boolean>(false)`<br>emits events the relate to the authentication state
* `session$ = new BehaviorSubject<Session<any,Ticket> | undefined>(undefined)`<br>emits events the relate to the current session
* `events$ = new Subject<SessionEvent<any,Ticket>>()`<br>emits session events

Session events are
```ts
export interface SessionEvent<U=any,T extends Ticket = Ticket> {
    type: "opening" | "opened" | "closing" | "closed"
    session: Session<U,T> 
}
```
## Portal Manager

The `PortalManager` is the main component that takes care of the (microfrontend) routing logic and is configured in the main module.

**Example**:
```ts
import { localRoutes } from "./local.routes";
import * as localManifest from "../assets/manifest.json"

...

PortalModule.forRoot({
    loader: {
        // call the portal server!
        server: {}
        // this would read the remoteEntry.mjs by hand in case of a missing server :-)!
        //local: {
        //   remotes:["http://localhost:4201", "http://localhost:4202"]]
        //}
    },
    localRoutes: localRoutes,
    localManifest: localManifest,
    decorateRoutes: (route : Route) => {
        route.resolve = {i18n: I18nResolver}
        route.canActivate = [CanActivateGuard]
        route.canDeactivate = [CanDeactivateGuard]
    }
}),
```
Its main task is to load a specific deployment and establish and synchronize the angular routing.
The passed decorator is used to add properies to the angualr routes, in this case

* a resolver that preloads i18n namespaces
* a `canActivateGuard`, that checks if the feature is enabled
a `canDeactivateGuard`, that calls a possible `canDeactive()` method of the current component.

The interface
```ts
export abstract class DeploymentLoader {
    abstract load() : Promise<Deployment>
}
```
is used to load a deployment, given the interfaces
```ts
/**
* The microfrontend manifest data as stored in the manifest.json
*/
export interface Manifest extends ModuleMetadata {
    name : string,
    version : string,
    enabled? : boolean,
    health? : string,
    commitHash : string,
    remoteEntry? : string,
    healthCheck?: string,
    module : string,
    features : FeatureConfig[],
    folders : FolderData[],
}
/**
* a set of microfrontends
*/
export interface Deployment {
    modules : { [name : string] : Manifest }
}
```

All lazy routes have to be registered with the portal manager, since it will for example link feature information to the routes ( via the `data` property )

The static method `registerLazyroutes` is called for this purpose.
**Example**:
```
@NgModule({
  imports: [
    RouterModule.forChild(PortalManager.registerLazyRoutes('first-microfront.private-portal', routes)),
  ],

  exports: [RouterModule],
})
export class PrivatePortalRouterModule {}
```
The good news is, that this is not written by hand, since the nx plugin does the job already. :-)

Whenever the session state changes ( eg. login, logout ) the deployment has to be recomputed and routes adjusted accordingly.

**Example**:
```ts
logout() {
    this.sessionManager.closeSession().subscribe(
        (session) => {
            this.portalManager.loadDeployment(true).then(result =>
                this.router.navigate(["/"])
            )
        })
}
```
## I18N

Since a number of use-case require localization and the existing solutions ( e.g. transloco ) are way too bloated in my mind,
a small own solution has been implemented.

### LocaleManager

The service `LocaleManager` responsibility is to store the current ( and available ) locales.

It is configured with the module `LocaleManager`

Example:

```
LocaleModule.forRoot({
    locale: 'en-US',
    supportedLocales: ['en-US', 'de-DE'],
}) 
```

It offers a getter and setter for the locale

* `setLocale(locale : string | Intl.Locale)`
* `getLocale() : Intl.Locale`

Listeners can be informed about changes by subscribing to

* `subscribe(onLocaleChange : OnLocaleChange, priority  = 10) : () => void`

where
```
interface OnLocaleChange {
    /**
     * called whenever the current locale changes
     * @param locale the new locale
     */
    onLocaleChange(locale : Intl.Locale) : Observable<any>;
}
```
The priority is used to sort listeners ( smaller number are executed earlier )

## Translator

The main interface for translation purposes is `Translator`, that defines the main methods

* **`translate(key : string, options?: any) : string`** <br/>translate the key given optional options for interpolation
* **`translate$(key : string, options?: any) : Observable<string>`** <br/>translate the key given optional options for interpolation and return an observable

The internal logic relies on an i18n organization that separates between namespaces and names

A valid key contains a ':' that separates the two items

**Example**: "portal.commands:ok.label"

As you can see, both namespace and names are '.'-separated paths.
In reality ( also supported by an ui editor ) the name is only a pair of a name followed by a type.
Supported types are
* "label"<br/> the label
* "tooltip"<br/> tooltips that can be used in combnation with buttons
* "shortcut"<br/> localized shotrzcuts, e.g. "ctlr+z"
*  "speech"<br/> associated speech command 

A translator needs a loader that is responsible for loading translations
The interface is defined as

```
export abstract class I18nLoader {
    /**
     * load the specified namespace
     * @param locale the requested locale
     * @param namespace the requested namespace
     */
    abstract loadNamespace(locale : Intl.Locale, namespace : string) : Observable<any>;
}
```

Two implemenations are available
*  `ServerTranslationLoader`<br/>a loader that will call a rest service
* `AssetTranslationLoader`<br/>a loader that will retrieve static i18n json files from the assets

The module I18nModule is used to configure the translator

**Example**:

```
I18nModule.forRoot({
   loader: { type: ServerTranslationLoader }
}),
```

The pipe `translate`can be used to integrate i18n in html templates

**Example**:

```html
{{"portal.commands:ok.label" | translate}}
```

The pipe can process additional arguments for interpolation as a second argument.
```html
{{"some.namespace:price.label" | translate | {price: price}}}
```

where the localized strings include necessary placeholders with optional formatting options

**Example**:
```
Hello {me}, today is {today:date()}, and i cost {price:number(style: 'currency', currency: 'EUR')}!"
```
Supported types for formatting options are "date" and "number" where the attributes are directly passed on to the
`Intl.DateFormat` and `Intl.NumberFormat` respectively.

## Commands

Commands is a pattern, that maps a specific functionality - in typescript, a simple method - to an object that will be responsible
for the execution. 

**Example**:
```
   @Command({})
   foo() {
      console.log("that's not exciting...")
   }
```
OK, so far, so good.... executing `foo` is now part of a command.
The big benefit is, that

* the command is _stateful_ 

and we can all of a sudden
* add meta-data to the command object, that will influence execution logic
* which is implemented in form of specific _interceptors_

Let's look at some ( implemented ) use-cases

**Shortcuts**

passing ``shortcut: "ctrl-z"``
will activate the appropriate keyboard shortcut, that will trigger the command

**I18N**

adding ``i18n: portal.commands:ok"``

will lookup available translations and fill related properties ("shortcut", "label", "tooltip")

**Command Status**

Commands are enabled or disabled. 

Passing ``lock: "command"`` will deactivate the command as long as a previous execution has not returned.
Think of a "Save" button that should be deactivated, if pressed in order to avoid multiple executions.

**UI Interaction**

In the context of specific features, command execution can influence the component, by 
* activating the busy cursor after a small delay, or
* lock the complete view with an overlay and spinner

**Other interceptors**

Other configured interceptors can be used to add additional logic.

**Examples**:
* error handling
* performance measurements

Let's look at the overall properties of the passed configuration object

* `command?: string`<br/>the command name ( if not passed, the method name is used)
* `group?: string`<br/> the group of the commands that may be disabled
* `label?: string`<br/> the label of the command. If not passed, it will be set to the name
* `i18n?: string`<br/> the i18n key that will be used to translate the other i18n aspects ( "label", "tooltip", "speech", "shortcut")
* `shortcut?: string`<br/> the shortcut of the command
* `tooltip?: string`<br/> the tooltip of the command
* `icon?: string`<br/> the icon name of the command
* `enabled?: boolean`<br/> the initial enabled status of the command
* `speech?: string`<br/> the speech input that can trigger a command in context of an activated speech recognition
* `lock?: "command" | "view" | "group" `<br/> the locking behaviour during command execution. 

The module `CommandModule` is used to configure the top-level interceptors

**Example:**

```
CommandModule.forRoot({
   interceptors: [interceptor_1, ..., interceptor_n]
})
```

where an interceptor is defined as
```
/**
 * A <code>CommandInterceptor</code> is part of a chain of interceptors and can add execution logic as part of a command execution.
 */
export interface CommandInterceptor {
    /**
     * called prior to method execution
     * @param executionContext  {@link ExecutionContext} the current execution context
     */
    onCall(executionContext: ExecutionContext): void;
    /**
     * called after a result has been computed
     * @param executionContext  {@link ExecutionContext} the current execution context
     */
    onResult(executionContext: ExecutionContext): void;
    /**
     * called after an exception has been caught
     * @param executionContext  {@link ExecutionContext} the current execution context
     */
    onError(executionContext: ExecutionContext): void;
  }
```

The integration of commands is done by simply adding the appropriate mixin.

```
class AppComponent extends WithCommands(AbstractFeature) {
   // commands
   
   @Command({})
   foo() {
      ...
   }
}
```

It will activate the decorator parsing and add the following methods
* `findCommand(command: string) : CommandDescriptor | undefined`<br/> find a named command
* `getCommand(command: string) : CommandDescriptor`<br/> find a named command. This will throw an exception if the command is not defined
* `setCommandEnabled(command: string, value: boolean): CommandManager`<br/> sets the enabled state of the command

Typically, the enabled status of commands is executed in a single place.

**Example**:
```
updateCommandState() {
   this
        .setCommandEnabled("save",   this.isDirty())
        .setCommandEnabled("revert", this.isDirty())
        ...
}
```

## Dialogs

The mixin `WithDialogs` adds methods that let you open ( convenience ) dialogs easily.

Example:
**Example**:
```
class AppComponent extends WithDialogs(AbstractFeature) {
   ...
   
   void checkSave() {
      return this.confirmationDialog()
        .title("Unsaved Changes")
        .message("Still close?")
        .okCancel()
        .show()
        .subscribe(result => ...)
   }
}
```

The new methods are

* `inputDialog() : InputDialogBuilder`<br/> returns a fluent interface to configure input dialogs
* `confirmationDialog() : ConfirmationDialogBuilder`<br/> returns a fluent interface to configure confirmation dialogs
* `openDialog<T>(component: ComponentType<T>, configuration: any) : Observable<any>`<br/> is used to open a generic dialog

The last method methods must be used instead of the angular method, since it needs add additional logic before openeing and after closing dialogs ( related to teh management shortcuts, etc. )

## Configuration

An application typically requires some configuration parameters passed from the outside, that control some internal aspects.
Usually there are the Angular files "environment.ts" that contain parameters. 

Since this is not the only source, and we additionally would like to add some convenience methods for retrieving values, 
a general configuration logic is implemented.

The singleton `ConfigurationManager` implemented that will manage different sources and retriven values.
It is configured via

```
ConfigurationModule.forRoot(...sources: ConfigurationSource[])

```

**Example**:
```
ConfigurationModule.forRoot(new ValueConfigurationSource(environment)), 

```
Here we simply integrate the existing environment.

Retrieval is done by the `ConfigurationManager` method 

**Example**:
```
/**
   * get a configuration value
   * @param key the - possibly '.' separated - key
   * @param defaultValue possible default value, if the value is not known
   */
  get<T>(key: string, defaultValue: T | undefined = undefined): T | undefined
```

Configuration sources need to implement the interface 

```
export interface ConfigurationSource {
    /**
     * return true, if the source is laoded, fals otherwise
     */
    isLoaded() : boolean

    /**
     * return the loaded values
     */
    values() : any
    
    /**
     * load the configuration values asynchronously and return the resulting tree
     */
    load(): Promise<any>
}
```
The only implementation so far is the `ValueConfigurationSource` which simply digetss the passed value

## Communication

A typical problem in the context of rest services is always, how and where to configure URLs of backend servers.
The approach here, is based on two components
* an abstract base class for services
* a service used to compute base URLs

**Example**:

```ts
@Injectable({providedIn: 'root'})
@Service({domain: "admin", prefix: "/administration"}) // prefix is added to the URLs
export class ComponentService extends AbstractHTTPService {
    // constructor

    constructor(injector : Injector) {
        super(injector);
    }

    // public

    public listAll() : Observable<string[]> {
        return this.get<string[]>(`/services`);
    }
    
    ...
}
```
The base class `AbstractHTTPService` in combination with the decorator offers the low-level method ( get, post, ... )

A second component 

```ts
export abstract class EndpointLocator {
    /**
     * return a base url for server calls
     * @param domain a domain name
     */
    abstract getEndpoint(domain : string) : string
}
```
is used to retrieve base URLs given a domain name.

A typical implementation is based on configuration values based on this implementation:
```ts
@Injectable({providedIn: 'root'})
export class ApplicationEndpointLocator extends EndpointLocator {
  // constructor

  constructor(private configuration : ConfigurationManager) {
    super()
  }

  // implement

  getEndpoint(domain : string) : string {
    return this.configuration.get<string>("backend." + domain)!
  }
}
```

and the corresponding entries
```ts
export const environment = {
    production: true,
    backend: {
        admin: 'http://localhost:8083'
    }
};

```

The concrete implementation needs to be added in the provider section of the main moudle, e.g.
```ts
   providers: [{
      provide: EndpointLocator,
      useClass: ApplicationEndpointLocator
   },
    ...
   ]
```

## State

The mixin `WithState` can be used to persist a component state and restore it when reopened.

**Example**:

```
interface TranslationState {
  selectedNamespace?: string
  selectedMessage?: string
}

...
export class TranslationEditorComponent extends WithState<TranslationState>()(AbstractFeature) {
   ...
   
   // override Stateful

   override applyState(state: TranslationState) : void {
      ...
   }

   override writeState(state: TranslationState) : void {
      state.selectedNamespace = this.selectedNamespace?.path
      state.selectedMessage = this.selectedName
   }
}
  
```

While every component is responsible for its own state, the framework logic will assemble an overall json object containing the overall state.

**Example**: 

```json
{
  "owner": {
    "component": "app"
  },
  "data": {
    "feature": "home"
  },
  "children": [
    {
      "owner": {
        "component": "translations" // by default the component selector
      },
      "data": {
        "selectedNamespace": "portal.commands",
        "selectedMessage": "ok"
      },
      "children": []
    },
    ...
  ]
}
```
This object will be persisted via an implementation of
```
/**
 * a <code>StateStorage</code> is responsible to save and load states
 */
export abstract class StateStorage {
 /**
  * load the state of a portal
  * @param application the id of the application
  * @param session the current session
  */
  abstract load(application: string, session?: Session): State

 /**
  * save the sate
  * @param state the state object
  * @param application the application name
  * @param session the current session
  */
  abstract save(state: State, application: string, session?: Session): void
}
```
which is configured in the module


```
StateModule.forRoot({ 
   storage: LocalStorageStateStorage
   }
),
```

`LocalStorageStateStorage`is the only current implementation that simply used the local storage

Since all state objects form a tree, it is essential that all parents of stateful components are also stateful!

## Tracing

Tracing offers a simple logging mechanism for development purposes which will be deactivated in production code.

After configuration of the corresponding module

```
TracerModule.forRoot({
    enabled: environment.production !== true,
    trace: new ConsoleTrace('%d [%p]: %m %f\n'), // d(ate), l(evel), p(ath), m(message), f(rame)
    paths: {
        "": TraceLevel.OFF,
        "portal": TraceLevel.FULL,
        ...
    }
}),
```

individual log messages are created by

**Example**:

```
if (Tracer.ENABLED)
  Tracer.Trace('message-bus', TraceLevel.MEDIUM, 'broadcast topic {0}: {1}', message.topic, message.message);
```

Different tracing outputs are possible that cover the interface `Trace`. 
Currently the class `ConsoleTrace` simply delegates the output to the console.
The constructor parameter defines the message format. Valid placeholders are
* `%d` the date of the log
* `%l` the trace level
* `%p` the path of the trace message
* `%m` the message itself
* `%f` the location of the calling frame 

**Example**:

```
Wed Feb 21 2024 [session.oidc]: handle event token_expires webpack:///libs/portal/src/lib/security/oidc/oidc-session-manager.ts:30:23
```

As you can see, integrating the frame will load the appropriate source maps:-)

## View

The mixin `WithView` is used in combination with a specific component `<view>` that surrounds the component html.
It will add the following methods

```ts
export interface WithView {
   /**
    * the view component
    */
    view : ViewComponent
   /**
    * set the busy cursor of the view
    */
    setBusy(busy: boolean) : void
   /**
    * show or hide the view overlay
    */
    showOverlay(on: boolean): void
   /**
    * show a message as part of the overlay
    */
    showMessage(message: string): void
}
```
As a side effect, specific command interceptors will be included that map the locking logic - busy curosr after 100ms, etc. - to the ui.

# Showcase Setup

A mimimal showcase can be setup with a few clicks by using the corresponding plugins 

## Shell

The main shell is generated with

```
npx nx generate microfrontend-shell-generator
```

While the most parameters - and the resulting project code - come from the standard angular application generator, it adds
* `serverURL: string` the URL of the backend portal server 
* `generatePublicPortal: boolean` if `true`, it will generate a feature the renders the frame of a public portal ( e.g. prior to a login )
* `generatePrivatePortal: boolean` if `true`, it will generate a feature the renders the frame of a private portal ( after successful login )

The portals will simply render a toolbar containing feature links ( of features that are tagged with "navigation" ) and a corresponding router-outlet.
A right aligned button "Login"/"Logout" will trigger the corresponding actions.

The only content of the shell component is a feature-outlet that references the corresponding portal feature. It will throw an exception, if the required features
are not available.

## Microfrontend

```
npx nx generate microfrontend-generator
```
This generator allows exactly the same parameters.

## Running the portal server

As a last step we need to run the portal server and register the microfrontends.

For this purpose we can execute

```shell
docker compose -f web-compose.yml up -d
```

in the top-level docker folder.

the account/password is "coolsamson" and "geheim"

In the "microfrontends" feature, click the plus button and add the microfrontend URLs ( e.g. "http://localhost:4200" )

**Beware**: The docker compose already starts two microfrontends and a shell under the ports 4200-4203.

If you check the corresponding Docker files, you will btw. see, how an automatic registration can be already included in the corresponding containers :-)

If you don't like the hustle, replace the line

```ts
loader: {
   server: {}"
}
```
with

```ts
loader: {
   local: {
      remotes: ["http://localhost:<port>", ...]
   }
}
```




