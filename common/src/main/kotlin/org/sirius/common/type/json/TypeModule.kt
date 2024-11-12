package org.sirius.common.type.json
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.databind.module.SimpleDeserializers
import com.fasterxml.jackson.databind.module.SimpleModule
import com.fasterxml.jackson.databind.module.SimpleSerializers
import org.sirius.common.type.Type


class TypeModule: SimpleModule() {
    // override

    override fun getModuleName(): String = this.javaClass.simpleName

    override fun setupModule(context: SetupContext) {
        // serializer

        val serializers = SimpleSerializers()

        serializers.addSerializer(Type::class.java, TypeSerializer())

        context.addSerializers(serializers)

        // deserializer

        val deserializers = SimpleDeserializers()

        deserializers.addDeserializer(Type::class.java, TypeDeserializer())

        context.addDeserializers(deserializers)
    }
}