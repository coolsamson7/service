package com.serious.demo

import com.serious.service.Service
import com.serious.service.ServiceInterface

/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/ /**
 * @author Andreas Ernst
 */
@ServiceInterface(name = "CommonService")
interface CommonService : Service {
    fun hello(): String
}
