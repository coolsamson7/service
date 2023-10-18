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
* 
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
