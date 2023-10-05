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

        TestRemoteRestService ts = manager.acquireService(TestRemoteRestService.class, "rest");

        ts.hello();

        ts = manager.acquireLocalService(TestRemoteRestService.class);

        ts.hello();

        TestRemoteRestService remote = manager.acquireService(TestRemoteRestService.class);
        remote = manager.acquireService(TestRemoteRestService.class);

        TestRemoteRestService local = manager.acquireLocalService(TestRemoteRestService.class);
        local = manager.acquireLocalService(TestRemoteRestService.class);

        remote.hello();

        long loops = 10000;
        long ms = System.currentTimeMillis();

        for (int i = 0; i < loops; i++)
            local.hello();

        long z1 = System.currentTimeMillis() - ms;

        ms = System.currentTimeMillis();

        for (int i = 0; i < loops; i++)
            remote.hello();

        long z2 = System.currentTimeMillis() - ms;

        System.out.println(loops + " local loops in " + z1 + "ms = " + (((double) z1) / loops) + "ms/loop");
        System.out.println(loops + " remote loops in " + z2 + "ms = " + (((double) z2) / loops) + "ms/loop");
    }
}
