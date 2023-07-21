package uk.ac.ebi.biostudies.submissiontool.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Controller
public class Auth {

    @Autowired
    private Environment environments;

    @CrossOrigin(origins = "http://localhost:5173")
    @PostMapping(value = "/api/{*path}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getResponse(@PathVariable String path, @RequestBody String body) throws Exception {
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

}
