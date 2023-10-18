[![Java CI with Maven](https://github.com/coolsamson7/service/actions/workflows/maven.yml/badge.svg)](https://github.com/coolsamson7/service/actions/workflows/maven.yml)
# Service

A spring based framework for service discovery and transparent routing.

## Motivation and goals

While there are already a number of - mostly spring - libraries
available that help to solve most of the problems in  a distributed microservice based architecture like
- registries ( consul, etc. ) and
- loadbalancing mechanisms

the result from a developer perspective in my mind is still too complicated and also has some shortcomings.
Even if most of the technical details are nicely hidden, the programmer typically still needs to write low-level protocol agnostic code to call services.

**Example:** 

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

What's bad?
- the code assumes that the called service is remote
- we commit to a specific protocol
- we commit to a loadbalanced connection
- we have to write technical boilerplate webclient code

This is _clumsy_ and against pretty valuable architectural principles like separation of concern, etc.

What we would like to do instead is

- services are described in form of interfaces
- corresponding implementations run somewhere and register with a central registry
- service calls use this information by establishing some kind of - transparent - remoting
- local services are executed locally

## Sample

Let's look at a simple example. Let's declare a service interface first
```
@ServiceInterface(name = "TestService")
interface TestService : Service {
    @GetMapping("/hello")
    @ResponseBody
    fun hello(): String
}
```
By coincidence, it declares all the necessary annotations for spring!

Services are bundled by a _component_
```
@ComponentInterface(name = "TestRemoteComponent", services = [TestRemoteRestService::class])
@RestController
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
* returning a channel type ( here "rest" )
* the address
* and health endpoints that are usually called by different kind of registries

```
@ComponentHost(health = "/api/test-health")
@RestController
@RequestMapping("/api")
class TestComponentImpl : AbstractComponent(), TestComponent {
    // override AbstractComponent

    @ResponseBody
    @GetMapping("/test-health")
    override val health: ComponentHealth
        get() = ComponentHealth.UP

    override val addresses: List<ChannelAddress>
        get() = listOf(
            ChannelAddress("rest", URI.create("http://$host:$port")) // local host and port
        )
}
```
Assuming that a channel of type "rest" is known ( we will come back to that later ), we can now call
service methods easily.
```
  // get the manager from spring
  
  val context : ApplicationContext  = ... 
  val manager = context.getBean(ComponentManager::class.java)

  // fetch the service ( proxy )  
            
  val service = manager.acquireService(TestService::class.java)

  // go forrest
  
  service.hello()
    
```
Voila!
## Basic concepts

As we have already seen, there are 3 different basic building blocks
* Service
* Component
* Channel

### Service
A service is represented by an annotated ( in order to be scanned by spring ) interface extending the tagging interface `Service` . 
There are no other restrictions except that it should contain all the necessary information so that the communication channels are able to do the remoting.
In our example we simply added the spring mvc annotations.

The service implementation is any spring bean ( that a channel can connect to ) 

### Component

The purpose of a component interface is to bundle a list of services that share the same channel

The implementation takes care of
* lifecycle of the component ( e.g. startup and shutdown methods )
* registration with a component registry
* health endpoint

### Component Registry

A component registry is a central registry that knows about all active component implementations and their supported channels

### Channel

A channel implements the technical remoting protocol whenever remote services are executed.
Resolving a proper channel is done lazily based on the available information from the component registry
which return a list of service instances and supported channels.

It is up to a concrete channel if ( client side ) loadbalancing is supported or not.
The current implementation simply talsk to the first address ( as long as alive )

Channels will automaticylly adjist to changes on the topology.

## Features

The framework offers the following features
* first component registry implementation based on spring consul
* rest channel based on `WebClient` supporting the _basic_ annotations
* injection possibilities for services
* central dynamic exception handling

## Getting started

Its always good the check the `JUnit` tests which are available for 
* the core module
* the rest module
Both make use of a local component registry

Two demo applications are available under `demo`
* app1
* app2
While both host a set of common services, app2 calls services hosted by app1.
Both applications assume a running consul server under the typical port.
 
The Kotlin API can be found [here](http://ernstandreas.de/service/)

Check the corresponding [here](https://github.com/coolsamson7/service/wiki) for detailed information.

Have fun!
