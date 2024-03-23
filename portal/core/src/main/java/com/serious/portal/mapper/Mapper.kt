package com.serious.portal.mapper
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.util.*
import kotlin.reflect.*
import kotlin.reflect.full.*
import kotlin.reflect.jvm.ExperimentalReflectionOnLambdas
import kotlin.reflect.jvm.jvmErasure
import kotlin.reflect.jvm.reflect

typealias Conversion<I, O> = (I) -> O
typealias Finalizer<S, T> = (S,T) -> Unit

typealias PKGetter<T,PK> = (any: T) -> PK


// mapper


fun constant(value: Any) : MappingDefinition.Accessor {
    return MappingDefinition.ConstantAccessor(value)
}

fun properties(vararg properties: String): MappingDefinition.Properties {
    return MappingDefinition.Properties(*properties)
}

fun path(vararg path: String): Array<String> {
    return path as Array<String> // ha !
}

fun property(name: String) : MappingDefinition.PropertyAccessor {
    return MappingDefinition.PropertyAccessor(name)
}

// local classes

class OperationBuilder(private val matches: MutableCollection<MappingDefinition.Match>) {
    // local classes

    data class OperationResult(
        val operations: Array<Transformer.Operation<Mapping.Context>>,
        val stackSize: Int
    )

    private class SourceTree(private val type: KClass<*>, matches: Collection<MappingDefinition.Match>) {
        // local class

        class Node(private val parent: Node?, val accessor: MappingDefinition.Accessor, val match: MappingDefinition.Match?) {
            // instance data

            private val children: MutableList<Node> = LinkedList()
            private var stackIndex = -1 // this will hold the index in the stack of intermediate results
            private var type: KClass<*> = accessor.type
            var fetchProperty: Transformer.Property<Mapping.Context>? = null // the transformer property needed to fetch the value

            // protected

            private val isRoot: Boolean
                get() = parent == null

            private val isLeaf: Boolean
                get() = children.isEmpty()

            private val index: Int
                get() = parent?.children?.indexOf(this) ?: 0

            // public

            fun insertMatch(tree: SourceTree, match: MappingDefinition.Match, index: Int) {
                var root: Node? = children.find { child -> child.accessor == match.paths[SOURCE][index] }

                if (root == null)
                    children.add(tree.makeNode(
                        this, match.paths[SOURCE][index],  // step

                        if (match.paths[SOURCE].size - 1 == index) match else null
                    ).also { root = it })

                if (match.paths[SOURCE].size > index + 1)
                    root!!.insertMatch(tree, match, index + 1)
            }

            // pre: this node matches index - 1

            fun findMatchingNode(match: MappingDefinition.Match, index: Int): Node {
                if (index < match.paths[SOURCE].size) {
                    for (child in children)
                        if (child.accessor == match.paths[SOURCE][index])
                            return child.findMatchingNode(match, index + 1)
                } // if

                return this
            }

            fun fetchValue(sourceTree: SourceTree, expectedType: KClass<*>, operations: MutableList<Transformer.Operation<Mapping.Context>>) {
                // recursion

                if (!isRoot)
                    parent!!.fetchValue(sourceTree, expectedType, operations)

                // fetch a stored value

                if (fetchProperty == null) {
                    // root, no children...

                    if (isRoot) {
                        fetchProperty = accessor.makeTransformerProperty(false /* write */)
                        type = accessor.type
                    }
                    else {
                        // inner node or leaf

                        fetchProperty = Mapping.PeekValueProperty(
                            parent!!.index,
                            accessor.makeTransformerProperty(false /* read */)
                        )
                        type = accessor.type
                    }

                    // in case of inner nodes take the result and remember it

                    if (!isLeaf) {
                        // store the intermediate result
                        stackIndex = sourceTree.stackSize++ // that's my index
                        operations.add(Transformer.Operation(fetchProperty!!, Mapping.PushValueProperty(index)))
                    }
                }
            }
        }

        // instance data

        private var roots: MutableList<Node> = LinkedList()
        var stackSize = 0

        // constructor

        init {
            for (match in matches)
                try {
                    insertMatch(match)
                }
                catch (exception: MapperDefinitionException) {
                    exception.setMatch(match)
                    throw exception
                }
        }

        // private

        private fun insertMatch(match: MappingDefinition.Match) {
            var root: Node? = roots.find { node -> node.match == match || node.accessor == match.paths[0][0] }

            if (root == null)
                roots.add(makeNode(
                    null,  // parent
                    match.paths[SOURCE][0],  // step
                    if (match.paths[SOURCE].size == 1) match else null
                ).also { root = it })

            if (match.paths[SOURCE].size > 1)
                root?.insertMatch(this, match, 1)
        }

        fun findNode(match: MappingDefinition.Match): Node? {
            for (node in roots)
                if (node.match === match)
                    return node
                else if (node.accessor == match.paths[SOURCE][0])
                    return node.findMatchingNode(match, 1)

            return null // make the compiler happy
        }

        fun makeNode(parent: Node?, step: MappingDefinition.Accessor, match: MappingDefinition.Match?): Node {
            step.resolve(parent?.accessor?.type ?: type, false)

            return Node(parent, step, match)
        }
    }

    private class TargetTree(private val bean: KClass<*>, matches: MutableCollection<MappingDefinition.Match>) {
        // local classes

        class Node(private val parent: Node?, val accessor: MappingDefinition.Accessor, val match: MappingDefinition.Match?) {
            // instance data

            private val children: MutableList<Node> = LinkedList()
            private var composite: MappingDefinition.CompositeDefinition? = null

            val immutable : Boolean
                get() = accessor.type.isData

            val readOnly : Boolean
                get() = accessor.readOnly

            // protected

            private val isRoot: Boolean
                get() = parent == null

            private val isLeaf: Boolean
                get() = children.isEmpty()

            private val isInnerNode: Boolean
                get() = children.isNotEmpty()

            private val index :Int
                get() = parent?.childIndex(this) ?: -1

            // public

            fun insertMatch(tree: TargetTree, match: MappingDefinition.Match, index: Int) {
                var root: Node? = children.find {child -> child.accessor == match.paths[TARGET][index] }

                if (root == null)
                    children.add(tree.makeNode(
                        this, match.paths[TARGET][index],  // step

                        if (match.paths[TARGET].size - 1 == index) match else null
                    ).also { root = it })

                if (match.paths[TARGET].size > index + 1)
                    root!!.insertMatch(tree, match, index + 1)
            }

            // protected

            fun childIndex(child: Node): Int {
                return if (readOnly) child.accessor.overallIndex else children.indexOf(child)
            }

