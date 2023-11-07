package com.serious.lang
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

object Classes {
    /**
     * Builds an **unordered** set of all interface and object classes that
     * are generalizations of the provided class.
     * @param classObject the class to find generalization of.
     * @return a Set of class objects.
     */
    fun getGeneralizations(classObject: Class<*>): Set<Class<*>> {
        val generalizations: MutableSet<Class<*>> = HashSet()

        generalizations.add(classObject)

        // class hierarchy

        val superClass = classObject.superclass
        if (superClass != null)
            generalizations.addAll(getGeneralizations(superClass))

        // interface hierarchy

        for (superInterface in classObject.interfaces)
            generalizations.addAll(getGeneralizations(superInterface))

        return generalizations
    }
}