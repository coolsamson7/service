package com.serious.portal.mapper
/*
 * @COPYRIGHT (C) 2023 Andreas Ernst
 *
 * All rights reserved
 */

import org.junit.runner.RunWith
import org.junit.runners.Suite
import org.junit.runners.Suite.SuiteClasses


@RunWith(Suite::class)
@SuiteClasses(
    MapperTest::class,
    CollectionTest::class,
    CompositeTest::class,
    TopLevelCompositeTest::class,
    InheritanceTest::class,
    SynchronizerTest::class
)
class MapperTestSuite

