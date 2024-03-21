package com.serious.portal.mapper

open class MapperException(message: String, cause: Throwable? = null) : RuntimeException(message, cause)

class MapperDefinitionException(message: String, cause: Throwable? = null) : MapperException(message, cause) {
    // instance data

    var definition: MappingDefinition<*,*>? = null
    var match: MappingDefinition.Match? = null
    var accessor: MappingDefinition.Accessor? = null

    // public

    fun <S:Any,T:Any> setDefinition(definition: MappingDefinition<S,T>) : MapperDefinitionException {
        this.definition = definition

        return this
    }

    fun setMatch(match: MappingDefinition.Match?) : MapperDefinitionException{
        this.match = match
        return this
    }

    fun setAccessor(accessor: MappingDefinition.Accessor): MapperDefinitionException {
        this.accessor = accessor
        return this
    }

    // override

    override fun toString(): String {
        val builder = StringBuilder(128)

        builder
            .append("error: ")
            .append(super.message)

        if (definition != null) {
            builder.append("\nmapping: ")

            definition!!.describe(builder)
        }

        if (match != null)
            match!!.describe(builder)

        if (accessor != null)
            builder
                .append("\naccessor: ")
                .append(accessor!!.description())

        return builder.toString()
    }
}