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

    public ServiceRuntimeException(String message, Object... args) {
        super(String.format(message, args));
    }

    ServiceRuntimeException(String message, Throwable cause) {
        super(message, cause);
    }
}