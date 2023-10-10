[![Java CI with Maven](https://github.com/coolsamson7/service/actions/workflows/maven.yml/badge.svg)](https://github.com/coolsamson7/service/actions/workflows/maven.yml)
# Service

A spring based framework for service discovery and transparent routing.

## Motivation and goals

While there are already a number of - mostly spring - libraries
available that help to solve most of the problems in  a distributed microservice based architecture like
- registries ( consul, etc. ) and
- loadbalancing mechanisms

the result from a developer perspective is still too complicated and also has some shortcomings.
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
- we commit to a specific protocol
- we commit to a loadbalanced connection
- necessity to write technical webclient code

It would be much nicer, if we whouldn't have to care at all and simply call a...well...interface with someone else in the background taking care of an appropriate implementation connected with whatever protocol.
This would also give us the opportunity to skip remote calls at all, if in a specific deployment scenario implementations are hosted in the same vm.

## Sample

Let's look at a first example.
