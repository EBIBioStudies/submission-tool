package uk.ac.ebi.biostudies.submissiontool.controllers;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class URLRewriteFilter extends OncePerRequestFilter {

    @Value("${app.external-path:/biostudies/submissions}")
    private String externalPath;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestURI = request.getRequestURI();

        if (requestURI.startsWith(externalPath)) {
            // Rewrite the request path by removing the externalPath
            String newURI = requestURI.replaceFirst(externalPath, "");

            // Forward the request internally
            request.getRequestDispatcher(newURI).forward(request, response);
            return;
        }

        filterChain.doFilter(request, response);
    }
}