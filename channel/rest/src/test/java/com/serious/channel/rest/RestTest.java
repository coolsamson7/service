package com.serious.channel.rest;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */


import com.serious.service.*;
import com.serious.service.registry.LocalComponentRegistry;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.cloud.client.DefaultServiceInstance;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.stereotype.Component;
import org.springframework.test.context.event.annotation.BeforeTestClass;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;

class Foo {
    public String id;


}
@Component
class TestComponentComponentRegistry extends LocalComponentRegistry {
    @Override
    public List<ServiceInstance> getInstances(String service) {
        Map<String, String> meta = new HashMap<>();
        meta.put("channels", "rest(http://localhost:" + AbstractComponent.port + ")");

        return List.of(new DefaultServiceInstance("id", "test", "localhost", Integer.valueOf(AbstractComponent.getPort()), false, meta));
    }
}

@ServiceInterface()
@RequestMapping("flux/")
interface FluxMethods extends Service {
    @RequestMapping(path = "get/{world}", method = RequestMethod.GET)
    @ResponseBody
    Mono<String> get(@PathVariable("world") String world);

    @RequestMapping(path = "get-list/{world}/{count}", method = RequestMethod.GET)
    @ResponseBody
    Flux<Foo> getList(@PathVariable("world") String world, @PathVariable int count);
}

@ServiceInterface()
@RequestMapping("request/")
interface RequestMappingMethods extends Service {
    @RequestMapping(path = "get-variable/{world}", method = RequestMethod.GET)
    @ResponseBody
    String getVariable(@PathVariable("world") String world);

    @RequestMapping(path = "get-variables/{bar}/{foo}", method = RequestMethod.GET)
    @ResponseBody
    String getVariables(@PathVariable("foo") String foo, @PathVariable("bar") String bar);

    @RequestMapping(path ="get-variable-no-name/{world}", method = RequestMethod.GET)
    @ResponseBody
    String getVariableNoName(@PathVariable String world);

    @RequestMapping(path ="put-variable/{world}", method = RequestMethod.PUT)
    @ResponseBody
    String putVariable(@PathVariable("world") String world);

    @RequestMapping(path ="delete/{world}", method = RequestMethod.DELETE)
    @ResponseBody
    String delete(@PathVariable("world") String world);

    @RequestMapping(path ="post", method = RequestMethod.POST)
    @ResponseBody
    Foo post(@RequestBody Foo foo);

    @RequestMapping(path = "request-param", method = RequestMethod.POST)
    @ResponseBody
    Foo postRequestParam(@RequestBody Foo foo, @RequestParam("bar") int bar);
}

@ServiceInterface()
interface BasicMethods extends Service {
    @RequestMapping(path = "get-list/{world}/{count}", method = RequestMethod.GET)
    @ResponseBody
    List<String> getList(@PathVariable("world") String world, @PathVariable int count);

    @RequestMapping(path = "get-object-list/{world}/{count}", method = RequestMethod.GET)
    @ResponseBody
    List<Foo> getObjectList(@PathVariable("world") String world, @PathVariable int count);

    @RequestMapping(path = "get-array/{world}/{count}", method = RequestMethod.GET)
    @ResponseBody
    String[] getArray(@PathVariable("world") String world, @PathVariable int count);

    @RequestMapping(path = "get-object-array/{world}/{count}", method = RequestMethod.GET)
    @ResponseBody
    Foo[] getObjectArray(@PathVariable("world") String world, @PathVariable int count);

    @GetMapping("/get-variable/{world}")
    @ResponseBody
    String getVariable(@PathVariable("world") String world);

    @GetMapping("/get-variables/{bar}/{foo}")
    @ResponseBody
    String getVariables(@PathVariable("foo") String foo, @PathVariable("bar") String bar);

    @GetMapping("/get-variable-no-name/{world}")
    @ResponseBody
    String getVariableNoName(@PathVariable String world);

    @PutMapping("/put-variable/{world}")
    @ResponseBody
    String putVariable(@PathVariable("world") String world);

    @DeleteMapping("/delete/{world}")
    @ResponseBody
    String delete(@PathVariable("world") String world);

    @PostMapping("/post")
    @ResponseBody
    Foo post(@RequestBody Foo foo);

    @PostMapping("/request-param")
    @ResponseBody
    Foo postRequestParam(@RequestBody Foo foo, @RequestParam("bar") int bar);
}


@ComponentInterface(
        services = {
                BasicMethods.class,
                RequestMappingMethods.class,
                FluxMethods.class
        })
interface TestComponent extends com.serious.service.Component {
}

@ComponentHost()
class TestComponentImpl extends AbstractComponent implements TestComponent {
    @Override
    public List<ServiceAddress> getAddresses() {
        return Collections.singletonList(new ServiceAddress("rest", URI.create("http://localhost:" + ":" + getPort())));
    }
}

@Component
@RestController
class FluxMethodsImpl extends AbstractService implements FluxMethods {
    @Override
    public Mono<String> get(String world) {
        return Mono.just(world);
    }

