package com.serious.service.channel.dispatch;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.ServiceInterface;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.lang.reflect.InvocationTargetException;

/**
 * @author Andreas Ernst
 */
@ServiceInterface
public interface DispatchService {
    @PostMapping("/dispatch")
    @ResponseBody
    String dispatch(@RequestBody String request);
}
