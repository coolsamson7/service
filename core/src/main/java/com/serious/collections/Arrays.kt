package com.serious.collections;
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import java.lang.reflect.Array;
import java.util.LinkedList;
import java.util.List;

/**
 * @author Andreas Ernst
 */
@SuppressWarnings("unchecked")
public final class Arrays {
    public static <T> boolean contains(T[] array, T element) {
        for (int i = 0; i < array.length; i++)
            if (array[i] == element)
                return true;

        return false;
    }

    public static <T> T[] add2(Class<T> type, T[] a1, T... a2) {
        T[] result = (T[]) Array.newInstance(type, a1.length + a2.length);

        System.arraycopy(a1, 0, result, 0, a1.length);
        System.arraycopy(a2, 0, result, a1.length, a2.length);

        return result;
    }

    public static <T> T[] add2(Class<T> type, T[] array, int index, T value) {
        int aLength = array.length;
        T[] result = (T[]) Array.newInstance(type, aLength + 1);

        System.arraycopy(array, 0, result, 0, index);

        result[index] = value;

        if (index < aLength)
            System.arraycopy(array, index, result, index + 1, aLength - index);

        return result;
    }

    public static <T> T[] remove(Class<T> type, T[] a1, T... a2) {
        List<T> newList = new LinkedList<T>();

        for (T t1 : a1) {
            boolean skip = false;

            for (T t2 : a2) {
                if (t1 == t2) {
                    skip = true;
                    break;
                } // if
            } // for

            if (!skip)
                newList.add(t1);
        } // for

        return newList.toArray((T[]) Array.newInstance(type, newList.size()));
    }
}
