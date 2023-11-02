package com.serious.demo
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull
import java.io.Serializable
import java.util.*

 /**
 * @author Andreas Ernst
 */
class Foo : Serializable {
    @NotNull()
    var name = "name"
    @Min(0)
    @Max(100)
    var age = 10
    var date = Date()
    var data1 = "data1"
    var data2 = "data2"
    var data3 = "data3"
    var data4 = "data4"
}
