package com.serious.service.channel;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Channel;
import org.springframework.stereotype.Component;

import java.lang.annotation.*;

/**
 * @author Andreas Ernst
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@Component
public @interface RegisterChannelBuilder {
    Class<? extends Channel> channel();
}