package com.serious.service

import com.serious.annotations.Description

/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

/**
 * The different status of a component
 */
@Description("describes the status of a component")
enum class ComponentStatus {
    /**
     * the component has not started yet
     */
    @Description("the component has not started yet")
    VIRGIN,
    /**
     * the component is running
     */
    @Description("the component is running")
    RUNNING,
    /**
     * the component has stopped
     */
    @Description("the component has stopped")
    STOPPED
}