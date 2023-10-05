package com.serious.demo;/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.annotations.InjectService;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

/**
 * @author Andreas Ernst
 */
@Component
public class Demo {
    // instance data
    @InjectService
    TestRemoteRestService testRemoteRestService;

    @InjectService(preferLocal = true)
    TestRemoteRestService localTestRemoteRestService;

    // lifecycle

    @PostConstruct
    public void demo() {
        //System.out.println(testRemoteRestService.hello());
        //System.out.println(localTestRemoteRestService.hello());
    }
}
