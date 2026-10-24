package com.TrueCoders.aiwebgen.service;

import com.TrueCoders.aiwebgen.Repository.projectsRepository;
import com.TrueCoders.aiwebgen.Repository.userRepository;
import com.TrueCoders.aiwebgen.dto.getProjectDto;
import com.TrueCoders.aiwebgen.dto.projectDto;
import com.TrueCoders.aiwebgen.entity.projects;
import com.TrueCoders.aiwebgen.entity.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class projectService {

    private final projectsRepository projectsRepository;
    private final userRepository userRepository;


    // =========================================================
    // SAVE PROJECT
    // =========================================================

    public String addProject(projectDto projectDto) {

        // Generate project ID
        String projectId = UUID.randomUUID().toString();

        // Find the user who owns this project
        user user = userRepository.findById(projectDto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create entity object
        projects project = new projects();

        // DTO -> Entity
        project.setProjectId(projectId);
        project.setProjectName(projectDto.getProjectName());

        // Connect project with user
        project.setUser(user);

        // Save entity
        projectsRepository.save(project);

        return "Project added successfully";
    }


    // =========================================================
    // GET ONE PROJECT
    // =========================================================

    public getProjectDto getProject(String projectId) {

        projects project = projectsRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Entity -> DTO
        getProjectDto result = new getProjectDto();

        result.setProjectId(project.getProjectId());
        result.setProjectName(project.getProjectName());
        result.setUserId(project.getUser().getUserid());

        return result;
    }


    // =========================================================
    // GET ALL PROJECTS OF ONE USER
    // =========================================================

    public List<getProjectDto> getProjectsByUser(String userId) {

        // Get all projects belonging to this user
        List<projects> projectsList =
                projectsRepository.findByUser_Userid(userId);

        // This list will contain our DTOs
        List<getProjectDto> result = new ArrayList<>();

        // Entity -> DTO
        for (projects project : projectsList) {

            getProjectDto dto = new getProjectDto();

            dto.setProjectId(project.getProjectId());
            dto.setProjectName(project.getProjectName());
            dto.setUserId(project.getUser().getUserid());

            result.add(dto);
        }

        return result;
    }


    public String createProjectForVoice(
            String userId,
            String projectName
    ) {
        if (projectName == null || projectName.isBlank()) {
            throw new IllegalArgumentException(
                    "Project name cannot be empty"
            );
        }

        user user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        projects project = new projects();

        String projectId = UUID.randomUUID().toString();

        project.setProjectId(projectId);
        project.setProjectName(projectName.trim());
        project.setUser(user);

        projectsRepository.save(project);

        return projectId;
    }

    public projects findProjectForVoiceByName(
            String userId,
            String projectName
    ) {
        if (projectName == null || projectName.isBlank()) {
            throw new IllegalArgumentException(
                    "Project name cannot be empty."
            );
        }

        List<projects> matches =
                projectsRepository
                        .findByUser_UseridAndProjectNameIgnoreCase(
                                userId,
                                projectName.trim()
                        );

        if (matches.isEmpty()) {
            throw new RuntimeException(
                    "No project named '" + projectName
                            + "' was found in your account."
            );
        }

        if (matches.size() > 1) {
            throw new RuntimeException(
                    "Multiple projects named '" + projectName
                            + "' exist. Please specify a more distinct name."
            );
        }

        return matches.get(0);
    }
}