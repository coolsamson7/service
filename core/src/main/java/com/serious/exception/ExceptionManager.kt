package com.serious.exception
/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/

import java.util.*
import com.serious.util.MethodDispatcher

/**
 * A `ExceptionManager` is a registry of [Handler]s that contain code to log and
 * transform exceptions in an appropriate way.
 * @see Handler
 */
class ExceptionManager {
    // local classes

    private class State(val methodDispatcher: MethodDispatcher) {
        var argument: Any? = null
        var head: MethodDispatcher.RegisteredMethod? = null
    }

    /**
     * A `Handler` contains logging and transformation code for specific exception
     * classes. Logging methods are identified by signature of type
     *
     * * `prexform(e: <exception-class>)`
     * * `log(e : <exception-class>)`
     * * `xform(e: <exception-class>)`
     * * ` handle(e: <exception-class>)`
     */
    interface Handler {
        // prexform(e: exception-class)
        // log(e: exception-class)
        // handle(e: exception-class)
        // xform(e: exception-class)
    }

    // instance data

    private val pretransformer = MethodDispatcher(PRE_TRANSFORM)
    private var logger = MethodDispatcher(LOG)
    private var transformer = MethodDispatcher(TRANSFORM)
    private var handler = MethodDispatcher(HANDLE)

    /**
     * return the array of registered [Handler]s.
     *
     * @return the array of registered [Handler]s
     */
    var handlers = EMPTY_HANDLERS_ARRAY
        private set

    // constructor

    /**
     * create a new `ExceptionManager`.
     *
     * @param handlers array of [Handler]s
     */
    constructor(vararg handlers: Handler) {
        for (handler in handlers)
            register(handler)
    }

    /**
     * create a new `ExceptionManager` on base of the specified original
     * [ExceptionManager].
     *
     * @param original the original [ExceptionManager]
     */
    constructor(original: ExceptionManager) {
        logger = MethodDispatcher( original.logger)
        transformer = MethodDispatcher(original.transformer)
        handler = MethodDispatcher(original.handler)
    }

    // public
    /**
     * registers the specified [Handler] in the registry by inspecting the public methods for the described patterns
     * @param handler the [Handler]
     */
    @JvmOverloads
    fun register(handler: Handler, replace: Boolean = false) {
        if (replace) {
            pretransformer.replaceMethods(handler, PRE_TRANSFORM)
            logger.replaceMethods(handler, LOG)
            transformer.replaceMethods(handler, TRANSFORM)
            this.handler.replaceMethods(handler, HANDLE)
        }
        else {
            pretransformer.addMethods(handler, PRE_TRANSFORM)
            logger.addMethods(handler, LOG)
            transformer.addMethods(handler, TRANSFORM)
            this.handler.addMethods(handler, HANDLE)
        }

        handlers = com.serious.collections.Arrays.add2(Handler::class.java, handlers, handler)
    }

    /**
     * handles the specified exception with respect to registered handlers. The following logic is
     * implemented:
     *
     *  * execute the chain of matching `log` methods starting with the most specific.
     * Every log-method is free to call [ExceptionManager.proceed] that will call
     * the next best matching method.
     *  * execute the chain of matching `xform` methods starting with the most specific.
     * Every xform-method is free to call [ExceptionManager.proceed] that will call
     * the next best matching method. Any explicit `throw` statement
     * will terminate the chain and the toplevel `handleException` call. Otherwise
     * the resulting - possibly transformed - objects will be returned.
     *
     * If no matching xform method can be identified the call will throw a
     * [MethodDispatcher.NoApplicableMethodError].
     *
     * @param exception the original exception.
     * @return the - possibly transformed - exception
     */
    fun handleException(exception: Throwable): Throwable {
        // pre transform

        var exception = exception
        try {
            CURRENT_STATE.set(State(pretransformer))
            exception = invoke(exception) as Throwable // throw?
        }
        catch (e: MethodDispatcher.NoApplicableMethodError) {
            // ignore
        }
        finally {
            CURRENT_STATE.remove()
        }

        // log

        CURRENT_STATE.set(State(logger))
        try {
            invoke(exception)
        }
        catch (e: MethodDispatcher.NoApplicableMethodError) {
            // ignore
        }
        catch (e: Throwable) {
            // ?? log?
        }

        // handle

        try {
            CURRENT_STATE.set(State(handler))
            invoke(exception) // throw?
        }
        catch (e: MethodDispatcher.NoApplicableMethodError) {
            // ignore
        }
        finally {
            CURRENT_STATE.remove()
        }

        // transform

        try {
            CURRENT_STATE.set(State(transformer))
            exception = invoke(exception) as Throwable // throw?
        }
        catch (e: MethodDispatcher.NoApplicableMethodError) {
            // ignore
        }
        finally {
            CURRENT_STATE.remove()
        }

        return exception
    }

