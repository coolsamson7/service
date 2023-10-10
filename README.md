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

`@Configuration
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
        return webClientBuilder.build().get().uri("http://stores/stores")
        				.retrieve().bodyToMono(String.class);
    }
}`

## Sample
Let's look at a first example.