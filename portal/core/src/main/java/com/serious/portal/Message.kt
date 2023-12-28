package com.serious.portal
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

class Message(
    var id: Long,
    var namespace : String,
    var name : String,
    var locale : String,
    var value : String
)

class MessageChanges(
    var newMessages: Array<Message>,
    var changedMessages: Array<Message>,
    var deletedMessages: Array<Message>
)

