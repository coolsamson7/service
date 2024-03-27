package com.serious.portal.mapper
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.util.HashMap

typealias PKGetter<T,PK> = (any: T) -> PK

abstract class RelationSynchronizer<S, T, PK> protected constructor(private val toPK: PKGetter<S,PK>, private val pk: PKGetter<T,PK>) {
    // protected

    protected open fun missingPK(pk: PK) : Boolean {
        return false
    }
    protected abstract fun provide(source: S, context: Mapping.Context): T

    protected open fun delete(entity: T) {}

    protected open fun update(target: T, source: S, context: Mapping.Context) {}

    protected fun addToRelation(relation: MutableCollection<T>, target: T) {
        relation.add(target)
    }

    protected fun removeFromRelation(relation: MutableCollection<T>, target: T) {
        relation.remove(target)
    }

    // public

    fun synchronize(source: Collection<S>, target: MutableCollection<T>, mappingContext: Mapping.Context) {
        val targetMap: MutableMap<PK, T> = HashMap()

        // collect all targets in a map

        for (t in target)
            targetMap[pk(t)] = t

        // iterate over source objects

        for (s in source) {
            val key = toPK(s)

            if (!missingPK(key)) {
                val t = targetMap[key]

                if (t == null)
                    addToRelation(target, provide(s, mappingContext))

                else {
                    // possibly update

                    update(t, s, mappingContext)

                    targetMap.remove(key)
                } // else
            } // if
            else addToRelation(target, provide(s, mappingContext))
        } // for

        // deleted

        for (deleted in targetMap.values) {
            removeFromRelation(target, deleted)

            delete(deleted)
        } // if
    }
}
