package com.serious.service

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
    //TODO KOTLIN private set

    // implement Component
    override fun startup() {
        //TODO KOTLIN AbstractComponent.log.info("starting up {}", javaClass.getName())
        status = ComponentStatus.RUNNING
    }

    override fun shutdown() {
        //TODO KOTLIN AbstractComponent.log.info("shutdown {}", javaClass.getName())
        status = ComponentStatus.STOPPED
    }

    override val health: ComponentHealth
        get() = if (status == ComponentStatus.RUNNING) ComponentHealth.UP else ComponentHealth.DOWN

    companion object {
        // static data
        @JvmField
        var port: String? = null // TODO
        var inet = InetUtils(InetUtilsProperties())
        @JvmStatic
        val host: String
            // static methods
            get() = inet.findFirstNonLoopbackHostInfo().hostname // TODO getIpAddress();
    }
}
