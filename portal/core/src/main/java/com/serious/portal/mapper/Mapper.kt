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

class ConversionFactory {
    // local classes
    data class ConversionKey(val from : KClass<*>, val to: KClass<*>)

    // instance data

    val conversions = HashMap<ConversionKey,Conversion<*,*>>()

    init {
        // short

        register {value: Short -> value.toInt() }
        register {value: Short -> value.toLong() }
        register {value: Short -> value.toDouble() }
        register {value: Short -> value.toFloat() }

        // int

        register {value: Int -> value.toShort() }
        register {value: Int -> value.toLong() }
        register {value: Int -> value.toDouble() }
        register {value: Int -> value.toFloat() }

        // long

        register {value: Long -> value.toShort() }
        register {value: Long -> value.toInt() }
        register {value: Long -> value.toDouble() }
        register {value: Long -> value.toFloat() }

        // double

        register {value: Double -> value.toInt().toShort() }
        register {value: Double -> value.toInt() }
        register {value: Double -> value.toLong() }
        register {value: Double -> value.toFloat() }

        // float

        register {value: Float -> value.toInt().toShort() }
        register {value: Float -> value.toInt() }
        register {value: Float -> value.toLong() }
        register {value: Float -> value.toDouble() }
    }

    @OptIn(ExperimentalReflectionOnLambdas::class)
    fun <I:Any,O:Any> register(conversion: Conversion<I,O>) {
        val from = conversion.reflect()!!.parameters[0].type.jvmErasure
        val to = conversion.reflect()!!.returnType.jvmErasure

        conversions.put(ConversionKey(from,to), conversion)
    }

    fun <I:Any,O:Any> findConversion(from : KClass<I>, to: KClass<O>) :Conversion<I,O>? {
        return conversions.get(ConversionKey(from,to)) as Conversion<I,O>?
    }
}

class OperationBuilder(private val matches: MutableCollection<MappingDefinition.Match>) {
    // local classes

