package com.serious.service.administration.model
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.cloud.client.ServiceInstance
import java.io.Serializable

data class UpdateDTO(
    val deletedServices : List<String>,
    val addedServices   : List<String>,
    val deletedInstances: Map<String, List<String>>,
    val addedInstances  : Map<String, List<ServiceInstance>>
) : Serializable