/**
* @COPYRIGHT (C) 2023 Andreas Ernst
* don't touch!
* generated at Wed Dec 27 11:23:47 CET 2023 with typescript V1.0
*/
import { Message } from "./message.interface";


export interface MessageChanges {
    newMessages: Message[]
    changedMessages: Message[]
    deletedMessages: Message[]
}
