package org.sirius.workflow.service

import org.camunda.bpm.engine.RepositoryService
import org.camunda.bpm.engine.repository.Deployment
import org.camunda.bpm.engine.repository.ProcessDefinition
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.*
import org.springframework.web.bind.annotation.*
import java.io.*
import java.util.*
import java.util.stream.Collectors


data class ProcessDescriptor(val deployment: String, val id: String, val name: String,  val key: String, val resourceName: String)

data class ProcessDefinitionXML(val xml: String)

data class DeploymentDescriptor(val id: String, val name: String, val source: String)

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
@RequestMapping(value = ["bpmn/administration/"])
class AdministrationRestService {
    // instance data

    @Autowired
    private lateinit var repositoryService: RepositoryService

    @Autowired
    private lateinit var metadataService: MetadataService

    // methods

    @GetMapping("processes")
    fun getProcessDefinitions(): List<ProcessDescriptor> {
        return repositoryService.createProcessDefinitionQuery().list().stream()
            .map { processDefinition: ProcessDefinition -> ProcessDescriptor(
                processDefinition.deploymentId,
                processDefinition.id,
                if ( processDefinition.name !== null ) processDefinition.name else processDefinition.key,
                processDefinition.key,
                processDefinition.resourceName
            ) }
            .collect(Collectors.toList())
    }

    @Throws(IOException::class)
    fun getContent(fis: InputStream/*, encoding: String?*/): String {
        BufferedReader(InputStreamReader(fis/*, encoding*/)).use { br ->
            val sb = java.lang.StringBuilder()

            var line: String
            while ((br.readLine().also { line = it }) != null) {
                sb.append(line)
                sb.append('\n')
            } // while

            return sb.toString()
        }
    }

    @GetMapping("read-process-definition/{deployment}/{resourceName}")
    @ResponseBody
    fun getProcessDefinition(@PathVariable  deployment: String, @PathVariable resourceName: String): ProcessDefinitionXML {
        val inputStream = repositoryService.getResourceAsStream(deployment, resourceName)
        val xml = getContent(inputStream)

        return ProcessDefinitionXML(xml)
    }

    @PostMapping("update-process-definition/{process}")
    fun updateProcessDefinition(@PathVariable process: String, @RequestBody xml: ProcessDefinitionXML) : ProcessDescriptor {
        val deployment =  repositoryService
            .createDeployment()
            .addString(process, xml.xml)
            .deployWithResult();

        // ??
        val processDefinition = deployment.deployedProcessDefinitions.last()

       return ProcessDescriptor(
            processDefinition.deploymentId,
            processDefinition.id,
            if ( processDefinition.name !== null ) processDefinition.name else processDefinition.key,
            processDefinition.key,
            processDefinition.resourceName
        )
    }

    @GetMapping("process-schema/{process}")
    @ResponseBody
    fun getProcessSchema(@PathVariable process: String) : SchemaDescriptor {
        return this.metadataService.processSchema(process)
    }

    @GetMapping("task-schema/{process}/{task}")
    @ResponseBody
    fun getProcessSchema(@PathVariable process: String, @PathVariable task: String) : SchemaDescriptor {
        return this.metadataService.taskInputSchema(process, task)
    }
}
