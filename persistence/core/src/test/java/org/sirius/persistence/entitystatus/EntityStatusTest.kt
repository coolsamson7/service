package org.sirius.persistence.entitystatus
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
import org.sirius.common.beans.BeanObserver
import org.sirius.common.bean.Attribute
import org.sirius.common.bean.BeanDescriptor
import org.sirius.common.type.base.StringType
import org.sirius.persistence.EntityStatusListener
import org.sirius.persistence.configuration.AtomikosConfiguration
import org.sirius.persistence.configuration.DataSourceConfiguration
import org.sirius.persistence.type.EntityStatus
import org.sirius.persistence.type.VersionCounter
import org.sirius.persistence.type.VersionCounterUserType
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.EnableTransactionManagement
import org.springframework.transaction.annotation.Transactional
import kotlin.test.assertEquals

@Configuration
@ComponentScan(basePackages = [/*"org.sirius.persistence",*/ "org.sirius.common.beans"])
@EntityScan(basePackages = ["org.sirius.persistence"])
@EnableTransactionManagement
@Import(value = [
    SpringCommonConfiguration::class,
    AtomikosConfiguration::class,
    DataSourceConfiguration::class
])
class EntityStatusConfiguration {
    @Bean
    fun sessionContext() : TestSessionContext {
        return TestSessionContext()
    }
}

class Str10 : StringType() {
    init {
        length(10)
    }
}

@Entity
@EntityListeners(value = [EntityStatusListener::class])
class EntityStatusEntity(
    @Id
    @Attribute(type = Str10::class)
    @Column var id: String = "",

    @Attribute
    @Column var name: String = "Andi",

    @Attribute()
    @Column var number: Long = 0L,

    @Attribute
    @Embedded
    var entityStatus: EntityStatus? = null
) {
    fun foo() {}
}

@Component
class TestSessionContext : EntityStatusListener.SessionContext {
    override val user: String
    get() = "user"
}

// the test

@Component
class Service {
    @PersistenceContext
    lateinit var entityManager: EntityManager

    @Autowired
    lateinit var userTransaction: UserTransaction


    @Transactional()
    fun writeEntity(entity: EntityStatusEntity) : EntityStatusEntity {
        entityManager.persist(entity)

        return entity
    }

    @Transactional
    fun changeEntity(id: String) : EntityStatusEntity {
        val entity = entityManager.find(EntityStatusEntity::class.java, id)!!

        entity.number = entity.number + 10
        entity.name = entity.name + "XXX"

        return entity
    }

    @Transactional
    fun readEntity(id: String) : EntityStatusEntity {
        return entityManager.find(EntityStatusEntity::class.java, id)
    }
}

@SpringBootTest(classes = [EntityStatusConfiguration::class, Service::class])
class EntityStatusTest {
    @Autowired
    lateinit var beanObserver: BeanObserver

    @Autowired
    lateinit var service: Service // for some reason transactional methods in this class will not work??

    // test

    @Test
    fun testAnnotations() {
        val bean = BeanDescriptor.ofClass(EntityStatusEntity::class)

        println(bean.report())
    }

    @Test
    fun testAudit() {
        var entity = service.writeEntity(EntityStatusEntity("id", "Andi", 0))

        assertEquals(true, entity.entityStatus != null )
        assertEquals("user", entity.entityStatus!!.creatingUser)
        assertEquals("user", entity.entityStatus!!.updatingUser)

        assertEquals(true, entity.entityStatus!!.creatingDate!!.equals( entity.entityStatus!!.updatingDate))

        entity = service.readEntity("id")

        assertEquals(true, entity.entityStatus != null )

        entity = service.changeEntity("id")

        assertEquals(true, !entity.entityStatus!!.creatingDate!!.equals( entity.entityStatus!!.updatingDate))
    }
}