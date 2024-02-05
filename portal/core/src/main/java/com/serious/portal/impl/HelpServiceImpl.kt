package com.serious.service.administration.portal.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.*
import com.serious.portal.persistence.HelpRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import javax.cache.Cache
import javax.cache.CacheManager
import javax.cache.Caching
import javax.cache.configuration.FactoryBuilder
import javax.cache.configuration.MutableConfiguration
import javax.cache.expiry.CreatedExpiryPolicy
import javax.cache.expiry.Duration
import javax.cache.integration.CacheLoader
import javax.cache.spi.CachingProvider

@Component
@RestController
class HelpServiceImpl : HelpService, CacheLoader<String, String> {
    // instance data

    @Autowired
    lateinit var helpRepository: HelpRepository

    lateinit var cache : Cache<String, String>

    init {
        val cachingProvider: CachingProvider = Caching.getCachingProvider()
        val cacheManager: CacheManager = cachingProvider.cacheManager
        val config = MutableConfiguration<String,String>()
            .setReadThrough(true)
            .setStoreByValue(false)
            .setExpiryPolicyFactory(CreatedExpiryPolicy.factoryOf(Duration.TEN_MINUTES))
            .setCacheLoaderFactory(FactoryBuilder.SingletonFactory<CacheLoader<String,String>>(this))

        cache = cacheManager.createCache("help", config)
    }

    // implement HelpAdministrationService

    @Transactional
    override fun getHelp(feature: String): String {
        return cache.get(feature)
    }

    // implement CacheLoader

    @Transactional
    override fun load(feature: String): String {
       return helpRepository.findById(feature).get().help
    }

    override fun loadAll(p0: MutableIterable<String>?): MutableMap<String, String> {
        TODO("Not yet implemented")
    }
}