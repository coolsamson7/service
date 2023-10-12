package com.serious.demo;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Service;
import com.serious.service.ServiceInterface;

/**
 * @author Andreas Ernst
 */
@ServiceInterface(name = "CommonService")
public interface CommonService extends Service {
    String hello();
}