            fun computeValueReceiver(targetTree: TargetTree) : Mapping.ValueReceiver {
                return if ( parent != null)
                    if (parent.composite != null) {
                        if ( parent.immutable)
                            Mapping.SetImmutableCompositePropertyValueReceiver(parent.composite!!, index)
                        else {
                            if ( accessor.readOnly)
                                throw MapperDefinitionException("${parent.accessor.type.simpleName}.${accessor.name} is read only")

                            Mapping.SetMutableCompositePropertyValueReceiver(parent.composite!!, accessor.makeTransformerProperty(true))
                        }
                    }
                    else
                        Mapping.SetPropertyValueReceiver(parent.accessor.makeTransformerProperty(true))
                else {
                    if (targetTree.composite != null) {
                        if ( targetTree.composite!!.immutable())
                            Mapping.SetImmutableCompositePropertyValueReceiver(targetTree.composite!!, accessor.index)
                        else
                            Mapping.SetMutableCompositePropertyValueReceiver(targetTree.composite!!, accessor.makeTransformerProperty(true))
                    }
                    else
                        Mapping.SetPropertyValueReceiver(accessor.makeTransformerProperty(true))
                }
            }

            // public

            fun <S : Any, T : Any> makeOperations(sourceTree: SourceTree, targetTree: TargetTree, mapper: Mapper, definition: MappingDefinition<S, T>, operations: MutableList<Transformer.Operation<Mapping.Context>>) {
                val type: KClass<*> = accessor.type

                if (isInnerNode) {
                    val valueReceiver = computeValueReceiver(targetTree)

                    // done

                    composite = if (immutable) {
                        // check if all arguments are mapped

                        if (children.size < type.memberProperties.size)
                            throw MapperDefinitionException("not all properties of the composite ${type.simpleName} are mapped", null)

                        // done

                        definition.addImmutableCompositeDefinition(type, valueReceiver)
                    }
                    else definition.addMutableCompositeDefinition(type, children.size, valueReceiver)

                    // recursion

                    for (child in children)
                        child.makeOperations(sourceTree, targetTree, mapper, definition, operations)
                } // if

                else { // leaf
                    val sourceNode = sourceTree.findNode(match!!)!!

                    sourceNode.fetchValue(sourceTree, type, operations) // compute property needed to fetch source value

                    operations.add(makeOperation(targetTree, sourceNode))
                } // if
            }

            @OptIn(ExperimentalReflectionOnLambdas::class)
            private fun calculateConversion(sourceNode: SourceTree.Node) : Conversion<Any?,Any?>? {
                var conversion = match!!.conversion
                val deep = match.deep

                // check conversion

                val sourceType = sourceNode.accessor.type
                val targetType = this.accessor.type

                if ( conversion != null) {
                    // manual conversion, check types!

                    val from = conversion.reflect()!!.parameters[0].type.jvmErasure
                    val to = conversion.reflect()!!.returnType.jvmErasure

                    if ( from != sourceType)
                        throw MapperDefinitionException("conversion source type ${from.simpleName} does not match ${sourceType.simpleName}", null)

                    if ( to != targetType)
                        throw MapperDefinitionException("conversion target type ${to.simpleName} does not match ${targetType.simpleName}", null)
                }
                else if (sourceType != targetType && !deep )
                    conversion = tryConvert(sourceType, targetType) // try automatic conversion for low-level types

                return conversion as Conversion<Any?,Any?>?
            }

            private fun makeOperation(tree: TargetTree, sourceNode: SourceTree.Node): Transformer.Operation<Mapping.Context> {
                val sourceProperty: Transformer.Property<Mapping.Context> = sourceNode.fetchProperty!!

                val deep = match!!.deep
                val conversion = calculateConversion(sourceNode)

                // compute operation

                var writeProperty = accessor.makeTransformerProperty( (isRoot && tree.composite == null) || (!isRoot && !parent!!.immutable)) // property, constant or synchronizer

                if (isRoot) {
                    // chain, if composite?

                    if (tree.composite != null)
                        writeProperty = Mapping.SetCompositeArgument(tree.composite!!, accessor.index, writeProperty)
                }
                else
                    writeProperty = Mapping.SetCompositeArgument(parent!!.composite!!, accessor.index, writeProperty)

                if ( deep )
                    writeProperty = mapDeep(sourceNode.accessor, accessor, writeProperty)
                else
                    writeProperty = maybeConvert(writeProperty, conversion)

                return Transformer.Operation(sourceProperty, writeProperty)
            }

            private fun <S : Any,T: Any> tryConvert(sourceType: KClass<S>, targetType: KClass<T>): Conversion<Any?,Any?> {
                if ( sourceType == Short::class) {
                    return when (targetType) {
                        Int::class -> {value -> (value as Short).toInt() }
                        Long::class -> {value -> (value as Short).toLong() }
                        Double::class -> {value -> (value as Short).toDouble() }
                        Float::class -> {value -> (value as Short).toFloat() }

                        else -> {
                            throw MapperDefinitionException("unknown conversion from ${sourceType.simpleName} to ${targetType.simpleName}", null)
                        }
                    }
                }
                else if ( sourceType == Int::class) {
                    return when (targetType) {
                        Short::class -> {value -> (value as Int).toShort() }
                        Long::class -> {value -> (value as Int).toLong() }
                        Double::class -> {value -> (value as Int).toDouble() }
                        Float::class -> {value -> (value as Int).toFloat() }

                        else -> {
                            throw MapperDefinitionException("unknown conversion from ${sourceType.simpleName} to ${targetType.simpleName}", null)
                        }
                    }
                }
                else if ( sourceType == Long::class) {
                    return when (targetType) {
                        Short::class -> {value -> (value as Long).toShort() }
                        Int::class -> {value -> (value as Long).toInt() }
                        Double::class -> {value -> (value as Long).toDouble() }
                        Float::class -> {value -> (value as Long).toFloat() }

                        else -> {
                            throw MapperDefinitionException("unknown conversion from ${sourceType.simpleName} to ${targetType.simpleName}", null)
                        }
                    }
                }
                else if ( sourceType == Float::class) {
                    return when (targetType) {
                        Short::class -> {value -> (value as Float).toInt().toShort() }
                        Int::class -> {value -> (value as Float).toInt() }
                        Long::class -> {value -> (value as Float).toLong() }
                        Double::class -> {value -> (value as Float).toDouble() }

                        else -> {
                            throw MapperDefinitionException("unknown conversion from ${sourceType.simpleName} to ${targetType.simpleName}", null)
                        }
                    }
                }

                else if ( sourceType == Double::class) {
                    return when (targetType) {
                        Short::class -> {value -> (value as Double).toInt().toShort() }
                        Int::class -> {value -> (value as Double).toInt() }
                        Long::class -> {value -> (value as Double).toLong() }
                        Double::class -> {value -> (value as Double).toDouble() }
                        Float::class -> {value -> (value as Double).toFloat() }

                        else -> {
                            throw MapperException("unknown conversion")
                        }
                    }
                }

                throw MapperDefinitionException("cannot convert ${sourceType.simpleName} to ${targetType.simpleName}", null)
            }

