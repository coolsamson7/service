package org.sirius.persistence.type
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.hibernate.HibernateException

import org.hibernate.usertype.UserType
import java.io.Serializable

/**
 * This is a base class for user types tha implements most of the standard methods.
 *
 * @author Andreas Ernst
 */
abstract class AbstractUserType<T>(private val clazz: Class<T>, private val sqlType: Int) : UserType<T> {
    // implement UserType

    override fun getSqlType(): Int {
        return sqlType
    }

    override fun returnedClass(): Class<T> {
        return clazz
    }

    @Throws(HibernateException::class)
    override fun equals(x: T, y: T): Boolean {
        return if (x == null || y == null) x === y
        else x.javaClass == y.javaClass && x == y
    }

    @Throws(HibernateException::class)
    override fun hashCode(o: T): Int {
        return o.hashCode()
    }

    @Throws(HibernateException::class)
    override fun deepCopy(value: T): T {
        return value
    }

    override fun isMutable(): Boolean {
        return false
    }

    @Throws(HibernateException::class)
    override fun disassemble(value: T): Serializable {
        return value as Serializable
    }

    @Throws(HibernateException::class)
    override fun assemble(cached: Serializable, owner: Any): T {
        return cached as T
    }

    @Throws(HibernateException::class)
    override fun replace(original: T, target: T, owner: Any): T {
        return original
    }
}