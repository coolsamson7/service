package com.serious.demo;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Service;
import com.serious.service.ServiceInterface;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * @author Andreas Ernst
 */
@ServiceInterface(name="TestRestService")
public interface TestRestService extends Service {
    @GetMapping("/hello1")
    @ResponseBody
    String hello();
}