            private fun maybeConvert(property: Transformer.Property<Mapping.Context>, conversion: Conversion<*,*>?): Transformer.Property<Mapping.Context> {
                return if (conversion == null) property
                else {
                    Mapping.Convert(property, conversion as Conversion<Any?,Any?>)
                }
            }

            private fun isContainerType(clazz: Class<*>): Boolean {
                return MutableCollection::class.java.isAssignableFrom(clazz) || clazz.isArray
            }

            private fun mapDeep(source: MappingDefinition.Accessor, target: MappingDefinition.Accessor, targetProperty: Transformer.Property<Mapping.Context>): Transformer.Property<Mapping.Context> {
                val sourceType = source.type
                val targetType = target.type

                val isSourceMultiValued = isContainerType(sourceType.java)
                val isTargetMultiValued = isContainerType(targetType.java)

                if (isSourceMultiValued != isTargetMultiValued)
                    throw MapperDefinitionException("relations must have the same cardinality", null)

                if (targetProperty is Mapping.SynchronizeMultiValuedRelationship<*, *, *>)
                    return targetProperty // ugly

                return if (isSourceMultiValued)
                    Mapping.MapCollection2Collection(sourceType, targetType, targetProperty)
                else
                    Mapping.MapDeep(targetProperty)
            }
        }

        // instance data

        private var roots: MutableList<Node> = LinkedList()
        var composite : MappingDefinition.CompositeDefinition? = null // in case the root is a data class

        // constructor

        init {
            for (match in matches)
                insertMatch(match)
        }

        // private

        private fun insertMatch(match: MappingDefinition.Match) {
            var root = roots.find { node -> node.match == match || node.accessor == match.paths[1][0] }

            if (root == null) roots.add(makeNode(
                null,  // parent
                match.paths[TARGET][0],  // step
                if (match.paths[TARGET].size == 1) match else null
            ).also { root = it })

            if (match.paths[TARGET].size > 1)
                root!!.insertMatch(this, match, 1)
        }

        // public

        fun <S : Any, T : Any> makeOperations(sourceTree: SourceTree, mapper: Mapper, definition: MappingDefinition<S, T>): Array<Transformer.Operation<Mapping.Context>> {
            val operations = LinkedList<Transformer.Operation<Mapping.Context>>()

            // check if the root is a data class

            if (definition.targetClass.isData)
                composite = definition.addImmutableCompositeDefinition(definition.targetClass, Mapping.MappingResultValueReceiver())

            // traverse roots

            for (node in roots) try {
                node.makeOperations(sourceTree, this, mapper, definition, operations)
            }
            catch (e: MapperDefinitionException) {
                e.setDefinition(definition)
                e.setMatch(node.match)

                throw e
            }

            return operations.toTypedArray()
        }

        // override

        fun makeNode(parent: Node?, step: MappingDefinition.Accessor, match: MappingDefinition.Match?): Node {
            return try {
                step.resolve(parent?.accessor?.type ?: bean, true)

                Node(parent, step, match)
            }
            catch (exception: MapperDefinitionException) {
                exception.setAccessor(step)

                throw exception
            }
        }
    }

    // public

    fun <S : Any, T : Any> makeOperations(mapper: Mapper, definition: MappingDefinition<S, T>): OperationResult {
        val sourceTree = SourceTree(definition.sourceClass, matches)

        return OperationResult(
            TargetTree(definition.targetClass, matches).makeOperations(sourceTree, mapper, definition),
            sourceTree.stackSize
        )
    }

    companion object {
        const val SOURCE = 0
        const val TARGET = 1
    }
}

class MappingDefinition<S : Any, T : Any>(val sourceClass: KClass<S>, val targetClass: KClass<T>) {
    // local classes

    class Properties(vararg val properties: String) {
        var except : Array<out String> = arrayOf()

        fun except(vararg except : String) :Properties {
            this.except = except

            return this
        }
    }

    class Builder<S:Any,T:Any>(val definition: MappingDefinition<S,T>) {
        // map { ... }

        data class MapBuilder<S: Any,T: Any>(val definition : MappingDefinition<S,T>) {
            val This = this

            // instance data

            var deep = false
            var conversion: Conversion<Any,Any>? = null
            var synchronizer: MapperRelationSynchronizer<Any,Any,Any?>? = null
            var sourceAccessor : Array<Accessor>? = null
            var targetAccessor : Array<Accessor>? = null
            var properties : Properties? = null

            // infix fun

            // string

            infix fun String.to(target: String) :MapBuilder<S,T> {
                sourceAccessor = arrayOf(PropertyAccessor(this))
                targetAccessor = arrayOf(PropertyAccessor(target))

                return This
            }

            infix fun String.to(target: Array<String>) :MapBuilder<S,T> {
                sourceAccessor = arrayOf(PropertyAccessor(this))
                targetAccessor = target.map {PropertyAccessor(it) }.toTypedArray()

                return This
            }

            // array of strings

            infix fun Array<String>.to(target: String) :MapBuilder<S,T> {
                sourceAccessor = this.map {PropertyAccessor(it) }.toTypedArray()
                targetAccessor = arrayOf(PropertyAccessor(target))

                return This
            }

            infix fun Array<String>.to(target: Array<String>) :MapBuilder<S,T> {
                sourceAccessor = this.map {PropertyAccessor(it) }.toTypedArray()
                targetAccessor = target.map { PropertyAccessor(it) }.toTypedArray()

                return This
            }

            // accessor

            infix fun Accessor.to(target: Accessor) :MapBuilder<S,T> {
                sourceAccessor = arrayOf(this)
                targetAccessor = arrayOf(target)

                return This
            }

            // property

            infix fun KProperty1<S,*>.to(target: KProperty1<T,*>):MapBuilder<S,T> {
                val sourceProperty = PropertyAccessor(this.name)
                sourceProperty.readProperty = this as KProperty1<Any, Any?>

                val targetProperty = PropertyAccessor(target.name)
                targetProperty.readProperty = target as KProperty1<Any, Any?>

                sourceAccessor = arrayOf(sourceProperty)
                targetAccessor = arrayOf(targetProperty)

                return This
            }

            // synchronize

            infix fun<TO: Any,ENTITY:Any, PK:Any?> synchronize(synchronizer: MapperRelationSynchronizer<TO,ENTITY, PK>) : MapBuilder<S,T> {
                this.synchronizer = synchronizer as MapperRelationSynchronizer<Any,Any,Any?>
                this.deep = true

                return this
            }

            // convert

            infix fun<I:Any,O:Any> convert(conversion: Conversion<I,O>) : MapBuilder<S,T> {
                this.conversion = conversion as Conversion<Any,Any>

                return this
            }

