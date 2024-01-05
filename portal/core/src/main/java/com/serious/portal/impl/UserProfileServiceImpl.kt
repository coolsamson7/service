package com.serious.portal.impl
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */


import com.serious.portal.UserProfileAdministrationService
import com.serious.portal.model.UserProfile
import com.serious.portal.persistence.UserProfileRepository
import com.serious.portal.persistence.entity.UserProfileEntity
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.RestController

@Component
@RestController
class UserProfileAdministrationServiceImpl : UserProfileAdministrationService {
    // instance data

    @Autowired
    lateinit var userProfileRepository: UserProfileRepository

    // implement

    @Transactional
    override fun createProfile(userProfile: UserProfile): UserProfile {
        this.userProfileRepository.save(UserProfileEntity(userProfile.user, userProfile.locale))

        return userProfile
    }

    @Transactional
    override fun readProfile(id: String): UserProfile {
        val entity = this.userProfileRepository.findById(id).get()
        return UserProfile(entity.user, entity.locale)
    }

    @Transactional
    override fun updateProfile(userProfile: UserProfile): UserProfile {
        this.userProfileRepository.save(UserProfileEntity(userProfile.user, userProfile.locale))

        return userProfile
    }
}
