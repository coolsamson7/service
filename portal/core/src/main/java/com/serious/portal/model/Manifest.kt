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
    var enabled: Boolean = true,
    var version: String,
    var commitHash: String,
    var remoteEntry: String?,

    var module: Module,
    var features: Array<Feature>
)
