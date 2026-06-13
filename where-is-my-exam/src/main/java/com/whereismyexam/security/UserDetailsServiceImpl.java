package com.whereismyexam.security;

import com.whereismyexam.entity.User;
import com.whereismyexam.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository repository;

    public UserDetailsServiceImpl(UserRepository repository) {
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Support both username and email for login
        Optional<User> user = repository.findByUsername(username);
        if (user.isEmpty()) {
            user = repository.findByEmail(username);
        }

        return user.map(UserInfoDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("user not found with username or email: " + username));
    }
}
