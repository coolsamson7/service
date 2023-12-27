package com.serious.portal.impl
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */


import com.serious.portal.TranslationService
import com.serious.portal.translations.Translation
import com.serious.portal.translations.TranslationManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.RestController

@Component
@RestController
class TranslationServiceServiceImpl : TranslationService {
    // instance data

    @Autowired
    lateinit var translationManager: TranslationManager

    // implement

    override fun getTranslations(locale: String, namespace: String) : List<Translation> {
        return translationManager.getTranslations(namespace, locale)
    }
}
