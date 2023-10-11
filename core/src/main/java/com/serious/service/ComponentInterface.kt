package com.serious.service;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.lang.annotation.*;

/**
 * @author Andreas Ernst
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface ComponentInterface {
    String name() default "";
    String description() default "";

    Class<? extends Service>[] services();
}