package com.serious.service.channel
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.Channel
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

/**
 * Marks a [ChannelCustomizer]
 */
@MustBeDocumented
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.CLASS)
@Component
annotation class RegisterChannelCustomizer(val channel: KClass<out Channel>)