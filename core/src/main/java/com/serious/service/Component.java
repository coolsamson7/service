package com.serious.service;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

/**
 * @author Andreas Ernst
 */
public interface Component extends Service {
    void startup();

    void shutdown();

    ServiceAddress getAddress();

    ComponentStatus getStatus();

    ComponentHealth getHealth();
}
