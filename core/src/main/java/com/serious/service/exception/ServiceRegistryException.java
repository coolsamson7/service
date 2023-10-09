package com.serious.service.exception;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

/**
 * @author Andreas Ernst
 */
public class ServiceRegistryException extends RuntimeException {
    // ServiceException

    public ServiceRegistryException(String message, Object... args) {
        super(String.format(message, args));
    }

    ServiceRegistryException(String message, Throwable cause) {
        super(message, cause);
    }
}