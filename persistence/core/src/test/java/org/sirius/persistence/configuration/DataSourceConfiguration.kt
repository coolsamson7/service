package org.sirius.persistence.configuration

/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.atomikos.jdbc.AtomikosDataSourceBean
import jakarta.inject.Inject
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.env.Environment
import org.springframework.core.env.get
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter
import java.util.*
import javax.sql.DataSource


@Configuration
@EnableJpaRepositories(
    entityManagerFactoryRef = "dataSourceConfiguration",
    transactionManagerRef = "transactionManager",
    basePackages = ["org.sirius.persistence"]
)
class DataSourceConfiguration {
    // instance data

    @Inject
    lateinit private var environment: Environment

    // beans

    fun jpaProperties(): Properties {//Map<String, String?> {
        val jpaProperties = Properties()//HashMap<String, String?>()

        jpaProperties["hibernate.hbm2ddl.auto"] = "create"
        jpaProperties["hibernate.dialect"] = "org.hibernate.dialect.H2Dialect"
        jpaProperties["hibernate.show_sql"] = environment.get("spring.jpa.show-sql")
        jpaProperties["hibernate.temp.use_jdbc_metadata_defaults"] = "false"
        jpaProperties["javax.persistence.transactionType"] = "jta"
        jpaProperties["jakarta.persistence.transactionType"] = "jta" // ?

        jpaProperties["hibernate.transaction.jta.platform"] = "org.sirius.persistence.configuration.AtomikosConfiguration"

        return jpaProperties
    }

    /*@Bean(name = ["entityManagerFactoryBuilder"])
    fun entityManagerFactoryBuilder(): EntityManagerFactoryBuilder {
        return EntityManagerFactoryBuilder(
            HibernateJpaVendorAdapter(), jpaProperties(), null
        )
    }*/


    @Bean(name = ["dataSourceConfiguration"])
    fun entityManager(
        //@Qualifier("entityManagerFactoryBuilder") entityManagerFactoryBuilder: EntityManagerFactoryBuilder,
        @Qualifier("dataSource") dataSource: javax.sql.DataSource
    ): LocalContainerEntityManagerFactoryBean {
        /*return entityManagerFactoryBuilder
            .dataSource(dataSource)
            .packages("org.sirius.persistence")
            .persistenceUnit("h2") // TODO
            .properties(jpaProperties())
            .jta(true)
            .build()*/

        val entityManager = LocalContainerEntityManagerFactoryBean()

        entityManager.setJpaVendorAdapter(HibernateJpaVendorAdapter())
        entityManager.setJtaDataSource(dataSource)
        entityManager.setPackagesToScan("org.sirius.persistence")
        entityManager.setJpaProperties(jpaProperties())

        return entityManager
    }

    @Bean("dataSourceProperties")
    fun applicationDataSourceProperties(): DataSourceProperties {
        return DataSourceProperties()
    }


    @Bean("dataSource")
    fun applicationDataSource(@Qualifier("dataSourceProperties") dataSourceProperties: DataSourceProperties?): DataSource {
        val h2XaDataSource = org.h2.jdbcx.JdbcDataSource()

        h2XaDataSource.setUrl(environment.get("spring.datasource.url"))
        h2XaDataSource.setUser(environment.get("spring.datasource.username"))
        h2XaDataSource.setPassword(environment.get("spring.datasource.password"))

        val xaDataSource = AtomikosDataSourceBean()

        xaDataSource.xaDataSource = h2XaDataSource
        xaDataSource.uniqueResourceName = "xa_application"
        xaDataSource.maxPoolSize = 30

        return xaDataSource
    }
}