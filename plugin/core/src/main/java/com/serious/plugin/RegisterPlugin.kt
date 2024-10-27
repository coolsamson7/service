package com.serious.plugin

@MustBeDocumented
@Retention(AnnotationRetention.RUNTIME)
@Target(AnnotationTarget.CLASS)
annotation class RegisterPlugin(val name: String, val version: String = "1.0", val description: String = "")