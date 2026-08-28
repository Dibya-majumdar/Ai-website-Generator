package com.TrueCoders.aiwebgen.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.TrueCoders.aiwebgen.entity.projectFiles;

import java.util.List;
import java.util.Optional;


public interface projectFilesRepository extends JpaRepository<projectFiles,String> {
    List<projectFiles> findByProjects_ProjectId(String projectId);


    Optional<projectFiles>
    findByProjects_ProjectIdAndPath(
            String projectId,
            String path
    );
}
