package com.serious.lang;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import java.io.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;

/**
 * The class <code>Keywords</code> is a helper for supporting named optional method arguments. These
 * arguments are handled like an array of
 * arguments with the difference that each argument is named and may or may not be provided in a
 * concrete method call. The concept of a
 * keyword arguments is fundamental for all languages derived from LISP and is even useful in a
 * language like Java.
 * <p/>
 * <p/>
 * Note: The main drawback using keyword arguments is that compile time type checking is effectively
 * disabled. Furthermore a little storage
 * overhead is posed on each method call using keyword arguments.
 * <p/>
 * <p/>
 * Note: <code>Keywords</code> implements the <code>toString</code> method and the
 * <code>clone</code> method.
 *
 * @author Andreas Ernst
 */
public class Keywords implements Cloneable, Externalizable {
    // local classes

    private static final class None extends Keywords {
        public static final Object[] EMPTY_OBJECT = new Object[0];
        // constructor

        public None() {
            super(EMPTY_OBJECT);

            size = -1;
        }

        // override

        @Override
        public int getSize() {
            return 0;
        }

        @Override
        public Keywords clone() {
            return this; // that's easy!
        }

        @Override
        public void setValue(String keyword, Object value) {
            throw new IllegalStateException("Keywords NONE must not be modified!");
        }

        @Override
        public void removeValue(String keyword) {
            throw new IllegalStateException("Keywords NONE must not be modified!");
        }
    }

    // constants

    /**
     * <code>NONE</code> represents a set of empty keyword arguments. These arguments cannot be
     * changed, i.e. no further arguments may be
     * added using <code>setValue</code> or <code>addValue</code>.
     */
    public static final Keywords NONE = new None();

    // instance data

    @SuppressWarnings("NonSerializableFieldInSerializableClass")
    private Object[] keywords;
    protected int size; // the used space of the mKeywords which may contain nulls at the end!

    // constructor

    /**
     * Constructs a empty set of <code>Pair</code> using the two given objects as head and tail.
     */
    public Keywords() {
        this.keywords = null;
        this.size = 0;
    }

    /**
     * Constructs a <code>Keywords</code> with an unlimited number of arguments.
     *
     * @param keywords an array of alternating keyword names and keyword values
     */
    public Keywords(Object... keywords) {
        this.size = keywords.length;
        this.keywords = keywords;
    }

    /**
     * Constructs a <code>Keywords</code> based upon a given keyword list.
     *
     * @param originalKeywords the keyword list, which should be extended
     * @param keywords         an array of alternating keyword names and keyword values
     */
    public Keywords(Keywords originalKeywords, Object... keywords) {
        this.size = originalKeywords.getSize();
        this.keywords = new Object[size + keywords.length];

        if (originalKeywords.keywords != null)
            System.arraycopy(originalKeywords.keywords, 0, this.keywords, 0, size);

        // add additional keywords

        for (int i = 0; i < keywords.length; i += 2)
            addValue((String) keywords[i], keywords[i + 1]);
    }

    // public

    /**
     * return the size of this instance which includes both keys and values.
     *
     * @return the size
     */
    public int getSize() {
        return size;
    }

    /**
     * Returns the value of a named keyword argument using <code>null</code> as the default value
     * that is returned, if this argument is
     * unknown.
     *
     * @param keyword the name of the keyword argument
     * @return the value of the named argument or <code>null</code>
     * @see #getValue(String, Object)
     */
    public final Object getValue(String keyword) {
        return getKeyword(keyword, null);
    }

    /**
     * Returns the value of a named keyword argument using <code>null</code> as the default value
     * that is returned, if this argument is
     * unknown.
     *
     * @param keyword the name of the keyword argument
     * @param clazz   the expected class of the value
     * @return the value of the named argument or <code>null</code>
     * @see #getValue(String, Object)
     */
    public final <T> T getValue(String keyword, Class<T> clazz) {
        //noinspection unchecked
        return (T) getKeyword(keyword, null);
    }

    /**
     * Returns the value of a named keyword argument. The given default value is returned, if this
     * argument is unknown.
     *
     * @param keyword      the name of the keyword argument
     * @param defaultValue the value to be returned if the argument is unknown
     * @return the value of the named argument or the default value
     * @see #getValue(String)
     */
    public final <T> T getValue(String keyword, T defaultValue) {
        //noinspection unchecked
        return (T) getKeyword(keyword, defaultValue);
    }

    /**
     * Returns the value of a named keyword argument. The given default value is returned, if this
     * argument is unknown.
     *
     * @param keyword      the name of the keyword argument
     * @param defaultValue the value to be returned if the argument is unknown
     * @return the value of the named argument or the default value
     * @see #getValue(String)
     */
    public final <T> T getValue(String keyword, Class<T> clazz, T defaultValue) {
        //noinspection unchecked
        return (T) getKeyword(keyword, defaultValue);
    }

    /**
     * Adds the given value with the given name to the keyword arguments. If a keyword argument with
     * the given name is already known, its
     * value is changed. This method and <code>addValue</code> are effectively identical.
     *
     * @param keyword the name of the keyword argument
     * @param value   the new value for the keyword argument
     * @see #getValue
     * @see #addValue
     */
    public void setValue(String keyword, Object value) {
        setKeyword(keyword, value);
    }

