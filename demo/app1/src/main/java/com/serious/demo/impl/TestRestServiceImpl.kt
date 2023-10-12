package com.serious.demo.impl;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.demo.TestRestService;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author Andreas Ernst
 */
@RestController
class TestRestServiceImpl implements TestRestService {
    public String hello() {
        return "hello";
    }
}
