package com.serious.service.administration
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Component
import com.serious.service.ComponentInterface

@ComponentInterface(services = [ComponentIntrospectionService::class])
interface AdministrationComponent : Component {
}