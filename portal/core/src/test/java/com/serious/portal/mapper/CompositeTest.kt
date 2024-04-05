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
        var name1 = ""
        var name2 = ""
        var name3 = ""
        var name4 = ""
        var name5 = ""
        var name6 = ""
        var name7 = ""
        var name8 = ""
        var name9 = ""
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
                map {matchingProperties("name1", "name2", "name3", "name4", "name5", "name6", "name7", "name8", "name9")}
                map {path("price", "currency") to path("price", "currency") }
                map {path("price", "value") to path("price", "value") }
            }
        )

        fun mapProduct(prod: Product) : Product{
            val result = Product()
            result.id = prod.id
            result.name = prod.name

            result.name1 = prod.name1
            result.name2 = prod.name2
            result.name3 = prod.name3
            result.name4 = prod.name4
            result.name5 = prod.name5
            result.name6 = prod.name6
            result.name7 = prod.name7
            result.name8 = prod.name8
            result.name9 = prod.name9
            result.price = Money(prod.price.currency, prod.price.value)

            return result
        }


        val prod = Product()
        val result = prodMapper.map<Product>(prod)!!

        assertEquals(prod.price.currency, result.price.currency)

        val loops = 100000

        while (false) {
            var start = System.currentTimeMillis()
            for (i in 0 until loops)
                prodMapper.map<Product>(prod)

            var ms = System.currentTimeMillis() - start
            println("mapper: " + loops + " loops in " + ms + "ms, avg " + ms.toDouble() / loops)

            // low level

            start = System.currentTimeMillis()
            for (i in 0 until loops)
                mapProduct(prod)

            ms = System.currentTimeMillis() - start
            println("manual:" + loops + " loops in " + ms + "ms, avg " + ms.toDouble() / loops)
        }
    }
}