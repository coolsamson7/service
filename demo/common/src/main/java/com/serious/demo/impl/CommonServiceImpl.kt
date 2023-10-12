package com.serious.demo.impl
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.demo.CommonService
import com.serious.service.AbstractService
import org.springframework.stereotype.Component

@Component
class CommonServiceImpl : AbstractService(), CommonService {
    override fun hello(): String {
        return "hello"
    }
}
