package com.serious.portal.model

/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

/**
 * @author Andreas Ernst
 */
data class Manifest(
    var name: String,
    var version: String,
    var commitHash: String,
    var remoteEntry: String?,

    // actually

    var enabled: Boolean,
    var health: String? = "",

    // end

    var module: Module,
    var features: Array<Feature>
)
