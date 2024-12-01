package org.sirius.common.lang
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.transaction.Synchronization
import jakarta.transaction.Transaction
import jakarta.transaction.TransactionManager
import org.sirius.common.beans.BeanObserver
import org.springframework.transaction.support.TransactionSynchronizationAdapter
import org.springframework.transaction.support.TransactionSynchronizationManager
import java.util.concurrent.ConcurrentHashMap

/**
 *
 *
 * This class provides transaction-local variables. The concept is equivalent to
 * [ThreadLocal] variables but values are not bound to [Thread]s
 * but to [Transaction]s.
 *
 * These variables differ from their normal counterparts in that each caller
 * that accesses one (via <tt>get</tt> or <tt>set</tt> method) has its own,
 * independently initialized copy of the variable per transaction.
 * <tt>TransactionLocal</tt> instances are typically private static fields in
 * classes that wish to associate state with a transaction.
 *
 *
 * @author Andreas Ernst
 * @see ThreadLocal
 */
class TransactionLocal<T:Any> : Synchronization {
    // instance data

    private val values  = ConcurrentHashMap<Transaction, Any>()

    // public

    fun foo() { // TODO: change
        TransactionSynchronizationManager.registerSynchronization(
            object : TransactionSynchronizationAdapter() {
                override fun afterCommit() {
                    println("TRANSACTION COMPLETE!!!")
                }
            }
        )
    }

    /**
     * Returns the value for the current transaction's copy of this
     * transaction-local variable. In contrast to [ThreadLocal], no new
     * copy instance is created and initialized if no value has be set for the
     * current [Transaction].
     *
     * @return the current transaction's value of this transaction-local or null
     * if no value was set for current transaction
     */
    fun get(): T? {
        val currentTransaction = transactionManager.transaction

        return values[currentTransaction] as T?
    }

    /**
     * Sets the current transaction's copy of this transaction-local variable to
     * the specified value.
     *
     * @param value the value to be stored in the current transaction' copy of
     * this transaction-local.
     */
    fun set(value: T) {
        val currentTransaction = transactionManager.transaction

        currentTransaction.registerSynchronization(this)

        values[currentTransaction] = value
    }

    // implement Synchronization

    /**
     * {@inheritDoc}
     */
    override fun afterCompletion(status: Int) {
        // no op
    }

    /**
     * {@inheritDoc}
     */
    override fun beforeCompletion() {
        values.remove(transactionManager.transaction)
    }

    companion object {
        private lateinit var transactionManager: TransactionManager

        init {
            BeanObserver.require(TransactionManager::class) { manager -> transactionManager = manager }
        }
    }
}