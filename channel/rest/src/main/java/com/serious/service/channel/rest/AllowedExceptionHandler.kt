package com.serious.service.channel.rest
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.exception.AllowedException
import com.serious.jackson.ThrowableMapper
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.context.request.WebRequest

@ControllerAdvice
class AllowedExceptionHandler {
    @ExceptionHandler(AllowedException::class)
    fun handleException(ex: AllowedException, request: WebRequest): ResponseEntity<String> {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ThrowableMapper.toJSON(ex.cause!!))
    }
}