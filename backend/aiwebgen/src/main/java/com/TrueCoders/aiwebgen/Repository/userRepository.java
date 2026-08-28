package com.TrueCoders.aiwebgen.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.TrueCoders.aiwebgen.entity.user;
import java.util.Optional;


@Repository
public interface userRepository extends JpaRepository<user,String> {


    Optional<user> findByEmailId(String emailId);
}
