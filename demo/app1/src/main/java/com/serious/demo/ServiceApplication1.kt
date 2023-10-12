package com.serious.demo

import com.serious.service.ComponentManager
import com.serious.service.ServiceConfiguration
import lombok.extern.slf4j.Slf4j
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.cloud.client.discovery.EnableDiscoveryClient
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import

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
open class ServiceApplication1 {
    companion object {
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
            val remoteRest = manager.acquireService(TestRemoteRestService::class.java, "rest")
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
