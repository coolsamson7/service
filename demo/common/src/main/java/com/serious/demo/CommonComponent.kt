package com.serious.demo
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.Component
import com.serious.service.ComponentInterface

@ComponentInterface(name = "CommonComponent", services = [CommonService::class])
interface CommonComponent : Component
