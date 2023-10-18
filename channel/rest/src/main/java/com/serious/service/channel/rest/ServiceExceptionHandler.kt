package com.serious.service.channel.rest
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.exception.AllowedException
import com.serious.exception.FatalException
import com.serious.jackson.ThrowableMapper
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.context.request.WebRequest

@ControllerAdvice
class ServiceExceptionHandler {
    @ExceptionHandler(AllowedException::class)
    fun handleAllowedException(ex: AllowedException, request: WebRequest): ResponseEntity<String> {
        return ResponseEntity
            .status(210)
            .body(ThrowableMapper.toJSON(ex.cause!!))
    }

    @ExceptionHandler(FatalException::class)
    fun handleUnknownException(ex: FatalException, request: WebRequest): ResponseEntity<String> {
        return ResponseEntity
            .status(512)
            .body(ThrowableMapper.toJSON(ex.cause!!))
    }
}