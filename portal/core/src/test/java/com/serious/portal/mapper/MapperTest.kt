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

    @Test
    fun test() {

        val mapper = Mapper(
            Mapping.build(Money::class, Money::class) {
                map { properties() }
            },
            Mapping.build(Product::class, Product::class) {
                map { "id" to "id"}
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