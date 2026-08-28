package com.TrueCoders.aiwebgen.entity;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;


@Entity
@Getter
@Setter
@NoArgsConstructor
public class projectFiles {

    @Id
    private String projectFilesId;
    private String path;
    @Column(columnDefinition = "TEXT")
    private String content;
    private String language;
    private String version;
    @ManyToOne
    @JoinColumn(name = "project_id")
    private projects projects;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
