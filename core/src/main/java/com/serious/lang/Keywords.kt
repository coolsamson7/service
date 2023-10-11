package com.serious.lang

import java.io.*

/*
* @COPYRIGHT (C) 2023 Andreas Ernst
*
* All rights reserved
*/ /**
 * The class `Keywords` is a helper for supporting named optional method arguments. These
 * arguments are handled like an array of
 * arguments with the difference that each argument is named and may or may not be provided in a
 * concrete method call. The concept of a
 * keyword arguments is fundamental for all languages derived from LISP and is even useful in a
 * language like Java.
 *
 *
 *
 *
 * Note: The main drawback using keyword arguments is that compile time type checking is effectively
 * disabled. Furthermore a little storage
 * overhead is posed on each method call using keyword arguments.
 *
 *
 *
 *
 * Note: `Keywords` implements the `toString` method and the
 * `clone` method.
 *
 * @author Andreas Ernst
 */
open class Keywords : Cloneable, Externalizable {
    // local classes
    private class None : Keywords(*EMPTY_OBJECT) {
        // constructor
        init {
            size = -1
        }

        // override

        override fun clone(): Keywords {
            return this // that's easy!
        }

        override fun setValue(keyword: String?, value: Any?) {
            throw IllegalStateException("Keywords NONE must not be modified!")
        }

        override fun removeValue(keyword: String?) {
            throw IllegalStateException("Keywords NONE must not be modified!")
        }

        companion object {
            val EMPTY_OBJECT = arrayOfNulls<Any>(0)
        }
    }

    // instance data
    private var keywords: Array<Any?>?

    /**
     * return the size of this instance which includes both keys and values.
     *
     * @return the size
     */
    open var size // the used space of the mKeywords which may contain nulls at the end!
            : Int
        protected set
    // constructor
    /**
     * Constructs a empty set of `Pair` using the two given objects as head and tail.
     */
    constructor() {
        keywords = null
        size = 0
    }

    /**
     * Constructs a `Keywords` with an unlimited number of arguments.
     *
     * @param keywords an array of alternating keyword names and keyword values
     */
    constructor(vararg keywords: Any?) {
        size = keywords.size
        this.keywords = arrayOf(keywords)
    }

    /**
     * Constructs a `Keywords` based upon a given keyword list.
     *
     * @param originalKeywords the keyword list, which should be extended
     * @param keywords         an array of alternating keyword names and keyword values
     */
    constructor(originalKeywords: Keywords, vararg keywords: Any?) {
        size = originalKeywords.size
        this.keywords = arrayOfNulls(size + keywords.size)
        if (originalKeywords.keywords != null) System.arraycopy(originalKeywords.keywords, 0, this.keywords, 0, size)

        // add additional keywords
        var i = 0
        while (i < keywords.size) {
            addValue(keywords[i] as String?, keywords[i + 1])
            i += 2
        }
    }
    // public
    /**
     * Returns the value of a named keyword argument using `null` as the default value
     * that is returned, if this argument is
     * unknown.
     *
     * @param keyword the name of the keyword argument
     * @return the value of the named argument or `null`
     * @see .getValue
     */
    fun getValue(keyword: String): Any? {
        return getKeyword(keyword, null)
    }

    /**
     * Returns the value of a named keyword argument using `null` as the default value
     * that is returned, if this argument is
     * unknown.
     *
     * @param keyword the name of the keyword argument
     * @param clazz   the expected class of the value
     * @return the value of the named argument or `null`
     * @see .getValue
     */
    fun <T> getValue(keyword: String, clazz: Class<T>?): T? {
        return getKeyword(keyword, null) as T?
    }

    /**
     * Returns the value of a named keyword argument. The given default value is returned, if this
     * argument is unknown.
     *
     * @param keyword      the name of the keyword argument
     * @param defaultValue the value to be returned if the argument is unknown
     * @return the value of the named argument or the default value
     * @see .getValue
     */
    fun <T> getValue(keyword: String, defaultValue: T): T? {
        return getKeyword(keyword, defaultValue) as T?
    }

    /**
     * Returns the value of a named keyword argument. The given default value is returned, if this
     * argument is unknown.
     *
     * @param keyword      the name of the keyword argument
     * @param defaultValue the value to be returned if the argument is unknown
     * @return the value of the named argument or the default value
     * @see .getValue
     */
    fun <T> getValue(keyword: String, clazz: Class<T>?, defaultValue: T): T? {
        return getKeyword(keyword, defaultValue) as T?
    }

    /**
     * Adds the given value with the given name to the keyword arguments. If a keyword argument with
     * the given name is already known, its
     * value is changed. This method and `addValue` are effectively identical.
     *
     * @param keyword the name of the keyword argument
     * @param value   the new value for the keyword argument
     * @see .getValue
     *
     * @see .addValue
     */
    open fun setValue(keyword: String?, value: Any?) {
        setKeyword(keyword, value)
    }

    /**
     * Adds the given value with the given name to the keyword arguments. If a keyword argument with
     * the given name is already known, its
     * value is changed. This method and `setValue` are effectively identical.
     *
     * @param keyword the name of the keyword argument
     * @param value   the new value for the keyword argument
     * @see .removeValue
     *
     * @see .setValue
     */
    fun addValue(keyword: String?, value: Any?) {
        setValue(keyword, value)
    }

