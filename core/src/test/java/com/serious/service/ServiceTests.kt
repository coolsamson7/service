package com.serious.service

import com.serious.channel.LocalChannel
import com.serious.registry.LocalComponentRegistry
import com.serious.service.annotations.InjectService
import com.serious.service.exception.ServiceRuntimeException
import jakarta.annotation.PostConstruct
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.cloud.client.DefaultServiceInstance
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import java.net.URI

// test classes
@RegisterChannel("test")
internal class TestChannel(channelManager: ChannelManager,  componentClass: Class<out Component>, address: ServiceAddress) : LocalChannel(channelManager, componentClass)

@RegisterChannel("test1")
internal class Test1Channel(channelManager: ChannelManager,  componentClass: Class<out Component>, address: ServiceAddress) : LocalChannel(channelManager, componentClass)

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

    override val addresses: List<ChannelAddress>
        get() {
            return listOf(ChannelAddress("test", URI.create("http://localhost:$port")))
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
@Import(ServiceConfiguration::class)
internal class ServiceTests {
    //@LocalServerPort
    private val port = "0" // server.port

    @Autowired
    lateinit var componentManager: ComponentManager

    lateinit var testService: TestService
    lateinit var localTestService: TestService
    lateinit var testComponent: TestComponent
    lateinit var localTestComponent: TestComponent

    @PostConstruct
    fun  setup() {
        componentManager.startup(port.toInt())

        testService        = componentManager.acquireService(TestService::class.java)
        localTestService   = componentManager.acquireLocalService(TestService::class.java)
        testComponent      = componentManager.acquireService(TestComponent::class.java)
        localTestComponent = componentManager.acquireLocalService(TestComponent::class.java)
    }

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