    data class OperationResult(
        val operations: Array<Transformer.Operation<Mapping.Context>>,
        val constructor: KFunction<Any>,
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
                            parent!!.stackIndex,
                            accessor.makeTransformerProperty(false /* read */)
                        )
                        type = accessor.type
                    }

                    // in case of inner nodes take the result and remember it

                    if (!isLeaf) {
                        // store the intermediate result
                        stackIndex = sourceTree.stackSize++ // that's my index
                        operations.add(Transformer.Operation(fetchProperty!!, Mapping.PushValueProperty(stackIndex)))
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

    private class TargetTree(private val clazz: KClass<*>, matches: MutableCollection<MappingDefinition.Match>) {
        // local classes

        class Node(private val parent: Node?, val accessor: MappingDefinition.Accessor, val match: MappingDefinition.Match?) {
            // instance data

            internal val children: MutableList<Node> = LinkedList()
            internal var resultDefinition: MappingDefinition.IntermediateResultDefinition? = null

            // protected

            private val isRoot: Boolean
                get() = accessor.name == ""

            private val isLeaf: Boolean
                get() = children.isEmpty()

            private val isInnerNode: Boolean
                get() = children.isNotEmpty()

            // protected

            fun isImmutable() : Boolean {
                return findDefaultConstructor() == null
            }

            protected fun findDefaultConstructor() :KFunction<Any>? {
                return accessor.type.constructors.find { ctr -> ctr.parameters.size == 0 }
            }
            protected fun findImmutableConstructor() :KFunction<Any> {
                // compute the read only children

                val readOnlyProperties = this.children
                    //.filter { node -> node.accessor.readOnly}
                    .map { node -> node.accessor.name }

                // find constructors that declare at least the read-only children

                val ctr = accessor.type.constructors.filter { ctr-> ctr.valueParameters.find { parameter -> readOnlyProperties.contains(parameter.name) } != null}

                if ( ctr.size == 1) {
                    val result = ctr[0]

                    // fix indexes to match constructor position

                    var nextIndex = result.parameters.size
                    for ( child in children) {
                        val constructorArg =  result.valueParameters.find { p -> p.name == child.accessor.name }
                        if ( constructorArg != null)
                            child.accessor.index = constructorArg.index
                        else
                            child.accessor.index = nextIndex++
                    }

                    // sort

                    children.sortBy { child -> child.accessor.index}

                    // done

                    return result
                }
                else {
                    throw MapperDefinitionException("expected constructor matching properties")
                }
            }

            // public

            fun insertMatch(tree: TargetTree, match: MappingDefinition.Match, index: Int) {
                var child: Node? = children.find { child -> child.accessor == match.paths[TARGET][index] }

                if (child == null)
                    children.add(tree.makeNode(
                        this, match.paths[TARGET][index],  // step

                        if (match.paths[TARGET].size - 1 == index) match else null
                    ).also { child = it })

                if (match.paths[TARGET].size > index + 1)
                    child!!.insertMatch(tree, match, index + 1)
            }

            // protected

            // is only called for children

            fun computeValueReceiver() : Mapping.ValueReceiver {
                return if (parent!!.resultDefinition != null)
                    Mapping.SetResultPropertyValueReceiver(
                        parent.resultDefinition!!.index,
                        accessor.index,
                        if ( accessor.index >= parent.resultDefinition!!.constructorArgs ) accessor.makeTransformerProperty(true) else null
                    )
                else
                    Mapping.SetPropertyValueReceiver(accessor.makeTransformerProperty(true))
            }

            // public

            fun <S : Any, T : Any> makeOperations(sourceTree: SourceTree, targetTree: TargetTree, mapper: Mapper, definition: MappingDefinition<S, T>, operations: MutableList<Transformer.Operation<Mapping.Context>>) {
                val type: KClass<*> = accessor.type

                if ( isRoot ) {
                    if (isImmutable())
                        resultDefinition = definition.addIntermediateResultDefinition(type, findImmutableConstructor(), children.size, Mapping.MappingResultValueReceiver())

                    // recursion

                    for (child in children)
                        child.makeOperations(sourceTree, targetTree, mapper, definition, operations)
                }
                else if (isInnerNode) {
                    val valueReceiver = computeValueReceiver()

                    // which constructor

                    val constructor = findDefaultConstructor() ?: findImmutableConstructor()

                    // done

                    resultDefinition = definition.addIntermediateResultDefinition(type, constructor, children.size, valueReceiver)

                    // recursion

                    for (child in children)
                        child.makeOperations(sourceTree, targetTree, mapper, definition, operations)
                } // if

                else { // leaf
                    val sourceNode = sourceTree.findNode(match!!)!!

                    sourceNode.fetchValue(sourceTree, type, operations) // compute property needed to fetch source value

                    operations.add(makeOperation(sourceNode))
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
                else if (sourceType !== targetType && !sourceType.isSubclassOf(targetType) && !deep )
                    conversion = tryConvert(sourceType, targetType) // try automatic conversion for low-level types

                return conversion as Conversion<Any?,Any?>?
            }

            private fun makeOperation(sourceNode: SourceTree.Node): Transformer.Operation<Mapping.Context> {
                val sourceProperty: Transformer.Property<Mapping.Context> = sourceNode.fetchProperty!!

                val deep = match!!.deep
                val conversion = calculateConversion(sourceNode)

                // compute operation

                val requiresWrite = parent!!.resultDefinition == null || parent.resultDefinition!!.constructor.parameters.find { param ->param.name == accessor.name  } == null

                var writeProperty = accessor.makeTransformerProperty(requiresWrite) // property, constant or synchronizer

                if (parent.resultDefinition != null)
                    writeProperty = Mapping.SetResultArgument(parent.resultDefinition!!, accessor.index, writeProperty)

                if ( deep )
                    writeProperty = mapDeep(sourceNode.accessor, accessor, writeProperty)
                else
                    writeProperty = maybeConvert(writeProperty, conversion)

                return Transformer.Operation(sourceProperty, writeProperty)
            }

            private fun <S : Any,T: Any> tryConvert(sourceType: KClass<S>, targetType: KClass<T>): Conversion<S,T> {
                val conversion = ConversionFactory().findConversion(sourceType, targetType) // TODO

               if ( conversion != null)
                   return conversion
                else
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

        class RootAccessor(override val type: KClass<*>) : MappingDefinition.Accessor {
            override val readOnly = MappingDefinition.isImmutable(type)
            override val name = ""
            override var index = 0

            override fun resolve(clazz: KClass<*>, write: Boolean) {
                // ?
            }

            override fun makeTransformerProperty(write: Boolean): Transformer.Property<Mapping.Context> {
                throw Exception("ouch")
            }

            override fun description(): String {
                return "root"
            }
        }

        var root = Node(null, RootAccessor(this.clazz), null)

        // constructor

        init {
            for (match in matches)
                root.insertMatch(this, match, 0)
        }

        // public

        fun <S : Any, T : Any> makeOperations(sourceTree: SourceTree, mapper: Mapper, definition: MappingDefinition<S, T>): Array<Transformer.Operation<Mapping.Context>> {
            val operations = LinkedList<Transformer.Operation<Mapping.Context>>()

            // traverse recursively

            try {
                root.makeOperations(sourceTree, this, mapper, definition, operations)
            }
            catch (e: MapperDefinitionException) {
                e.setDefinition(definition)

                throw e
            }

            return operations.toTypedArray()
        }

        // override

        fun makeNode(parent: Node?, step: MappingDefinition.Accessor, match: MappingDefinition.Match?): Node {
            return try {
                step.resolve(parent?.accessor?.type ?: clazz, true)

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
        val targetTree = TargetTree(definition.targetClass, matches)
        val operations = targetTree.makeOperations(sourceTree, mapper, definition)
        val constructor = if ( targetTree.root.resultDefinition != null ) targetTree.root.resultDefinition?.constructor!! else definition.targetClass.primaryConstructor!!

        return OperationResult(operations, constructor, sourceTree.stackSize)
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
            var synchronizer: RelationSynchronizer<Any,Any,Any?>? = null
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

            infix fun Accessor.to(target: String) :MapBuilder<S,T> {
                sourceAccessor = arrayOf(this)
                targetAccessor = arrayOf(PropertyAccessor(target))

                return This
            }

            infix fun Accessor.to(target: Array<String>) :MapBuilder<S,T> {
                sourceAccessor = arrayOf(this)
                targetAccessor = target.map { PropertyAccessor(it) }.toTypedArray()

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

            infix fun<TO: Any,ENTITY:Any, PK:Any?> synchronize(synchronizer: RelationSynchronizer<TO,ENTITY, PK>) : MapBuilder<S,T> {
                this.synchronizer = synchronizer as RelationSynchronizer<Any,Any,Any?>
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

            // path

            fun path(vararg path: String): Array<String> {
                return path as Array<String> // ha !
            }

            fun property(name: String) : PropertyAccessor {
                return PropertyAccessor(name)
            }

            fun constant(value: Any) : Accessor {
                return ConstantAccessor(value)
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
        val readOnly : Boolean
        val type: KClass<*>

        fun resolve(clazz: KClass<*>, write: Boolean)

        fun makeTransformerProperty(write: Boolean): Transformer.Property<Mapping.Context>

        fun description() : String
    }

    open class PropertyAccessor(override val name: String) : Accessor {
        // instance data

        override var index = -1
        lateinit var readProperty: KProperty1<Any, Any?>
        var writeProperty: KMutableProperty1<Any, Any>? = null

        override val type: KClass<*>
            get() = this.readProperty.returnType.jvmErasure

        override val readOnly: Boolean
            get() = !(readProperty is KMutableProperty1<*,*>)

        // implement

        override fun makeTransformerProperty(write: Boolean): Transformer.Property<Mapping.Context> {
            if ( write ) {
                if ( writeProperty != null)
                    return Mapping.MutablePropertyProperty(writeProperty!!)
                else
                    throw MapperDefinitionException("${type.simpleName}.${name} is read-only")
            }
            else
                return Mapping.PropertyProperty(readProperty)
        }

        override fun resolve(clazz: KClass<*>, write: Boolean) {
            try {
                this.readProperty = clazz.memberProperties.first { it.name == this.name } as KProperty1<Any, Any?>

                if ( this.readProperty is KMutableProperty1<*, *> )
                    this.writeProperty = this.readProperty as KMutableProperty1<Any, Any>
            }
            catch (e: MapperDefinitionException) {
                throw e
            }
            catch (e: Exception) {
                throw MapperDefinitionException("unknown property ${clazz.simpleName}.${name}")
            }

            this.index = clazz.declaredMemberProperties.indexOf(this.readProperty)
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

        override fun description() :String{
            return "constant ${constant}"
        }
    }

    // result stuff

    class IntermediateResultDefinition(@JvmField val clazz: KClass<*>, @JvmField val constructor: KFunction<Any>, @JvmField val index: Int, private val nArgs: Int, public @JvmField val valueReceiver: Mapping.ValueReceiver) {
        val constructorArgs = constructor.parameters.size

        // local classes
        class Buffer(protected @JvmField val definition: IntermediateResultDefinition, @JvmField val nArgs: Int, @JvmField val constructorArgs: Int) {
            // instance data

            private var nSuppliedArgs = 0
            private val arguments: Array<Any?> = arrayOfNulls(constructorArgs)
            private var result : Any? = null

            init {
                if ( constructorArgs == 0)
                    result = definition.constructor.call()
            }

            // public

            fun set(instance: Any, value: Any?, property:  Transformer.Property<Mapping.Context>?, index: Int, mappingContext: Mapping.Context) {
                // are we done?

                if (nSuppliedArgs < constructorArgs) {
                    // create instance

                    arguments[index] = value
                    if ( nSuppliedArgs == constructorArgs - 1)
                        result = definition.constructor.call(*arguments)
                } // if
                else
                    property!!.set(result!!, value, mappingContext)

                if ( ++nSuppliedArgs == nArgs)
                    definition.valueReceiver.receive(mappingContext, instance, result!!)
            }
        }

        // public

        fun createBuffer(): Buffer {
            return Buffer(this, nArgs, this.constructorArgs)
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
    private val intermediateResultDefinitions = LinkedList<IntermediateResultDefinition>()
    private val operations = ArrayList<MapOperation>()

    // public

    fun addIntermediateResultDefinition(clazz: KClass<*>, ctr: KFunction<Any>, nargs: Int, valueReceiver: Mapping.ValueReceiver): IntermediateResultDefinition {
        intermediateResultDefinitions.add(IntermediateResultDefinition( clazz, ctr, intermediateResultDefinitions.size, nargs, valueReceiver))

        return intermediateResultDefinitions.last
    }

    fun createMapping(mapper: Mapper): Mapping<S, T> {
        val (operations, constructor, stackSize) = this.createOperations(mapper)

        return Mapping(this, constructor, operations, stackSize, intermediateResultDefinitions, collectFinalizer())
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

    fun <TO: Any, ENTITY: Any, PK: Any?> synchronize(from: String, to: String, synchronizer: RelationSynchronizer<TO, ENTITY, PK>): MappingDefinition<S, T> {
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

    companion object {
        fun isImmutable(clazz: KClass<*>) : Boolean {
            return findDefaultConstructor(clazz) != null
        }

        fun findDefaultConstructor(clazz: KClass<*>): KFunction<Any>? {
            val ctrs = clazz.constructors.filter { ctr -> ctr.parameters.size == 0  }
            return if ( ctrs.size == 1)
                ctrs[0]
            else
                null
        }
    }
}

class Mapping<S : Any, T : Any>(
    definition: MappingDefinition<S, T>,
    val constructor: KFunction<Any>,
    operations: Array<Operation<Context>>,
    private val stackSize: Int,
    private val intermediateResultDefinitions: List<MappingDefinition.IntermediateResultDefinition>,
    private val finalizer : Array<Finalizer<S,T>>
) : Transformer<Mapping.Context>(operations) {
    // local classes

    class Context(val mapper: Mapper) {
        // local classes

        class State(context: Context) {
            // instance data

            private val resultBuffers: Array<MappingDefinition.IntermediateResultDefinition.Buffer?>
            private val stack: Array<Any?>
            var result : Any? = null
            var nextState: State? = context.currentState

            // constructor

            init {
                context.currentState = this
                resultBuffers = context.resultBuffers
                stack = context.stack
            }

            // public

            fun restore(context: Context) {
                context.resultBuffers = resultBuffers
                context.stack = stack
                context.currentState = nextState
                context.decrement()
            }
        }

        // instance data

        private var level = 0
        private val sourceAndTarget = arrayOfNulls<Any>(2)
        private val mappedObjects: MutableMap<Any, Any> = IdentityHashMap()
        private var resultBuffers: Array<MappingDefinition.IntermediateResultDefinition.Buffer?> = NO_BUFFERS
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

        private fun setupResultBuffers(buffers: Array<MappingDefinition.IntermediateResultDefinition.Buffer?>): Array<MappingDefinition.IntermediateResultDefinition.Buffer?> {
            val saved = resultBuffers
            resultBuffers = buffers

            return saved
        }

        fun setup(intermediateResultDefinitions: Array<MappingDefinition.IntermediateResultDefinition>, stackSize: Int): Array<MappingDefinition.IntermediateResultDefinition.Buffer?> {
            val buffers = arrayOfNulls<MappingDefinition.IntermediateResultDefinition.Buffer?>(intermediateResultDefinitions.size)
            for ( i in 0..<intermediateResultDefinitions.size)
                buffers[i] = intermediateResultDefinitions[i].createBuffer()

            stack = if (stackSize == 0) NO_STACK else arrayOfNulls(stackSize)

            increment()

            return setupResultBuffers(buffers)
        }

        fun getResultBuffer(index: Int): MappingDefinition.IntermediateResultDefinition.Buffer {
            return resultBuffers[index]!!
        }

        fun push(value: Any?, index: Int) {
            stack[index] = value
        }

        fun peek(index: Int): Any? {
            return stack[index]
        }

        companion object {
            private val NO_BUFFERS = arrayOf<MappingDefinition.IntermediateResultDefinition.Buffer?>()
            private val NO_STACK = arrayOfNulls<Any>(0)
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

    class SetResultPropertyValueReceiver(private val resultIndex: Int, private val index: Int, private val property: Property<Context>?) : ValueReceiver {
        // implement ValueReceiver

        override fun receive(context: Context, instance: Any, value: Any) {
            context.getResultBuffer(resultIndex).set(instance, value, property, index, context)
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

        @OptIn(ExperimentalReflectionOnLambdas::class)
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
                null
        }

        override fun set(instance: Any, value: Any?, context: Context) {
            throw IllegalArgumentException("not possible")
        }

        // override Any

        override fun toString() : String {
            return "peek[${index}].$property"
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

    class SynchronizeMultiValuedRelationship<TO:Any, ENTITY:Any, PK:Any?>(val property: KProperty1<Any, Any?>, val synchronizer: RelationSynchronizer<TO, ENTITY, PK>)
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

    class RelationshipAccessor<TO: Any, ENTITY: Any, PK: Any?>(accessor: String, val synchronizer: RelationSynchronizer<TO, ENTITY, PK>) : MappingDefinition.PropertyAccessor(accessor) {
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
                    writer.set(context.mapper.map(reader.get(), context)!!)

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

    class SetResultArgument(private val resultDefinition: MappingDefinition.IntermediateResultDefinition, private val index: Int, private val property: Property<Context>) : Property<Context> {
        // implement Property

        override operator fun get(instance: Any, context: Context): Any? {
            throw MapperException("wrong direction")
        }

        override operator fun set(instance: Any, value: Any?, context: Context) {
            context.getResultBuffer(resultDefinition.index).set(instance, value, property, index, context)
        }

        // override Any

        override fun toString() : String {
            return "${resultDefinition.clazz.simpleName}[${index}](${property})"
        }
    }

    // instance data

    val sourceClass: KClass<*> = definition.sourceClass
    val targetClass: KClass<*> = definition.targetClass

    // override

    fun transform(source: Any, target: Any, context: Context) {
        transformTarget(source, target, context)

        for ( finalizer in this.finalizer)
            finalizer(source as S, target as T)
    }

    // public

    fun setupContext(context: Context): Context.State {
        val state = Context.State(context)

        context.setup(intermediateResultDefinitions.toTypedArray(), stackSize)

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
    }
}

fun <S:Any,T:Any>mapping(sourceClass: KClass<S>, targetClass: KClass<T>, lambda: MappingDefinition.Builder<S,T>.() -> Unit) : MappingDefinition<S,T> {
    val definition = MappingDefinition(sourceClass, targetClass)

    MappingDefinition.Builder(definition)
        .apply(lambda)

    return definition
}

// one mapper has n mappings

class Mapper(vararg definitions: MappingDefinition<*, *>) {
    // instance data

    private var mappings = HashMap<KClass<*>, Mapping<out Any, out Any>>()

    var conversionFactory = ConversionFactory()

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

    fun createContext() : Mapping.Context {
        return Mapping.Context(this)
    }

    fun <T:Any>map(source: Any?): T? {
        if ( source == null)
            return null

        return map(source, Mapping.Context(this))
    }

    fun <T:Any>map(source: List<Any?>): List<T?> {
       val context = createContext()

        return source.map { element -> map(element, context) }
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
            if (mapping.constructor.parameters.isNotEmpty())
                target = context // hmm....
            else {
                target = mapping.constructor.call()

                context.remember(source, target)
            }
        }

        val state = mapping.setupContext(context)
        try {
            mapping.transform(source, target, context)

            if ( mapping.constructor.parameters.isNotEmpty() ) {
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