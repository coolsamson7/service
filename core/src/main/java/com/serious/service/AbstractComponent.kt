package com.serious.service

import com.serious.service.ComponentManager.Companion.log
import lombok.extern.slf4j.Slf4j
import org.springframework.cloud.commons.util.InetUtils
import org.springframework.cloud.commons.util.InetUtilsProperties

/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/ /**
 * @author Andreas Ernst
 */
@Slf4j
abstract class AbstractComponent : Component {
    // instance data
    override var status = ComponentStatus.VIRGIN

    // implement Component
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
            get() = inet.findFirstNonLoopbackHostInfo().hostname // TODO getIpAddress();
    }
}
