package com.serious.injection;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

/**
 * @author Andreas Ernst
 */
public class InjectionException extends RuntimeException {
    public InjectionException() {
    }

    public InjectionException(Throwable cause) {
        super(cause);
    }

    public InjectionException(String message) {
        super(message);
    }

    public InjectionException(String message, Throwable cause) {
        super(message, cause);
    }
}