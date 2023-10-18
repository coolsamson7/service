package com.serious.demo

import com.serious.service.ServiceManager
import com.serious.service.ServiceConfiguration
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.cloud.client.discovery.EnableDiscoveryClient
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.stereotype.Component

@Configuration
@Import(ServiceConfiguration::class)
@ComponentScan
open class RootConfig

// main application
@SpringBootApplication
@EnableDiscoveryClient
@Component
open class ServiceApplication2 {
    @Value("\${server.port}")
    val port = 0

    @PostConstruct
    fun init() {
        ServiceApplication2.port = port
    }

    companion object {
        var port : Int = 0
        @JvmStatic
        fun main(args: Array<String>) {
            val context = SpringApplication.run(ServiceApplication2::class.java, *args)

            //context.getBean(Environment::class.javaClass).

            val manager = context.getBean(ServiceManager::class.java)
            manager.startup(port)
            val testRemoteRestService = manager.acquireService(TestRemoteRestService::class.java)
            println(testRemoteRestService.hello())
        }
    }
}
