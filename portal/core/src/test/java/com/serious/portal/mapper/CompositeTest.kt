package com.serious.portal.mapper
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class CompositeTest {
    // local classes

    class Product {
        var name: String = "product"
        var id : Long = 1
        var price: Money = Money("EU", 1)
    }

    data class Money(
        val currency: String,
        val value: Long
    )

    // test

    @Test
    fun test() {
        val prodMapper = Mapper(
            mapping(Product::class, Product::class) {
                map {"id" to "id"}
                map {"name" to "name" }
                map {path("price", "currency") to path("price", "currency") }
                map {path("price", "value") to path("price", "value") }
            }
        )


        val prod = Product()
        val result = prodMapper.map<Product>(prod)!!

        assertEquals(prod.price.currency, result.price.currency)
    }
}