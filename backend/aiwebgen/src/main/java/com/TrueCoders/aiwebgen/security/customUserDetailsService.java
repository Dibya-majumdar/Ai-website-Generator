package com.TrueCoders.aiwebgen.security;

import com.TrueCoders.aiwebgen.Repository.userRepository;
import com.TrueCoders.aiwebgen.entity.user;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class customUserDetailsService
        implements UserDetailsService {


    private final userRepository userRepository;


    @Override
    public UserDetails loadUserByUsername(
            String userId
    ) {

        user user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new UsernameNotFoundException(
                                        "User not found"
                                )
                        );


        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUserid())
                .password(user.getPassword())
                .roles("USER")
                .build();
    }
}