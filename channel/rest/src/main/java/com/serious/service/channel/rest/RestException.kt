package com.serious.service.channel.rest
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import com.serious.exception.ServerException

class RestException(val timestamp: String, val status: Int, val error: String, val path: String) : ServerException(error) {
}