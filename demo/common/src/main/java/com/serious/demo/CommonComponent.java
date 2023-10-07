package com.serious.demo;
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Component;
import com.serious.service.ComponentInterface;

/**
 * @author Andreas Ernst
 */
@ComponentInterface(services = {CommonService.class})
public interface CommonComponent extends Component {
}
