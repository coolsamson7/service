package com.serious.portal.model
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.annotation.JsonInclude

@JsonInclude(JsonInclude.Include.NON_NULL)
data class Folder(
    var name : String,
    var label: String? = null,
    var icon : String? = null,
    var children: Array<String>? = null,
)
