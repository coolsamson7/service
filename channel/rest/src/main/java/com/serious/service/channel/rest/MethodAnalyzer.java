package com.serious.service.channel.rest;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.exception.ServiceRegistryException;
import com.serious.service.exception.ServiceRuntimeException;
import org.apache.logging.log4j.util.Strings;
import org.springframework.core.DefaultParameterNameDiscoverer;
import org.springframework.core.ParameterNameDiscoverer;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * @author Andreas Ernst
 */
public class MethodAnalyzer {
    // static methods

    private static Class genericsType(Type clazz) {
        Type type = clazz;
        if (type instanceof ParameterizedType parameterizedType) {
            Type[] typeArguments = parameterizedType.getActualTypeArguments();
            return (Class) typeArguments[0];
        }

        return null;
    }

    // local classes

    interface Analyzer {
        RequestBuilder build();
    }

    abstract class RestAnalyzer implements Analyzer {
        // static
        static Pattern pattern = Pattern.compile("\\{([^{}]*)}");

        // instance data

        protected WebClient webClient;
        protected Method method;
        protected HashMap<String, Integer> requestParams = new HashMap<>();
        protected Integer[] variables;
        protected int body = -1;

        // constructor
        protected RestAnalyzer(WebClient webClient, Method method) {
            this.webClient = webClient;
            this.method = method;
        }

        // protected

        protected String getPath(String path) {
            String result = getDefaultPath();
            if (result != null)
                return result + path;
            else
                return path;
        }

        protected String getDefaultPath() {
            Class clazz = method.getDeclaringClass();

            if (clazz.getAnnotation(RequestMapping.class) != null)
                return ((RequestMapping) clazz.getAnnotation(RequestMapping.class)).value()[0];

            if (clazz.getAnnotation(GetMapping.class) != null)
                return ((GetMapping) clazz.getAnnotation(GetMapping.class)).value()[0];

            if (clazz.getAnnotation(PostMapping.class) != null)
                return ((PostMapping) clazz.getAnnotation(PostMapping.class)).value()[0];

            if (clazz.getAnnotation(DeleteMapping.class) != null)
                return ((DeleteMapping) clazz.getAnnotation(DeleteMapping.class)).value()[0];

            return null;
        }

        protected RequestMethod getDefaultMethod() {
            Class clazz = method.getDeclaringClass();

            if (clazz.getAnnotation(RequestMapping.class) != null)
                return ((RequestMapping) clazz.getAnnotation(RequestMapping.class)).method()[0];

            if (clazz.getAnnotation(GetMapping.class) != null)
                return RequestMethod.GET;

            if (clazz.getAnnotation(PostMapping.class) != null)
                return RequestMethod.POST;

            if (clazz.getAnnotation(DeleteMapping.class) != null)
                return RequestMethod.DELETE;

            return null;
        }


        protected void scanMethod(String path) {
            // scan request params & path variables

            HashMap<String, Integer> pathVariables = new HashMap<>();

            String[] parameterNames = getParameterNames(method);

            int index = 0;
            for (Annotation[] annotations : method.getParameterAnnotations()) {
                for (Annotation paramAnnotation : annotations) {
                    if (paramAnnotation instanceof PathVariable) {
                        String name = ((PathVariable) paramAnnotation).value();
                        if (Strings.isEmpty(name))
                            name = parameterNames[index];

                        pathVariables.put(name, index);
                    }
                    else if (paramAnnotation instanceof RequestParam) {
                        String name = ((RequestParam) paramAnnotation).name();
                        if (Strings.isEmpty(name))
                            name = parameterNames[index];

                        requestParams.put(name, index);
                    }

                    else if (paramAnnotation instanceof RequestBody)
                        body = index;
                }


                index++;
            } // for

            // scan path

            List<Integer> variables = new ArrayList<>();

            Pattern pattern = Pattern.compile("\\{([^{}]*)}");
            Matcher matcher = pattern.matcher(path);

            while (matcher.find()) {
                String match = matcher.group(1);

                variables.add(pathVariables.get(match));
            }

            this.variables = variables.toArray(new Integer[0]);
        }

        protected String[] getParameterNames(Method method) {
            return parameterNameDiscoverer.getParameterNames(method);
        }
    }

    class GetAnalyzer extends RestAnalyzer {
        // constructor

        GetAnalyzer(WebClient webClient, Method method) {
            super(webClient, method);
        }

        // implement

        public RequestBuilder build() {
            GetMapping getMapping = method.getAnnotation(GetMapping.class);

            RequestBuilder getBuilder = new RequestBuilder(webClient).get();

            String path = getPath(getMapping.value()[0]);

            scanMethod(path);

            // done

            return getBuilder.uri(path, variables, requestParams);
        }
    }

    class PostAnalyzer extends RestAnalyzer {
        // constructor

