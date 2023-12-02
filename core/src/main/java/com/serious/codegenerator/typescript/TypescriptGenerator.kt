package com.serious.codegenerator.typescript
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.codegenerator.AbstractCodeGenerator
import com.serious.service.*
import java.io.BufferedWriter
import java.io.File
import java.io.FileWriter
import java.io.PrintWriter

class TypescriptGenerator(options: TypescriptOptions) : AbstractTypescriptGenerator(options,"typescript", "1.0") {
    // not here

    var currentFolder = ""
    var currentClass: InterfaceDescriptor? = null
    val analyzer = options.analyzer

    private fun outputFile(folder: String, fileName: String): File {
        createDirectories(folder)

        return File(folder + '/' + fileName)
    }

    private fun createDirectory(dir: String) {
        if (!File(dir).exists())
            if (File(dir).mkdir())
                println("created $dir")
    }

    private fun createDirectories(folder: String): String { // /Users/user/asd
        val currentDirectory: StringBuilder = StringBuilder("/")

        // split package name

        var start = 1 // we know it starts with a /!
        var dot = folder.indexOf('/', start)
        val len = folder.length
        while (start < len && dot >= 0) {
            currentDirectory.append('/').append(folder.substring(start, dot))
            createDirectory(currentDirectory.toString())
            start = dot + 1
            dot = folder.indexOf('/', start)
        } // while

        if (start < len) {
            currentDirectory.append('/').append(folder.substring(start))
            createDirectory(currentDirectory.toString())
        } // if

        currentDirectory.append('/')

        return currentDirectory.toString()
    }

    // package "com.

    fun packageName(clazz: String) : String {
        return clazz.substring(0, clazz.lastIndexOf("."))
    }

    fun folderFor(clazz: String) : String {
        val clazzPackage = clazz.substring(0, clazz.lastIndexOf("."))

        for ((packageName, folder) in options.packageFolder ) {
            if (clazz.startsWith(packageName)) {
                return folder + clazzPackage.substring(packageName.length).replace(".", "/")
            }
        }

        return clazz
    }

    fun file4Service(clazz: String) : String {
        return folderFor(clazz) + "/" + fileName4Service(clazz)
    }

    fun file4Model(clazz: String) : String {
        return folderFor(clazz) + "/" + fileName4Model(clazz)
    }

    fun setFileWriter(file: File) {
        writer = AbstractCodeGenerator.Writer(PrintWriter(BufferedWriter(FileWriter(file, false))))
    }

    // not here

    fun generate() {
        // models

        for ((name, clazz) in analyzer.models)
            if (clazz.kind.contains("class"))
                generateClass(clazz)

        // services

        for ((name, clazz) in analyzer.services)
            generateService(clazz)
    }


