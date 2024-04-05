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
        var value: Long
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

    class From {
        var name: String=""
        var price = Money("EU", 1)
        var p3 = ""
        var p4 = ""
        var p5 = ""
        var p6 = ""
        var p7 = ""
        var p8 = ""
        var p9 = ""
        var p10 = ""
    }

    class To {
        var name: String=""
        var price = Money("EU", 1)
        var p3 = ""
        var p4 = ""
        var p5 = ""
        var p6 = ""
        var p7 = ""
        var p8 = ""
        var p9 = ""
        var p10 = ""
    }

    class FooSource (var name: String, var bars: List<BarSource> = ArrayList() )

    class FooDataSource (var name: String, var bars: List<BarSource> = ArrayList() )

    data class FooTarget(var name: String, var bars: List<BarTarget> = ArrayList())

    class BarSource (var name: String = "")

    data class BarTarget(var name: String)

    class ReadOnly {
        val name = "read-only"
    }

    @Test()
    fun testStrangeConstructor() {
        // classes

        class StrangeConstructor(val a: Int, val b: String) {
            var c = 1
            var d = ""
        }

        // mapper

        val mapper = Mapper(
            mapping(StrangeConstructor::class, StrangeConstructor::class) {
                map { matchingProperties("a", "b")}
                map { "d" to "d"}
                map { "c" to "c"}
            })


        val source = StrangeConstructor(1, "b")
        source.c = 2
        source.d = "d"
        val target = mapper.map<StrangeConstructor>(source)!!

        assertEquals(1, target.a)
        assertEquals(2, target.c)
        assertEquals("d", target.d)
    }

    @Test()
    fun testPath() {
        // classes

        data class Price(val currency: String, val value: Long)

        class Product (var name: String = "", val price1: Price?, val price2: Price)

        data class Target(var name: String, val price1: Long, val price2: Long) // TODO ? test :-)

        // mapper

        val mapper = Mapper(
            mapping(Product::class, Target::class) {
                map { matchingProperties("name")}
                map { path("price1", "value") to "price1"}
                map { path("price2", "value") to "price2"}
            })


        val source = Product("product", Price("EU", 1), Price("EU", 2)) // TODO null
        val target = mapper.map<Target>(source)!!

        //assertEquals(null, target.price1)
        assertEquals(2, target.price2)
    }

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
            mapping(Source::class, Target::class) {
                map { matchingProperties("name")}
                map { path("innerClass", "bars") to  path("innerClass", "bars") deep true}
            },
            mapping(BarSource::class, BarTarget::class) {
                map { matchingProperties("name")}
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
            mapping(Source::class, Target::class) {
                map { matchingProperties("name")}
                map { path("innerClass", "bars") to  path("innerClass", "bars") deep true }
            },
            mapping(BarSource::class, BarTarget::class) {
                map { matchingProperties("name")}
            })

        val foo = Source("source", InnerClassSource(arrayListOf(BarSource("bar"))))

        val result = mapper.map<Target>(foo)!!

        assertEquals("source", result.name)
        assertEquals(1, result.innerClass.bars.size)
    }

    @Test()
    fun testTopLevelDeepCollection() {
        val mapper = Mapper(
            mapping(FooSource::class, FooTarget::class) {
                map { matchingProperties("name")}
                map { "bars" to "bars" deep true}
            },
            mapping(BarSource::class, BarTarget::class) {
                map { matchingProperties("name")}
            })

        val source = FooSource("source", arrayListOf(BarSource("bar")))
        val target = mapper.map<FooTarget>(source)!!

        assertEquals("source", target.name)
        assertEquals(1, target.bars.size)
    }
    @Test()
    fun testTopLevelDataDeepCollection() {
        val mapper = Mapper(
            mapping(FooDataSource::class, FooTarget::class) {
                map { matchingProperties("name")}
                map { "bars" to "bars" deep true}
            },
            mapping(BarSource::class, BarTarget::class) {
                map { matchingProperties("name")}
            })

        val source = FooDataSource("source", arrayListOf(BarSource("bar")))
        val target = mapper.map<FooTarget>(source)!!

        assertEquals("source", target.name)
        assertEquals(1, target.bars.size)
    }


    @Test()
    fun testReadOnlyException() {
        try {
            val m = Mapper(
                mapping(From::class, ReadOnly::class) {
                    map { "name" to "name"}
                })

            throw Exception("ouch")
        }
        catch(exception: MapperDefinitionException) {
            println()
        }
    }

    @Test()
    fun testConstant() {
        val mapper = Mapper(
            mapping(From::class, To::class) {
                    map { constant("name") to "name"}
                })

        val result = mapper.map<To>(From())!!

        assertEquals("name", result.name)
    }

    @Test()
    fun testExceptionMissingSpec() {
        try {
            Mapper(
                mapping(From::class, To::class) {
                    map { }
                })

            throw Exception("ouch")
        }
        catch(exception: MapperDefinitionException) {

        }
    }

    @Test
    fun test1() {
        val from = From()//"from")

        val mapper = Mapper(
            mapping(From::class, To::class) {
                map { path("price", "currency") to path("price", "currency") }
                map { path("price", "value") to path("price", "value") }
                map { matchingProperties() }
                finalize {source, target -> target }
            })

        // warm up

        val result = mapper.map<To>(from)

        val loops = 100000

        while (false) {
            var start = System.currentTimeMillis()
            for (i in 0 until loops)
                mapper.map<To>(from)

            var ms = System.currentTimeMillis() - start
            println("map: " + loops + " loops in " + ms + "ms, avg " + ms.toDouble() / loops)


            fun mapTo(from: From): To {
                val to = To()

                to.price = Money(from.price.currency, from.price.value)

                to.p3 = from.p3
                to.p4 = from.p4
                to.p5 = from.p5
                to.p6 = from.p6
                to.p7 = from.p7
                to.p8 = from.p8
                to.p9 = from.p9

                return to
            }

            start = System.currentTimeMillis()
            for (i in 0 until loops)
                mapTo(from)

            ms = System.currentTimeMillis() - start
            println("manual: " + loops + " loops in " + ms + "ms, avg " + ms.toDouble() / loops)

        }
        //assertEquals("from", result?.name)
    }


    @Test
    fun test() {
        val mapper = Mapper(
            mapping(Money::class, Money::class) {
                map { matchingProperties() }
            },
            mapping(Product::class, Product::class) {
                map { matchingProperties("id") }
                //map { Product::isNull to Product::isNull}

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


        /*


        val loops = 100000
        val start = System.currentTimeMillis()
        for (i in 0 until loops)
            mapper.map<Product>(product)

        val ms = System.currentTimeMillis() - start
        println("" + loops + " loops in " + ms + "ms, avg " + ms.toDouble() / loops)
*/

    }
}