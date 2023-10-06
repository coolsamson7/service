package com.serious.channel.rest;/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */


import com.serious.service.*;
import com.serious.service.annotations.InjectService;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.*;

import static org.junit.jupiter.api.Assertions.assertEquals;

@Component
class TestComponentComponentRegistry implements ComponentRegistry {

    @Override
    public void startup(ComponentDescriptor<com.serious.service.Component> descriptor) {

    }

    @Override
    public void shutdown(ComponentDescriptor<com.serious.service.Component> descriptor) {

    }

    @Override
    public List<String> getServices() {
        return Arrays.asList("test");
    }

    @Override
    public List<ServiceInstance> getInstances(String service) {
        Map<String, String> meta = new HashMap<>();
        meta.put("channels", "rest(http://localhost:" + AbstractComponent.port + ")");

        return Arrays.asList(new DefaultServiceInstance("id", "test", "localhost",  Integer.valueOf(AbstractComponent.getPort()), false, meta));
    }
}

@ServiceInterface()
interface TestService extends Service {
    @GetMapping("/hello/{world}")
    @ResponseBody
    String hello(@PathVariable("world") String world);
}


@ComponentInterface(
        services = {TestService.class})
interface TestComponent extends com.serious.service.Component {
    String hello(String world);
}

@ComponentHost(channels = {"rest"}) // actually not needed TODO
class TestComponentImpl extends AbstractComponent implements TestComponent {
    @Override
    public String hello(String world) {
        return "hello " + world;
    }

    @Override
    public List<ServiceAddress> getAddresses() {
        return Collections.singletonList(new ServiceAddress("rest", URI.create("http://localhost:" + ":" + getPort())));
    }
}

@Component
@RestController
class TestServiceImpl extends AbstractService implements TestService {
    @Override
    public String hello(String world) {
        return "hello " + world;
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
//@Import(ServiceConfiguration.class)
@EnableAutoConfiguration
class RestTest {
    // instance data

    @LocalServerPort
    private int port; // local.server.port

    @Autowired
    ComponentManager componentManager;
    @Autowired
    ServiceInstanceRegistry serviceInstanceRegistry;

    // test

    @Test
    void testRemoteService() {
        AbstractComponent.port = String.valueOf(port);
        serviceInstanceRegistry.startup();

        TestService service = componentManager.acquireService(TestService.class);

        assertEquals("hello world", service.hello("world"));
    }
}