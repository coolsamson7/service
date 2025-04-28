package org.sirius.workflow.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import org.camunda.bpm.engine.RuntimeService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.web.bind.annotation.*


@CrossOrigin(
    origins = [ "http://localhost:8080", "http://localhost:4200"],
    methods = [
        RequestMethod.OPTIONS,
        RequestMethod.GET,
        RequestMethod.PUT,
        RequestMethod.DELETE,
        RequestMethod.POST
    ])
@RestController
@RequestMapping(value = ["bpmn/runtime/"])
class RuntimeRestService {
    // instance data

    @Autowired
    private lateinit var runtimeService: RuntimeService

    @Autowired
    private lateinit var metadataService: MetadataService

    // methods

    @PostMapping("start/{processDefinitionKey}")
    fun startTask(@PathVariable processDefinitionKey: String, @RequestBody parameter: Map<String,Object>) {
        // TODO: any coercion logic required?

        val mapper = ObjectMapper()
        val input = HashMap<String,Any>()

        input["input"] =  mapper.writerWithDefaultPrettyPrinter().writeValueAsString(parameter)

        if ( processDefinitionKey.contains(":")) {
            val colon = processDefinitionKey.indexOf(':')
            runtimeService.startProcessInstanceByKey(processDefinitionKey.substring(0, colon), input)
        }
        else
            runtimeService.startProcessInstanceByKey(processDefinitionKey, parameter)
    }
}