    /**
     * add all keys of the specified [Keywords] arguments to this instance possibly
     * overwritting existing entries.
     *
     * @param keywords the [Keywords] argument.
     * @return this
     */
    fun add(keywords: Keywords): Keywords {
        var i = 0
        while (i < keywords.size) {
            addValue(keywords.keywords!![i] as String?, keywords.keywords!![i + 1])
            i += 2
        }
        return this
    }

    /**
     * Removes the keyword argument with the given name.
     *
     * @param keyword the name of the keyword argument to be removed
     */
    open fun removeValue(keyword: String?) {
        var index = -1
        var i = 0
        while (i < size) {
            if ((keywords!![i] as String?).equals(keyword, ignoreCase = true)) {
                index = i
                break
            }
            i += 2
        }
        if (index >= 0) {
            System.arraycopy(keywords, index + 2, keywords, index, size - index - 2)
            keywords!![--size] = null
            keywords!![--size] = null
        }
    }

    val isEmpty: Boolean
        /**
         * Returns `true`, if there are no key/value pairs.
         *
         * @return `true`, if there are no key/value pairs
         */
        get() = size == 0

    /**
     * Returns `true`, if the given keyword argument has a known value.
     *
     * @param keyword the keyword name
     * @return `true`, if the given keyword argument has a known value
     */
    fun hasValue(keyword: String): Boolean {
        return getValue(keyword, this) !== this
    }

    val keys: Collection<String?>
        /**
         * Returns a Collection of all keys
         *
         * @return a Collection of all keys
         */
        get() {
            val keys: MutableCollection<String?> = ArrayList(size)
            getKeys(keys)
            return keys
        }

    // private
    private fun getKeyword(keyword: String, defaultValue: Any?): Any? {
        var i = 0
        while (i < size) {
            if ((keywords!![i] as String?).equals(keyword, ignoreCase = true)) return keywords!![i + 1]
            i += 2
        }
        return defaultValue
    }

    private fun setKeyword(keyword: String?, value: Any?) {
        var i = 0
        while (i < size) {
            if ((keywords!![i] as String?).equals(keyword, ignoreCase = true)) {
                keywords!![i + 1] = value
                return
            } // if
            i += 2
        }
        val length = if (keywords != null) keywords!!.size else 0
        val newSize = size + 2
        if (newSize <= length && keywords != null) System.arraycopy(keywords, 0, keywords, 2, size) else {
            val newKeywords = arrayOfNulls<Any>(newSize + 8)
            if (keywords != null) System.arraycopy(keywords, 0, newKeywords, 2, size)
            keywords = newKeywords
        } // else
        keywords!![0] = keyword
        keywords!![1] = value
        size = newSize
    }

    private fun getKeys(keys: MutableCollection<String?>) {
        var i = 0
        while (i < size) {
            if (!keys.contains(keywords!![i])) keys.add(keywords!![i] as String?)
            i += 2
        }
    }

    public override fun clone(): Keywords {
        return Keywords(this)
    }

    // implement Externalizable
    @Throws(IOException::class)
    override fun writeExternal(out: ObjectOutput) {
        var newSize = size
        run {
            var i = 1
            while (i < size) {
                val value = keywords!![i]
                if (value !is Serializable && value != null) newSize -= 2
                i += 2
            }
        }
        val newKeywords = arrayOfNulls<Any>(if (newSize >= 0) newSize else 0)
        var index = 0
        var i = 1
        while (i < size) {
            val value = keywords!![i]
            if (value is Serializable || value == null) {
                newKeywords[index++] = keywords!![i - 1]
                newKeywords[index++] = value
            } // if
            i += 2
        }
        out.writeObject(newKeywords)
        out.writeInt(newSize)
    }

    @Throws(IOException::class, ClassNotFoundException::class)
    override fun readExternal(`in`: ObjectInput) {
        keywords = `in`.readObject() as Array<Any?>
        size = `in`.readInt()
    }

    // override Object
    override fun toString(): String {
        val result = StringBuilder(16 + size * 16)
        result.append('<')
        var i = 0
        while (i < size) {
            if (i > 0) result.append(", ")
            result.append(keywords!![i])
            result.append(": ")
            val value = keywords!![i + 1]
            if (value is String) result.append('"').append(value)
                .append('"') else if (value is Char) result.append('\'').append(value).append('\'') else result.append(
                value
            )
            i += 2
        }
        result.append('>')
        return result.toString()
    }

    override fun hashCode(): Int {
        return keywords.contentHashCode()
    }

    override fun equals(o: Any?): Boolean {
        if (this === o) return true
        return if (o == null) false else {
            try {
                val k = o as Keywords
                if (size != k.size) return false
                var i = 0
                while (i < size) {
                    if (keywords!![i] != k.keywords!![i]) return false
                    val value = keywords!![i + 1]
                    if (value == null) {
                        if (value !== k.keywords!![i + 1]) return false
                    } else if (value != k.keywords!![i + 1]) return false
                    i += 2
                }
                true
            } catch (e: Exception) {
                false
            }
        }
    }

    // called by the java marshalling process.
    @Throws(ObjectStreamException::class)
    protected fun readResolve(): Any {
        return if (size == -1) NONE else this
    }

    companion object {
        // constants
        /**
         * `NONE` represents a set of empty keyword arguments. These arguments cannot be
         * changed, i.e. no further arguments may be
         * added using `setValue` or `addValue`.
         */
        val NONE: Keywords = None()
    }
}
