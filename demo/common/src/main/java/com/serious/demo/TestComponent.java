package com.serious.demo;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Component;
import com.serious.service.ComponentInterface;

/**
 * @author Andreas Ernst
 */
@ComponentInterface(
        name = "TestComponent",
        description = "du funny stuff",
        services = {
                TestService.class,
                TestRestService.class
        })
public interface TestComponent extends Component {
    String hello();
}
