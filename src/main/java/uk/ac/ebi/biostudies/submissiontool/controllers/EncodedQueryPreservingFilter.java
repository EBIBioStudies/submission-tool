package uk.ac.ebi.biostudies.submissiontool.controllers;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Enumeration;

@Component
@Order(1)
@WebFilter(urlPatterns = "/api/*")
public class EncodedQueryPreservingFilter implements Filter {

    @Value("${backend.url}")
    private String backendUrl;

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) servletRequest;
        HttpServletResponse res = (HttpServletResponse) servletResponse;

        String encodedQuery = req.getQueryString();
        String path = req.getRequestURI().replaceFirst("/api", "");  // Strip /api prefix
        String fullUrl = backendUrl + path + (encodedQuery != null ? "?" + encodedQuery : "");

        if ("GET".equalsIgnoreCase(req.getMethod())) {
            HttpURLConnection connection = (HttpURLConnection) new URL(fullUrl).openConnection();
            connection.setRequestMethod("GET");

            // Copy headers
            Enumeration<String> headerNames = req.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                connection.setRequestProperty(headerName, req.getHeader(headerName));
            }

            res.setStatus(connection.getResponseCode());
            connection.getInputStream().transferTo(res.getOutputStream());
        } else {
            chain.doFilter(servletRequest, servletResponse);
        }
    }
}
