package org.sirius.common.bean
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.sirius.common.type.Type
import java.lang.StringBuilder
import java.util.concurrent.ConcurrentHashMap
import kotlin.reflect.KClass
import kotlin.reflect.KMutableProperty1
import kotlin.reflect.KProperty1
import kotlin.reflect.full.findAnnotations
import kotlin.reflect.full.isSubclassOf
import kotlin.reflect.full.memberProperties
import kotlin.reflect.jvm.javaField
import kotlin.reflect.jvm.jvmErasure


class BeanDescriptor(val clazz: KClass<*>) {
    // internal classes

    open class Property<C:Any>(val name: String, val property: KProperty1<C, Any>) {
        // instance data

        private val getter = property.getter
        private val setter : KMutableProperty1.Setter<C,Any>?

        init {
            setter = if ( property is KMutableProperty1<C, Any> ) property.setter else null
        }
        // public

        open fun <V:Any> set(instance: C, value: V) {
            setter!!(instance, value)
        }

        fun <T:Any?> get(instance: C) : T {
            return getter(instance) as T
        }

        open fun report(builder: StringBuilder) {
            builder.append(name)
        }
    }

    class AttributeProperty<C:Any>(name: String, property: KProperty1<C, Any>, val type: Type<*>, val primaryKey: Boolean,
                            val mutable : Boolean, val nullable : Boolean, val version : Boolean) : Property<C>(name, property) {
        override fun <V:Any> set(instance: C, value: V) {
            type.validate(value)

            super.set(instance, value)
        }

        override fun report(builder: StringBuilder) {
            super.report(builder)

            builder
                .append(" : ")
                .append(type.baseType.name)

            if ( primaryKey )
                builder.append(" primary-key")

            if ( mutable )
                builder.append(" mutable")

            if ( nullable )
                builder.append(" nullable")

            if ( version )
                builder.append(" version")
        }
    }

    // instance data

    var superClass : BeanDescriptor? = null
    var properties : Array<Property<Any>>

    // constructor

    init {
        /*if ( clazz.supertypes.isEmpty())
            superClass = null
        else {
            val x =  clazz.supertypes[0]

            println()
        }*/


        this.properties = computeProperties(clazz) as Array<Property<Any>>

        println(report())
    }

    // private

    private fun hasAnnotation(property:  KProperty1<*, *>, clazz: String) : Boolean {
        var result = property.annotations.firstOrNull { annotation ->
            annotation.annotationClass.qualifiedName == clazz
        } !== null

        if ( !result )
            result = property.javaField?.annotations?.firstOrNull { annotation ->
            annotation.annotationClass.qualifiedName == clazz
        } !== null

        return result
    }

    private fun <T:Any> getAnnotation(property:  KProperty1<*, *>, clazz: KClass<T>) : T? {
        var annotation = property.annotations.firstOrNull { ann ->
            ann.annotationClass.isSubclassOf(clazz)
        }

        if ( annotation == null) {
            annotation = property.javaField?.annotations?.firstOrNull { ann ->
                ann.annotationClass.isSubclassOf(clazz)
            }
        }

        return annotation as T?
    }

    private fun isMutable(property: KProperty1<*, *>) : Boolean {
        return property is  KMutableProperty1<*, *>
    }

    private fun isNullable(property: KProperty1<*, *>) : Boolean {
        return property.returnType.isMarkedNullable
    }

    private fun <T:Any> computeProperties(clazz: KClass<T>) : Array<Property<T>> {
        val properties = ArrayList<Property<T>>()
        for ( member in clazz.memberProperties) {
            val attribute = getAnnotation(member, Attribute::class)

            if (attribute != null) {
                properties.add(AttributeProperty(
                    member.name,
                    member as KProperty1<T, Any>,
                    type(attribute.type, member.returnType.jvmErasure),
                    attribute.primaryKey || hasAnnotation(member,"jakarta.persistence.Id"),
                    attribute.mutable || isMutable(member),
                    isNullable(member),
                    attribute.version || hasAnnotation(member,"jakarta.persistence.Version")
                ))
            }
        }

        return properties.toTypedArray()
    }

    // public

    fun property(property: String) : Property<Any>? {
        return properties.find { prop -> prop.name == property }
    }

    fun <T:Any> get(instance: Any, name: String) : T {
        return property(name)!!.get(instance)
    }

    fun <T:Any> set(instance: Any, name: String, value: T)  {
        return property(name)!!.set(instance, value)
    }

    // public

    fun report() : String {
        val builder = StringBuilder()

        builder
            .append(clazz.qualifiedName).append(" {\n")

        for ( property in properties) {
            builder.append("\t")
            property.report(builder)
            builder.append("\n")
        }

        builder.append("}")

        return builder.toString()
    }

    // companion

    companion object {
        // instance data

        val beans = ConcurrentHashMap<KClass<*>,BeanDescriptor>()
        val types = HashMap<KClass<out Type<*>>, Type<*>>()

        fun type(type : KClass<out Type<*>>, clazz: KClass<*>) : Type<*> {
            return types.getOrElse(type) { if ( type == Type::class)
                Type(clazz.javaObjectType)
            else
                type.java.newInstance()
            }
        }

        // public

        fun of(o: Any) : BeanDescriptor {
            return ofClass(o::class)
        }

        fun ofClass(clazz: KClass<*>) : BeanDescriptor {
            return beans.getOrPut(clazz) { BeanDescriptor(clazz) }
        }
    }
}