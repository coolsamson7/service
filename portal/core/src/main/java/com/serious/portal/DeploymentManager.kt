package com.serious.portal
/*
 * @COPYRIGHT (C) 2016 Andreas Ernst
 *
 * All rights reserved
 */

import com.serious.portal.model.Deployment
import com.serious.portal.model.Feature
import com.serious.portal.model.Manifest
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.util.*
import kotlin.collections.HashMap

// types

data class FilterContext(
    val hasSession: Boolean
)

typealias ManifestFilter = (context: FilterContext, manifest: Manifest) -> Boolean

typealias FeatureFilter = (context: FilterContext, feature: Feature) -> Boolean

@Component
class DeploymentManager(@Autowired val manager: ManifestManager) {
    // instance data

    private val manifestFilters = mutableListOf<ManifestFilter>()
    private val featureFilters = mutableListOf<FeatureFilter>()

    // constructor

    init {
        // enabled

        filterManifest { context, manifest -> manifest.enabled }
        filterManifest { context, manifest -> manifest.health == "alive" }
        filterFeature { context, feature -> feature.enabled }

        // session

        fun specifiedVisibilty(feature: Feature) :Boolean {
            return feature.visibility != null && feature.visibility!!.isNotEmpty()
        }

        filterFeature { context, feature ->
            if ( specifiedVisibilty(feature))
                if (!context.hasSession)
                    // no session yet, allow public only
                    feature.visibility!!.contains("public")
                else
                    // a have a session, allow private only
                    feature.visibility!!.contains("private")
            else true
        }
    }

    // fluent

    fun filterManifest(filter: ManifestFilter): DeploymentManager {
        manifestFilters.add(filter)

        return this
    }

    fun filterFeature(filter: FeatureFilter): DeploymentManager {
        featureFilters.add(filter)

        return this
    }

    private fun accept(context: FilterContext, manifest: Manifest) : Boolean {
        for ( filter in manifestFilters)
            if ( !filter(context, manifest))
                return false

        return true
    }

    private fun accept(context: FilterContext, feature: Feature) : Boolean {
        for ( filter in featureFilters)
            if ( !filter(context, feature))
                return false

        return true
    }

    // public

    fun create(session: Boolean) : Deployment {
        val context = FilterContext(session)

        // local function

        fun copyFeature(feature: Feature) : Feature {
            val result = feature.copy()

            val features = LinkedList<Feature>()
            if ( feature.children != null)
                for ( child in feature.children!!) {
                    val copy = copyFeature(child)

                    copy.enabled = accept(context, child)

                    features.add(copy)
                }

            result.children = features.toTypedArray()

            return result
        }

        val deployment = Deployment(HashMap())

        // add matching manifests

        for ( manifest in manager.manifests)
            if (accept(context, manifest)) {
                val result = manifest.copy()

                // filter features

                var enabledFeatures = 0

                val features = LinkedList<Feature>()
                for (feature in manifest.features) {
                    // copy anyway

                    val copy = copyFeature(feature)
                    copy.enabled = accept(context, feature)
                    features.add(copy)

                    if (copy.enabled)
                        enabledFeatures++

                    result.features = features.toTypedArray()

                    // only add, if there is at least one enabled feature

                    if (enabledFeatures > 0)
                        deployment.modules.put(manifest.name, result);
                } // for
            }

        // done

        return deployment
    }
}
