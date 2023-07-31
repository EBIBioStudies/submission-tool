package uk.ac.ebi.biostudies.submissiontool.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.*;

@Controller
public class Auth {

    private final String SESSION_HEADER = "x-session-token";
    @Autowired
    private Environment environments;

    @CrossOrigin(origins = "http://localhost:5173")
    @PostMapping(value = "/api/{*path}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> postResponse(@PathVariable String path, @RequestBody String body) throws Exception {
        RestTemplate restTemplate = new RestTemplate();
        String url = "%s/%s".formatted(environments.getProperty("backend.url"), path);
        Map<String, Object> jsonObject = new ObjectMapper().readValue(body, Map.class);
        String response;
        try {
            response = restTemplate.postForObject(url, jsonObject, String.class);
        } catch (HttpStatusCodeException e) {
            return ResponseEntity.status(e.getStatusCode()).headers(e.getResponseHeaders()).body(e.getResponseBodyAsString());
        }
        return ResponseEntity.ok(response);
    }

    @CrossOrigin(origins = "http://localhost:5173")
    @GetMapping(value = "/api/**", produces = MediaType.ALL_VALUE)
    public void getResponse(HttpServletRequest request,
                                              HttpServletResponse response) throws Exception {
        RestTemplate restTemplate = new RestTemplate();
        String url = "%s/%s".formatted(environments.getProperty("backend.url"),
                request.getRequestURI().substring(5));
        if (request.getQueryString() != null) url += "?" + request.getQueryString();
        HttpHeaders headers = new HttpHeaders();
        headers.set( SESSION_HEADER , request.getHeader(SESSION_HEADER));
        HttpEntity httpEntity = new HttpEntity(headers);
        ResponseEntity<Resource> resp;
        try {
            resp = restTemplate.exchange(url, HttpMethod.GET, httpEntity, Resource.class);
            resp.getHeaders().forEach((header, values) -> response.setHeader(header, String.join(",", values))); // https://www.rfc-editor.org/rfc/rfc7230#section-3.2.2
            IOUtils.copyLarge(resp.getBody().getInputStream(), response.getOutputStream());
        } catch (HttpStatusCodeException e) {
            response.sendError(e.getStatusCode().value(), e.getResponseBodyAsString());
        }
        return;
    }

}
