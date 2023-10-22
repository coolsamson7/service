package com.serious.demo

import com.serious.service.ServiceManager
import com.serious.service.ServiceConfiguration
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
    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            val context = SpringApplication.run(ServiceApplication2::class.java, *args)

            val manager = context.getBean(ServiceManager::class.java)

            val commonService = manager.acquireService(CommonService::class.java)
            commonService.hello()
            commonService.hello()

            //println(testRemoteRestService.hello())
        }
    }
}
