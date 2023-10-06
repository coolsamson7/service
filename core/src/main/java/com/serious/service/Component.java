package com.serious.service;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.util.List;

/**
 * @author Andreas Ernst
 */
public interface Component extends Service {
    void startup();

    void shutdown();

    List<ServiceAddress> getAddresses();

    ComponentStatus getStatus();

    ComponentHealth getHealth();
}
