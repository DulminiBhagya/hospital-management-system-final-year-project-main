package com.HMS.HMS.config;

import com.HMS.HMS.util.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Auth endpoints
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/register").hasRole("ADMIN")
                        .requestMatchers("/api/auth/allUsers").hasRole("ADMIN")
                        .requestMatchers("/api/auth/update/**").hasRole("ADMIN")
                        .requestMatchers("/api/auth/delete/**").hasRole("ADMIN")

                        // Specific patient endpoint for WARD_NURSE
//                        .requestMatchers("/api/patients/all").hasRole("WARD_NURSE")

                        // Patient endpoints - all require CLINIC_NURSE role
                                .requestMatchers("/api/transfers/**").permitAll()
                                .requestMatchers("/api/reports/admissions/**").permitAll()
                                .requestMatchers("/api/pharmacy/medications/**").permitAll()
                                .requestMatchers("/api/reports/medications/**").permitAll()
                        .requestMatchers("/api/patients/**").hasAnyRole("CLINIC_NURSE","WARD_NURSE")
                        .requestMatchers("/api/doctors/**").hasRole("CLINIC_NURSE")
                        .requestMatchers("/api/appointments/**").hasRole("CLINIC_NURSE")
                        .requestMatchers("/api/admissions/**").hasRole("WARD_NURSE")
                        .requestMatchers("/api/wards/getAll").hasRole("WARD_NURSE")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}