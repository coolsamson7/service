package com.serious.portal.mapper
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.util.HashMap

typealias PKGetter<T,PK> = (any: T) -> PK

abstract class RelationSynchronizer<TO, ENTITY, PK> protected constructor(private val toPK: PKGetter<TO,PK>, private val entityPK: PKGetter<ENTITY,PK>) {
    // protected

    protected open fun missingPK(pk: PK) : Boolean {
        return false
    }
    protected abstract fun provide(referencedTransportObject: TO, context: Mapping.Context): ENTITY

    protected open fun delete(entity: ENTITY) {}

    protected open fun update(entity: ENTITY, transportObject: TO, context: Mapping.Context) {}

    protected fun addToRelation(relation: MutableCollection<ENTITY>, referencedEntity: ENTITY) {
        relation.add(referencedEntity)
    }

    protected fun removeFromRelation(relation: MutableCollection<ENTITY>, referencedEntity: ENTITY) {
        relation.remove(referencedEntity)
    }

    // public

    fun synchronize(toRelation: Collection<TO>, entityRelation: MutableCollection<ENTITY>, mappingContext: Mapping.Context) {
        val entityMap: MutableMap<PK, ENTITY> = HashMap()

        // collect all entities in a map

        for (entity in entityRelation)
            entityMap[entityPK(entity)] = entity

        // iterate over transport objects

        for (to in toRelation) {
            val key = toPK(to)

            if (!missingPK(key)) {
                val entity = entityMap[key]

                if (entity == null)
                    addToRelation(entityRelation, provide(to, mappingContext))

                else {
                    // possibly update entity

                    update(entity, to, mappingContext)

                    entityMap.remove(key)
                } // else
            } // if
            else addToRelation(entityRelation, provide(to, mappingContext))
        } // for

        // deleted entities

        for (deletedPersistent in entityMap.values)
            if (isEntityToRemove(deletedPersistent)) {
                removeFromRelation(entityRelation, deletedPersistent)

                delete(deletedPersistent)
            } // if
    }

    protected fun isEntityToRemove(entity: ENTITY): Boolean {
        return true
    }
}
