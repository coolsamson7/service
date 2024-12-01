package org.sirius.common.bean
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.sirius.common.type.Type
import java.util.concurrent.ConcurrentHashMap
import kotlin.reflect.KClass
import kotlin.reflect.KMutableProperty1
import kotlin.reflect.KProperty1
import kotlin.reflect.full.memberProperties
import kotlin.reflect.jvm.jvmErasure


class BeanDescriptor(val clazz: KClass<*>) {
    // internal classes

    open class Property(val name: String, val property: KProperty1<Any, *>) {
        // public

        open fun <T:Any?> set(instance: Any, value: T) {
            (property as KMutableProperty1<Any, T>).set(instance, value)
        }

        fun <T:Any?> get(instance: Any) : T {
            return property.get(instance) as T
        }
    }

    class AttributeProperty(name: String, property: KProperty1<Any, *>, val type: Type<*>, val primaryKey: Boolean,
                            val required : Boolean, val version : Boolean) : Property(name, property) {
        override fun <T:Any?> set(instance: Any, value: T) {
            type.validate(value!!)

            super.set(instance, value)
        }
    }

    // instance data

    var superClass : BeanDescriptor? = null
    var properties : Array<Property>

    // constructor

    init {
        /*if ( clazz.supertypes.isEmpty())
            superClass = null
        else {
            val x =  clazz.supertypes[0]

            println()
        }*/


        this.properties = computeProperties(clazz)
    }

    // private

    private fun computeProperties(clazz: KClass<*>) : Array<Property> {
        val properties = ArrayList<Property>()
        for ( member in clazz.memberProperties /*members .filterIsInstance<KProperty<*>>()*/) {
            val attribute : Attribute? = member.annotations.firstOrNull { annotation -> annotation is Attribute } as Attribute?

            if (attribute != null) {
                properties.add(AttributeProperty(
                    member.name,
                    member as KProperty1<Any, *>,
                    type(attribute.type, member.returnType.jvmErasure),
                    attribute.primaryKey,
                    attribute.required,
                    attribute.version
                ))
            }
        }

        return properties.toTypedArray()
    }

    // public

    fun property(property: String) : Property? {
        return properties.find { prop -> prop.name == property }
    }

    fun <T:Any> get(instance: Any, name: String) : T {
        return property(name)!!.get(instance)
    }

    fun <T:Any> set(instance: Any, name: String, value: T)  {
        return property(name)!!.set(instance, value)
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
            return beans.getOrPut(clazz, { BeanDescriptor(clazz) })
        }
    }
}