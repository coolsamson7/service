package com.serious.codegenerator

/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

interface LanguageSupport {
    fun mapType(type: String) : String

    fun isArray(type: String) : Boolean

    fun isNativeType(type: String) : Boolean
}

class KotlinLanguageSupport : LanguageSupport {
    // implement LanguageSupport

    override fun isNativeType(type: String) : Boolean {
        return type.startsWith("kotlin.") || type.startsWith("java.") // HACK
    }

    override fun mapType(typeName: String): String {
        return when (typeName) {
            "kotlin.Short" -> "number"
            "kotlin.Int" -> "number"
            "kotlin.Long" -> "number"
            "kotlin.String" -> "string"
            "kotlin.Boolean" -> "boolean"
            "kotlin.Unit" -> "void"
            "kotlin.Any" -> "any"
            "java.net.URI" -> "string"
            else -> "unsupported type " + typeName
        }
    }

    override fun isArray(typeName: String): Boolean {
        return when ( typeName ) {
            "kotlin.collections.List" -> true
            "kotlin.collections.Collection" -> true
            "kotlin.Array" -> true

            else -> false
        }
    }
}