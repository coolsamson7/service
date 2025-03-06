package org.sirius.workflow.service

import org.sirius.workflow.ParameterDescriptor
import org.springframework.beans.factory.annotation.Autowired

import org.sirius.workflow.TaskRegistry
import org.springframework.web.bind.annotation.*

data class ServiceTaskParameterDescriptorDTO(
    val name: String,
    val type: String,
    val description: String
)

data class ServiceTaskDescriptorDTO(
    val name: String? = null,
    val description: String,
    val input: List<ServiceTaskParameterDescriptorDTO>,
    val output: List<ServiceTaskParameterDescriptorDTO>
)

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
@RequestMapping(value = ["bpmn/service-task/"])
class ServiceTaskRestService {
    // instance data

    @Autowired
    private lateinit var taskRegistry: TaskRegistry

    // private

    private fun mapType(clazz: Class<*>) : String {
        return clazz.simpleName
    }

    private fun mapParameter(parameter: ParameterDescriptor) : ServiceTaskParameterDescriptorDTO {
        return ServiceTaskParameterDescriptorDTO(parameter.name, mapType(parameter.type), parameter.description)
    }
    // methods

    @GetMapping("service-tasks")
    @ResponseBody
    fun getTaskDescriptors(): List<ServiceTaskDescriptorDTO> {
      return taskRegistry.getServiceTaskDescriptors().map { descriptor ->
          ServiceTaskDescriptorDTO(
              descriptor.name,
              descriptor.description,
              descriptor.inputs.map { input -> mapParameter(input) },
              descriptor.outputs.map { output -> mapParameter(output) },
          )
      }
    }
}