            // deep

            infix fun deep(deep : Boolean) : MapBuilder<S,T>  {
                this.deep = deep

                return this
            }

            // properties

            fun properties(vararg property: String): MapBuilder<S,T>  {
                this.properties = Properties(*property)

                return this
            }

            infix fun except(property: Array<String>) :MapBuilder<S,T>  {
                this.properties?.except(*property)

                return this
            }

            infix fun except(property: String) :MapBuilder<S,T>  {
                this.properties?.except(property)

                return this
            }

            // done

            fun build() {
                if ( properties != null) {
                    if ( deep )
                        definition.mapDeep(properties!!)
                    else
                        definition.map(properties!!)
                }
                else {
                    if ( sourceAccessor == null || targetAccessor == null)
                        throw MapperDefinitionException("missing map source / target")

                    if ( deep ) {
                        if ( synchronizer != null)
                            definition.synchronize(sourceAccessor!![0].name, targetAccessor!![0].name, synchronizer!!)
                        else
                            definition.mapDeep(sourceAccessor!!, targetAccessor!!)
                    }
                    else
                        definition.map(sourceAccessor!!, targetAccessor!!, conversion)
                }

            }
        }

        fun map(lambda: MapBuilder<S,T>.() -> Unit) : Builder<S,T> {
            val builder = MapBuilder(definition)

            builder.apply(lambda)

            // create operation

            builder.build()

            // done

            return this
        }

        // top level

        infix fun finalize(finalizer: Finalizer<Any,Any>) : Builder<S,T> {
            definition.finalizer = finalizer

            return this
        }

        infix fun derives(mappingDefinition: MappingDefinition<*,*>) : Builder<S,T> {
            definition.derives(mappingDefinition)

            return this
        }
    }

    class Match(private val mapOperation: MapOperation, source: Array<Accessor>, target: Array<Accessor>) {
        val paths: Array<Array<Accessor>> = arrayOf(source, target)

        val deep: Boolean
            get() = mapOperation.deep

        val conversion: Conversion<*,*>?
            get() = mapOperation.conversion

        fun describe(builder: StringBuilder) {
            builder.append("\noperation: ")

            mapOperation.describe(builder)
        }
    }

    // accessors


    interface Accessor {
        val name: String
        var index: Int
        var overallIndex : Int
        val readOnly : Boolean
        val type: KClass<*>

        fun resolve(clazz: KClass<*>, write: Boolean)

        fun makeTransformerProperty(write: Boolean): Transformer.Property<Mapping.Context>

        fun description() : String
    }

    open class PropertyAccessor(override val name: String) : Accessor {
        // instance data

        override var index = -1
        override var overallIndex = -1
        lateinit var readProperty: KProperty1<Any, Any?>
        var writeProperty: KMutableProperty1<Any, Any>? = null

        override val type: KClass<*>
            get() = this.readProperty.returnType.jvmErasure

        override val readOnly: Boolean
            get() = readProperty !is KMutableProperty<*>

        // implement

        override fun makeTransformerProperty(write: Boolean): Transformer.Property<Mapping.Context> {
            if ( write )
                return Mapping.MutablePropertyProperty(writeProperty!!)
            else
                return Mapping.PropertyProperty(readProperty)
        }

        override fun resolve(clazz: KClass<*>, write: Boolean) {
            try {
                this.readProperty = clazz.memberProperties.first { it.name == this.name } as KProperty1<Any, Any?>

                if (write && readOnly && !clazz.isData)
                    throw MapperDefinitionException("property ${clazz.simpleName}.${readProperty.name} is read only")

                if ( this.readProperty is KMutableProperty1<*, *> )
                    this.writeProperty = this.readProperty as KMutableProperty1<Any, Any>
            }
            catch (e: MapperDefinitionException) {
                throw e
            }
            catch (e: Exception) {
                throw MapperDefinitionException("unknown property ${clazz.simpleName}.${name}")
            }

            if ( clazz.isData) {
                val param = clazz.constructors.first().parameters.find { parameter-> parameter.name == this.name }
                this.index = clazz.constructors.first().parameters.indexOf(param)
                this.overallIndex = index
            }
            else {
                this.index = clazz.declaredMemberProperties.indexOf(this.readProperty)
                this.overallIndex = clazz.memberProperties.indexOf(this.readProperty)
            }
        }

        // override Any

        override fun equals(other: Any?): Boolean {
            return other is PropertyAccessor && other.name == name
        }

        override fun hashCode(): Int {
            return name.hashCode()
        }

        override fun description() : String{
            return "\"${name}\""
        }
    }


    class ConstantAccessor(private val constant: Any) : Accessor {
        // override

        override val name: String
            get() = "constant(" + constant.toString() + ')'

        override val type: KClass<*>
            get() = constant.javaClass.kotlin

        override val readOnly: Boolean
            get() = true

        override var index = 0
        override var overallIndex = 0

        override fun resolve(clazz: KClass<*>, write: Boolean) {
            if ( write )
                throw MapperDefinitionException("constants are not writeable")
        }

        override fun makeTransformerProperty(write: Boolean): Transformer.Property<Mapping.Context> {
            if ( write )
                throw MapperDefinitionException("constants are not writeable")
            else
                return Mapping.ConstantValue(constant)
        }

        /*TODO override fun getValue(instance: Any): Any {
            return constant
        }*/

        override fun description() :String{
            return "constant ${constant}"
        }
    }

    // composite stuff

    abstract class CompositeDefinition(val clazz: KClass<*>, val index: Int, val nArgs: Int, val valueReceiver: Mapping.ValueReceiver) {
        @JvmField
        val constructor = clazz.constructors.first()

        open fun immutable() : Boolean {return false}
        abstract fun createBuffer(mapper: Mapper): Mapping.CompositeBuffer
    }

    class ImmutableCompositeDefinition(index: Int, clazz: KClass<*>, nargs: Int, valueReceiver: Mapping.ValueReceiver)
        : CompositeDefinition(clazz, index, nargs, valueReceiver) {

        // override CompositeDefinition

        override fun immutable() : Boolean {return true}

        override fun createBuffer(mapper: Mapper): Mapping.CompositeBuffer {
            return Mapping.ImmutableCompositeBuffer(this, nArgs)
        }
    }

    class MutableCompositeDefinition(index: Int, clazz: KClass<*>, nargs: Int, valueReceiver: Mapping.ValueReceiver)
        : CompositeDefinition(clazz, index, nargs, valueReceiver) {

        // override

        override fun createBuffer(mapper: Mapper): Mapping.CompositeBuffer {
            return Mapping.MutableCompositeBuffer(this, clazz, nArgs)
        }
    }

    // operations

    interface MapOperation {
        val deep: Boolean
        val conversion: Conversion<*,*>?

