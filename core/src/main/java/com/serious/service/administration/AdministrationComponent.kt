package com.serious.service.administration
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Component
import com.serious.service.ComponentInterface

@ComponentInterface(name = "AdministrationComponent",
    services = [
        ComponentIntrospectionService::class,
        ApplicationIntrospectionService::class
    ])
interface AdministrationComponent : Component {
}