    @Override
    public Flux<Foo> getList(String world, int count) {
        List<Foo> result = new ArrayList<>();
        for ( int i = 0; i < count; i++) {
            Foo foo = new Foo();
            foo.id = world + i;

            result.add(foo);
        }

        return Flux.fromIterable(result);
    }
}

@Component
@RestController
class BasicMethodsImpl extends AbstractService implements BasicMethods {
    @Override
    public List<String> getList(String world, int count) {
        List<String> result = new ArrayList<>();
        for ( int i = 0; i < count; i++)
            result.add(world + i);

        return result;
    }

    @Override
    public List<Foo> getObjectList(String world, int count) {
        List<Foo> result = new ArrayList<>();
        for ( int i = 0; i < count; i++) {
            Foo foo = new Foo();
            foo.id = world + i;
            result.add(foo);
        }

        return result;
    }

    public String[] getArray(String world, int count) {
        List<String> result = new ArrayList<>();
        for ( int i = 0; i < count; i++) {
            result.add(world + i);
        }

        return result.toArray(new String[0]);
    }

    public Foo[] getObjectArray(String world, int count) {
        List<Foo> result = new ArrayList<>();
        for ( int i = 0; i < count; i++) {
            Foo foo = new Foo();
            foo.id = world + i;
            result.add(foo);
        }

        return result.toArray(new Foo[0]);
    }

    @Override
    public String getVariable(String world) {
        return world;
    }

    @Override
    public String getVariables(String foo, String bar) {
        return foo + bar;
    }

    @Override
    public String getVariableNoName(String world) {
        return world;
    }

    @Override
    public String putVariable(String world) {
        return world;
    }

    @Override
    public String delete(String world) {
        return world;
    }

    @Override
    public Foo post(Foo foo) {
        return foo;
    }

    @Override
    public Foo postRequestParam(Foo foo, int bar) {
        foo.id = String.valueOf(bar);

        return foo;
    }
}

@Component
@RestController
class RequestMappingMethodsImpl extends AbstractService implements RequestMappingMethods {
    @Override
    public String getVariable(String world) {
        return world;
    }

    @Override
    public String getVariables(String foo, String bar) {
        return foo + bar;
    }

    @Override
    public String getVariableNoName(String world) {
        return world;
    }

    @Override
    public String putVariable(String world) {
        return world;
    }

    @Override
    public String delete(String world) {
        return world;
    }

    @Override
    public Foo post(Foo foo) {
        return foo;
    }

    @Override
    public Foo postRequestParam(Foo foo, int bar) {
        foo.id = String.valueOf(bar);

        return foo;
    }
}


// test classes

@Configuration
@ComponentScan
@Import(ServiceConfiguration.class)
class TestConfig {
    TestConfig() {
    }
}
@SpringBootTest(classes = {TestConfig.class}, webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnableAutoConfiguration
class RestTest {
    // instance data

    @LocalServerPort
    private int port; // local.server.port

    @Autowired
    ComponentManager componentManager;
    @Autowired
    ServiceInstanceRegistry serviceInstanceRegistry;

    // lifecycle

    @BeforeEach
    void before() {
        if (AbstractComponent.port.equals("0")) {
            AbstractComponent.port = String.valueOf(port);
            serviceInstanceRegistry.startup();
        }
    }

    // test

    @Test
    void testBasicMethods() {
        BasicMethods service = componentManager.acquireService(BasicMethods.class);

        Foo foo = new Foo();
        foo.id = "id";

        assertEquals("world", service.delete("world"));
        assertEquals("world", service.getVariable("world"));
        assertEquals("world", service.getVariableNoName("world"));
        assertEquals("id", service.post(foo).id);
        assertEquals("1", service.postRequestParam(foo, 1).id);
        assertEquals("foobar", service.getVariables("foo", "bar"));
        assertEquals("world", service.putVariable("world"));
        assertEquals("world", service.getVariableNoName("world"));
        assertEquals(2, service.getList("world", 2).size());
        assertEquals(2, service.getObjectList("world", 2).size());
        assertEquals(2, service.getArray("world", 2).length);
        assertEquals(2, service.getObjectArray("world", 2).length);
    }

    @Test
    void testRequestMappingMethods() {
        RequestMappingMethods service = componentManager.acquireService(RequestMappingMethods.class);

        Foo foo = new Foo();
        foo.id = "id";

        assertEquals("world", service.delete("world"));
        assertEquals("world", service.getVariable("world"));
        assertEquals("world", service.getVariableNoName("world"));
        assertEquals("id", service.post(foo).id);
        assertEquals("1", service.postRequestParam(foo, 1).id);
        assertEquals("foobar", service.getVariables("foo", "bar"));
        assertEquals("world", service.putVariable("world"));
        assertEquals("world", service.getVariableNoName("world"));
    }

    @Test
    void testFlux() {
        FluxMethods service = componentManager.acquireService(FluxMethods.class);

        // mono

        assertEquals("world", service.get("world").block());

        StepVerifier.create(service.get("world"))
                .expectNext("world")
                .verifyComplete();

        // flux

        List<Foo> list = service.getList("world", 10).collect(Collectors.toList()).block();


        assertEquals(list.size(), 10);
    }
}