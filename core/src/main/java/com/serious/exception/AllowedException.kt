package com.serious.exception
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

class AllowedException(e: Throwable) : RuntimeException(e) {
}