package com.serious.service;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.commons.util.InetUtils;
import org.springframework.cloud.commons.util.InetUtilsProperties;

/**
 * @author Andreas Ernst
 */
@Slf4j
public abstract class AbstractComponent implements Component {
    // static data

    static String port;

    static InetUtils inet = new InetUtils(new InetUtilsProperties());

    // static methods

    public static String getHost() {
        return inet.findFirstNonLoopbackHostInfo().getHostname();// TODO getIpAddress();
    }

    public static String getPort() {
        return port;
    }

    // instance data

    private ComponentStatus status = ComponentStatus.VIRGIN;

    // implement Component
    public void startup() {
        log.info("starting up {}", getClass().getName());

        status = ComponentStatus.RUNNING;
    }

    public void shutdown() {
        log.info("shutdown {}", getClass().getName());

        status = ComponentStatus.STOPPED;
    }

    public ComponentStatus getStatus() {
        return status;
    }

    public ComponentHealth getHealth() {
        return getStatus() == ComponentStatus.RUNNING ? ComponentHealth.UP : ComponentHealth.DOWN;
    }
}