    /**
     * Adds the given value with the given name to the keyword arguments. If a keyword argument with
     * the given name is already known, its
     * value is changed. This method and <code>setValue</code> are effectively identical.
     *
     * @param keyword the name of the keyword argument
     * @param value   the new value for the keyword argument
     * @see #removeValue
     * @see #setValue
     */
    public final void addValue(String keyword, Object value) {
        setValue(keyword, value);
    }

    /**
     * add all keys of the specified {@link Keywords} arguments to this instance possibly
     * overwritting existing entries.
     *
     * @param keywords the {@link Keywords} argument.
     * @return this
     */
    public Keywords add(Keywords keywords) {
        for (int i = 0; i < keywords.getSize(); i += 2)
            addValue((String) keywords.keywords[i], keywords.keywords[i + 1]);

        return this;
    }

    /**
     * Removes the keyword argument with the given name.
     *
     * @param keyword the name of the keyword argument to be removed
     */
    public void removeValue(String keyword) {
        int index = -1;

        for (int i = 0; i < size; i += 2)
            if (((String) keywords[i]).equalsIgnoreCase(keyword)) {
                index = i;

                break;
            }

        if (index >= 0) {
            System.arraycopy(keywords, index + 2, keywords, index, size - index - 2);

            keywords[--size] = null;
            keywords[--size] = null;
        }
    }

    /**
     * Returns <code>true</code>, if there are no key/value pairs.
     *
     * @return <code>true</code>, if there are no key/value pairs
     */
    public final boolean isEmpty() {
        return getSize() == 0;
    }

    /**
     * Returns <code>true</code>, if the given keyword argument has a known value.
     *
     * @param keyword the keyword name
     * @return <code>true</code>, if the given keyword argument has a known value
     */
    public final boolean hasValue(String keyword) {
        return getValue(keyword, this) != this;
    }

    /**
     * Returns a Collection of all keys
     *
     * @return a Collection of all keys
     */
    public Collection<String> getKeys() {
        Collection<String> keys = new ArrayList<String>(getSize());

        getKeys(keys);

        return keys;
    }

    // private

    private Object getKeyword(String keyword, Object defaultValue) {
        for (int i = 0; i < size; i += 2)
            if (((String) keywords[i]).equalsIgnoreCase(keyword))
                return keywords[i + 1];

        return defaultValue;
    }

    private void setKeyword(String keyword, Object value) {
        for (int i = 0; i < size; i += 2)
            if (((String) keywords[i]).equalsIgnoreCase(keyword)) {
                keywords[i + 1] = value;

                return;
            } // if

        int length = keywords != null ? keywords.length : 0;
        int newSize = size + 2;

        if (newSize <= length && keywords != null)
            System.arraycopy(keywords, 0, keywords, 2, size);

        else {
            Object[] newKeywords = new Object[newSize + 8];

            if (keywords != null)
                System.arraycopy(keywords, 0, newKeywords, 2, size);

            keywords = newKeywords;
        } // else

        keywords[0] = keyword;
        keywords[1] = value;

        size = newSize;
    }

    private void getKeys(Collection<String> keys) {
        for (int i = 0; i < size; i += 2)
            //noinspection SuspiciousMethodCalls
            if (!keys.contains(keywords[i]))
                keys.add((String) keywords[i]);
    }

    @Override
    public Keywords clone() {
        return new Keywords(this);
    }

    // implement Externalizable

    @Override
    public void writeExternal(ObjectOutput out) throws IOException {
        int newSize = size;

        for (int i = 1; i < size; i += 2) {
            Object value = keywords[i];

            if (!(value instanceof Serializable) && value != null)
                newSize -= 2;
        }

        Object[] newKeywords = new Object[newSize >= 0 ? newSize : 0];
        int index = 0;

        for (int i = 1; i < size; i += 2) {
            Object value = keywords[i];

            if (value instanceof Serializable || value == null) {
                newKeywords[index++] = keywords[i - 1];
                newKeywords[index++] = value;
            } // if
        } // for

        out.writeObject(newKeywords);
        out.writeInt(newSize);
    }

    @Override
    public void readExternal(ObjectInput in) throws IOException, ClassNotFoundException {
        keywords = (Object[]) in.readObject();
        size = in.readInt();
    }

    // override Object

    @Override
    public final String toString() {
        StringBuilder result = new StringBuilder(16 + size * 16);

        result.append('<');

        for (int i = 0; i < size; i += 2) {
            if (i > 0)
                result.append(", ");

            result.append(keywords[i]);
            result.append(": ");

            Object value = keywords[i + 1];

            if (value instanceof String)
                result.append('"').append(value).append('"');

            else if (value instanceof Character)
                result.append('\'').append(value).append('\'');
            else
                result.append(value);
        } // for

        result.append('>');

        return result.toString();
    }

    @Override
    public int hashCode() {
        return Arrays.hashCode(keywords);
    }

    @SuppressWarnings({"EqualsWhichDoesntCheckParameterClass"})
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null)
            return false;

        else {
            try {
                Keywords k = (Keywords) o;

                if (size != k.size)
                    return false;

                for (int i = 0; i < size; i += 2) {
                    if (!keywords[i].equals(k.keywords[i]))
                        return false;

                    Object value = keywords[i + 1];
                    if (value == null) {
                        if (value != k.keywords[i + 1])
                            return false;
                    }
                    else if (!value.equals(k.keywords[i + 1]))
                        return false;
                } // for

                return true;
            }
            catch (Exception e) {
                return false;
            }
        }
    }

    // called by the java marshalling process.

    protected Object readResolve() throws ObjectStreamException {
        if (size == -1)
            return NONE;
        else
            return this;
    }
}
