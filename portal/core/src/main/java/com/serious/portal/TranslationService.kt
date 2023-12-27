package com.serious.portal
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.translations.Translation
import com.serious.service.Service
import com.serious.service.ServiceInterface
import org.springframework.web.bind.annotation.*

@ServiceInterface
@RequestMapping("portal-i18n/")
@RestController
interface TranslationService : Service {
    @GetMapping("get-translations/{locale}/{namespace}")
    @ResponseBody
    fun getTranslations(@PathVariable locale: String, @PathVariable namespace: String) : List<Translation>
}
