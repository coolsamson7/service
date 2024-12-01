package org.sirius.persistence.type
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.transaction.Status
import org.hibernate.usertype.UserVersionType
import java.sql.PreparedStatement
import java.sql.ResultSet
import java.sql.SQLException
import java.sql.Types
import java.util.*
import jakarta.transaction.TransactionManager
import jakarta.transaction.Synchronization
import org.hibernate.HibernateException
import org.hibernate.engine.spi.SharedSessionContractImplementor
import org.sirius.common.beans.BeanObserver


/**
 * User type for [VersionCounter]s that additionally takes care of
 * incrementing the version instance.
 *
 * @author Andreas Ernst
 */
class VersionCounterUserType : AbstractUserType<VersionCounter>(VersionCounter::class.java, Types.BIGINT), UserVersionType<VersionCounter> {
    // private

    private fun registerModification(versionCounter: VersionCounter) {
        var incrementCounters: MutableList<VersionCounter>?

        if ((COUNTERS.get().also { incrementCounters = it }) == null) {
            COUNTERS.set(LinkedList<VersionCounter>().also { incrementCounters = it })

            transactionManager.transaction.registerSynchronization(object : Synchronization {
                override fun beforeCompletion() {
                }

                override fun afterCompletion(status: Int) {
                    if (status == Status.STATUS_COMMITTED) {
                        try {
                            for (counter in COUNTERS.get()!!)
                                counter.increment()
                        }
                        finally {
                            COUNTERS.remove()
                        }
                    } // if
                }
            })
        } // if

        incrementCounters!!.add(versionCounter)
    }

    // implement UserType

    @Throws(HibernateException::class, SQLException::class)
    override fun nullSafeGet(rs: ResultSet, position: Int, session: SharedSessionContractImplementor, owner: Any?): VersionCounter? {
        val version = rs.getInt(position)

        return if (rs.wasNull())
            null
        else
            VersionCounter(version.toLong())
    }

    @Throws(HibernateException::class, SQLException::class)
    override fun nullSafeSet(st: PreparedStatement, value: VersionCounter?, index: Int, session: SharedSessionContractImplementor) {
        if (value == null) st.setNull(index, sqlType)
        else st.setLong(index, value.counter)
    }

    // implement UserVersionType

    override fun seed(session: SharedSessionContractImplementor?): VersionCounter {
        return VersionCounter() // 0
    }

    override fun next(current: VersionCounter, session: SharedSessionContractImplementor?): VersionCounter {
        registerModification(current)

        return current.incremented()
    }

    // implement Comparator

    override fun compare(o1: VersionCounter, o2: VersionCounter): Int {
        return o1.compareTo(o2)
    }

    // companion

    companion object {
        init {
            BeanObserver.require(TransactionManager::class) { manager -> transactionManager = manager}
        }

        private val COUNTERS = ThreadLocal<MutableList<VersionCounter>?>()

        private lateinit var transactionManager: TransactionManager
    }
}

