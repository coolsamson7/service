package org.sirius.common.type.json
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.databind.ser.std.StdSerializer
import org.sirius.common.type.Type
import java.io.IOException

open class TypeSerializer : StdSerializer<Type<*>>(Type::class.java) {
    // override

    @Throws(IOException::class)
    override fun serialize(obj: Type<*>, jsonGenerator: JsonGenerator, serializerProvider: SerializerProvider) {
        jsonGenerator.writeStartObject()

        for ( test in obj.tests) {
            if ( test.parameter != null) {
                when ( test.parameter.javaClass) {
                    Short::class.java -> jsonGenerator.writeNumberField(test.name, (test.parameter as Short).toInt())
                    Int::class.java -> jsonGenerator.writeNumberField(test.name, (test.parameter as Int).toInt())
                    Long::class.java -> jsonGenerator.writeNumberField(test.name, (test.parameter as Long).toInt())
                    Float::class.java -> jsonGenerator.writeNumberField(test.name, (test.parameter as Float).toFloat())
                    Double::class.java -> jsonGenerator.writeNumberField(test.name, (test.parameter as Double).toDouble())
                    Boolean::class.java -> jsonGenerator.writeBooleanField(test.name, test.parameter as Boolean)
                    String::class.java -> jsonGenerator.writeStringField(test.name, (test.parameter as String))
                }
            }
            else {
                jsonGenerator.writeBooleanField(test.name, true)
            }
        }

        jsonGenerator.writeEndObject()
    }
}