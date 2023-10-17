package com.serious.demo

import com.serious.service.ComponentManager
import com.serious.service.ServiceConfiguration
import jakarta.annotation.PostConstruct
import lombok.extern.slf4j.Slf4j
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.cloud.client.discovery.EnableDiscoveryClient
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.stereotype.Component

// a configuration
@Configuration
@ComponentScan
@Import(
    ServiceConfiguration::class
)
internal open class RootConfig

// main application
@SpringBootApplication
@EnableDiscoveryClient
@Slf4j
@Component
open class ServiceApplication1 {
    @Value("\${server.port}")
    val port = 0

    @PostConstruct
    fun init() {
        ServiceApplication1.port = port
    }

    companion object {
        var port : Int = 0

        @JvmStatic
        fun main(args: Array<String>) {
            val context = SpringApplication.run(ServiceApplication1::class.java, *args)

            // give the registry some time to startup
            try {
                Thread.sleep(1000)
            }
            catch (e: InterruptedException) {
            }
            val manager = context.getBean(ComponentManager::class.java)

            manager.startup(port)

            val remoteRest = manager.acquireService(TestRemoteRestService::class.java, "rest")


            //

            try {
                remoteRest.throwException("Foo()")
            }
            catch(e: Throwable) {
                println()
            }

            //
            val remoteDispatch = manager.acquireService(TestRemoteRestService::class.java, "dispatch")
            val local = manager.acquireLocalService(TestRemoteRestService::class.java)
            local.hello()
            remoteRest.hello()
            remoteDispatch.hello()

            // data
            val foo = Foo()

            // local
            val loops: Long = 10000
            var ms = System.currentTimeMillis()
            for (i in 0 until loops) local.postBody(foo)
            val z1 = System.currentTimeMillis() - ms

            // rest
            ms = System.currentTimeMillis()
            for (i in 0 until loops) remoteRest.postBody(foo)
            val z2 = System.currentTimeMillis() - ms

            // dispatch
            ms = System.currentTimeMillis()
            for (i in 0 until loops) remoteDispatch.postBody(foo)
            val z3 = System.currentTimeMillis() - ms

            // print
            println(loops.toString() + " local loops in " + z1 + "ms = " + z1.toDouble() / loops + "ms/loop")
            println(loops.toString() + " remote rest loops in " + z2 + "ms = " + z2.toDouble() / loops + "ms/loop")
            println(loops.toString() + " remote dispatch loops in " + z3 + "ms = " + z3.toDouble() / loops + "ms/loop")
        }
    }
}
