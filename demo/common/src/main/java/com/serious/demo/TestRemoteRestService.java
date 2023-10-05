package com.serious.demo;/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Service;
import com.serious.service.ServiceInterface;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;


/**
 * @author Andreas Ernst
 */
@ServiceInterface()
@RestController
public interface TestRemoteRestService extends Service {
    @GetMapping("/hello")
    String hello();

    @GetMapping("/passId/{id}")
    String passId(@PathVariable("id") String id);

    @GetMapping("/passIdReturnBody/{id}")
    @ResponseBody
    Foo passIdReturnBody(@PathVariable("id") String id);

    @PostMapping("/postBody")
    @ResponseBody
    Foo postBody(@RequestBody Foo foo);

    @GetMapping("/passParam")
    String passParam(@RequestParam("id") String id);

    @PostMapping("/postBodyMono")
    @ResponseBody
    Mono<Foo> postBodyMono(@RequestBody Foo foo);
}
