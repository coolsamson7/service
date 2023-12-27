package com.serious.portal.persistence.entity
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.persistence.*;


@Entity
@Table(name="LANGUAGE")
class LanguageEntity(
    @Id
    @Column(name = "LOCALE")
    var locale : String
)
