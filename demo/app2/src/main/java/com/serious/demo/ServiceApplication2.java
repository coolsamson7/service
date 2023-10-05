package com.serious.demo;

import com.serious.service.ComponentManager;
import com.serious.service.ServiceConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

@Configuration
@Import(ServiceConfiguration.class)
@ComponentScan
class RootConfig {
    RootConfig() {
    }
}

// main application

@SpringBootApplication
@EnableDiscoveryClient
public class ServiceApplication2 {
    public static void main(String[] args) {
        ConfigurableApplicationContext context = SpringApplication.run(ServiceApplication2.class, args);

        ComponentManager manager = context.getBean(ComponentManager.class);

        TestRemoteRestService testRemoteRestService = manager.acquireService(TestRemoteRestService.class);

        System.out.println(testRemoteRestService.hello());
    }
}
