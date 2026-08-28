//package com.TrueCoders.aiwebgen.service;
//
//
//import com.TrueCoders.aiwebgen.Repository.userRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import com.TrueCoders.aiwebgen.dto.userDto;
//import com.TrueCoders.aiwebgen.entity.user;
//
//import java.util.Optional;
//import java.util.UUID;
//import com.TrueCoders.aiwebgen.dto.getUserDetailsDto;
//import org.springframework.security.crypto.password.PasswordEncoder;
//
//@Service
//public class userService {
//    private userRepository userRepository;
//
//
//    //dependency injection of repository class-constructor DI
//    @Autowired
//    public userService(userRepository userRepository){
//        this.userRepository=userRepository;
//    }
//
//    public String addUser(userDto userDto){
//            //make or generate id of user first
//        String userid = UUID.randomUUID().toString();
//        //make entity object.only entity object we can store using jpa repository
//            user user=new user();
//            user.setUserid(userid);
//            user.setUsername(userDto.getUsername());
//            user.setEmailId(userDto.getEmailId());
//            user.setPassword(userDto.getPassword());
//            //save to db
//            userRepository.save(user);
//
//        return "user added successfully!";
//    }
//
//
//    public getUserDetailsDto getUser(String userId) {
//        Optional<user> optionalUser = userRepository.findById(userId);
//        if (optionalUser.isPresent()) {
//            user user = optionalUser.get();
//            getUserDetailsDto result = new getUserDetailsDto();
//            result.setUsername(user.getUsername());
//            result.setUserid(user.getUserid());
//            result.setEmailId(user.getEmailId());
//            return result;
//        } else {
//            return null;
//        }
//    }
//}
//




package com.TrueCoders.aiwebgen.service;

import com.TrueCoders.aiwebgen.Repository.userRepository;
import com.TrueCoders.aiwebgen.dto.getUserDetailsDto;
import com.TrueCoders.aiwebgen.dto.loginResponseDto;
import com.TrueCoders.aiwebgen.dto.userDto;
import com.TrueCoders.aiwebgen.entity.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;
import com.TrueCoders.aiwebgen.security.jwtService;


@Service
public class userService {

    private final userRepository userRepository;

    private final PasswordEncoder passwordEncoder;//from passwordConfig
    private final jwtService jwtService;


    // ============================================================
    // CONSTRUCTOR DI
    // ============================================================

    @Autowired
    public userService(
            userRepository userRepository,
            PasswordEncoder passwordEncoder,
            jwtService jwtService
    ) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }


    // ============================================================
    // SIGN UP
    // ============================================================

    public String addUser(userDto userDto) {

        // Generate user ID
        String userid = UUID.randomUUID().toString();


        // Create entity
        user user = new user();

        user.setUserid(userid);

        user.setUsername(
                userDto.getUsername()
        );

        user.setEmailId(
                userDto.getEmailId()
        );


        // ========================================================
        // HASH PASSWORD
        // ========================================================

        String hashedPassword =
                passwordEncoder.encode(
                        userDto.getPassword()
                );

        user.setPassword(
                hashedPassword
        );


        // Save to database
        userRepository.save(user);


        return "user added successfully!";
    }


    // ============================================================
    // LOGIN
    // ============================================================

    public loginResponseDto login(
            String emailId,
            String password
    ) {

        // Find user using email
        user user = userRepository
                .findByEmailId(emailId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid email or password"
                        )
                );


        // ========================================================
        // CHECK PASSWORD
        // ========================================================

        boolean passwordMatches =
                passwordEncoder.matches(
                        password,
                        user.getPassword()
                );


        if (!passwordMatches) {

            throw new RuntimeException(
                    "Invalid email or password"
            );
        }


        // ========================================================
        // JWT WILL BE GENERATED HERE
        // ========================================================

//        String token = "TEMP_TOKEN";
            String token =
                jwtService.generateToken(
                        user.getUserid()
                );

        // Return login response
        return new loginResponseDto(
                token,
                user.getUserid(),
                user.getUsername()
        );
    }


    // ============================================================
    // GET USER
    // ============================================================

    public getUserDetailsDto getUser(String userId) {

        Optional<user> optionalUser =
                userRepository.findById(userId);


        if (optionalUser.isPresent()) {

            user user = optionalUser.get();

            getUserDetailsDto result =
                    new getUserDetailsDto();

            result.setUsername(
                    user.getUsername()
            );

            result.setUserid(
                    user.getUserid()
            );

            result.setEmailId(
                    user.getEmailId()
            );

            return result;

        } else {

            return null;
        }
    }
}
