package com.serious.portal.mapper
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.junit.jupiter.api.Test
import java.util.ArrayList
import kotlin.test.assertEquals

class SynchronizerTest {
    // local classes

    class Bar(var id: Int) {
        var name : String = ""
    }

    class BarEntity(var id: Int) {
        constructor() : this(0) {
        }

        var name : String = ""
    }

    class Root {
        var bars = ArrayList<Bar>()
    }

    class RootEntity {
        var bars = ArrayList<BarEntity>()
    }


    class BarSynchronizer : MapperRelationSynchronizer<Bar, BarEntity, Int>({bar: Bar -> bar.id}, {bar: BarEntity -> bar.id}) {
        override fun provide(bar: Bar, context: Mapping.Context): BarEntity {
            return context.mapper.map(bar, context)!!
        }

        override fun update(entity: BarEntity, transportObject: Bar, context: Mapping.Context) {
            context.mapper.map(transportObject, entity, context)
        }
    }

    // test

    @Test
    fun test() {
        val root = Root()
        val bar = Bar(1)
        bar.name = "bar"
        root.bars.add(bar)

        val rootMapper = Mapper(
            mapping(Root::class, RootEntity::class)
                .synchronize("bars", "bars", BarSynchronizer()),

            mapping(Bar::class, BarEntity::class)
                .map("id", "id") // ?
                .map("name", "name")
        )

        val rootResult = rootMapper.map<RootEntity>(root)!!

        // add another bar and remap

        root.bars.add(Bar(2))

        rootMapper.map(root, rootResult)
    }
}