        fun <S : Any, T : Any> findMatches(definition: MappingDefinition<S, T>, matches: MutableCollection<Match> )

        fun describe(builder: StringBuilder)
    }

    class MapProperties(private val properties: Properties, override val conversion: Conversion<Any?,Any?>? = null, override val deep: Boolean = false) : MapOperation {
        // implement MapOperation

        override fun <S : Any, T : Any> findMatches(definition: MappingDefinition<S, T>, matches: MutableCollection<Match>) {
            for (property in computeProperties(definition.sourceClass, definition.targetClass))
                matches.add(Match(
                    this,
                    arrayOf(PropertyAccessor(property)),
                    arrayOf(PropertyAccessor(property))
                ))
        }

        override fun describe(builder: StringBuilder) {
            builder.append("properties()")
            if ( properties.except.isNotEmpty()) {
                builder
                    .append(" except arrayOf(")
                    .append(properties.except.map { property -> "\"${property}\n" }.joinToString())
                    .append("}")
            }
        }

        // private

        private fun computeProperties(sourceClass: KClass<*>, targetClass: KClass<*>): List<String> {
            val result: MutableList<String> = LinkedList()

            var names = properties.properties

            if ( names.isEmpty())
                names = sourceClass.memberProperties.map { property -> property.name } .toTypedArray()

            for (property in names) {
                if (properties.except.contains(property))
                    continue

                if (sourceClass.memberProperties.find { prop -> prop.name == property } !== null &&
                    targetClass.memberProperties.find { prop -> prop.name == property } !== null)
                    result.add(property)
            }

            return result
        }
    }

    class MapAccessor(private val from: Array<Accessor>, private val to: Array<Accessor>, override val conversion: Conversion<*,*>? = null, override val deep: Boolean = false) : MapOperation {
        // implement MapOperation

        override fun <S : Any, T : Any> findMatches(definition: MappingDefinition<S, T>, matches: MutableCollection<Match>) {
            matches.add(Match(this, from, to))
        }

        @Override
        override fun describe(builder: StringBuilder) {
            builder.append("map { ")

            // source

            if ( from.size == 1)
                builder.append(from[0])
            else {
                builder
                    .append("path(")
                    .append(from.joinToString { accessor -> accessor.description() })
                    .append(")")
            }

            builder.append(" to ")

            // target

            if ( to.size == 1)
                builder.append(from[0])
            else {
                builder
                    .append("path(")
                    .append(to.joinToString { accessor -> accessor.description() })
                    .append(")")
            }

            if (deep)
                builder.append(" deep true")

            if (conversion != null) {
                builder
                    .append(" convert ")
                    .append( from[from.size-1].type.simpleName)
                    .append(" to ")
                    .append( to[0].type.simpleName)
            }

            builder.append(" }")
        }
    }

    // instance data

    private var finalizer : Finalizer<S,T>? = null
    private var baseMapping: MappingDefinition<*,*>? = null
    private val composites = LinkedList<CompositeDefinition>()
    private val operations = ArrayList<MapOperation>()

    // public

    fun addImmutableCompositeDefinition(clazz: KClass<*>, valueReceiver: Mapping.ValueReceiver): CompositeDefinition {
        composites.add(ImmutableCompositeDefinition(composites.size, clazz, clazz.memberProperties.size, valueReceiver))

        return composites.last
    }

    fun addMutableCompositeDefinition(clazz: KClass<*>, nargs: Int, valueReceiver: Mapping.ValueReceiver): CompositeDefinition {
        composites.add(MutableCompositeDefinition(composites.size, clazz, nargs, valueReceiver))

        return composites.last
    }

    fun createMapping(mapper: Mapper): Mapping<S, T> {
        val (operations, stackSize) = this.createOperations(mapper)

        return Mapping(this, operations, stackSize, composites, collectFinalizer())
    }

    fun describe(builder: StringBuilder) {
        builder.append("${sourceClass.simpleName} to ${targetClass.simpleName}")
    }

    // private

    private fun collectFinalizer() : Array<Finalizer<S,T>> {
        val finalizer = ArrayList<Finalizer<S,T>>()

        // local function

        fun collect(definition: MappingDefinition<*,*>) {
            if ( definition.baseMapping != null )
                collect(definition.baseMapping!!)

            if ( definition.finalizer != null)
                finalizer.add(definition.finalizer!! as Finalizer<S,T>)
        }

        // go, forrest

        collect(this)

        // done

        return finalizer.toTypedArray()
    }

    private fun findMatches(matches: MutableCollection<Match>) {
        // recursion

        if (baseMapping != null)
            baseMapping!!.findMatches(matches)

        // own matches

        for (operation in operations)
            operation.findMatches(this, matches)
    }

    private fun createOperations(mapper: Mapper): OperationBuilder.OperationResult {
        val matches: MutableCollection<Match> = ArrayList<Match>()

        findMatches(matches)

        return OperationBuilder(matches).makeOperations(mapper, this)
    }

    // fluent

    fun derives(mappingDefinition: MappingDefinition<*,*>): MappingDefinition<S,T> {
        // sanity checks

        if (baseMapping != null)
            throw MapperDefinitionException("base mapping has been already defined")

        // done

        baseMapping = mappingDefinition

        return this
    }

    fun mapDeep(from: String, to: String): MappingDefinition<S, T> {
        return this.mapDeep(arrayOf(from), arrayOf(to))
    }

    fun  map(from: String, to: String): MappingDefinition<S, T> {
        return this.map(arrayOf(from), arrayOf(to), null)
    }

    fun  <I:Any,O:Any> map(from: String, to: String, conversion: Conversion<I,O>): MappingDefinition<S, T> {
        return this.map(arrayOf(from), arrayOf(to), conversion)
    }

    fun mapDeep(from: Array<String>, to: Array<String>): MappingDefinition<S, T> {
        return this.mapDeep(
            from.map { PropertyAccessor(it) }.toTypedArray(),
            to.map { PropertyAccessor(it) }.toTypedArray()
        )
    }

    fun map(from: Array<String>, to: Array<String>, conversion: Conversion<*,*>? = null): MappingDefinition<S, T> {
        return this.map(
            from.map { PropertyAccessor(it) }.toTypedArray(),
            to.map { PropertyAccessor(it) }.toTypedArray(),
            conversion
        )
    }

    fun map(properties: Properties): MappingDefinition<S, T> {
        operations.add(MapProperties(properties))

        return this
    }

    fun mapDeep(properties: Properties): MappingDefinition<S, T> {
        operations.add(MapProperties(properties, null, true))

        return this
    }

    fun map(from: Array<Accessor>, to: Array<Accessor>, conversion: Conversion<*,*>? = null): MappingDefinition<S, T> {
        operations.add(MapAccessor(from, to,  conversion))

        return this
    }

