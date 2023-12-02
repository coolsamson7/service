package com.serious.codegenerator.typescript
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.AnnotationDescriptor
import com.serious.service.InterfaceAnalyzer
import com.serious.codegenerator.AbstractCodeGenerator
import kotlin.reflect.KClass

data class TypescriptOptions(
    val analyzer : InterfaceAnalyzer,
    val header: String,
    val packageFolder : HashMap<String,String>,
    val filePerService : Boolean,
    val filePerModel : Boolean
) {
    // local classes

    class Builder {
        // instance data

        var packageFolder = HashMap<String,String>()
        var filePerService = true
        var filePerModel = true
        var header = ""
        val analyzer = InterfaceAnalyzer()

        // fluent

        fun addService(clazz: KClass<*>) : Builder {
            analyzer.analyzeService(clazz)

            return this
        }

        fun setPackageFolder(packageName: String, folder: String) : Builder {
            packageFolder.put(packageName, folder)

            return this
        }

        fun setFilePerService(filePerService : Boolean = true) : Builder {
            this.filePerService = filePerService

            return this
        }

        fun setFilePerModel(filePerModel: Boolean = true) : Builder {
            this.filePerModel = filePerModel

            return this
        }

        fun setHeader(header : String) : Builder {
            this.header = header

            return this
        }

        //  build

        fun build() : TypescriptOptions {
            analyzer.finalize()

            val options = TypescriptOptions(
                analyzer,
                header,
                packageFolder,
                filePerService,
                filePerModel
            )

            return options
        }
    }
}

open class AbstractTypescriptGenerator() : AbstractCodeGenerator() {
    // instance data

    private val imports = HashMap<String, MutableSet<String>>()

    // private

    protected fun reset() {
        imports.clear()
    }

    fun camelToSnake(str: String): String {
        var result = ""

        // first character(in lower case)

        val c = str[0]
        result = result + c.lowercaseChar()

        // traverse the string

        for (i in 1 until str.length) {
            val ch = str[i]

            if (Character.isUpperCase(ch)) {
                result += '-'
                result += ch.lowercaseChar()
            }
            else result += ch
        }

        return result
    }

    // protected

    // current=com/foo target=com/bar
    // result: ../bar/

    protected fun relativeImport(current: String, target: String, separator: String = "/") : String {
        if ( current == target)
            return "./"

        var check = current
        var result = ""

        while (!target.startsWith(check)) {
            check = check.substring(0, check.lastIndexOf(separator))

            result += "../"
        }

        if ( !result.isEmpty())
            result += target.substring(check.length)
        else
            result += "." +  target.substring(check.length)

        return result
    }

    protected fun fileName4Model(clazz: String, addTs : Boolean = true ) : String {
        var fileName = camelToSnake(simpleName(clazz)) + ".interface"
        if ( addTs )
            fileName += ".ts"

        return fileName
    }

    protected fun fileName4Service(clazz: String, addTs : Boolean = true ) : String {
        var fileName =  camelToSnake(simpleName(clazz)) + ".service"
        if ( addTs )
            fileName += ".ts"

        return fileName
    }

    protected fun findDocumentation(annotations : List<AnnotationDescriptor>): AnnotationDescriptor? {
        return annotations.find { annotation -> annotation.name.endsWith(".Description") }
    }

    protected fun writeDocumentation(documentation : AnnotationDescriptor?) {
        if ( documentation != null) {
            val description = documentation.parameters.find { param -> param.name == "value" }!!.value

            writer.indent().println("/**")
            writer.splitLines(description as String, " * ")

            if (documentation.parameters.find { param -> param.name == "parameters" } != null) {
                val annotations = documentation.parameters.find { param -> param.name == "parameters" }?.value as List<AnnotationDescriptor>

                for ( annotation in annotations) {
                    val name = annotation.parameters.find { annotation -> annotation.name == "name" }!!.value

                    if (name != null) {
                        val description =
                            annotation.parameters.find { annotation -> annotation.name == "description" }!!.value

                        writer.indent().println(" * @param " + name + " " + description)
                    }
                }
            }

            writer.indent().println(" */")
        }
    }

    protected fun addImport(element: String, source: String) {
        this.imports.computeIfAbsent(source) {_ -> HashSet() } .add(element)
    }

    protected fun writeImports() {
        for ( (source, imports) in imports) {
            writer.print("import { ")

            var index = 0
            for ( import in imports ) {
                if ( index++ > 0)
                    writer.print(", ")
                writer.print(import)
            }

            writer.println(" } from \"" + source + "\"")
        } // for

        writer.println("")
    }

    protected fun writeHeader(header: String) {
        this.writer
            .indent().println("/** ")
            .splitLines(header," * ")
            .indent().println(" */")
            .println()
    }
}