package org.sirius.common.type.base
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */
import org.sirius.common.type.Type

open class CharacterType : Type<Char>(Char::class.javaObjectType) {
    // override Type

    override fun computeDefaultValue() : Char {
        return ' '
    }
}

fun character() : CharacterType {return CharacterType()
}