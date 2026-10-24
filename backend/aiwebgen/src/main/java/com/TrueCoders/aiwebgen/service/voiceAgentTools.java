
package com.TrueCoders.aiwebgen.service;

import com.TrueCoders.aiwebgen.dto.aiResponseDto;
import com.TrueCoders.aiwebgen.entity.projects;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;

public class voiceAgentTools {

    private final String userId;
    private final projectService projectService;
    private final aiService aiService;

    private String createdProjectId;

    public voiceAgentTools(
            String userId,
            projectService projectService,
            aiService aiService
    ) {
        this.userId = userId;
        this.projectService = projectService;
        this.aiService = aiService;
    }

    // TOOL 1: Create a new project.

    @Tool(
            name = "createProject",
            description = """
                    Create a new AiWebGen project when the user
                    explicitly requests a new project.
                    Do not use this tool to modify an existing project.
                    Returns the actual ID of the created project.
                    """
    )
    public String createProject(
            @ToolParam(
                    description = "The name of the new project"
            )
            String projectName
    ) {
        if (projectName == null || projectName.isBlank()) {
            return "ERROR: Project name cannot be empty.";
        }

        if (createdProjectId != null) {
            return "ERROR: A project was already created during "
                    + "this voice request. Project ID: "
                    + createdProjectId;
        }

        try {
            createdProjectId =
                    projectService.createProjectForVoice(
                            userId,
                            projectName.trim()
                    );

            return """
                    Project created successfully.
                    Project name: %s
                    Project ID: %s
                    Call generateWebsite next, using this exact ID.
                    """.formatted(
                    projectName.trim(),
                    createdProjectId
            );

        } catch (RuntimeException ex) {
            return "ERROR: Could not create the project. "
                    + ex.getMessage();
        }
    }

    // TOOL 2: Generate a website for the newly created project.

    @Tool(
            name = "generateWebsite",
            description = """
                    Generate a website for a project created during
                    the current voice request. Call createProject
                    first and use its exact returned project ID.
                    Use aiService for generation and file persistence.
                    """
    )
    public String generateWebsite(
            @ToolParam(
                    description = "The actual ID returned by createProject"
            )
            String projectId,

            @ToolParam(
                    description = "The user's complete website requirements"
            )
            String requirements
    ) {
        if (createdProjectId == null
                || !createdProjectId.equals(projectId)) {
            return "ERROR: Call createProject first and use the "
                    + "project ID it returned.";
        }

        if (requirements == null || requirements.isBlank()) {
            return "ERROR: Website requirements cannot be empty.";
        }

        try {
            aiResponseDto response = aiService.askAi(
                    requirements,
                    userId,
                    createdProjectId
            );

            if (response == null) {
                return "ERROR: Website generation returned no response.";
            }

            int fileCount = response.getFiles() == null
                    ? 0
                    : response.getFiles().size();

            if (fileCount == 0) {
                return "WARNING: The generator returned no files. "
                        + "Do not claim that the website is ready. "
                        + "Project ID: " + createdProjectId;
            }

            return """
                    Website generation completed.
                    Project ID: %s
                    Operation: %s
                    Files returned: %d
                    Generator message: %s
                    """.formatted(
                    createdProjectId,
                    response.getOperation(),
                    fileCount,
                    response.getMessage()
            );

        } catch (RuntimeException ex) {
            return "ERROR: Website generation failed. "
                    + ex.getMessage();
        }
    }

    // TOOL 3: Find and modify an existing project by its name.

    @Tool(
            name = "modifyProjectByName",
            description = """
                    Modify an existing AiWebGen website by its project name.
                    Use this for requests to change, update, fix, or improve
                    an existing project.

                    Extract the project's name from the user's instruction.
                    Pass the exact project name and the requested changes.
                    The backend finds the project belonging to the
                    authenticated user and resolves its actual ID.

                    Never ask the user for a project ID.
                    Never create a new project for a modification request.
                    Do not use createProject for an existing project.
                    """
    )
    public String modifyProjectByName(
            @ToolParam(
                    description = "Exact existing project name spoken by the user"
            )
            String projectName,

            @ToolParam(
                    description = "The requested changes to the website"
            )
            String requirements
    ) {
        if (projectName == null || projectName.isBlank()) {
            return "ERROR: The project name is missing. "
                    + "Ask the user which project they mean.";
        }

        if (requirements == null || requirements.isBlank()) {
            return "ERROR: The requested website changes are missing.";
        }

        try {
            // Find only projects belonging to this authenticated user.
            projects project =
                    projectService.findProjectForVoiceByName(
                            userId,
                            projectName.trim()
                    );

            // aiService loads this project's recent messages and files.
            aiResponseDto response = aiService.askAi(
                    requirements,
                    userId,
                    project.getProjectId()
            );

            if (response == null) {
                return "ERROR: The website generator returned no response.";
            }

            int fileCount = response.getFiles() == null
                    ? 0
                    : response.getFiles().size();

            if (fileCount == 0
                    && !"NO_CHANGE".equalsIgnoreCase(
                    response.getOperation())) {
                return """
                        WARNING: The generator returned no files.
                        Project name: %s
                        Do not claim that the requested changes are complete.
                        """.formatted(project.getProjectName());
            }

            return """
                    Existing project processed.
                    Project name: %s
                    Operation: %s
                    Files returned: %d
                    Generator message: %s
                    """.formatted(
                    project.getProjectName(),
                    response.getOperation(),
                    fileCount,
                    response.getMessage()
            );

        } catch (RuntimeException ex) {
            return "ERROR: " + ex.getMessage();
        }
    }
}













