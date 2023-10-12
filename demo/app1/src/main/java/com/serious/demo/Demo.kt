package com.serious.demo

import com.serious.service.annotations.InjectService
import jakarta.annotation.PostConstruct
import org.springframework.stereotype.Component

/*
* @COPYRIGHT (C) 2016 Andreas Ernst
*
* All rights reserved
*/ /**
 * @author Andreas Ernst
 */
@Component
class Demo {
    // instance data
    @InjectService
    var testRemoteRestService: TestRemoteRestService? = null

    @InjectService(preferLocal = true)
    var localTestRemoteRestService: TestRemoteRestService? = null

    // lifecycle
    @PostConstruct
    fun demo() {
        //System.out.println(testRemoteRestService.hello());
        //System.out.println(localTestRemoteRestService.hello());
    }
}
