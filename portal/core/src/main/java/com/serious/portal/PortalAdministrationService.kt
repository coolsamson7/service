package com.serious.portal
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.service.Service
import com.serious.service.ServiceInterface
import org.springframework.web.bind.annotation.RequestMapping


@ServiceInterface
@RequestMapping("portal-administration/")
interface PortalAdministrationService : Service {
}
