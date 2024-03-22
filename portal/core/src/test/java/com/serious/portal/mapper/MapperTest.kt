package com.serious.portal.mapper
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class MapperTest {
    // local classes

    data class Money(
        val currency: String,
        val value: Long
    )

    open class Base {
        var id = "id"
    }

    data class InnerComposite(val price: Money)

    class MutableInnerComposite {
        var price: Money = Money("EU", 1)
    }

    class Product : Base() {
        var isNull = null
        var innerComposite : InnerComposite? =  null
        var mutableInnerComposite : MutableInnerComposite? =  null
    }

    // test

    class From (var name: String = "")

    data class To(var name: String)

    class ReadOnly(val name: String)

    @Test()
    fun testReadOnlyException() {
        try {
            Mapper(
                Mapping.build(From::class, ReadOnly::class) {
                    map { "name" to "name"}
                })

            throw Exception("ouch")
        }
        catch(exception: MapperDefinitionException) {
            println()
        }
    }

    @Test()
    fun testExceptionMissingSpec() {
        try {
            Mapper(
                Mapping.build(From::class, To::class) {
                    map { }
                })

            throw Exception("ouch")
        }
        catch(exception: MapperDefinitionException) {

        }
    }

    @Test
    fun test1() {
        val from = From()
        from.name = "from"

        val mapper = Mapper(
            Mapping.build(From::class, To::class) {
                map { properties() }
            })

        println(mapper.describe())

        val result = mapper.map<To>(from)

        assertEquals("from", result?.name)
    }


    @Test
    fun test() {
        val mapper = Mapper(
            Mapping.build(Money::class, Money::class) {
                map { properties() }
            },
            Mapping.build(Product::class, Product::class) {
                map { properties("id") }
                map { Product::isNull to Product::isNull}

                map { path("innerComposite", "price", "value") to  path("innerComposite", "price", "value")}
                map { path("innerComposite", "price", "currency") to  path("innerComposite", "price", "currency")}

                map { path("mutableInnerComposite", "price", "value") to  path("mutableInnerComposite", "price", "value")}
                map { path("mutableInnerComposite", "price", "currency") to  path("mutableInnerComposite", "price", "currency")}
            }
        )

        val product = Product()
        product.innerComposite = InnerComposite(Money("EU",1))
        product.mutableInnerComposite = MutableInnerComposite()

        product.mutableInnerComposite?.price = Money("EU",1)

        val result = mapper.map<Product>(product)

        assertEquals(1, result?.mutableInnerComposite?.price?.value)
        assertEquals(1, result?.innerComposite?.price?.value)
    }
}