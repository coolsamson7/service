package org.sirius.persistence.configuration
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.atomikos.icatch.jta.UserTransactionImp
import com.atomikos.icatch.jta.UserTransactionManager
import jakarta.inject.Inject
import jakarta.transaction.TransactionManager
import jakarta.transaction.UserTransaction
import org.hibernate.engine.transaction.jta.platform.internal.AbstractJtaPlatform
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer
import org.springframework.core.env.Environment
import org.springframework.orm.jpa.JpaVendorAdapter
import org.springframework.orm.jpa.vendor.Database
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.jta.JtaTransactionManager

@Configuration
class AtomikosConfiguration : AbstractJtaPlatform() {
    @Inject
    lateinit private var environment: Environment

    /*fun tailorProperties(properties: Properties) {
        properties.setProperty(
            "hibernate.transaction.manager_lookup_class",
            TransactionManagerLookup::class.java.getName()
        )
    }*/

    @Bean
    fun propertySourcesPlaceholderConfigurer(): PropertySourcesPlaceholderConfigurer {
        return PropertySourcesPlaceholderConfigurer()
    }

    @Bean
    fun jpaVendorAdapter(): JpaVendorAdapter {
        val hibernateJpaVendorAdapter = HibernateJpaVendorAdapter()

        hibernateJpaVendorAdapter.setShowSql(true)
        hibernateJpaVendorAdapter.setGenerateDdl(true)
        hibernateJpaVendorAdapter.setDatabase(Database.H2)

        return hibernateJpaVendorAdapter
    }

    @Bean
    fun userTransaction(): UserTransaction {
        return userTransaction
    }

    @Bean(initMethod = "init", destroyMethod = "close")
    fun atomikosTransactionManager(): TransactionManager {
        return txManager
    }

    @Bean
    @Throws(Throwable::class)
    fun platformTransactionManager(): PlatformTransactionManager {
        return JtaTransactionManager(userTransaction, txManager)
    }

    // implement AbstractJtaPlatform

    override fun locateTransactionManager(): TransactionManager {
        return txManager
    }

    override fun locateUserTransaction(): UserTransaction {
        return userTransaction
    }

    // companion

    companion object {
        // manager

        val txManager: UserTransactionManager = UserTransactionManager()

        // user transaction

        val userTransaction: UserTransaction = UserTransactionImp()

        init {
            txManager.forceShutdown = false

            userTransaction.setTransactionTimeout(10000) // here?
        }
    }
}