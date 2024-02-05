package com.serious.service.administration.portal.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.HelpAdministrationService
import com.serious.portal.ManifestLoader
import com.serious.portal.ManifestManager
import com.serious.portal.PortalAdministrationService
import com.serious.portal.model.Address
import com.serious.portal.model.Manifest
import com.serious.portal.model.RegistryError
import com.serious.portal.model.RegistryResult
import com.serious.portal.persistence.HelpEntityManager
import com.serious.portal.persistence.HelpRepository
import com.serious.portal.persistence.entity.HelpEntity
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.net.MalformedURLException
import java.net.URL

@Component
@RestController
class HelpAdministrationServiceImpl : HelpAdministrationService {
    // instance data

    @Autowired
    lateinit var helpRepository: HelpRepository

    @Autowired
    lateinit var helpEntityManager: HelpEntityManager

    // implement HelpAdministrationService

    @Transactional
    override fun readEntries() : List<String> {
        return helpEntityManager.readEntries()
    }

    @Transactional
    override fun saveHelp(feature: String, help: String) {
        helpRepository.save(HelpEntity(feature, help))
    }

    @Transactional
    override fun readHelp(feature: String): String {
        return helpRepository.findById(feature).get().help
    }
}
