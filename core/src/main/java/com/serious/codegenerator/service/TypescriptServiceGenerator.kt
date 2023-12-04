package com.serious.codegenerator.service
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.codegenerator.typescript.AbstractTypescriptGenerator
import com.serious.codegenerator.typescript.TypescriptOptions
import com.serious.service.*

class TypescriptServiceGenerator(options: TypescriptOptions) : AbstractTypescriptGenerator(options,"typescript", "1.0") {
    // instance data

    val analyzer = options.analyzer

    // public

    fun generate() {
        // models

        for ((_, clazz) in analyzer.models)
            if (clazz.kind.contains("class"))
                generateClass(clazz)

        // services

        for ((_, clazz) in analyzer.services)
            generateService(clazz)

        // how about index.ts

        generateIndex()
    }

    fun generateClass(clazz: InterfaceDescriptor) {
        setClass(clazz)

        setFileWriter(outputFile(currentFolder, fileName4Model(clazz.name)))

        println("generate class " + clazz.name + " file = " + currentFolder + fileName4Model(clazz.name))

        if ( options.header.isBlank())
            writeHeader(header())
        else
            writeHeader( options.header + "\n" + header())

        // collect imports

        if ( clazz.inherits != null)
            type(TypeDescriptor(clazz.inherits, false, emptyList()))

        for ( property in clazz.properties)
            type(property.type!!)

        this.writeImports()

        // documentation

        writeDocumentation(findDocumentation(clazz.annotations))
        this.writer
            .print("export interface ${simpleName(clazz.name)}")

        if ( clazz.inherits != null)
            writer.print(" extends ").print(simpleName(clazz.inherits!!)).println(" {")
        else
            writer.println(" {")

        writer.tab(1)

        // properties

        var index = 0
        for ( property in clazz.properties) {
            if (index++ > 0)
                writer.println(",")

            writeDocumentation(findDocumentation(property.annotations))

            writer.indent().print(property.name).print(" : ").print(type(property.type!!))
            if ( property.type.optional)
                writer.print(" | undefined")
        }

        // done

        this.writer.tab(-1).println().println("}").close()
    }

    // here?

    fun mapType(typeName: String) : String {
        val typescriptType : String
        if (  options.language.isNativeType(typeName))
            typescriptType = options.language.mapType(typeName)

        else {
            if ( currentClass?.name != typeName) {
                val mapping = getMapping(packageName(typeName))
                val typeFolder = folderFor(typeName)

                if ( mapping !== currentMapping) {
                    this.addImportFrom(
                        simpleName(typeName),
                        mapping.importName
                    )
                }

                else this.addImportFrom(
                    simpleName(typeName),
                    this.relativeImport(currentFolder, typeFolder) + fileName4Model(typeName, false)
                )
            }

            return simpleName(typeName)
        }

        return typescriptType
    }

    fun type(type: TypeDescriptor) : String {
        val typeName = type.name

        return if ( options.language.isArray(typeName))
            type(type.parameter[0]) + "[]"
        else
            mapType(typeName)
    }


    fun getMapping(methodDescriptor: MethodDescriptor) : AnnotationDescriptor? {
        for ( annotation in methodDescriptor.annotations) {
            when ( annotation.name ) {
                "org.springframework.web.bind.annotation.GetMapping" -> return annotation
                "org.springframework.web.bind.annotation.PostMapping" -> return annotation
                "org.springframework.web.bind.annotation.PutMapping" -> return annotation
                "org.springframework.web.bind.annotation.DeleteMapping" -> return annotation
            }
        }

        return null
    }
    // ..

    fun findParameter4Path(methodDescriptor: MethodDescriptor, pathVariable: String) : ParameterDescriptor? {
        for ( parameter in methodDescriptor.parameters) {
            val annotation = parameter.annotations.find { annotation -> annotation.name == "org.springframework.web.bind.annotation.PathVariable" }
            if ( annotation != null) {
                if ( annotation.parameters.isEmpty()) {
                    if (parameter.name == pathVariable)
                        return parameter
                }
                else {
                    if (annotation.parameters[0].value == pathVariable)
                        return parameter
                }
            }
        }

        return null
    }

