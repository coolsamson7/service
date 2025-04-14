package org.sirius.workflow.model

/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */
class Process(val id: String, val deployment: Long, val name: String, val bpmn: String, val xml: String, val forms: List<Form>)