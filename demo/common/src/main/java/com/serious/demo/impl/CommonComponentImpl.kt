package com.serious.demo.impl;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.demo.CommonComponent;
import com.serious.demo.TestComponent;
import com.serious.service.AbstractComponent;
import com.serious.service.ComponentHealth;
import com.serious.service.ComponentHost;
import com.serious.service.ServiceAddress;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.health.Status;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.Collections;
import java.util.List;

/**
 * @author Andreas Ernst
 */
@ComponentHost(health = "/api/common-component/test-health")
@RestController()
@RequestMapping(value = "/api/common-component")
public class CommonComponentImpl extends AbstractComponent implements CommonComponent {
    // instance data

    @Autowired
    HealthEndpoint healthEndpoint;

    // override AbstractComponent

    @GetMapping("/test-health")
    @ResponseBody
    public ComponentHealth getHealth() {
        return healthEndpoint.health().getStatus() == Status.UP ? ComponentHealth.UP : ComponentHealth.DOWN;
    }

    // implement TestComponent

    @GetMapping("/uri")
    @ResponseBody
    public List<ServiceAddress> getAddresses() {
        return List.of(
                new ServiceAddress("dispatch", URI.create("http://" + getHost() + ":" + port)),
                new ServiceAddress("rest", URI.create("http://" + getHost() + ":" + port))
        );
    }
}
