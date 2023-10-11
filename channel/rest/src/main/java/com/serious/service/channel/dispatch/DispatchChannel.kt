package com.serious.service.channel.dispatch

import com.serious.service.ChannelManager
import com.serious.service.Component
import com.serious.service.RegisterChannel
import com.serious.service.ServiceAddress
import com.serious.service.channel.SimpleMethodInvocation
import com.serious.service.channel.rest.RestChannel
import com.serious.util.Exceptions
import org.aopalliance.intercept.MethodInvocation
import org.springframework.beans.factory.annotation.Autowired
import java.io.*
import java.util.*

/*
* @COPYRIGHT (C) 2016 Andreas Ernst
*
* All rights reserved
*/
@RegisterChannel("dispatch")
class DispatchChannel  // constructor
@Autowired constructor(channelManager: ChannelManager?) : RestChannel(channelManager) {
    // instance data
    @Autowired
    var methodCache: MethodCache? = null

    // private
    // implement Channel
    override fun invoke(invocation: MethodInvocation): Any? {
        val clazz = invocation.method.declaringClass
        val request = ServiceRequest(
            clazz.getName(),
            methodCache!!.getIndex(clazz, invocation.method),
            invocation.arguments
        )
        return try {
            val result = super.invoke(
                SimpleMethodInvocation(
                    "null", // TODO KOTLIN
                    DispatchService::class.java.getDeclaredMethod("dispatch", String::class.java),
                    encodeAsString(encodeObject(request))
                )
            ) as String?
            decodeObject(decodeFromString(result))
        } catch (e: NoSuchMethodException) {
            throw RuntimeException(e)
        }
    }

    override fun setup(componentClass: Class<out Component>, serviceAddresses: List<ServiceAddress>?) {
        super.setup(componentClass, serviceAddresses)
    }

    companion object {
        // static methods
        @JvmStatic
        fun encodeAsString(data: ByteArray?): String {
            return Base64.getEncoder().encodeToString(data)
        }

        @JvmStatic
        fun decodeFromString(data: String?): ByteArray {
            return Base64.getDecoder().decode(data)
        }

        @JvmStatic
        fun encodeObject(o: Any?): ByteArray? {
            val bos = ByteArrayOutputStream()
            var out: ObjectOutputStream? = null
            return try {
                out = ObjectOutputStream(bos)
                out.writeObject(o)
                out.flush()
                bos.toByteArray()
            } catch (e: IOException) {
                Exceptions.throwException(e)
                null
            } finally {
                try {
                    bos.close()
                } catch (ex: IOException) {
                    // ignore close exception
                }
            }
        }

        @JvmStatic
        fun decodeObject(bytes: ByteArray?): Any? {
            val bis = ByteArrayInputStream(bytes)
            var `in`: ObjectInput? = null
            try {
                `in` = ObjectInputStream(bis)
                return `in`.readObject()
            } catch (e: IOException) {
                Exceptions.throwException(e)
            } catch (e: ClassNotFoundException) {
                Exceptions.throwException(e)
            } finally {
                try {
                    `in`?.close()
                } catch (ex: IOException) {
                    // ignore close exception
                }
            }
            return null
        }
    }
}
