package com.serious.portal.translations
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.persistence.MessageEntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import javax.cache.Cache
import javax.cache.CacheManager
import javax.cache.Caching
import javax.cache.configuration.FactoryBuilder.SingletonFactory
import javax.cache.configuration.MutableConfiguration
import javax.cache.expiry.CreatedExpiryPolicy
import javax.cache.expiry.Duration
import javax.cache.integration.CacheLoader
import javax.cache.spi.CachingProvider

@Component
class TranslationManager : CacheLoader<String,List<Translation>> {
    // instance date

    @Autowired
    lateinit var messageEntityManager: MessageEntityManager

    lateinit var cache : Cache<String, List<Translation>>

    init {
        val cachingProvider: CachingProvider = Caching.getCachingProvider()
        val cacheManager: CacheManager = cachingProvider.cacheManager
        val config = MutableConfiguration<String, List<Translation>>()
            .setReadThrough(true)
            .setStoreByValue(false)
            .setExpiryPolicyFactory(CreatedExpiryPolicy.factoryOf(Duration.TEN_MINUTES))
            .setCacheLoaderFactory(SingletonFactory<CacheLoader<String, List<Translation>>>(this));

        cache = cacheManager.createCache("translationCache", config)
    }

    // public

    public fun clearCache() {
        cache.clear()
    }

    public fun getTranslations(namespace: String, locale: String) : List<Translation> {
        return cache.get(namespace + ":" + locale)
    }

    // implement CacheLoader

    @Transactional
    override fun load(namespaceLocale: String?): List<Translation> {
        var index = namespaceLocale!!.indexOf(":")
        val namespace = namespaceLocale.substring(0, index)
        var locale =  namespaceLocale.substring(index+1)

        val fallbacks : Array<String> = arrayOf("de-DE", "en-EN") // TODO
        index = fallbacks.indexOf(locale)

        // read distinct names

        val names = HashSet(messageEntityManager.readDistinctNames(namespace))

        val translations = ArrayList<Translation>()

        // and iterate through fallbacks until all items fetched

        var more = true;
        do {
            val localeTranslations = messageEntityManager.readSpecificTranslations(namespace, locale, names)

            more =  translations.size + localeTranslations.size < names.size

            if ( more ) {
                locale = fallbacks[++index]

                for (translation in localeTranslations)
                    names.remove(translation.key)
            } // if

            // add

            translations.addAll(localeTranslations)
        } while ( more )

        return translations

        //return messageEntityManager.readTranslations(namespaceLocale.substring(0, index), namespaceLocale.substring(index+1))
    }

    override fun loadAll(p0: MutableIterable<String>?): MutableMap<String, List<Translation>> {
        TODO("Not yet implemented")
    }
}
