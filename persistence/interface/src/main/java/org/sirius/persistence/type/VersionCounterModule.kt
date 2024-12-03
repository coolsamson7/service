package org.sirius.persistence.type
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.SerializerProvider
import com.fasterxml.jackson.databind.deser.std.StdDeserializer
import com.fasterxml.jackson.databind.module.SimpleDeserializers
import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.databind.module.SimpleSerializers
import com.fasterxml.jackson.databind.ser.std.StdSerializer
import java.io.IOException


class VersionCounterModule: SimpleModule() {
    class Serializer : StdSerializer<VersionCounter>(VersionCounter::class.java) {
        // override

        @Throws(IOException::class)
        override fun serialize(obj: VersionCounter, jsonGenerator: JsonGenerator, serializerProvider: SerializerProvider) {
            jsonGenerator.writeNumber(obj.counter)
        }
    }

    class Deserializer() : StdDeserializer<VersionCounter>(VersionCounter::class.java) {
        // override

        override fun deserialize(jsonParser: JsonParser, context: DeserializationContext): VersionCounter {
            return VersionCounter(jsonParser.longValue)
        }
    }
    // override

    override fun getModuleName(): String = this.javaClass.simpleName

    override fun setupModule(context: SetupContext) {
        // serializer

        val serializers = SimpleSerializers()

        serializers.addSerializer(VersionCounter::class.java, Serializer())

        context.addSerializers(serializers)

        // deserializer

        val deserializers = SimpleDeserializers()

        deserializers.addDeserializer(VersionCounter::class.java, Deserializer())

        context.addDeserializers(deserializers)
    }
}