    fun generateService(clazz: InterfaceDescriptor) {
        // convenience functions

        fun annotation(annotations: List<AnnotationDescriptor>, name: String) : AnnotationDescriptor? {
            return annotations.find { annotation -> annotation.name == name }
        }

        fun parameter(parameters: List<ParameterValueDescriptor>, name: String) : ParameterValueDescriptor? {
            return parameters.find { parameter -> parameter.name == name }
        }

        fun <T> parameterValue(parameters: List<ParameterValueDescriptor>, name: String) : T {
            return parameters.find { parameter -> parameter.name == name }?.value as T
        }

        //
        setClass(clazz)

        setFileWriter(outputFile(currentFolder, fileName4Service(clazz.name)))

        println("generate service ${clazz.name} file = $currentFolder${fileName4Service(clazz.name)}")

        // write header

        if ( options.header.isBlank())
            writeHeader(header())
        else
            writeHeader( options.header + "\n" + header())

        // add imports

        this.addImport("Injectable", "Injector", "Observable", "RegisterService", "AbstractHTTPService")

        // collect method imports

        for ( method in clazz.methods) {
            type(method.returnType)

            for (parameter in method.parameters)
                type(parameter.type)
        }

        // look for request mapping at class level

        var prefix : String? = null
        val requestMapping = annotation(clazz.annotations, "org.springframework.web.bind.annotation.RequestMapping")
        if ( requestMapping != null) {
            val param = parameter(requestMapping.parameters, "value")
            if (param != null)
                prefix = (param.value as Array<String>)[0]
        }

        // header

        val domain = options.domain
        var register = "@RegisterService({domain: \"$domain\""
        if (prefix != null)
            register += ", prefix: \"$prefix\""

        register += "})"

        // write imports

        this.writeImports()

        // write class

        writeDocumentation(findDocumentation(clazz.annotations))

        this.writer
            .println("@Injectable({providedIn: 'root'})")
            .println(register)
            .println("export class ${simpleName(clazz.name)} extends AbstractHTTPService {")
            .tab(1)
            .indent().println("// constructor")
            .println()
            .indent().println("constructor(injector: Injector) {")
            .tab(1)
            .indent().println("super(injector)")
            .tab(-1)
            .indent().println("}")
            .println()
            .indent().println("// public methods" )

        // methods

        for ( method in clazz.methods) {
            writer.println()

            writeDocumentation(findDocumentation(method.annotations))

            writer
                .indent().print("public " + method.name + "(")

            var index = 0
            for (parameter in method.parameters) {
                if ( index++ > 0)
                    writer.print(", ")

                writer.print(parameter.name).print(" : ").print(type(parameter.type))
            }

            writer
                .print(") : Observable<")
                .print(type(method.returnType))
                .println("> {")

            val mapping = getMapping(method)!!
            val func = mapping.name.substring(mapping.name.lastIndexOf(".") + 1, mapping.name.indexOf("Mapping")).lowercase()

            writer
                .tab(1)
                .indent().print("return this." + func + "<" + type(method.returnType) + ">(")

            val uri = parameterValue<Array<String>>(mapping.parameters, "value")[0]

            writer.print("`")

            var start = 0
            var lBrace = uri.indexOf("{")
            while ( lBrace > 0) {
                // add prefix

                writer.print(uri.substring(start, lBrace))

                // add param

                val rBrace = uri.indexOf("}", lBrace)
                val param = uri.substring(lBrace + 1, rBrace)

                writer.print("\${").print(findParameter4Path(method, param)!!.name).print("}")

                start = rBrace + 1
                lBrace =  uri.indexOf("{", start)
            }

            if ( start < uri.length)
                writer.print(uri.substring(start))

            // replace all path variables {x} by ${name-of-parameter}

            writer.print("`")

            if ( func == "post") {
                val body = method.parameters.find { param -> annotation(param.annotations, "org.springframework.web.bind.annotation.RequestBody") != null }!!.name

                writer.print(", ").print(body)
            }

            // params

            if ( method.parameters.find { param -> annotation(param.annotations, "org.springframework.web.bind.annotation.RequestParam") != null} != null) {
                writer.print(", { params: {")

                val requestParams = method.parameters.filter { param -> annotation(param.annotations, "org.springframework.web.bind.annotation.RequestParam") != null }

                for ( param in requestParams) {
                    var name = param.name

                    val annotation = annotation(param.annotations, "org.springframework.web.bind.annotation.RequestParam")
                    if (annotation!!.parameters.isNotEmpty())
                        name = annotation.parameters[0].value as String

                    writer.print(name).print(": ").print(param.name)
                }

                writer.print("}}")
            }

            // done

            writer.println(")")

            // done

            writer
                .tab(-1)
                .indent().println("}")
        }

        // done

        this.writer
            .tab(1)
            .println("}")
            .close()
    }

    companion object {
        fun options() : TypescriptOptions.Builder {
            return TypescriptOptions.Builder()
        }
    }
}
