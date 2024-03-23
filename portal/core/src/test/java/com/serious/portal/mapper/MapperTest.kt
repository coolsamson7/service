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

    data class From(var name: String)

    data class To(var name: String)

    class FooSource (var name: String, var bars: List<BarSource> = ArrayList() )

    class FooDataSource (var name: String, var bars: List<BarSource> = ArrayList() )

    data class FooTarget(var name: String, var bars: List<BarTarget> = ArrayList())

    class BarSource (var name: String = "")

    data class BarTarget(var name: String)

    class ReadOnly(val name: String)

    @Test()
    fun testDeepCollectionLevel1Data() {
        // classes

        class BarSource (var name: String = "")

        data class BarTarget(var name: String)

        data class InnerClassSource (var bars: List<BarSource> = ArrayList() )

        data class InnerClassTarget (var bars: List<BarTarget> = ArrayList() )

        class Source (var name: String, var innerClass: InnerClassSource)

        data class Target(var name: String, var innerClass: InnerClassTarget)


        // mapper

        val mapper = Mapper(
            Mapping.build(Source::class, Target::class) {
                map { properties("name")}
                map { path("innerClass", "bars") to  path("innerClass", "bars") deep true}
            },
            Mapping.build(BarSource::class, BarTarget::class) {
                map { properties("name")}
            })

        val source = Source("source", InnerClassSource(arrayListOf(BarSource("bar"))))
        val target = mapper.map<Target>(source)!!

        assertEquals("source", target.name)
        assertEquals(1, target.innerClass.bars.size)
    }

    @Test()
    fun testDeepCollectionLevel1() {
        // classes

        class BarSource (var name: String = "")

        data class BarTarget(var name: String)

        class InnerClassSource (var bars: List<BarSource> = ArrayList() )

        class InnerClassTarget (var bars: List<BarTarget> = ArrayList() )

        class Source (var name: String, var innerClass: InnerClassSource)

        data class Target(var name: String, var innerClass: InnerClassTarget)


        // mapper

        val mapper = Mapper(
            Mapping.build(Source::class, Target::class) {
                map { properties("name")}
                map { path("innerClass", "bars") to  path("innerClass", "bars") deep true}
            },
            Mapping.build(BarSource::class, BarTarget::class) {
                map { properties("name")}
            })

        val foo = Source("source", InnerClassSource(arrayListOf(BarSource("bar"))))

        val result = mapper.map<Target>(foo)!!

        assertEquals("source", result.name)
        assertEquals(1, result.innerClass.bars.size)
    }

    @Test()
    fun testTopLevelDeepCollection() {
        val mapper = Mapper(
            Mapping.build(FooSource::class, FooTarget::class) {
                map { properties("name")}
                map { "bars" to "bars" deep true}
            },
            Mapping.build(BarSource::class, BarTarget::class) {
                map { properties("name")}
            })

        val source = FooSource("source", arrayListOf(BarSource("bar")))
        val target = mapper.map<FooTarget>(source)!!

        assertEquals("source", target.name)
        assertEquals(1, target.bars.size)
    }
    @Test()
    fun testTopLevelDataDeepCollection() {
        val mapper = Mapper(
            Mapping.build(FooDataSource::class, FooTarget::class) {
                map { properties("name")}
                map { "bars" to "bars" deep true}
            },
            Mapping.build(BarSource::class, BarTarget::class) {
                map { properties("name")}
            })

        val source = FooDataSource("source", arrayListOf(BarSource("bar")))
        val target = mapper.map<FooTarget>(source)!!

        assertEquals("source", target.name)
        assertEquals(1, target.bars.size)
    }


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
        val from = From("from")

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