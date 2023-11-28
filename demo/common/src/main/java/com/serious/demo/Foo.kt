package com.serious.demo
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.io.Serializable
import java.time.LocalDate
import java.util.*

 /**
 * @author Andreas Ernst
 */
 open class Base : Serializable {
     @NotNull
     @NotBlank
     var name = "name"
 }

enum class RGB {
    RED,
    GREEN,
    BLUE
}
class Foo : Base() {

    @Min(0)
    @Max(100)
    var age = 10
    var weight = 10.0
    var color = RGB.RED
    var single = false
    var date = Date()
    //var localDate = LocalDate.now()
    var data1 = "data1"
    var data2 = "data2"
    var data3 = "data3"
    var data4 = "data4"
}
