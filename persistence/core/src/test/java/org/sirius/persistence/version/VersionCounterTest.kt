package org.sirius.persistence.version
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.persistence.*
import jakarta.transaction.UserTransaction
import org.hibernate.annotations.Type
import org.junit.jupiter.api.Test
import org.sirius.common.SpringCommonConfiguration
import org.sirius.common.bean.Attribute
import org.sirius.persistence.EntityStatusListener
import org.sirius.persistence.configuration.AtomikosConfiguration
import org.sirius.persistence.configuration.DataSourceConfiguration
import org.sirius.persistence.type.VersionCounter
import org.sirius.persistence.type.VersionCounterUserType
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.transaction.annotation.EnableTransactionManagement
import org.sirius.persistence.entitystatus.Str10
import org.sirius.persistence.entitystatus.TestSessionContext
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import kotlin.test.assertEquals

@Configuration
@ComponentScan(basePackages = ["org.sirius.persistence.version", "org.sirius.common.beans"])
@EntityScan(basePackages = ["org.sirius.persistence.version"])
@EnableTransactionManagement
@Import(value = [
    SpringCommonConfiguration::class,
    AtomikosConfiguration::class,
    DataSourceConfiguration::class
])
class VersionCounterConfiguration {
    @Bean
    fun sessionContext() : TestSessionContext {
        return TestSessionContext()
    }
}
/*
@Component
class TestSessionContext : EntityStatusListener.SessionContext {
    override val user: String
        get() = "user"
}*/

@Entity
class VersionCounterEntity(
    @Id
    @Attribute(primaryKey = true, type = Str10::class)
    @Column
    var id: String = "",

    @Attribute(primaryKey = true, type = Str10::class)
    @Column
    var name: String = "",

    @Attribute(version = true)
    @Type(VersionCounterUserType::class)
    @Version
    var version: VersionCounter? = null
)

@Component
class VersionCounterService {
    @PersistenceContext
    lateinit var entityManager: EntityManager

    @Autowired
    lateinit var userTransaction: UserTransaction


    @Transactional()
    fun writeEntity(entity: VersionCounterEntity) : VersionCounterEntity {
        entityManager.persist(entity)

        return entity
    }

    @Transactional
    fun changeEntity(id: String) : VersionCounterEntity {
        val entity = entityManager.find(VersionCounterEntity::class.java, id)!!

        entity.name = entity.name + "XXX"

        return entity
    }

    @Transactional
    fun readEntity(id: String) : VersionCounterEntity {
        return entityManager.find(VersionCounterEntity::class.java, id)
    }
}

@SpringBootTest(classes = [VersionCounterConfiguration::class])
internal class VersionCounterTest {
    @Autowired
    lateinit var service: VersionCounterService // for some reason transactional methods in this class will not work??

    // test

    @Test
    fun testVersionCounter() {
        var entity = service.writeEntity(VersionCounterEntity("id", "Andi", VersionCounter()))

        assertEquals(true, entity.version != null )
        assertEquals(0L, entity.version!!.counter )

        entity = service.readEntity("id")

        assertEquals(0L, entity.version!!.counter )

        entity = service.changeEntity("id")

        assertEquals(1L, entity.version!!.counter )
    }
}