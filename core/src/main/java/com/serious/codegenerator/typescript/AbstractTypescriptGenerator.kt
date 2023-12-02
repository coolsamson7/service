package com.serious.codegenerator.typescript
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.AnnotationDescriptor
import com.serious.service.InterfaceAnalyzer
import com.serious.codegenerator.AbstractCodeGenerator
import com.serious.codegenerator.LanguageSupport
import com.serious.service.InterfaceDescriptor
import java.io.File
import kotlin.reflect.KClass

class PackageMapping(val packageName: String, val folder: String, val importName: String) {

}
data class
TypescriptOptions(
    val analyzer : InterfaceAnalyzer,
    val language: LanguageSupport,
    val header: String,
    val mappings : MutableList<PackageMapping>,
    val domain: String,
    val filePerService : Boolean,
    val filePerModel : Boolean,
    val imports : HashMap<String,String> // element -> source
) {
    // local classes

    class Builder {
        // instance data

        var mappings : MutableList<PackageMapping> = ArrayList()
        var filePerService = true
        var filePerModel = true
        var header = ""
        var domain: String = ""
        var language: LanguageSupport? = null
        val analyzer = InterfaceAnalyzer()
        val imports = HashMap<String,String>() // element -> source

        // fluent

        fun addImports(source: String, vararg imports: String) : Builder {
            for ( import in imports)
                this.imports.put(import, source)

            return this
        }

        fun addService(clazz: KClass<*>) : Builder {
            analyzer.analyzeService(clazz)

            return this
        }

        fun setDomain(domain: String) : Builder {
            this.domain = domain

            return this
        }

        fun setLanguage(language : LanguageSupport) : Builder{
            this.language = language

            return this
        }

        fun mapPackage(packageName: String, folder: String, libraryName: String) : Builder {
            mappings.add(PackageMapping(packageName, folder, libraryName))

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
                language!!,
                header,
                mappings,
                domain,
                filePerService,
                filePerModel,
                imports
            )

            return options
        }
    }
}

open class AbstractTypescriptGenerator(protected val options: TypescriptOptions, name: String, version: String) : AbstractCodeGenerator(name, version) {
    // instance data

    private val imports = HashMap<String, MutableSet<String>>()
    protected var currentClass: InterfaceDescriptor? = null
    protected var currentFolder = ""
    protected var currentMapping : PackageMapping? = null
    protected var touchedFolder = HashSet<String>()

    // protected

    protected fun setClass(clazz: InterfaceDescriptor) {
        currentMapping = getMapping(packageName(clazz.name))
        currentClass = clazz
        currentFolder = folderFor(clazz.name)
        touchedFolder.add(currentFolder)

        reset()
    }

    protected fun getMapping(packageName: String) : PackageMapping {
        // get mapping with longest match

        return options.mappings
            .filter { mapping -> packageName.startsWith(mapping.packageName) }
            .sortedWith { m1: PackageMapping, m2: PackageMapping ->
                m2.packageName.length - m1.packageName.length
            }
            .first()
    }
    protected fun folderFor(clazz: String) : String {
        val clazzPackage = packageName(clazz)
        val mapping = getMapping(clazzPackage)

        return mapping.folder + clazzPackage.substring(mapping.packageName.length).replace(".", "/")
    }

    fun generateIndex() {
        for ( folder in touchedFolder) {
            setFileWriter(File("$folder/index.ts"))

            val dir = File(folder)

            fun withoutTS(file: String) : String {
                return file.substring(0,  file.lastIndexOf("."))
            }

            val files = dir.listFiles()
                .filter { file ->file.isFile }
                .filter { file -> file.name != "index.ts" }
                .map { file -> withoutTS(file.name) }
                .sorted()

            for (file in files)
                writer.println("export * from '" + file + "'")

            writer.close()
        } // for
    }

    protected fun outputFile(folder: String, fileName: String): File {
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

    protected fun reset() {
        imports.clear()
    }

    fun camelToSnake(str: String): String {
        var result = ""

        // first character(in lower case)

        var isLower = true

        val c = str[0]
        result += c.lowercaseChar()

        // traverse the string

        for (i in 1 until str.length) {
            val ch = str[i]

            if (Character.isUpperCase(ch)) {
                if ( isLower )
                    result += '-'

                result += ch.lowercaseChar()
                isLower = false
            }
            else {
                isLower = true
                result += ch
            }
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

        return result + separator
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

                        writer.indent().println(" * @param $name $description")
                    }
                }
            }

            writer.indent().println(" */")
        }
    }

    protected fun addImport(vararg elements: String) {
        for ( element in elements) {
            val source = this.options.imports[element]

            this.addImportFrom(element, source!!)
        }
    }
    protected fun addImportFrom(element: String, source: String) {
        this.imports.computeIfAbsent(source.replace("//", "/")) {_ -> HashSet() } .add(element)
    }

    protected fun writeImports() {
        // sort imports alphabetically
        // relative imports last...

        val absoluteImports = ArrayList<String>()
        val relativeImports = ArrayList<String>()

        for ( (source, imports) in imports)
            if ( source.startsWith("."))
                relativeImports.add(source)
             else
                absoluteImports.add(source)

        relativeImports.sort()
        absoluteImports.sort()

        fun writeImport(source: String, imports: MutableSet<String>) {
            writer.print("import { ")

            var index = 0
            for (import in imports) {
                if (index++ > 0)
                    writer.print(", ")
                writer.print(import)
            }

            writer.println(" } from \"$source\"")
        }

        for (source in absoluteImports)
            writeImport(source, imports.get(source)!!)

        for (source in relativeImports)
            writeImport(source, imports.get(source)!!)

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