    companion object {
        // constants

        private const val LOG = "log"
        private const val PRE_TRANSFORM = "prexform"
        private const val TRANSFORM = "xform"
        private const val HANDLE = "handle"
        val EMPTY_HANDLERS_ARRAY = arrayOf<Handler>()

        // static data

        private val handle = ThreadLocal<Boolean?>()

        // static functions

        fun setExternal() {
            handle.set(java.lang.Boolean.TRUE)
        }

        val isInternal: Boolean
            get() = handle.get() == null

        fun clearExternal() {
            handle.remove()
        }

        // static data

        private val CURRENT_STATE = ThreadLocal<State>()
        private val ACTIVE_EXCEPTION_MANAGERS: ThreadLocal<LinkedList<ExceptionManager>> = ThreadLocal<LinkedList<ExceptionManager>>()

        // static methods

        val exceptionManager: ExceptionManager?
            /**
             * Returns the topmost active `ExceptionManager`, i.e. the exception manager, for which
             * [.pushExceptionManager] has been most recently called.
             *
             * @return the active `ExceptionManager`
             */
            get() {
                val list: LinkedList<ExceptionManager>? = ACTIVE_EXCEPTION_MANAGERS.get()
                return if (list == null || list.isEmpty()) // calling getExceptionManager() without having installed one before is actually a programming error.
                // However, for the sake of defensive programming, we install a default exception manager such that an
                // application programmer at least gets a stack trace of its own exception and not a NPE due to a missing
                // exception manager.
                    null
                else list.getFirst()
            }

        /**
         * Calling `pushExceptionManager` pushed a new exception manager on the stack. If an exception
         * manager is already active in the current thread, the new exception manager will shadow the old one, i.e. that
         * the registered handlers of the new exception manager will be applied before the handlers of the old one.
         * Only, if an exception is not handled, the exception handlers of the old exception manager will be applied.
         *
         * Note: Be sure to call `popExceptionManager` correctly to establish the shadowed exception manager again.
         *
         * @param exceptionManager the exception manager to be established
         */
        fun pushExceptionManager(exceptionManager: ExceptionManager?) {
            var exceptionManagers: LinkedList<ExceptionManager>? = ACTIVE_EXCEPTION_MANAGERS.get()
            if (exceptionManagers == null) {
                ACTIVE_EXCEPTION_MANAGERS.set(LinkedList<ExceptionManager>().also { exceptionManagers = it })
            }
            exceptionManagers!!.addFirst(exceptionManager)
        }

        /**
         * `popExceptionManager` pops the current exception manager and reactivates a possible former exception manager,
         */
        fun popExceptionManager() {
            ACTIVE_EXCEPTION_MANAGERS.get().removeFirst()
        }

        private operator fun invoke(arg: Any): Any {
            val state = CURRENT_STATE.get()

            if (state.argument !== arg) {
                // recompute list
                state.head = state.methodDispatcher.getApplicableMethods(arg.javaClass) // will throw!
                state.argument = arg
            } // if

            // execute the current most applicable method

            return if (state.head != null) state.head!!(arg)
            else throw MethodDispatcher.NoApplicableMethodError(arg.javaClass)
        }

        // public

        /**
         * proceed the current process by invoking the next applicable method with respect to the
         * specified argument. If the argument does not
         * correspond to the current argument of the chain, the complete list of applicable methods will
         * be recomputed and the current argument
         * will be set to this new value.
         *
         * @param arg the exception argument
         * @return the - possibly transformed - exception instance
         */
        fun proceed(arg: Throwable): Throwable {
            val state = CURRENT_STATE.get()

            state.head = state.head!!.nextApplicableMethod

            return invoke(arg) as Throwable
        }
    }
}
