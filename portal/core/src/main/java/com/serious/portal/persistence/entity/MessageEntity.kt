package com.serious.portal.persistence.entity

/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import jakarta.persistence.*;


@Entity
@Table(name="MESSAGE", indexes =[Index(columnList = "NAMESPACE,NAME,LOCALE")])
class MessageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    var id: Long = 0
    @Column(name = "NAMESPACE")
    lateinit var namespace : String
    @Column(name = "NAME")
    lateinit var name : String
    @Column(name = "LOCALE")
    lateinit var locale : String
    @Column(name = "TRANSLATION")
    lateinit var value : String
}
