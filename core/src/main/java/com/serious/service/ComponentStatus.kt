package com.serious.service
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

/**
 * The different status of a component
 */
enum class ComponentStatus {
    /**
     * the component has not started yet
     */
    VIRGIN,
    /**
     * the component is running
     */
    RUNNING,
    /**
     * the component has stopped
     */
    STOPPED
}