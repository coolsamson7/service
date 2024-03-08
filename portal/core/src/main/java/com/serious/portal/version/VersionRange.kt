package com.serious.portal.version
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.util.regex.Matcher
import java.util.regex.Pattern

class VersionRange(version: String) {
        // instance data

        private var operations: ArrayList<(Version) -> Boolean > = ArrayList()

        // constructor

        init {
            parse(version)
        }

        // private

        private fun compare(version: Version, op: String) : (Version) -> Boolean {
            when (op) {
                "<" -> return { v -> v.lt(version) }
                "<=" -> return { v -> v.le(version) }
                ">" -> return { v -> v.gt(version) }
                ">=" -> return { v -> v.ge(version) }

                else -> {
                    throw Error("bad operator")
                }
            }
        }

        private fun parse(version: String) {
            val pattern = "(?<op>(>|>=|<|<=))(?<v>\\d[.\\d]+)(,(?<op1>(>|>=|<|<=))(?<v1>\\d[.\\d]+))*"
            val regex: Pattern = Pattern.compile(pattern)
            val matcher: Matcher = regex.matcher(version)
            val success: Boolean = matcher.find()

            if ( success ) {
                val op = matcher.group("op")
                val v  = matcher.group("v")

                operations.add(compare(Version(matcher.group("v")), matcher.group("op")))

                if ( matcher.group("op1") != null)
                    operations.add(compare(Version(matcher.group("v1")), matcher.group("op1")))

            }
            else throw Error("parse error")
        }

        // public

        fun matches(version: Version) : Boolean {
            for ( operation in operations)
                if ( !operation(version))
                    return false

            return true
        }
}