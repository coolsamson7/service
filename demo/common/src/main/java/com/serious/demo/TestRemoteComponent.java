package com.serious.demo;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Component;
import com.serious.service.ComponentInterface;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Andreas Ernst
 */
@ComponentInterface(
        services = {
                TestRemoteRestService.class
        })
@RestController
public interface TestRemoteComponent extends Component {
}
