package com.serious.service
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.ServiceManager.Companion.log
import lombok.extern.slf4j.Slf4j
import org.springframework.cloud.commons.util.InetUtils
import org.springframework.cloud.commons.util.InetUtilsProperties

/**
 * abstract base class for components
 */
@Slf4j
abstract class AbstractComponent : Component {
    // implement Component

     override var status = ComponentStatus.VIRGIN

    override fun startup() {
        log.info("starting up {}", javaClass.getName())

        status = ComponentStatus.RUNNING
    }

    override fun shutdown() {
        log.info("shutdown {}", javaClass.getName())

        status = ComponentStatus.STOPPED
    }

    override val health: ComponentHealth
        get() = if (status == ComponentStatus.RUNNING) ComponentHealth.UP else ComponentHealth.DOWN

    companion object {
        // static data

        @JvmField
        var port: String? = null
        var inet = InetUtils(InetUtilsProperties())
        @JvmStatic
        val host: String
            get() = inet.findFirstNonLoopbackHostInfo().hostname // isn't getIpAddress() better?
    }
}
