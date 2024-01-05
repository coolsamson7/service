package com.serious.portal.persistence.entity
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.persistence.*;


@Entity
@Table(name="USER_PROFILE")
class UserProfileEntity(
    @Id
    @Column(name = "USER_ID")
    var user : String,
    @Column(name = "LOCALE")
    var locale : String
)
