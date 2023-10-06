package com.serious.service;

import com.serious.service.annotations.InjectService;
import com.serious.service.channel.AbstractChannel;
import org.aopalliance.intercept.MethodInvocation;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.client.DefaultServiceInstance;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

// test classes

@RegisterChannel(protocol = "test")
class TestChannel extends AbstractChannel {

    protected TestChannel(ChannelManager channelManager) {
        super(channelManager);
    }

    @Override
    public Object invoke(MethodInvocation invocation) throws Throwable {
        Object implementation = BaseDescriptor.forService((Class<Service>)invocation.getMethod().getDeclaringClass()).local;

        Method method = implementation.getClass().getMethod(invocation.getMethod().getName(), invocation.getMethod().getParameterTypes());

        return method.invoke(implementation, invocation.getArguments());
    }
}

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
        meta.put("channels", "test");

        return Arrays.asList(new DefaultServiceInstance("id", "test", "localhost", 0, false, meta));
    }
}

@ServiceInterface()
interface TestService extends Service {
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
        return null;
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
    void testLocalService() {
        assertEquals("hello world", localTestService.hello("world"));
    }

    @Test
    void testRemoteService() {
        assertEquals("hello world", testService.hello("world"));
    }

    @Test
    void testLocalComponent() {
        assertEquals("hello world", localTestComponent.hello("world"));
    }

    @Test
    void testRemoteComponent() {
        assertEquals("hello world", testComponent.hello("world"));
    }

}