    fun mapDeep(from: Array<Accessor>, to: Array<Accessor>): MappingDefinition<S, T> {
        operations.add(MapAccessor(from, to, null,true))

        return this
    }

    fun map(from: Accessor, to: Accessor): MappingDefinition<S, T> {
        operations.add(MapAccessor(arrayOf(from), arrayOf(to)))

        return this
    }

    fun <TO: Any, ENTITY: Any, PK: Any?> synchronize(from: String, to: String, synchronizer: MapperRelationSynchronizer<TO, ENTITY, PK>): MappingDefinition<S, T> {
        operations.add(MapAccessor(
            arrayOf(PropertyAccessor(from)),
            arrayOf(Mapping.RelationshipAccessor(to, synchronizer)),
            null,
            true /* deep */))

        return this
    }

    fun finalize(finalizer: Finalizer<S,T >) : MappingDefinition<S, T> {
        this.finalizer = finalizer

        return this
    }
}

class Mapping<S : Any, T : Any>(
    definition: MappingDefinition<S, T>,
    operations: Array<Operation<Context>>,
    private val stackSize: Int,
    private val composites: List<MappingDefinition.CompositeDefinition>,
    private val finalizer : Array<Finalizer<S,T>>
) : Transformer<Mapping.Context>(operations) {
    // local classes

    class Context(val mapper: Mapper) {
        // local classes

        class State(context: Context) {
            // instance data

            private val compositeBuffers: Array<CompositeBuffer>
            private val stack: Array<Any?>
            var result : Any? = null
            var nextState: State? = context.currentState

            // constructor

            init {
                context.currentState = this
                compositeBuffers = context.compositeBuffers
                stack = context.stack
            }

            // public

            fun restore(context: Context) {
                context.compositeBuffers = compositeBuffers
                context.stack = stack
                context.currentState = nextState
                context.decrement()
            }
        }

        // instance data

        private var level = 0
        private val sourceAndTarget = arrayOfNulls<Any>(2)
        private val mappedObjects: MutableMap<Any, Any> = IdentityHashMap()
        private var compositeBuffers: Array<CompositeBuffer> = NO_BUFFERS
        private var stack: Array<Any?> = arrayOf()

        var currentState : State? = null

        private fun increment() {
            level++
        }

        fun decrement() {
            level--
        }

        private fun setSourceAndTarget(source: Any?, target: Any?) {
            sourceAndTarget[0] = source
            sourceAndTarget[1] = target
        }

        fun remember(source: Any, target: Any): Context {
            mappedObjects[source] = target
            setSourceAndTarget(source, target) // also remember the current involved objects!
            return this
        }

        fun mappedObject(source: Any): Any? {
            return mappedObjects[source]
        }

        private fun setupComposites(buffers: Array<CompositeBuffer>): Array<CompositeBuffer> {
            val saved = compositeBuffers
            compositeBuffers = buffers

            return saved
        }

        fun setup(compositeDefinitions: Array<MappingDefinition.CompositeDefinition>, stackSize: Int): Array<CompositeBuffer> {
            val buffers = compositeDefinitions.map { definition -> definition.createBuffer(mapper) }.toTypedArray()

            /*val buffers = arrayOfNulls<CompositeBuffer>(compositeDefinitions.size)
            for ( i in 0..<compositeDefinitions.size)
                buffers[i] = compositeDefinitions[i].createBuffer(mapper)*/

            stack = if (stackSize == 0) NO_STACK else arrayOfNulls(stackSize)

            increment()

            return setupComposites(buffers)
        }

        fun getCompositeBuffer(compositeIndex: Int): CompositeBuffer {
            return compositeBuffers[compositeIndex]
        }

        fun push(value: Any?, index: Int) {
            stack[index] = value
        }

        fun peek(index: Int): Any? {
            return stack[index]
        }

        companion object {
            private val NO_BUFFERS = arrayOf<CompositeBuffer>()
            private val NO_STACK = arrayOfNulls<Any>(0)
        }
    }

    abstract class CompositeBuffer(protected @JvmField val definition: MappingDefinition.CompositeDefinition, @JvmField val nArgs: Int) {
        @JvmField
        protected var nSuppliedArgs = 0

        // abstract

        abstract fun set(instance: Any, value: Any?, property: Property<Context>?, index: Int, mappingContext: Context)
    }

    class ImmutableCompositeBuffer(definition: MappingDefinition.CompositeDefinition, nargs: Int) : CompositeBuffer(definition, nargs) {
        // instance data

        private var arguments: Array<Any?> = arrayOfNulls(nargs)

        // override

        override fun set(instance: Any, value: Any?, property:  Property<Context>?, index: Int, mappingContext: Context) {
            arguments[index] = value

            // are we done?

            if (++nSuppliedArgs == nArgs) {
                // create composite

                val composite = definition.constructor.call(*arguments)

                definition.valueReceiver.receive(mappingContext, instance, composite)
            } // if
        }
    }

    class MutableCompositeBuffer(definition: MappingDefinition.CompositeDefinition, clazz: KClass<*>, nargs: Int) : CompositeBuffer(definition, nargs) {
        // instance data

        private val newInstance = clazz.createInstance() // TODO cache

        // public

        override fun set(instance: Any, value: Any?, property: Property<Context>?, index: Int, mappingContext: Context) {
            property!!.set(newInstance, value, mappingContext)

            // are we done?

            if (++nSuppliedArgs == nArgs)
                definition.valueReceiver.receive(mappingContext, instance, newInstance)
        }
    }

    // value receiver

    interface ValueReceiver {
        fun receive(context: Context, instance: Any, value: Any)
    }

    class SetPropertyValueReceiver(val property:  Property<Context>) : ValueReceiver {
        // implement ValueReceiver

        override fun receive(context: Context, instance: Any, value: Any) {
            property.set(instance, value, context)
        }
    }

    class SetMutableCompositePropertyValueReceiver(val composite: MappingDefinition.CompositeDefinition, val property: Property<Context>) : ValueReceiver {
        // implement ValueReceiver

        override fun receive(context: Context, instance: Any, value: Any) {
            context.getCompositeBuffer(composite.index).set(instance, value, property, 0, context)
        }
    }

    class SetImmutableCompositePropertyValueReceiver(val composite: MappingDefinition.CompositeDefinition, val index: Int) : ValueReceiver {
        // implement ValueReceiver

        override fun receive(context: Context, instance: Any, value: Any) {
            context.getCompositeBuffer(composite.index).set(instance, value, null, index, context)
        }
    }

    class MappingResultValueReceiver : ValueReceiver {
        // implement ValueReceiver

        override fun receive(context: Context, instance: Any, value: Any) {
            context.currentState!!.result = value
        }
    }

    // properties

    class ConstantValue(val value: Any?) : Property<Context> {
        // implement

        override fun get(instance: Any, context: Context): Any? {
            return value
        }

        override fun set(instance: Any, value: Any?, context: Context) {
        }

        // override Any

        override fun toString() : String {
            return if ( value != null )value.toString() else "null"
        }
    }

    data class Convert(val property: Property<Context>, val conversion: Conversion<Any?,Any?>) : Property<Context> {
        // implement Property

        override fun get(instance: Any, context: Context): Any? {
            val value = property.get(instance, context)

            return conversion(value)
        }

        override fun set(instance: Any, value: Any?, context: Context) {
            property.set(instance, conversion(value), context)
        }

        // override Any

        override fun toString() : String {
            return "convert(${conversion.reflect()!!.returnType}) ${property}"
        }
    }

    class PeekValueProperty(private var index: Int, private val property: Property<Context>) : Property<Context> {
        // implement Property

        override fun get(instance: Any, context: Context): Any? {
            val value = context.peek(index)

            return if (value != null)
                property.get(value, context)
            else
                UNDEFINED
        }

        override fun set(instance: Any, value: Any?, context: Context) {
            throw IllegalArgumentException("not possible")
        }

        // override Any

        override fun toString() : String {
            return "peek[${index}].$property"
        }

        companion object {
            val UNDEFINED = Any()
        }
    }

    class PushValueProperty(private val index: Int) : Property<Context> {
        // implement Property

        override fun get(instance: Any, context: Context): Any? {
            throw java.lang.IllegalArgumentException("not possible")
        }

        override fun set(instance: Any, value: Any?, context: Context) {
            context.push(value, index)
        }

        // override Any

        override fun toString() : String {
            return "push[${index}]"
        }
    }

    class PropertyProperty<CONTEXT>(private val property: KProperty1<Any, Any?>) : Property<CONTEXT> {
        override fun get(instance: Any, context: CONTEXT): Any? {
            return property.getter.call(instance)
        }

        override fun set(instance: Any, value: Any?, context: CONTEXT) {
            throw Exception("read only")
        }

        // override Any

        override fun toString() : String {
            return property.name
        }
    }

    class MutablePropertyProperty<CONTEXT>(private val property: KMutableProperty<out Any?>) : Property<CONTEXT> {
        override fun get(instance: Any, context: CONTEXT): Any? {
            return property.getter.call(instance)
        }

        override fun set(instance: Any, value: Any?, context: CONTEXT) {
            property.setter.call(instance, value)
        }

        // override Any

        override fun toString() : String {
            return property.name
        }
    }

    class SynchronizeMultiValuedRelationship<TO:Any, ENTITY:Any, PK:Any?>(val property: KProperty1<Any, Any?>, val synchronizer: MapperRelationSynchronizer<TO, ENTITY, PK>)
        :Property<Context> {
        // override

        override fun get(entity: Any, context: Context): Any? {
            return property.get(entity)
        }

        override fun set(entity: Any, toList: Any?, context: Context) {
            val entityList = get(entity, context) as MutableCollection<ENTITY> // ???

            synchronizer.synchronize(toList as Collection<TO>, entityList, context)
        }

        // override Any

        override fun toString(): String {
            return "synchronize relationship " + property.name
        }
    }

    class RelationshipAccessor<TO: Any, ENTITY: Any, PK: Any?>(accessor: String, val synchronizer: MapperRelationSynchronizer<TO, ENTITY, PK>) : MappingDefinition.PropertyAccessor(accessor) {
        override fun makeTransformerProperty(write: Boolean): Property<Context> {
            return if (!write)
                throw MapperDefinitionException("error")
            else
                SynchronizeMultiValuedRelationship(readProperty, synchronizer)
        }

        override fun description(): String {
            return "synchronize relations..."
        }
    }

    class MapCollection2Collection(sourceClass: KClass<*>, targetClass: KClass<*>,  val property: Property<Context>)
        : Property<Context> {
        // local classes

        interface Container<T> {
            interface Reader {
                fun size() : Int
                fun get(): Any
                fun hasMore(): Boolean
            }

            interface Writer {
                fun create(size: Int) : Any
                fun set(value: Any)
            }

            fun reader(container: Any) : Reader
            fun writer() : Writer
        }

        // array

        class ArrayContainer<T>(val containerClass: KClass<*>) : Container<T> {
            class Reader(val array: Array<Any>) : Container.Reader {
                var index = 0

                override fun size() : Int {
                    return array.size
                }

                override fun get(): Any {
                    return array[index++]
                }
                override fun hasMore(): Boolean {
                    return index < array.size
                }
            }

            class Writer(val containerClass: KClass<*>) : Container.Writer {
                var index = 0
                lateinit var container : Array<Any>

                override fun create(size: Int) : Any {
                    this.container = java.lang.reflect.Array.newInstance(containerClass.java, size) as Array<Any>

                    return container
                }

                override fun set(value: Any) {
                    container[index++] = value
                }
            }

            override fun reader(container: Any) : Container.Reader {
                return Reader(container as Array<Any>)
            }

            override fun writer() : Container.Writer {
                return Writer(containerClass)
            }
        }

        // collection

        class CollectionContainer<T>(val containerClass: KClass<*>) : Container<T> {
            class Reader(val collection: Collection<Any>) : Container.Reader {
                var iterator = collection.iterator()

                override fun size() : Int {
                    return collection.size
                }

                override fun get(): Any {
                    return iterator.next()
                }
                override fun hasMore(): Boolean {
                    return iterator.hasNext()
                }
            }

            class Writer(private val containerClass: KClass<*>) : Container.Writer {
                lateinit var collection : MutableCollection<Any>

                override fun create(size: Int) : Any {
                    this.collection = containerClass.createInstance() as MutableCollection<Any>

                    return collection
                }

                override fun set(value: Any) {
                    collection.add(value)
                }
            }

            override fun reader(container: Any) : Container.Reader {
                return Reader(container as Collection<Any>)
            }

            override fun writer() : Container.Writer {
                return Writer(containerClass)
            }
        }

        // instance data

        protected lateinit var source: Container<Any>
        protected lateinit var target: Container<Any>

        // constructor

        init {
            analyzeContainer(sourceClass, targetClass)
        }

        // private

        private fun analyzeContainer(sourceClass: KClass<*>, targetClass: KClass<*>) {
            // source

            if (sourceClass.java.isArray)
                source = ArrayContainer(sourceClass.java.componentType.kotlin)

            else if (MutableCollection::class.isSuperclassOf(sourceClass))
                source = CollectionContainer(sourceClass)

            else
                throw MapperDefinitionException("unsupported source container type " + sourceClass.simpleName, null)

            // target

            if (targetClass.java.isArray)
                target = ArrayContainer(targetClass.java.componentType.kotlin)

            else if (MutableCollection::class.isSuperclassOf(targetClass))
                target = CollectionContainer(guessContainerImplementation(targetClass))

            else
                throw MapperDefinitionException("unsupported target container type " + targetClass.simpleName, null)
        }

        private fun guessContainerImplementation(containerType: KClass<*>): KClass<*> {
            if (!containerType.isAbstract)
                return containerType

            // maybe put in the mapper?

            return if (MutableSet::class.isSuperclassOf(containerType))
                HashSet::class
            else
                ArrayList::class
        }

        // override

        override fun set(instance: Any, value: Any?, context: Context) {
            if (value != null) {
                val reader = source.reader(value)
                val writer = target.writer()
                val result = writer.create(reader.size())

                while ( reader.hasMore())
                    writer.set(reader.get())

                property.set(instance, result, context)
            } // if
        }

        override fun get(instance: Any, context: Context): Any? {
            return null
        }

        // override Any

        override fun toString() : String {
            return "map deep collection ${this.property}"
        }
    }

    class MapDeep(val targetProperty: Property<Context>) : Property<Context> {
        // override AccessorValue

        override fun get(insatnce: Any, context: Context): Any? {
            return null
        }

        override fun set(instance: Any, value: Any?, context: Context) {
            //context.setOrigin(origin)

            val transformed = try {
                context.mapper.map<Any>(value, context)
            }
            finally {
                //context.setOrigin(null)
            }

            targetProperty.set(instance, transformed, context)
        }

        // override Any

        override fun toString() : String {
            return "map deep " + targetProperty
        }
    }

    class SetCompositeArgument(private val composite: MappingDefinition.CompositeDefinition, private val index: Int, private val property: Property<Context>) : Property<Context> {
        // implement Property

        override operator fun get(instance: Any, context: Context): Any? {
            throw MapperException("wrong direction")
        }

        override operator fun set(instance: Any, value: Any?, context: Context) {
            context.getCompositeBuffer(composite.index).set(instance, value, property, index, context)
        }

        // override Any

        override fun toString() : String {
            if ( composite.immutable())
                return "${composite.clazz.simpleName}[${index}]"
            else
                return "${composite.clazz.simpleName}.${property}" // TODO
        }
    }

    // instance data

    val sourceClass: KClass<*> = definition.sourceClass
    val targetClass: KClass<*> = definition.targetClass
    val isData = targetClass.isData

    //TODO val constructor = targetClass.constructors.find { ctr -> ctr.parameters.size == 0}!!

    //fun createInstance() : Any {
    //    return constructor.callBy(NO_PARAMETERS)
    //}

    // override

    fun transform(source: Any, target: Any, context: Context) {
        transformTarget(source, target, context)

        for ( finalizer in this.finalizer)
            finalizer(source as S, target as T)
    }

    // public

    fun setupContext(context: Context): Context.State {
        val state = Context.State(context)

        context.setup(composites.toTypedArray(), stackSize)

        return state
    }

    fun describe(builder : StringBuilder) {
        builder.append("mapping(${sourceClass.simpleName} -> ${targetClass.simpleName})\n")

        for ( operation in operations ) {
            builder
                .append("\t")
                .append(operation.source.toString())
                .append(" -> ")
                .append(operation.target.toString())
                .append("\n")
        }
    }

    companion object {
        fun <S:Any,T:Any>build(sourceClass: KClass<S>, targetClass: KClass<T>, lambda: MappingDefinition.Builder<S,T>.() -> Unit) : MappingDefinition<S,T> {
            val definition = MappingDefinition(sourceClass, targetClass)

            MappingDefinition.Builder(definition)
                .apply(lambda)

            return definition
        }

        val NO_PARAMETERS = emptyMap<KParameter, Any?>()
    }
}

