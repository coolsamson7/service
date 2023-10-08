package com.serious.service.registry.consul;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.ecwid.consul.v1.agent.model.NewService;
import com.serious.service.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.client.discovery.event.HeartbeatEvent;
import org.springframework.cloud.commons.util.InetUtils;
import org.springframework.cloud.commons.util.InetUtilsProperties;
import org.springframework.cloud.consul.discovery.ConsulDiscoveryProperties;
import org.springframework.cloud.consul.serviceregistry.ConsulRegistration;
import org.springframework.cloud.consul.serviceregistry.ConsulServiceRegistry;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.*;


@Component
@Slf4j
class ConsuleHeartbeatListener implements ApplicationListener<HeartbeatEvent> {
    // instance data

    @Autowired
    DiscoveryClient discoveryClient;
    @Autowired
    ServiceInstanceRegistry serviceInstanceRegistry;
    @Autowired
    ComponentManager componentManager;
    private Object state;

    // override ApplicationListener

    @Override
    public void onApplicationEvent(HeartbeatEvent event) {
        if (state == null || !state.equals(event.getValue())) {
            log.info("process consul heartbeat");

            List<String> services = discoveryClient.getServices().stream().filter(service ->  componentManager.componentDescriptors.containsKey(service)).toList();

            // create new map

            Map<String, List<ServiceInstance>> newMap = new HashMap<>();
            for ( String service : services)
                newMap.put(service, discoveryClient.getInstances(service));

            // set

            serviceInstanceRegistry.update(newMap);

            // done

            state = event.getValue();
        }
    }
}
/**
 * @author Andreas Ernst
 */
@Component
public class ConsulComponentRegistry implements ComponentRegistry {
    // instance data
    @Autowired
    ConsulServiceRegistry consulServiceRegistry;
    @Autowired
    private Environment environment;
    @Autowired
    DiscoveryClient discoveryClient;
    ConsulDiscoveryProperties properties = new ConsulDiscoveryProperties(new InetUtils(new InetUtilsProperties()));

    Map<ComponentDescriptor, ConsulRegistration> registeredServices = new HashMap<>();

    // constructor

    // lifecycle

    // private

    private ServiceAddress getLocalAddress() {
        return null;//TODO new ServiceAddress("rest", URI.create())
    }

    private String getPort() {
        return AbstractComponent.getPort();
    }

    private String getId(ComponentDescriptor<com.serious.service.Component> descriptor) {
        //ServiceAddress serviceAddress = descriptor.getExternalAddress();

        String host = properties.getIpAddress();//serviceAddress.getUri().getHost();
        String port = getPort();

        return host + ":" + port + ":" + descriptor.getName();
    }

    private ConsulDiscoveryProperties properties4(ComponentDescriptor<com.serious.service.Component> descriptor) {
        properties.setPort(properties.getPort());//serviceAddress.getUri().getPort());
        properties.setInstanceId(getId(descriptor));

        properties.setHealthCheckPath(descriptor.health);

        return properties;
    }

    private NewService service4(ComponentDescriptor<com.serious.service.Component> descriptor) {
        ConsulDiscoveryProperties props = properties4(descriptor);

        // service

        NewService service = new NewService();

        Map<String, String> meta = new HashMap<>();

        // build channels

        StringBuilder channels = new StringBuilder();

        // something like: rest(http://bla:90),http("https://hhh:90)
        boolean first = true;
        for ( ServiceAddress external : descriptor.getExternalAddresses()) {
            if ( !first )
                channels.append(",");

            channels
                    .append(external.getChannel())
                    .append("(")
                    .append(external.getUri().toString())
                    .append(")");

            first = false;
        }

        meta.put("channels", channels.toString());

        //

        service.setPort(props.getPort());
        service.setId(props.getInstanceId());
        service.setMeta(meta);
        service.setAddress(props.getIpAddress());
        service.setTags(Arrays.stream(new String[]{"component"}).toList());
        //service.setEnableTagOverride(serviceTemplate.getEnableTagOverride());

        // check

        NewService.Check check = new NewService.Check();

        check.setInterval(environment.getProperty("spring.cloud.consul.discovery.health-check-interval", "15s"));
        check.setHttp("http://" + props.getIpAddress() + ":" + getPort() + descriptor.health);
        check.setTimeout(environment.getProperty("spring.cloud.consul.discovery.health-check-timeout", "90s"));
        check.setDeregisterCriticalServiceAfter(environment.getProperty("health-check-critical-timeout", "3m"));

        service.setCheck(check);

        // add stuff

        service.setName(descriptor.getName());
        service.setId(getId(descriptor));

        // done

        return service;
    }

    // implement ComponentRegistry

    public void startup(ComponentDescriptor<com.serious.service.Component> descriptor) {
        ConsulRegistration registration = new ConsulRegistration(
                service4(descriptor),
                properties4(descriptor)
        );

        registeredServices.put(descriptor, registration);

        consulServiceRegistry.register(registration);
    }

    public void shutdown(ComponentDescriptor<com.serious.service.Component> descriptor) {
        consulServiceRegistry.deregister(registeredServices.get(descriptor));
    }

    public List<ServiceInstance> getInstances(String service) {
        return discoveryClient.getInstances(service);
    }

    public List<String> getServices() {
        return discoveryClient.getServices();
    }
}

