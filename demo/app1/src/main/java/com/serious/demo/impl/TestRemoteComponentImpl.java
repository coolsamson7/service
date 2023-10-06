package com.serious.demo.impl;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.demo.TestRemoteComponent;
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
@ComponentHost(health = "/api/test-remote-component/test-health")
@RestController()
@RequestMapping("/api/test-remote-component/")
public class TestRemoteComponentImpl extends AbstractComponent implements TestRemoteComponent {
    // instance data

    @Autowired
    HealthEndpoint healthEndpoint;

    // override AbstractComponent

    @GetMapping("/test-health")
    @ResponseBody
    public ComponentHealth getHealth() {
        return healthEndpoint.health().getStatus() == Status.UP ? ComponentHealth.UP : ComponentHealth.DOWN;
    }

    @GetMapping("/uri")
    @ResponseBody
    public List<ServiceAddress> getAddresses() {
        return Collections.singletonList(new ServiceAddress("rest", URI.create("http://" + getHost() + ":" + getPort())));
    }
}
