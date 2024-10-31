package com.serious.portal.model
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.annotation.JsonInclude



/**
 * @author Andreas Ernst
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
data class Manifest(
    var name: String,
    var type: String,
    var stack: String?,
    var version: String,
    var commitHash: String,
    var remoteEntry: String?,
    var healthCheck: String?,

    // actually

    var enabled: Boolean,
    var health: String? = "",

    // end

    var module: String,
    var features: Array<Feature>,
    var folders: Array<Folder>
)
