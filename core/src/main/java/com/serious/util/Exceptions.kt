package com.serious.util;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.lang.reflect.Field;

/**
 * @author Andreas Ernst
 */
public class Exceptions {
    // required to avoid startup issues with the security manager.

    static final sun.misc.Unsafe UNSAFE;

    static {
        try {
            Field field = sun.misc.Unsafe.class.getDeclaredField("theUnsafe");
            field.setAccessible(true);

            UNSAFE = (sun.misc.Unsafe) field.get(null);
        }
        catch (Exception e) {
            throw new AssertionError(e);
        }
    }

    // constructor

    private Exceptions() {
    }

    // static methods

    /**
     * Rethrow any throwable, even checked exceptions blindly. :-)
     *
     * @param e the exception
     */
    public static void throwException(Throwable e) {
        UNSAFE.throwException(e);
    }
}
