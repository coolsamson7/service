package com.serious.service;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.stereotype.Component;

import java.lang.annotation.*;

/**
 * @author Andreas Ernst
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Component
public @interface ComponentHost {
    String[] channels() default {"local"};

    String health() default "/health";
}