package com.serious.portal
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.model.*
import com.serious.service.Service
import com.serious.service.ServiceInterface
import org.springframework.web.bind.annotation.*
import java.lang.NullPointerException


@ServiceInterface
@RequestMapping("user-administration/")
@RestController
interface UserProfileAdministrationService : Service {
    @PostMapping("create-profile")
    @ResponseBody
    fun createProfile(@RequestBody user : UserProfile) : UserProfile

    @GetMapping("read-profile/{id}")
    @ResponseBody
    fun readProfile(@PathVariable id : String) : UserProfile

    @PostMapping("update-profile")
    @ResponseBody
    fun updateProfile(@RequestBody user : UserProfile) : UserProfile
}
