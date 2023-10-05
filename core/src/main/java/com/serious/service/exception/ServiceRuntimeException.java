package com.serious.service.exception;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

/**
 * @author Andreas Ernst
 */
public class ServiceRuntimeException extends RuntimeException {
    // ServiceException

    public ServiceRuntimeException(String message) {
        super(message);
    }

    ServiceRuntimeException(String message, Throwable cause) {
        super(message, cause);
    }
}