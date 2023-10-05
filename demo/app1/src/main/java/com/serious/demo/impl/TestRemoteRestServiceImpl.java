package com.serious.demo.impl;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.demo.Foo;
import com.serious.demo.TestRemoteRestService;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

/**
 * @author Andreas Ernst
 */
@RestController
class TestRemoteRestServiceImpl implements TestRemoteRestService {
    public String hello() {
        return "foo";
    }

    public String passId(String id) {
        return id;
    }

    public Foo passIdReturnBody(String id) {
        return new Foo();
    }

    public Foo postBody(Foo foo) {
        System.out.println("postBody");
        return foo;
    }

    public Mono<Foo> postBodyMono(Foo foo) {
        System.out.println("postBodyMono");
        return Mono.just(foo);
    }

    public String passParam(String id) {
        return id;
    }
}
