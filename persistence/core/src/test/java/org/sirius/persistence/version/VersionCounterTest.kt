package org.sirius.persistence.version
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.persistence.*
import org.hibernate.annotations.Type
import org.junit.jupiter.api.Test
import org.sirius.common.bean.Attribute
import org.sirius.persistence.type.VersionCounter
import org.sirius.persistence.type.VersionCounterUserType
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.transaction.annotation.EnableTransactionManagement
import org.sirius.persistence.entitystatus.Str10


@Configuration
@ComponentScan
@EnableJpaRepositories(basePackages = ["org.sirius.persistence"])
@EntityScan
@EnableTransactionManagement
class VersionCounterConfiguration {
    /*@Bean
    fun dataSource(): DataSource {
        val builder = EmbeddedDatabaseBuilder()
        return builder.setType(EmbeddedDatabaseType.H2).build()
    }

    @Bean
    fun entityManagerFactory(): LocalContainerEntityManagerFactoryBean {
        val vendorAdapter = HibernateJpaVendorAdapter()
        vendorAdapter.setGenerateDdl(true)

        val factory = LocalContainerEntityManagerFactoryBean()
        factory.jpaVendorAdapter = vendorAdapter
        factory.setPackagesToScan("com.serious")
        factory.dataSource = dataSource()
        return factory
    }

    @Bean
    fun transactionManager(entityManagerFactory: EntityManagerFactory?): PlatformTransactionManager {
        val txManager = JpaTransactionManager()
        txManager.entityManagerFactory = entityManagerFactory
        return txManager
    }*/
}

@Entity
class VersionCounterEntity(
    @Id
    @Attribute(primaryKey = true, type = Str10::class)
    @Column
    var id: String = "",

    @Attribute(version = true)
    @Type(VersionCounterUserType::class)
    var version: VersionCounter? = null
)

@SpringBootTest(classes = [VersionCounterConfiguration::class])
internal class VersionCounterTest {
    @PersistenceContext
    lateinit var entityManager: EntityManager

    @Test
    fun test() {
        entityManager.persist(VersionCounterEntity("id"))
    }
}