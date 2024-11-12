package org.sirius.common.type
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */
class ValidationError(val violations : List<TypeViolation>) : Error() {}