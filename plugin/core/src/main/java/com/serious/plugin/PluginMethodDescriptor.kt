package com.serious.plugin

import java.lang.reflect.Method

class PluginMethodDescriptor(val name: String, val method: Method, val isVoid: Boolean) {
}