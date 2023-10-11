package com.serious.service

import org.springframework.stereotype.Component

/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */ /**
 * @author Andreas Ernst
 */
@MustBeDocumented
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.CLASS)
@Component
annotation class ComponentHost(val health: String = "/health") 