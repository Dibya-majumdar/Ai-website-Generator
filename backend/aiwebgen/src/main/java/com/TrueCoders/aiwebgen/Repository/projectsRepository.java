package com.TrueCoders.aiwebgen.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.TrueCoders.aiwebgen.entity.projects;

import java.util.List;

public interface projectsRepository extends JpaRepository<projects,String> {
    List<projects> findByUser_Userid(String userid);
}


