package com.serious.service;/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

/**
 * @author Andreas Ernst
 */
public class ServiceException extends RuntimeException {
    // constructor

    public ServiceException(String message) {
        super(message);
    }

    ServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
