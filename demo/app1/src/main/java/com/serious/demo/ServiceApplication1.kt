package com.serious.demo

import com.ecwid.consul.v1.ConsulClient
import com.ecwid.consul.v1.QueryParams
import com.ecwid.consul.v1.catalog.CatalogServicesRequest
import com.ecwid.consul.v1.health.HealthChecksForServiceRequest
import com.serious.service.ServiceConfiguration
import com.serious.service.ServiceManager
import lombok.extern.slf4j.Slf4j
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.cloud.client.discovery.EnableDiscoveryClient
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.stereotype.Component
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer


// a configuration
@Configuration
@ComponentScan
@Import(ServiceConfiguration::class)
open class RootConfig

@Configuration
open class WebConfig {
    @Bean
    open fun corsConfigurer(): WebMvcConfigurer {
        return object : WebMvcConfigurer {
            override fun addCorsMappings(registry: CorsRegistry) {
                registry.addMapping("/**").allowedOrigins("http://localhost:4200")
            }
        }
    }
}
// main application
@SpringBootApplication
@EnableDiscoveryClient
@Slf4j
@Component
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
            val manager = context.getBean(ServiceManager::class.java)

            val common = manager.acquireService(CommonService::class.java, "rest")

            val remoteRest = manager.acquireService(TestRemoteRestService::class.java, "rest")

            val remoteDispatch = manager.acquireService(TestRemoteRestService::class.java, "dispatch")
            val local = manager.acquireLocalService(TestRemoteRestService::class.java)
            local.hello()
            remoteRest.hello()
            remoteDispatch.hello()

            // data
            val foo = Foo()

            // local
            val loops: Long = 10//10000
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

            // NEW

            val consul = context.getBean(ConsulClient::class.java);

            val services = consul.getCatalogServices(CatalogServicesRequest.newBuilder()
                .build())

            services.value.forEach { (serviceName: String, value) ->
                print("$serviceName")

                if ( value.contains("component")) {
                    val sname : String = serviceName
                    val r : CatalogServicesRequest = CatalogServicesRequest.newBuilder().build()
                    val qp = QueryParams.Builder.builder().build()

                    val catalogServices = consul.getCatalogService(sname!!, qp!!)

                    for ( catalogService in catalogServices.value) {
                        println(catalogService)

                        catalogService.serviceId // ip:port:component
                        catalogService.node // Andras-MPP
                        catalogService.nodeMeta
                        catalogService.serviceAddress
                        catalogService.servicePort

                        val checks = consul.getHealthChecksForService(serviceName, HealthChecksForServiceRequest.newBuilder()
                            .build()).value

                        for ( check in checks) {
                            check.serviceId
                            check.status
                        }

                        //catalogService.
                    }
                }
            }

            println()
        }
    }
}