fun <S : Any, T : Any> mapping(sourceClass: KClass<S>, targetClass: KClass<T>): MappingDefinition<S, T> {
    return MappingDefinition(sourceClass, targetClass)
}

// one mapper has n mappings

class Mapper(vararg definitions: MappingDefinition<*, *>) {
    // instance data

    private var mappings = HashMap<KClass<*>, Mapping<out Any, out Any>>()

    // constructor

    init {
        for (definition in definitions)
            try {
                registerMapping(definition.createMapping(this))
            }
            catch(exception: MapperDefinitionException) {
                exception.setDefinition(definition)

                throw exception
            }
    }

    // private

    private fun <S : Any, T : Any> registerMapping(mapping: Mapping<S, T>) {
        mappings[mapping.sourceClass] = mapping
    }

    private fun <S : Any> getMapping(type: KClass<S>): Mapping<S, Any> {
        var mapping = mappings[type]

        if (mapping == null) {
            val clonedMap = HashMap(mappings)

            mapping = slowFind(clonedMap, type)

            mappings = clonedMap
        } // if

        if (mapping === null)
            throw MapperException("unknown mapping for class ${type.simpleName}")

        return mapping as Mapping<S, Any>
    }

    private fun <S : Any, T : Any> slowFind(mappings: HashMap<KClass<*>, Mapping<out Any, out Any>>, clazz: KClass<*>): Mapping<S, T>? {
        if (clazz == Any::class)
            return null // that's easy

        var mapping = mappings[clazz]
        if (mapping == null) {
            mapping = slowFind(mappings, clazz.superclasses[0])

            if (mapping !== null)
                mappings[clazz] = mapping // cache
        } // else

        return mapping as Mapping<S, T>?
    }

