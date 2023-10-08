package com.serious.demo;

import com.serious.service.ComponentManager;
import com.serious.service.ServiceConfiguration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

// a configuration

@Configuration
@ComponentScan
@Import(ServiceConfiguration.class)
class RootConfig {
    RootConfig() {
    }
}

// main application

@SpringBootApplication
@EnableDiscoveryClient
@Slf4j
public class ServiceApplication1 {
    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(ServiceApplication1.class, args);

        // give the registry some time to startup

        try {
            Thread.sleep(1000);
        }
        catch (InterruptedException e) { }

        ComponentManager manager = context.getBean(ComponentManager.class);

        TestRemoteRestService remoteRest = manager.acquireService(TestRemoteRestService.class, "rest");
        TestRemoteRestService remoteDispatch = manager.acquireService(TestRemoteRestService.class, "dispatch");

        TestRemoteRestService local = manager.acquireLocalService(TestRemoteRestService.class);

        local.hello();
        remoteRest.hello();
        remoteDispatch.hello();

        // data

        Foo foo = new Foo();

        // local

        long loops = 10000;
        long ms = System.currentTimeMillis();

        for (int i = 0; i < loops; i++)
            local.postBody(foo);

        long z1 = System.currentTimeMillis() - ms;

        // rest

        ms = System.currentTimeMillis();

        for (int i = 0; i < loops; i++)
            remoteRest.postBody(foo);

        long z2 = System.currentTimeMillis() - ms;

        // dispatch

        ms = System.currentTimeMillis();

        for (int i = 0; i < loops; i++)
            remoteDispatch.postBody(foo);

        long z3 = System.currentTimeMillis() - ms;

        // print

        System.out.println(loops + " local loops in " + z1 + "ms = " + (((double) z1) / loops) + "ms/loop");
        System.out.println(loops + " remote rest loops in " + z2 + "ms = " + (((double) z2) / loops) + "ms/loop");
        System.out.println(loops + " remote dispatch loops in " + z3 + "ms = " + (((double) z3) / loops) + "ms/loop");
    }
}