//package com.TrueCoders.aiwebgen.service;
//import com.TrueCoders.aiwebgen.entity.projects;
//
//import com.TrueCoders.aiwebgen.dto.aiResponseDto;
//import org.springframework.ai.tool.annotation.Tool;
//import org.springframework.ai.tool.annotation.ToolParam;
//
//public class voiceAgentTools {
//
//    private final String userId;
//    private final String selectedProjectId;
//
//    private final projectService projectService;
//    private final aiService aiService;
//
//    private String createdProjectId;
//
//    public voiceAgentTools(
//            String userId,
//            String selectedProjectId,
//            projectService projectService,
//            aiService aiService
//    ) {
//        this.userId = userId;
//        this.selectedProjectId = selectedProjectId;
//        this.projectService = projectService;
//        this.aiService = aiService;
//    }
//
//    // TOOL 1: Create a new project.
//
//    @Tool(
//            name = "createProject",
//            description = """
//                    Create a new AiWebGen project.
//                    Use this when the user explicitly requests
//                    a new project or a new website project.
//                    Returns the actual ID of the created project.
//                    """
//    )
//    public String createProject(
//            @ToolParam(
//                    description = "The name of the new project"
//            )
//            String projectName
//    ) {
//
//        if (projectName == null || projectName.isBlank()) {
//            return "ERROR: Project name cannot be empty.";
//        }
//
//        if (createdProjectId != null) {
//            return "ERROR: A project has already been created "
//                    + "during this voice request. Its ID is "
//                    + createdProjectId;
//        }
//
//        createdProjectId =
//                projectService.createProjectForVoice(
//                        userId,
//                        projectName.trim()
//                );
//
//        return """
//                Project created successfully.
//                Project name: %s
//                Project ID: %s
//                You can now call generateWebsite using this ID.
//                """.formatted(
//                projectName.trim(),
//                createdProjectId
//        );
//    }
//
//    // TOOL 2: Generate a website for a project.
//
//    @Tool(
//            name = "generateWebsite",
//            description = """
//                    Generate a new website for a project that
//                    was just created during this voice request.
//                    Call createProject first and use the exact
//                    project ID returned by that tool.
//                    Delegate all code generation and file saving
//                    to the existing aiService.askAi method.
//                    """
//    )
//    public String generateWebsite(
//            @ToolParam(
//                    description = "The actual project ID returned "
//                            + "by createProject"
//            )
//            String projectId,
//
//            @ToolParam(
//                    description = "The complete website requirements "
//                            + "spoken by the user"
//            )
//            String requirements
//    ) {
//
//        if (createdProjectId == null
//                || !createdProjectId.equals(projectId)) {
//
//            return "ERROR: This project was not created by "
//                    + "the current voice request. "
//                    + "Use the project ID returned by createProject.";
//        }
//
//        if (requirements == null || requirements.isBlank()) {
//            return "ERROR: Website requirements cannot be empty.";
//        }
//
//        aiResponseDto response = aiService.askAi(
//                requirements,
//                userId,
//                createdProjectId
//        );
//
//        if (response == null) {
//            return "ERROR: Website generation returned no response.";
//        }
//
//        int fileCount = response.getFiles() == null
//                ? 0
//                : response.getFiles().size();
//
//        if (fileCount == 0
//                && "CREATE".equalsIgnoreCase(response.getOperation())) {
//
//            return "WARNING: The AI did not return any website files. "
//                    + "Do not claim that the website is ready. "
//                    + "Project ID: " + createdProjectId;
//        }
//
//        return """
//                Website generation finished.
//                Project ID: %s
//                Operation: %s
//                Files returned: %d
//                Generator message: %s
//                """.formatted(
//                createdProjectId,
//                response.getOperation(),
//                fileCount,
//                response.getMessage()
//        );
//    }
//
//    // TOOL 3: Modify the currently selected project.
//
//    @Tool(
//            name = "modifyProjectByName",
//            description = """
//        Modify an existing website by its spoken project name.
//        Use this when the user requests changes to an existing project.
//        Extract the exact project name from the user's instruction.
//        The backend resolves the project ID securely.
//        Never ask the user for a project ID.
//        Do not create a project for a modification request.
//        """
//    )
//    public String modifyProjectByName(
//            @ToolParam(
//                    description = "Exact existing project name mentioned by the user"
//            )
//            String projectName,
//
//            @ToolParam(
//                    description = "The requested changes to the website"
//            )
//            String requirements
//    ) {
//        if (projectName == null || projectName.isBlank()) {
//            return "ERROR: Ask the user which project they want to modify.";
//        }
//
//        if (requirements == null || requirements.isBlank()) {
//            return "ERROR: The requested changes are empty.";
//        }
//
//        try {
//            projects project =
//                    projectService.findProjectForVoiceByName(
//                            userId,
//                            projectName
//                    );
//
//            aiResponseDto response = aiService.askAi(
//                    requirements,
//                    userId,
//                    project.getProjectId()
//            );
//
//            if (response == null) {
//                return "ERROR: The website generator returned no response.";
//            }
//
//            int fileCount = response.getFiles() == null
//                    ? 0
//                    : response.getFiles().size();
//
//            return """
//                Existing project processed.
//                Project name: %s
//                Project ID: %s
//                Operation: %s
//                Files returned: %d
//                Generator message: %s
//                """.formatted(
//                    project.getProjectName(),
//                    project.getProjectId(),
//                    response.getOperation(),
//                    fileCount,
//                    response.getMessage()
//            );
//
//        } catch (RuntimeException ex) {
//            return "ERROR: " + ex.getMessage();
//        }
//    }
//}
//
