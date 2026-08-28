package com.TrueCoders.aiwebgen.service;

import com.TrueCoders.aiwebgen.Repository.projectFilesRepository;
import com.TrueCoders.aiwebgen.Repository.projectsRepository;
import com.TrueCoders.aiwebgen.dto.getProjectFilesDto;
import com.TrueCoders.aiwebgen.dto.projectFilesDto;
import com.TrueCoders.aiwebgen.entity.projectFiles;
import com.TrueCoders.aiwebgen.entity.projects;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class projectFilesService {

    private final projectFilesRepository projectFilesRepository;
    private final projectsRepository projectsRepository;


    // =========================================================
    // SAVE PROJECT FILE
    // =========================================================

    public String addProjectFile(projectFilesDto projectFilesDto) {

        // Generate ID
        String projectFilesId = UUID.randomUUID().toString();

        // Find project
        projects project = projectsRepository.findById(projectFilesDto.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Create entity
        projectFiles projectFile = new projectFiles();

        // DTO -> Entity
        projectFile.setProjectFilesId(projectFilesId);
        projectFile.setPath(projectFilesDto.getPath());
        projectFile.setContent(projectFilesDto.getContent());
        projectFile.setLanguage(projectFilesDto.getLanguage());
        projectFile.setVersion(projectFilesDto.getVersion());

        // Connect file with project
        projectFile.setProjects(project);

        // Save
        projectFilesRepository.save(projectFile);

        return "Project file added successfully";
    }


    // =========================================================
    // GET ONE PROJECT FILE
    // =========================================================

    public getProjectFilesDto getProjectFile(String projectFilesId) {

        projectFiles projectFile = projectFilesRepository.findById(projectFilesId)
                .orElseThrow(() -> new RuntimeException("Project file not found"));

        // Entity -> DTO
        getProjectFilesDto result = new getProjectFilesDto();

        result.setProjectFilesId(projectFile.getProjectFilesId());
        result.setPath(projectFile.getPath());
        result.setContent(projectFile.getContent());
        result.setLanguage(projectFile.getLanguage());
        result.setVersion(projectFile.getVersion());
        result.setProjectId(projectFile.getProjects().getProjectId());

        return result;
    }


    // =========================================================
    // GET ALL FILES OF ONE PROJECT
    // =========================================================

    public List<getProjectFilesDto> getProjectFilesByProject(String projectId) {

        // Get all files belonging to this project
        List<projectFiles> projectFilesList =
                projectFilesRepository.findByProjects_ProjectId(projectId);

        // DTO list
        List<getProjectFilesDto> result = new ArrayList<>();

        // Entity -> DTO
        for (projectFiles projectFile : projectFilesList) {

            getProjectFilesDto dto = new getProjectFilesDto();

            dto.setProjectFilesId(projectFile.getProjectFilesId());
            dto.setPath(projectFile.getPath());
            dto.setContent(projectFile.getContent());
            dto.setLanguage(projectFile.getLanguage());
            dto.setVersion(projectFile.getVersion());
            dto.setProjectId(projectFile.getProjects().getProjectId());

            result.add(dto);
        }

        return result;
    }
}