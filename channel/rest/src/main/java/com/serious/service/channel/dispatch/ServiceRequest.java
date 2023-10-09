package com.serious.service.channel.dispatch;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import java.io.Serializable;

public class ServiceRequest implements Serializable {
    // instance data
    public String service;
    public int method;
    public Object[] arguments;

    // constructor

    ServiceRequest( String service, int method, Object[] arguments) {
        this.service   = service;
        this.method    = method;
        this.arguments = arguments;
    }
}