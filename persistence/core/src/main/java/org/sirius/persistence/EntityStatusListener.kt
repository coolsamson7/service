package org.sirius.persistence
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.persistence.PrePersist
import jakarta.persistence.PreUpdate
import org.sirius.common.beans.BeanObserver

import org.sirius.common.bean.BeanDescriptor
import org.sirius.common.lang.TransactionLocal
import org.sirius.persistence.type.EntityStatus
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.concurrent.ConcurrentHashMap
import kotlin.reflect.KClass

class EntityStatusListener {
    // local classes

    interface SessionContext {
        /**
         * return the current user.
         *
         * @return the current user
         */
        val user: String
    }

    open class Setter {
        open fun create(entity: Any, user: String, time: LocalDateTime) {}

        open fun update(entity: Any, user: String, time: LocalDateTime) {}
    }

    class BeanSetter(private val property: BeanDescriptor.Property<Any>) : Setter() {
        // override Setter

        override fun create(entity: Any, user: String, time: LocalDateTime) {
            val status : EntityStatus? = property.get(entity)
            if ( status == null) {
                property.set(entity, EntityStatus(
                    time,
                    user,
                    time,
                    user
                ))
            }
            else {
                CREATING_USER.set(status, user)
                CREATING_DATE.set(status, time)
            }
        }

        override fun update(entity: Any, user: String, time: LocalDateTime) {
            val status : EntityStatus? = property.get(entity)
            if ( status == null) {
                property.set(entity, EntityStatus(
                    time,
                    user,
                    time,
                    user
                ))
            }
            else {
                UPDATING_USER.set(status, user)
                UPDATING_DATE.set(status, time)
            }
        }
    }

    // private

    private val flushTime = TransactionLocal<LocalDateTime>()
    private val setter = ConcurrentHashMap<KClass<*>, Setter>()

    // jpa-callbacks

    @PrePersist
    fun prePersist(entity: Any) {
        setEntityStatus(entity, true)
    }

    @PreUpdate
    fun preUpdate(entity: Any) {
        setEntityStatus(entity, false)
    }

    // private

    private fun setter4(clazz: KClass<*>) : Setter {
        val beanDescriptor = BeanDescriptor.ofClass(clazz)
        return if ( beanDescriptor.properties.find { property -> property.name == ENTITY_STATUS } != null)
            BeanSetter(beanDescriptor.property(ENTITY_STATUS)!!)
        else
            NOOP_SETTER
    }

    private fun getFlushTime(): LocalDateTime {
        var time = flushTime.get()
        if (time == null) {
            time = LocalDateTime.now(ZoneOffset.UTC)
            flushTime.set(time)
        }

        return time!!
    }

    private fun setEntityStatus(entity: Any, create: Boolean) {
        val setter = setter.getOrPut(entity::class) { setter4(entity::class) }
        if ( create )
            setter.create(entity, sessionContext.user, getFlushTime())
        else
            setter.update(entity, sessionContext.user, getFlushTime())
    }

    companion object {
        // init

        init {
            BeanObserver.require(SessionContext::class) { context -> sessionContext = context }
        }

        // constants

        private const val ENTITY_STATUS = "entityStatus"

        private val NOOP_SETTER = Setter()

        private val CREATING_USER = BeanDescriptor.ofClass(EntityStatus::class).property("creatingUser")!!
        private val CREATING_DATE = BeanDescriptor.ofClass(EntityStatus::class).property("creatingDate")!!

        private val UPDATING_USER = BeanDescriptor.ofClass(EntityStatus::class).property("updatingUser")!!
        private val UPDATING_DATE = BeanDescriptor.ofClass(EntityStatus::class).property("updatingDate")!!

        // static data

        private lateinit var sessionContext: SessionContext
    }
}