    fun generateClass(clazz: InterfaceDescriptor) {
        reset()

        currentClass = clazz
        currentFolder = folderFor(clazz.name)

        setFileWriter(outputFile(currentFolder, fileName4Model(clazz.name)))

        println("generate class " + clazz.name + " file = " + currentFolder + fileName4Model(clazz.name))

        if ( options.header.isBlank())
            writeHeader(header())
        else
            writeHeader(header() + "\n" + options.header)

        // collect imports

        if ( clazz.inherits != null)
            type(TypeDescriptor(clazz.inherits, false, emptyList()))

        for ( property in clazz.properties)
            type(property.type!!)

        this.writeImports()

        // documentation

        writeDocumentation(findDocumentation(clazz.annotations))
        this.writer
            .print("export interface " + simpleName(clazz.name))// + " {")

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
        var typescriptType : String = typeName
        if ( typeName.startsWith("kotlin.")) {
            typescriptType = when (typeName) {
                "kotlin.Short" -> "number"
                "kotlin.Int" -> "number"
                "kotlin.Long" -> "number"
                "kotlin.String" -> "string"
                "kotlin.Boolean" -> "boolean"
                "kotlin.Unit" -> "void"
                "kotlin.Any" -> "any"

                else -> { // Note the block
                    typeName
                }
            }
        }
        else {
            if ( currentClass?.name != typeName) {
                val typeFolder = folderFor(typeName)

                this.addImportFrom(
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

        return when ( typeName ) {
            "kotlin.collections.List" -> type(type.parameter[0]) + "[]"
            "kotlin.collections.Collection" -> type(type.parameter[0]) + "[]"
            "kotlin.Array" -> type(type.parameter[0]) + "[]"

            else -> mapType(typeName)
        }
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
        reset()

        currentFolder = folderFor(clazz.name)

        setFileWriter(outputFile(currentFolder, fileName4Service(clazz.name)))

        println("generate service " + clazz.name + " file = " + currentFolder + fileName4Service(clazz.name))

        // write header

        if ( options.header.isBlank())
            writeHeader(header())
        else
            writeHeader(header() + "\n" + options.header)

        // add imports

        this.addImport("Injectable", "Injector","Observable", "RegisterService", "AbstractHTTPService")

        // collect method imports

        for ( method in clazz.methods) {
            type(method.returnType)

            for (parameter in method.parameters) {
                type(parameter.type)
            }
        }

        // look for requestmapping at class level

        var prefix : String? = null
        val requestMapping = clazz.annotations.find { annotation -> annotation.name == "org.springframework.web.bind.annotation.RequestMapping" }
        if ( requestMapping != null) {
            val param = requestMapping.parameters.find { parameterValueDescriptor -> parameterValueDescriptor.name == "value" }
            if (param != null)
                prefix = (param.value as Array<String>)[0]
        }

        // header

        var domain = options.domain
        var register = "@RegisterService({domain: \"" + domain + "\""
        if (prefix != null)
            register += ", prefix: \"" + prefix + "\""
        register += "})"

        // write imports

        this.writeImports()

        // write class

        writeDocumentation(findDocumentation(clazz.annotations))

        this.writer
            .println("@Injectable({providedIn: 'root'})")
            .println(register)
            .println("export class " + simpleName(clazz.name) + " extends AbstractHTTPService {")
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
            val func = mapping.name.substring(mapping.name.lastIndexOf(".") + 1, mapping.name.indexOf("Mapping")).toLowerCase()

            writer
                .tab(1)
                .indent().print("return this." + func + "<" + type(method.returnType) + ">(")

            val uris = mapping.parameters.find { param -> param.name == "value" }?.value as Array<String>
            val uri = uris[0]
            writer.print("`")

            var start = 0
            var lBrace = uri.indexOf("{")
            while ( lBrace > 0) {
                // add prefix

                writer.print(uri.substring(start, lBrace))

                // add param

                val rBrace = uri.indexOf("}", lBrace)
                val param = uri.substring(lBrace + 1, rBrace)

                val p = findParameter4Path(method, param)

                writer.print("\${").print(p!!.name).print("}")

                start = rBrace + 1
                lBrace =  uri.indexOf("{", start)
            }

            if ( start < uri.length)
                writer.print(uri.substring(start))

            // replace all path variables {x} by ${name-of-parameter}

            writer.print("`")

            if ( func == "post") {
                val body = method.parameters.find { param -> param.annotations.find { annotation -> annotation.name == "org.springframework.web.bind.annotation.RequestBody"} != null }!!.name

                writer.print(", ").print(body)
            }

            // params

            if ( method.parameters.find { param -> param.annotations.find { annotation -> annotation.name == "org.springframework.web.bind.annotation.RequestParam" } != null} != null) {
                writer.print(", { params: {")

                val requestParams = method.parameters.filter { param -> param.annotations.find { annotation -> annotation.name == "org.springframework.web.bind.annotation.RequestParam" } != null }

                for ( param in requestParams) {
                    var name = param.name

                    val annotation = param.annotations.find { param -> param.name == "org.springframework.web.bind.annotation.RequestParam"}
                    if ( !annotation!!.parameters.isEmpty())
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
                //.println("")
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
