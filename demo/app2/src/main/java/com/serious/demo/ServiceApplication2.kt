package com.serious.demo

import com.serious.service.ComponentManager
import com.serious.service.ServiceConfiguration
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.cloud.client.discovery.EnableDiscoveryClient
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import

@Configuration
@Import(
    ServiceConfiguration::class
)
@ComponentScan
open class RootConfig

// main application
@SpringBootApplication
@EnableDiscoveryClient
open class ServiceApplication2 {
    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            val context = SpringApplication.run(ServiceApplication2::class.java, *args)
            val manager = context.getBean(ComponentManager::class.java)
            val testRemoteRestService = manager.acquireService(TestRemoteRestService::class.java)
            println(testRemoteRestService.hello())
        }
    }
}
