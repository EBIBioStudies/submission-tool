package uk.ac.ebi.biostudies.submissiontool.controllers;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
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

        String rawRequestURI = request.getRequestURI(); // decoded path (OK)
        String rawQueryString = request.getQueryString(); // raw (encoded) query string

        if (rawRequestURI.startsWith(externalPath)) {
            String internalPath = rawRequestURI.replaceFirst(externalPath, "");
            if (rawQueryString != null) {
                internalPath += "?" + rawQueryString;
            }

            request.getRequestDispatcher(internalPath).forward(request, response);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