        PostAnalyzer(WebClient webClient, Method method) {
            super(webClient, method);
        }
        // implement

        public RequestBuilder build() {
            PostMapping postMapping = method.getAnnotation(PostMapping.class);

            RequestBuilder getBuilder = new RequestBuilder(webClient).post();

            // scan path

            String path = getPath(postMapping.value()[0]);

            scanMethod(path);
            // done

            return getBuilder.uri(path, variables/* index */, requestParams).body(body);
        }
    }

    class PutAnalyzer extends RestAnalyzer {
        // constructor

        PutAnalyzer(WebClient webClient, Method method) {
            super(webClient, method);
        }
        // implement

        public RequestBuilder build() {
            PutMapping postMapping = method.getAnnotation(PutMapping.class);

            RequestBuilder getBuilder = new RequestBuilder(webClient).put();

            // scan path

            String path = getPath(postMapping.value()[0]);

            scanMethod(path);

            // done

            return getBuilder.uri(path, variables/* index */, requestParams).body(body);
        }
    }

    class DeleteAnalyzer extends RestAnalyzer {
        // constructor

        DeleteAnalyzer(WebClient webClient, Method method) {
            super(webClient, method);
        }
        // implement

        public RequestBuilder build() {
            DeleteMapping deleteMapping = method.getAnnotation(DeleteMapping.class);

            RequestBuilder getBuilder = new RequestBuilder(webClient).delete();

            // scan path

            String path = getPath(deleteMapping.value()[0]);

            scanMethod(path);
            // done

            return getBuilder.uri(path, variables/* index */, requestParams).body(body);
        }
    }

    class RequestAnalyzer extends RestAnalyzer {
        // constructor

        RequestAnalyzer(WebClient webClient, Method method) {
            super(webClient, method);
        }
        // implement

        public RequestBuilder build() {
            RequestMapping requestMapping = method.getAnnotation(RequestMapping.class);

            RequestMethod method = requestMapping.method().length > 0 ? requestMapping.method()[0] : getDefaultMethod();

            if (method == null)
                throw new ServiceRegistryException("missing http method");

            RequestBuilder getBuilder;

            if (method == RequestMethod.GET)
                getBuilder = new RequestBuilder(webClient).get();
            else if (method == RequestMethod.PUT)
                getBuilder = new RequestBuilder(webClient).put();
            else if (method == RequestMethod.POST)
                getBuilder = new RequestBuilder(webClient).post();
            else if (method == RequestMethod.DELETE)
                getBuilder = new RequestBuilder(webClient).delete();
            else
                throw new ServiceRegistryException("unsupported request method ");

            // scan path

            String path = requestMapping.value()[0];

            scanMethod(path);

            // done

            return getBuilder.uri(path, variables/* index */, requestParams).body(body);
        }
    }

    // instance data
    private final ParameterNameDiscoverer parameterNameDiscoverer = new DefaultParameterNameDiscoverer();

    // private
    RequestBuilder build(WebClient webClient, Method method) {
        for (Annotation annotation : method.getDeclaredAnnotations()) {
            if (annotation instanceof GetMapping)
                return new GetAnalyzer(webClient, method).build();

            else if (annotation instanceof PostMapping)
                return new PostAnalyzer(webClient, method).build();

            else if (annotation instanceof DeleteMapping)
                return new DeleteAnalyzer(webClient, method).build();

            else if (annotation instanceof PutMapping)
                return new PutAnalyzer(webClient, method).build();

            else if (annotation instanceof RequestMapping)
                return new RequestAnalyzer(webClient, method).build();
        }

        throw new ServiceRuntimeException("http channel does not support the method " + method.getName() + " missing annotations");
    }

    // public

    public Request request(WebClient webClient, Method method) {
        // specs

        RequestBuilder builder = build(webClient, method);

        // response

        Request.ResponseHandler responseHandler = null;

        // void

        if (method.getReturnType() == void.class) {
            responseHandler = spec -> null;
        }

        // list

        else if (method.getReturnType() == List.class && method.getGenericReturnType() != null) { // TODO
            Class elementType = genericsType(method.getGenericReturnType());
            responseHandler = spec -> spec.bodyToFlux(elementType).collectList().block();
        }

        // mono

        else if (method.getReturnType() == Mono.class) {
            Class elementType = genericsType(method.getGenericReturnType());

            responseHandler = spec -> spec.bodyToMono(elementType);
        }

        // flux

        else if (method.getReturnType() == Flux.class) {
            Class elementType = genericsType(method.getGenericReturnType());

            responseHandler = spec -> spec.bodyToFlux(elementType);
        }

        // object

        else {
            responseHandler = spec -> spec.bodyToMono(method.getReturnType()).block();
        }

        // done

        return new Request((RequestBuilder.SpecOperation[]) builder.operations.toArray(new RequestBuilder.SpecOperation[0]), responseHandler);
    }
}