package com.serious.demo.impl
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.demo.CommonService
import org.springframework.stereotype.Component

@Component
class CommonServiceImpl : CommonService {
    override fun hello(): String {
        return "hello"
    }
}
