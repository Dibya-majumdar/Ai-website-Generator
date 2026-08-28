package com.TrueCoders.aiwebgen.controller;

import com.TrueCoders.aiwebgen.dto.getProjectFilesDto;
import com.TrueCoders.aiwebgen.dto.projectFilesDto;
import com.TrueCoders.aiwebgen.service.projectFilesService;

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
@RequestMapping("/api/project-files")
@RequiredArgsConstructor
public class projectFilesController {

    private final projectFilesService projectFilesService;


    @PostMapping
    public ResponseEntity<String> addProjectFile(
            @RequestBody projectFilesDto projectFilesDto
    ) {

        return ResponseEntity.ok(
                projectFilesService.addProjectFile(
                        projectFilesDto
                )
        );
    }


    @GetMapping("/{projectFilesId}")
    public ResponseEntity<getProjectFilesDto> getProjectFile(
            @PathVariable String projectFilesId
    ) {

        return ResponseEntity.ok(
                projectFilesService.getProjectFile(
                        projectFilesId
                )
        );
    }


    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<getProjectFilesDto>>
    getProjectFilesByProject(
            @PathVariable String projectId
    ) {

        return ResponseEntity.ok(
                projectFilesService.getProjectFilesByProject(
                        projectId
                )
        );
    }
}
