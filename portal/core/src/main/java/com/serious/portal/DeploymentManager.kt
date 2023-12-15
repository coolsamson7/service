package com.serious.portal
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */


import com.serious.portal.ManifestManager
import com.serious.portal.model.Deployment
import com.serious.portal.model.Feature
import com.serious.portal.model.Manifest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.util.*
import kotlin.collections.HashMap


// types

typealias ManifestFilter = (manifest: Manifest) -> Boolean

typealias FeatureFilter = (feature: Feature) -> Boolean

@Component
class DeploymentManager(@Autowired val manager: ManifestManager) {
    // instance data

    private val manifestFilters = mutableListOf<ManifestFilter>()
    private val featureFilters = mutableListOf<FeatureFilter>()

    // constructor

    // fluent

    fun filterManifest(filter: ManifestFilter): DeploymentManager {
        manifestFilters.add(filter)

        return this
    }

    fun filterFeature(filter: FeatureFilter): DeploymentManager {
        featureFilters.add(filter)

        return this
    }

    private fun check(manifest: Manifest) : Boolean {
        for ( filter in manifestFilters)
            if ( !filter(manifest))
                return false

        return true
    }

    private fun check(feature: Feature) : Boolean {
        for ( filter in featureFilters)
            if ( !filter(feature))
                return false

        return true
    }

    // public

    fun create() : Deployment {
        // local function

        fun copyFeature(feature: Feature) : Feature {
            val result = feature.copy()

            val features = LinkedList<Feature>()
            if ( feature.children != null)
                for ( feature in feature.children!!) {
                    if ( check(feature))
                        features.add(copyFeature(feature))
                }

            result.children = features.toTypedArray()

            return result
        }

        val deployment = Deployment(HashMap())

        // add matching manifests

        for ( manifest in manager.manifests)
            if (check(manifest)) {
                val result = manifest.copy()

                deployment.modules.put(manifest.name, result);

                val features = LinkedList<Feature>()
                for ( feature in manifest.features) {
                    if ( check(feature))
                        features.add(copyFeature(feature))
                }

                result.features = features.toTypedArray()
            }

        // done

        return deployment
    }
}
