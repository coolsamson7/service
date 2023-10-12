package com.serious.service.channel.rest
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.service.channel.rest.RequestBuilder.SpecOperation
import com.serious.service.exception.ServiceRegistryException
import com.serious.service.exception.ServiceRuntimeException
import org.apache.logging.log4j.util.Strings
import org.springframework.core.DefaultParameterNameDiscoverer
import org.springframework.core.ParameterNameDiscoverer
import org.springframework.web.bind.annotation.*
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.lang.reflect.Method
import java.lang.reflect.ParameterizedType
import java.lang.reflect.Type
import java.util.*
import java.util.regex.Pattern

 /**
 * A <code>MethodAnalyzer</code> analyzes methods for spring mvc annotations and calls the appropriate webclient
  * builder methods on the fly.
 */
class MethodAnalyzer {
    // local classes
    internal interface Analyzer {
        fun build(): RequestBuilder<RHS>
    }

    internal abstract inner class RestAnalyzer protected constructor(
        protected var webClient: WebClient, protected var method: Method
    ) : Analyzer {
        protected var requestParams = HashMap<String, Int>()
        protected var body = -1

        // protected
        protected fun getPath(path: String): String {
            val result = defaultPath
            return if (result != null) result + path else path
        }

        protected val defaultPath: String?
            get() {
                val clazz = method.declaringClass

                if (clazz.getAnnotation(RequestMapping::class.java) != null)
                    return (clazz.getAnnotation(RequestMapping::class.java) as RequestMapping).value[0]

                if (clazz.getAnnotation(GetMapping::class.java) != null)
                    return (clazz.getAnnotation(GetMapping::class.java) as GetMapping).value[0]

                if (clazz.getAnnotation(PostMapping::class.java) != null)
                    return (clazz.getAnnotation(PostMapping::class.java) as PostMapping).value[0]

                return if (clazz.getAnnotation(DeleteMapping::class.java) != null) (clazz.getAnnotation(DeleteMapping::class.java) as DeleteMapping).value[0] else null
            }
        protected val defaultMethod: RequestMethod?
            get() {
                val clazz = method.declaringClass

                if (clazz.getAnnotation(RequestMapping::class.java) != null)
                    return (clazz.getAnnotation(RequestMapping::class.java) as RequestMapping).method[0]

                if (clazz.getAnnotation(GetMapping::class.java) != null)
                    return RequestMethod.GET

                if (clazz.getAnnotation(PostMapping::class.java) != null)
                    return RequestMethod.POST

                return if (clazz.getAnnotation(DeleteMapping::class.java) != null) RequestMethod.DELETE else null
            }

        protected fun scanMethod(path: String) : Array<Int> {
            // scan request params & path variables

            val pathVariables = HashMap<String, Int>()
            val parameterNames = getParameterNames(method)

            for ((index, annotations) in method.parameterAnnotations.withIndex()) {
                for (paramAnnotation in annotations) {
                    when (paramAnnotation) {
                        is PathVariable -> {
                            var name = paramAnnotation.value
                            if (Strings.isEmpty(name))
                                name = parameterNames[index]

                            pathVariables[name] = index
                        }

                        is RequestParam -> {
                            var name = paramAnnotation.name
                            if (Strings.isEmpty(name))
                                name = parameterNames[index]

                            requestParams[name] = index
                        }

                        is RequestBody -> body = index
                    }
                }
            } // for

            // scan path

            val variables: MutableList<Int> = ArrayList()
            val pattern = Pattern.compile("\\{([^{}]*)}")
            val matcher = pattern.matcher(path)
            while (matcher.find()) {
                val match = matcher.group(1)
                val argumentIndex =
                    pathVariables[match] ?: throw ServiceRegistryException("missing @PathVariable for %s", match)

                variables.add(argumentIndex)
            }

            return variables.toTypedArray<Int>()
        }

        protected fun getParameterNames(method: Method): Array<String> {
            return parameterNameDiscoverer.getParameterNames(method)
        }
    }

