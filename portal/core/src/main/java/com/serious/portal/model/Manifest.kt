package com.serious.portal.model

import com.fasterxml.jackson.annotation.JsonInclude

/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

/**
 * @author Andreas Ernst
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
data class Manifest(
    var name: String,
    var version: String,
    var commitHash: String,
    var remoteEntry: String?,

    // actually

    var enabled: Boolean,
    var health: String? = "",

    // end

    var module: String,
    var features: Array<Feature>
)
