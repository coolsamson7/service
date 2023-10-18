package com.serious.service

import com.serious.channel.LocalChannel
import com.serious.exception.FatalException
import com.serious.registry.LocalComponentRegistry
import com.serious.service.exception.ServiceRuntimeException
import jakarta.annotation.PostConstruct
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import java.lang.NullPointerException
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

    @Throws(NullPointerException::class)
    fun throwException()

    fun throwUnhandledException()
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

    //@Throws(NullPointerException::class)
    override fun throwException() {
        throw NullPointerException()
    }

    override fun throwUnhandledException() {
        throw NullPointerException()
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
    lateinit var serviceManager: ServiceManager

    lateinit var testService: TestService
    lateinit var localTestService: TestService
    lateinit var testComponent: TestComponent
    lateinit var localTestComponent: TestComponent

    @PostConstruct
    fun  setup() {
        serviceManager.startup(port.toInt())

        testService        = serviceManager.acquireService(TestService::class.java)
        localTestService   = serviceManager.acquireLocalService(TestService::class.java)
        testComponent      = serviceManager.acquireService(TestComponent::class.java)
        localTestComponent = serviceManager.acquireLocalService(TestComponent::class.java)
    }

    // test
    @Test
    fun testUnknownService() {
        try {
            serviceManager.acquireService(BadService::class.java)
            Assertions.fail<Any>("should throw")
        } catch (e: ServiceRuntimeException) {
        }
    }

    @Test
    fun testMissingChannel() {
        try {
            serviceManager.acquireService(TestService::class.java, "dunno")
            Assertions.fail<Any>("should throw")
        } catch (e: ServiceRuntimeException) {
        }
    }

    @Test
    fun testLocalService() {
        Assertions.assertEquals("hello world", localTestService.hello("world"))
    }

    @Test
    fun testLocalException() {
        try {
            localTestService.throwException()
        }
        catch(e : NullPointerException) {

        }

        try {
            localTestService.throwUnhandledException()
        }
        catch(e : FatalException) {

        }

    }

    @Test
    fun testRemoteException() {
        try {
            testService.throwException()
        }
        catch(e : NullPointerException) {

        }

        try {
            testService.throwUnhandledException()
        }
        catch(e : FatalException) {

        }

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