    internal inner class GetAnalyzer(webClient: WebClient, method: Method) : RestAnalyzer(webClient, method) {
        // implement
        override fun build(): RequestBuilder<RHS> {
            val getMapping = method.getAnnotation(GetMapping::class.java)
            val getBuilder = RequestBuilder<RHS>(webClient).get()

            val path = getPath(getMapping.value[0])

            // done

            return getBuilder.uri(path, scanMethod(path), requestParams)
        }
    }

    internal inner class PostAnalyzer(webClient: WebClient, method: Method) : RestAnalyzer(webClient, method) {
        // implement
        override fun build(): RequestBuilder<RHS> {
            val postMapping = method.getAnnotation(PostMapping::class.java)
            val getBuilder = RequestBuilder(webClient).post()

            // scan path

            val path = getPath(postMapping.value[0])
            val attributes = scanMethod(path)

            if (body == -1) throw ServiceRegistryException(
                "missing @RequestBody for %s.%s",
                method.declaringClass.getName(),
                method.name
            )

            // done

            return getBuilder.uri(path, attributes /* index */, requestParams).body(body)
        }
    }

    internal inner class PutAnalyzer(webClient: WebClient, method: Method) : RestAnalyzer(webClient, method) {
        // implement
        override fun build(): RequestBuilder<RHS> {
            val postMapping = method.getAnnotation(PutMapping::class.java)
            val getBuilder = RequestBuilder(webClient).put()

            // scan path

            val path = getPath(postMapping.value[0])
            val attributes = scanMethod(path)

            // done

            val uri = getBuilder.uri(path, attributes /* index */, requestParams)

            return if (body >= 0) uri.body(body) else uri
        }
    }

    internal inner class DeleteAnalyzer(webClient: WebClient, method: Method) : RestAnalyzer(webClient, method) {
        // implement
        override fun build(): RequestBuilder<RHS> {
            val deleteMapping = method.getAnnotation(DeleteMapping::class.java)
            val getBuilder = RequestBuilder(webClient).delete()

            // scan path

            val path = getPath(deleteMapping.value[0])
            val attributes = scanMethod(path)

            // done

            val uri = getBuilder.uri(path, attributes /* index */, requestParams)

            return if (body >= 0) uri.body(body) else uri
        }
    }

    internal inner class RequestAnalyzer(webClient: WebClient, method: Method) : RestAnalyzer(webClient, method) {
        // implement
        override fun build(): RequestBuilder<RHS> {
            val requestMapping = method.getAnnotation(RequestMapping::class.java)
            val httpMethod = if (requestMapping.method.size > 0) requestMapping.method[0] else defaultMethod

            if (httpMethod == null) throw ServiceRegistryException(
                "missing http method for %s.%s",
                this.method.declaringClass.getName(),
                httpMethod?.name
            )

            val getBuilder = when (httpMethod) {
                RequestMethod.GET -> RequestBuilder(webClient).get()

                RequestMethod.PUT -> RequestBuilder(webClient).put()

                RequestMethod.POST -> RequestBuilder(webClient).post()

                RequestMethod.DELETE -> RequestBuilder(webClient).delete()

                else -> throw ServiceRegistryException("unsupported request method %s", httpMethod)
            }

            // scan path

            val path = getPath(requestMapping.path[0])
            val attributes = scanMethod(path)

            // checks

            if (httpMethod == RequestMethod.POST && body == -1) throw ServiceRegistryException(
                "missing @RequestBody in method %s.%s",
                this.method.declaringClass.getName(),
                httpMethod.name
            )

            // done

            val uri = getBuilder.uri(path, attributes /* index */, requestParams)

            return if (body >= 0) uri.body(body) else uri
        }
    }

    // instance data

