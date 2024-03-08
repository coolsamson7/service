package com.serious.portal.configuration
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.contains
import org.springframework.stereotype.Component

@Component()
class ConfigurationMerger {
    // instance data

    var mapper = ObjectMapper()

    // private

    fun traverse(obj: JsonNode, result: ObjectNode) {
        if ( obj.isObject)
            traverseObject(obj as ObjectNode, result)

        else if (obj.isArray) {
            for ( i in 0..obj.size() - 1) {
                obj.get(i)

            }
        }
        else if ( obj.isValueNode) {
            obj.nodeType

            obj.asText()
            /*JsonNodeType*/
        }
    }

    fun traverseArray(obj: ArrayNode, result: ArrayNode) {
        obj.forEach {  node ->
            val objectNode : ObjectNode = node as ObjectNode

            val resultNode = result.find { node -> (node as ObjectNode).get("name") == objectNode.get("name")}

            if ( resultNode == null) {
                result.add(objectNode.deepCopy())
            }
        }
    }

    fun traverseObject(obj: ObjectNode, result: ObjectNode) {
        for (field in obj.fields()) {
            val property = field.key
            val value = field.value

            if ( value.isObject) {
                if ( result.contains(property)) {
                    traverseObject(value as ObjectNode, result[property] as ObjectNode)
                }
                else {
                    val newNode = mapper.createObjectNode()
                    result.put(property, newNode)

                    traverseObject(value as ObjectNode, newNode)
                }
            }
            else if (value.isArray) {
                if ( result.contains(property)) {
                    traverseArray(value as ArrayNode, result[property] as ArrayNode)
                }
                else {
                    val newNode = mapper.createArrayNode()
                    result.put(property, newNode)

                    traverseArray(value as ArrayNode, newNode)
                }
            }
            else {
                result.put(property, value)
            }
        }
    }

    private fun parse(config: String)  : JsonNode {
        return mapper.readTree(config)
    }

    // public

    fun mergeConfigurationValues(vararg configurations: String) : String {
        val result = mapper.createObjectNode()

        configurations.forEach { configuration ->
            traverse(parse(configuration), result )
        }

        return result.toString()
    }
}