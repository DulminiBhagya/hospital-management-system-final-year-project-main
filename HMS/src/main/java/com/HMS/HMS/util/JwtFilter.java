package com.HMS.HMS.util;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if(header != null && header.startsWith("Bearer ")){
            String token = header.substring(7);
            Claims claims = jwtUtil.extractClaims(token);
            String empId = claims.getSubject();
            String role = (String) claims.get("role");

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(empId,null, List.of(new SimpleGrantedAuthority("ROLE_"+role)));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
        chain.doFilter(request,response);
    }
}
