package com.serious.portal
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.transaction.annotation.EnableTransactionManagement

@Configuration
@ComponentScan
//@EnableJpaRepositories(basePackages = ["com.serious.portal.entity"])
//@EntityScan( basePackages = ["com.serious.portal.entity"] )
//@EnableTransactionManagement
class PortalConfiguration {
}
