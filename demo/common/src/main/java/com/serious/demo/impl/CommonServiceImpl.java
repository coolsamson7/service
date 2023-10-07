package com.serious.demo.impl;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.demo.CommonService;
import com.serious.demo.TestService;
import com.serious.service.AbstractService;
import org.springframework.stereotype.Component;

/**
 * @author Andreas Ernst
 */
@Component
public class CommonServiceImpl extends AbstractService implements CommonService {
    @Override
    public String hello() {
        return "hello";
    }
}
