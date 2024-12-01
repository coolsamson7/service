package org.sirius.common.beans
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.stereotype.Component
import kotlin.test.assertNotNull


@Component
class Foo() {
}

@Configuration
@ComponentScan(basePackages = ["org.sirius.common.beans"])
class TestConfiguration {
}

@SpringBootTest(classes = [TestConfiguration::class])
class BeanObserverTest {
    init {
        BeanObserver.require(Foo::class) { value ->
            foo = value
        }
    }

    lateinit var foo: Foo

    @Test
    fun test() {
        assertNotNull(foo)
    }
}