    private val parameterNameDiscoverer: ParameterNameDiscoverer = DefaultParameterNameDiscoverer()

    // private
    fun build(webClient: WebClient, method: Method): RequestBuilder<*> {
        for (annotation in method.declaredAnnotations) {
            when (annotation) {
                is GetMapping -> return GetAnalyzer(webClient, method).build()

                is PostMapping -> return PostAnalyzer(webClient, method).build()

                is DeleteMapping -> return DeleteAnalyzer(webClient, method).build()

                is PutMapping -> return PutAnalyzer(webClient, method).build()

                is RequestMapping -> return RequestAnalyzer(webClient, method).build()
            }
        }
        throw ServiceRuntimeException("http channel does not support the method %s missing annotation!", method.name)
    }

    // public
    private fun <T : Collection<*>?> convertList2(list: List<*>, target: Type): T { // TODO KOTLIN
        return if (!target.javaClass.isAssignableFrom(list.javaClass)) {
            // interfaces
            if (target === MutableCollection::class.java || target === MutableList::class.java) return ArrayList(
                list
            ) as T

            // concrete
            if (target === ArrayList::class.java) return ArrayList(list) as T
            if (target === LinkedList::class.java) LinkedList(list) as T else throw ServiceRuntimeException(
                "collection type " + target.typeName + " not supported"
            )
        } else list as T
    }

    private fun <T : Collection<Any>> convertArray2Collection(list: Array<Any>, target: Type): T {
        if (target === MutableCollection::class.java || target === MutableList::class.java || target === ArrayList::class.java) return Arrays.asList(
            *list
        ) as T

        // concrete
        return if (target === LinkedList::class.java) {
            val result: LinkedList<Any> = LinkedList<Any>()

            Collections.addAll(result, list)

            result as T
        } else throw ServiceRuntimeException("collection type %s not supported", target.typeName)
    }

     fun createCollectionResponseHandler( method: Method) : ResponseHandler {
         if (method.genericReturnType == null) throw ServiceRuntimeException(
             "return type for method %s must be generic",
             method.name
         )
         val type: Type = method.returnType
         val elementType = genericsType(method.genericReturnType)
         val arrayType = elementType.arrayType() as Class<Any>

         return { spec: WebClient.ResponseSpec ->
             convertArray2Collection(
                 spec
                     .bodyToMono(arrayType)
                     .block() as Array<Any>, type
             )
         }
     }

    fun request(webClient: WebClient, method: Method): Request {
        // specs

        val builder = build(webClient, method)

        // response

        val responseHandler: ResponseHandler = if (method.returnType == Void.TYPE) {
            { spec: WebClient.ResponseSpec -> Void.TYPE } // TODO???
        }

        else if (method.returnType.isArray) {
            { spec: WebClient.ResponseSpec ->
                spec
                    .bodyToMono(method.returnType)
                    .block()
            }
        }
        else if (MutableCollection::class.java.isAssignableFrom(method.returnType)) {
            createCollectionResponseHandler(method)
        }

        else if (method.returnType == Mono::class.java) {
            { spec: WebClient.ResponseSpec -> spec.bodyToMono<Any>(genericsType(method.genericReturnType)) }
        }

        else if (method.returnType == Flux::class.java) {
            { spec: WebClient.ResponseSpec -> spec.bodyToFlux<Any>(genericsType(method.genericReturnType)) }
        }

        else {
            { spec: WebClient.ResponseSpec -> spec.bodyToMono(method.returnType).block() }
        }

        // done

        return Request(builder.operations.toTypedArray() as Array<SpecOperation<RHS>>, responseHandler)
    }

    companion object {
        // static methods
        private fun genericsType(clazz: Type): Class<Any> {
            if (clazz is ParameterizedType) {
                val typeArguments: Array<Type> = clazz.actualTypeArguments

                return typeArguments[0] as Class<Any>
            }

            else throw RuntimeException("expected generics type")
        }
    }
}