    // public

    fun <T:Any>map(source: Any?): T? {
        if ( source == null)
            return null

        return map(source, Mapping.Context(this))
    }

    fun <S:Any,T:Any>map(source: S?, target: T): T? {
        if ( source == null)
            return null

        return map(source, target, Mapping.Context(this))
    }

    fun <T:Any> map(source: Any?, target: T, context: Mapping.Context): T? {
        if ( source == null)
            return null

        val mapping = getMapping(source::class)

        context.remember(source, target)

        val state = mapping.setupContext(context)
        try {
            mapping.transform(source, target, context)
        }
        finally {
            state.restore(context)
        }

        return target
    }

    fun <T:Any> map(source: Any?, context: Mapping.Context): T? {
        if ( source == null)
            return null

        var target = context.mappedObject(source)

        val mapping = getMapping(source::class)

        if ( target == null) {
            if ( mapping.isData )
                target = context // hmm....
            else
                target = mapping.targetClass.createInstance() // TODO

            context.remember(source, target)
        }

        val state = mapping.setupContext(context)
        try {
            mapping.transform(source, target, context)

            if ( mapping.isData ) {
                target =  context.currentState!!.result
                context.remember(source, target!!)
            }
        }
        finally {
            state.restore(context)
        }

        return target as T
    }

    // override Any

    fun describe() : String {
        val builder = StringBuilder()

        for ( mapping in mappings.values)
            mapping.describe(builder)

        return builder.toString()
    }
}