package com.TrueCoders.aiwebgen.controller;

import com.TrueCoders.aiwebgen.dto.getProjectDto;
import com.TrueCoders.aiwebgen.dto.projectDto;
import com.TrueCoders.aiwebgen.service.projectService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class projectController {

    private final projectService projectService;

    @PostMapping
    public ResponseEntity<String> addProject(
            @RequestBody projectDto projectDto
    ) {

        return ResponseEntity.ok(
                projectService.addProject(projectDto)
        );
    }


    @GetMapping("/{projectId}")
    public ResponseEntity<getProjectDto> getProject(
            @PathVariable String projectId
    ) {

        return ResponseEntity.ok(
                projectService.getProject(projectId)
        );
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<List<getProjectDto>> getProjectsByUser(
            @PathVariable String userId
    ) {

        return ResponseEntity.ok(
                projectService.getProjectsByUser(userId)
        );
    }
}
