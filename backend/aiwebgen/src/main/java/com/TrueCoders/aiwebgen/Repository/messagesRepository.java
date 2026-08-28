package com.TrueCoders.aiwebgen.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.TrueCoders.aiwebgen.entity.messages;

import java.util.List;


public interface messagesRepository extends JpaRepository<messages,String> {
    List<messages> findByProjects_ProjectId(String projectId);
    List<messages>
    findTop10ByProjects_ProjectIdOrderByCreatedAtDesc(
            String projectId);
}
