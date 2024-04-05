package com.serious.portal.mapper
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class TopLevelCompositeTest {
    // local classes

    data class Money(
        val currency: String,
        val value: Long
    )

    @Test
    fun test() {
        val moneyMapper = Mapper(
            mapping(Money::class, Money::class) {
                map { matchingProperties() }
            }
        )

        val money = Money("EU", 1)
        val result = moneyMapper.map<Money>(money)

        assertEquals(money.currency, result?.currency)
        assertEquals(money.currency, result?.currency)
    }
}