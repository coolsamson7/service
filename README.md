[![Java CI with Maven](https://github.com/coolsamson7/service/actions/workflows/maven.yml/badge.svg)](https://github.com/coolsamson7/service/actions/workflows/maven.yml)
# Service

This library is based upon spring ( core, mvc, cloud ) and tries to simplify the approach for typical architectures with distributed (micro)services that need to discover and communicate with each other in a dynamic environment.

## Motivation and goals

While there are a number of - mostly spring - libraries
available that help to solve most of the low-level problems in a distributed microservice based architecture like
- registries ( consul, etc. ) and
- loadbalancing mechanisms

the result from a developer perspective in my mind is still too poor and also has some major shortcomings.

Let's look at an example ( in Java ) 

```@Configuration
public class MyConfiguration {
   @Bean
   @LoadBalanced
   public WebClient.Builder loadBalancedWebClientBuilder() {
      return WebClient.builder();
   }
}

public class MyClass {
   @Autowired
   private WebClient.Builder webClientBuilder;

   public Mono<String> doOtherStuff() {
        return webClientBuilder.build()
            .get().uri("http://stores/stores")
            .retrieve().bodyToMono(String.class);
    }
}
```

What's wrong?
- the code assumes that the called service is remote in the first place which is a totally unnecessary restriction
- we have to commit to a specific protocol and take care of technical details on protocol level ( e.g.  loadbalancing )
- we have to write technical boilerplate webclient code

This is _clumsy_ and against some major architectural principles like separation of concern, etc.

Talking about modularization: Spring assumes that the basis for clustering services is an application which is wrong in my mind. Teams split up work
by working on different modules. It should be a deployment aspect at the very end how modules are mapped to processes. So we bascially need a smaller building block! 

The following design ideas or principles where the basis of the implemented architecture: 

- we want to program against simple interfaces and are not interested in protocol level details
- we don't want to care where the implementation is. It could be remote, it could be local as well.
- depending on a specific deployment scenarios - e.g class path - different remoting situations should be possible.
- remote service calls are transparently routed based on a central registry that keeps track of running services
- services allow different protocols for remoting, which they expose as meta-data
- typical health checks are executed in order to valdidate the health of individual services
- changes in the topology - due to died or newly started services - should be handled transparently
- every component is able to compute and return the full meta-data concerning its hosted services ( service-signatures, model-information, etc. )

## Sample

Let's look at a simple example at a final result. Let's declare a service interface first
```
@ServiceInterface(name = "TestService")
interface TestService : Service {
    @GetMapping("/hello")
    @ResponseBody
    fun hello(): String
}
```
By coincidence, it declares all the necessary annotations for spring! The framework onyl cares abou the - tagging - interface and the annotation.

Services are bundled by a _component_
```
@ComponentInterface(name = "TestComponent", services = [TestService::class])
interface TestRemoteComponent : Component
```
The service implementation is a normal rest controller
```
@RestController
class TestServiceImpl : TestService {
    override fun hello(): String {
        return "foo"
    }
}
```
The component implementation adds the necessary details in order to establish a remote connection, by
* referencing a channel type ( here "rest" )
* the address
* and http health endpoints that are usually called by different kind of registries

```
@ComponentHost(health = "/api/health")
@RestController
@RequestMapping("/api")
class TestComponentImpl : AbstractComponent(), TestComponent {
    // override AbstractComponent

    @ResponseBody
    @GetMapping("/health")
    override val health: ComponentHealth
        get() = ComponentHealth.UP

    override val addresses: List<ChannelAddress>
        get() = listOf(
            ChannelAddress("rest", URI.create("http://$host:$port")) // local host and port in this case!
        )
}
```
As we can see here, we utilize the normal spring mechanisms to expose the health method :-) 

Assuming that a channel of type "rest" is known ( we will come back to that later ), we can now call
service methods easily.
```
  // get the manager from spring
  
  val context : ApplicationContext  = ... 
  val manager = context.getBean(ServiceManager::class.java)

  // fetch the service ( proxy )  
            
  val service = manager.acquireService(TestService::class.java)

  // go forrest
  
  service.hello()
    
```
An alternative approach would be to use annotations
```
class Foo {
   // inject services
   
   @InjectService
   val service : TestService
   @InjectService(preferLocal=true)
   val localService : TestService // works if the implementation lives in teh same VM
   ...
}
```

Voila, easy, eh?

## Basic concepts

As we have already seen, there are four different basic building blocks
* Service
* Component
* Component Registry
* Channel

### Service

A service is represented by an annotated ( in order to be scanned by spring ) interface extending the tagging interface `Service` . 
There are no other restrictions except that it should contain all the necessary information so that the communication channels are able to do the remoting.
In our example we simply added the spring mvc annotations knowing that spring will take care of the rest.

The service implementation is any spring bean. 

### Component

The purpose of a component interface is to bundle a list of services that share the same channel

The implementation takes care of
* lifecycle of the component ( e.g. startup and shutdown methods )
* registration with a component registry
* providing a health endpoint

### Component Registry

A component registry is a central registry that knows about all active component implementations and their supported channels

### Channel

A channel implements the technical remoting protocol whenever remote services are executed.
Resolving a proper channel is done lazily based on the available information from the component registry
which return a list of service instances and supported channels.

It is up to a concrete channel if ( client side ) loadbalancing is supported or not.

Channels will automatically adjust to changes in the topology which is detected by failing heartbeats.

## Features

The framework offers the following features

### Backend

* first component registry implementation based on spring consul
* rest channel based on `WebClient` supporting the _basic_ annotations
* injection possibilities for services
* central exception handling mechanisms
* full introspection possibilities of the meta-data of components and services with respect to the interfaces as well as model classes

### Web

An administration ui has been implemented in Angular that is able to
* see the list of running components & services
* see the service catalog of every component with respect to service interfaces and models
* see details of the running infrastructure in terms of processes and the current inter-process communication flows
* run service methods

The ui is secured by an OpenID Connect mechanism in combination with an external server ( e.g. Keycloak ) 

Let's look at some screenshots

Here you see the registered instances for a particular component including the current health state

![image](https://github.com/coolsamson7/service/assets/19403960/69c4159b-dba4-4538-a9db-23a06f130aae)

All aspects of a component can be viewed here. 

![image](https://github.com/coolsamson7/service/assets/19403960/656cb434-4160-4cd6-b474-1673286f2fda)

In addition to simply viewing, executing services is supported as well. As the meta-data is available all input parameters are validated.

![image](https://github.com/coolsamson7/service/assets/19403960/9e8256cd-4e4b-4f93-a842-c9fcf5f46cb9)

The current state of the infrastructure can be viewed in form of a graph that shows running processes, the hosted components, and the current communication flows.

![image](https://github.com/coolsamson7/service/assets/19403960/ebb190c1-31e0-480d-85e6-592b800c4241)

## Getting started

Its always good the check the `JUnit` tests which are available for 
* the core module
* the rest module

* Both make use of a local component registry

Two demo applications are available under `demo`
* app1
* app2

While both host a set of common services, app2 calls services hosted by app1.
Both applications assume a running consul server under the typical port.
 
The Kotlin API can be found [here](http://ernstandreas.de/service/)

Check the corresponding [Wiki](https://github.com/coolsamson7/service/wiki) for detailed information.

Have fun!
