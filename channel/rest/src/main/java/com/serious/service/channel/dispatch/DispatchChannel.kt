package com.serious.service.channel.dispatch
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.ChannelManager
import com.serious.service.Component
import com.serious.service.RegisterChannel
import com.serious.service.ServiceAddress
import com.serious.service.channel.SimpleMethodInvocation
import com.serious.service.channel.rest.RestChannel
import org.aopalliance.intercept.MethodInvocation
import org.springframework.beans.factory.annotation.Autowired
import java.io.*
import java.util.*


/**
 * A specific [Channel] used to dispatch [ServiceRequest]s using a [RestChannel]
 */
@RegisterChannel("dispatch")
class DispatchChannel @Autowired constructor(channelManager: ChannelManager) : RestChannel(channelManager) {
    // instance data

    @Autowired
    lateinit var methodCache: MethodCache
    val dispatchMethod = DispatchService::class.java.getDeclaredMethod("dispatch", String::class.java)

    // implement Channel
    override fun invoke(invocation: MethodInvocation): Any {
        val clazz = invocation.method.declaringClass
        val request = ServiceRequest(clazz.getName(), methodCache.getIndex(clazz, invocation.method), invocation.arguments)

        val result = super.invoke(SimpleMethodInvocation(null, dispatchMethod, encodeAsString(encodeObject(request)))) as String

        return decodeObject(decodeFromString(result))
    }

    override fun setup(componentClass: Class<out Component>, serviceAddresses: List<ServiceAddress>) {
        super.setup(componentClass, serviceAddresses)
    }

    companion object {
        // static methods
        @JvmStatic
        fun encodeAsString(data: ByteArray): String {
            return Base64.getEncoder().encodeToString(data)
        }

        @JvmStatic
        fun decodeFromString(data: String): ByteArray {
            return Base64.getDecoder().decode(data)
        }

        @JvmStatic
        fun encodeObject(o: Any): ByteArray {
            val bos = ByteArrayOutputStream()

            return try {
                val out = ObjectOutputStream(bos)

                out.writeObject(o)
                out.flush()

                bos.toByteArray()
            }
            finally {
                try {
                    bos.close()
                }
                catch (ex: IOException) {
                    // ignore close exception
                }
            }
        }

        @JvmStatic
        fun decodeObject(bytes: ByteArray): Any {
            val bis = ByteArrayInputStream(bytes)
            var objectInput: ObjectInput? = null
            try {
                objectInput = ObjectInputStream(bis)

                return objectInput.readObject()
            }
            finally {
                try {
                    objectInput?.close()
                }
                catch (ex: IOException) {
                    // ignore close exception
                }
            }
        }
    }
}
