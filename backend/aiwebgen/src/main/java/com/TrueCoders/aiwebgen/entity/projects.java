package com.TrueCoders.aiwebgen.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class projects {

    @Id
    private String projectId;

    private String projectName;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private user user;

    @OneToMany(mappedBy = "projects")
    private List<projectFiles> projectFilesList = new ArrayList<>();

    @OneToMany(mappedBy = "projects")
    private List <messages>messagesList=new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}