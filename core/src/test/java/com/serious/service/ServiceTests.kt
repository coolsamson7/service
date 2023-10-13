package com.serious.service

import com.serious.channel.LocalChannel
import com.serious.registry.LocalComponentRegistry
import com.serious.service.annotations.InjectService
import com.serious.service.exception.ServiceRuntimeException
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.cloud.client.DefaultServiceInstance
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import

// test classes
@RegisterChannel("test")
internal class TestChannel protected constructor(channelManager: ChannelManager) : LocalChannel(channelManager)

@RegisterChannel("test1")
internal class Test1Channel protected constructor(channelManager: ChannelManager) : LocalChannel(channelManager)

@org.springframework.stereotype.Component
internal class TestComponentComponentRegistry : LocalComponentRegistry()

@ServiceInterface
internal interface TestService : Service {
    fun hello(world: String): String
}

internal interface BadService : Service {
    fun hello(world: String?): String?
}

@ComponentInterface(services = [TestService::class])
internal interface TestComponent : Component {
    fun hello(world: String): String
}

@ComponentHost
internal class TestComponentImpl : AbstractComponent(), TestComponent {
    override fun hello(world: String): String {
        return "hello $world"
    }

    override val addresses: List<ServiceAddress>
        get() {
            val meta: MutableMap<String, String> = HashMap()
            meta["channels"] = "test(http://localhost:0),test1(http://localhost:0)"
            return java.util.List.of(
                ServiceAddress("test", DefaultServiceInstance("id", "test", "localhost", 0, false, meta))
            )
        }
}

@org.springframework.stereotype.Component
internal class TestServiceImpl : TestService {
    override fun hello(world: String): String {
        return "hello $world"
    }
}

// test classes
@Configuration
@ComponentScan
@Import(
    ServiceConfiguration::class
)
open class TestConfig

@SpringBootTest(classes = [ServiceConfiguration::class])
@Import(
    ServiceConfiguration::class
)
internal class ServiceTests {
    // instance data
    @Autowired
    lateinit var componentManager: ComponentManager

    @InjectService
    lateinit var testService: TestService

    @InjectService(preferLocal = true)
    lateinit var localTestService: TestService

    @InjectService
    lateinit var testComponent: TestComponent

    @InjectService(preferLocal = true)
    lateinit var localTestComponent: TestComponent

    // test
    @Test
    fun testUnknownService() {
        try {
            componentManager.acquireService(BadService::class.java)
            Assertions.fail<Any>("should throw")
        } catch (e: ServiceRuntimeException) {
        }
    }

    @Test
    fun testMissingChannel() {
        try {
            componentManager.acquireService(TestService::class.java, "dunno")
            Assertions.fail<Any>("should throw")
        } catch (e: ServiceRuntimeException) {
        }
    }

    @Test
    fun testLocalService() {
        Assertions.assertEquals("hello world", localTestService.hello("world"))
    }

    //@Test
    fun testRemoteService() {
        Assertions.assertEquals("hello world", testService.hello("world"))
    }

    @Test
    fun testLocalComponent() {
        Assertions.assertEquals("hello world", localTestComponent.hello("world"))
    }

    //@Test
    fun testRemoteComponent() {
        Assertions.assertEquals("hello world", testComponent.hello("world"))
    }
}
