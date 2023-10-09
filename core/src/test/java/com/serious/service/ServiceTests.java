package com.serious.service;

import com.serious.channel.LocalChannel;
import com.serious.registry.LocalComponentRegistry;
import com.serious.service.annotations.InjectService;
import com.serious.service.exception.ServiceRuntimeException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.client.DefaultServiceInstance;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

// test classes

@RegisterChannel(protocol = "test")
class TestChannel extends LocalChannel {

    protected TestChannel(ChannelManager channelManager) {
        super(channelManager);
    }
}

@RegisterChannel(protocol = "test1")
class Test1Channel extends LocalChannel {

    protected Test1Channel(ChannelManager channelManager) {
        super(channelManager);
    }
}

@Component
class TestComponentComponentRegistry extends LocalComponentRegistry {
}

@ServiceInterface()
interface TestService extends Service {
    String hello(String world);
}

interface BadService extends Service {
    String hello(String world);
}


@ComponentInterface(
        services = {TestService.class})
interface TestComponent extends com.serious.service.Component {
    String hello(String world);
}

@ComponentHost()
class TestComponentImpl extends AbstractComponent implements TestComponent {
    @Override
    public String hello(String world) {
        return "hello " + world;
    }

    @Override
    public List<ServiceAddress> getAddresses() {
        Map<String, String> meta = new HashMap<>();
        meta.put("channels", "test(http://localhost:0),test1(http://localhost:0)");

        return List.of(
                new ServiceAddress("test", new DefaultServiceInstance("id", "test", "localhost", 0, false, meta))
        );
    }
}

@Component
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

@SpringBootTest(classes = {ServiceConfiguration.class})
@Import(ServiceConfiguration.class)
class ServiceTests {
    // instance data

    @Autowired
    ComponentManager componentManager;
    @InjectService
    TestService testService;
    @InjectService(preferLocal = true)
    TestService localTestService;

    @InjectService
    TestComponent testComponent;
    @InjectService(preferLocal = true)
    TestComponent localTestComponent;

    // test

    @Test
    void testUnknownService() {
        try {
            componentManager.acquireService(BadService.class);

            fail("should throw");
        }
        catch (ServiceRuntimeException e) {
        }
    }

    @Test
    void testMissingChannel() {
        try {
            componentManager.acquireService(TestService.class, "dunno");

            fail("should throw");
        }
        catch (ServiceRuntimeException e) {
        }
    }


    @Test
    void testLocalService() {
        assertEquals("hello world", localTestService.hello("world"));
    }

    //@Test
    void testRemoteService() {
        assertEquals("hello world", testService.hello("world"));
    }

    @Test
    void testLocalComponent() {
        assertEquals("hello world", localTestComponent.hello("world"));
    }

    //@Test
    void testRemoteComponent() {
        assertEquals("hello world", testComponent.hello("world"));
    }
}
