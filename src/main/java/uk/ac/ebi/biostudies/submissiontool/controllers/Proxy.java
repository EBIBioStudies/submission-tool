package uk.ac.ebi.biostudies.submissiontool.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Files;
import java.util.Map;

@Controller
public class Proxy {

    private final String SESSION_HEADER = "x-session-token";
    @Autowired
    private Environment environments;

    @CrossOrigin(origins = "http://localhost:5173")
    @PostMapping(value = "/api/{*path}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> postResponse(@PathVariable String path, @RequestBody String body) throws Exception {
        RestTemplate restTemplate = new RestTemplate();
        String url = "%s/%s".formatted(environments.getProperty("backend.url"), path.startsWith("/") ? path.substring(1) : path);
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
    @RequestMapping(value = "/api/**", produces = MediaType.ALL_VALUE, method = {RequestMethod.GET, RequestMethod.DELETE})
    public void getResponse(HttpServletRequest request,
                            HttpServletResponse response) throws Exception {
        RestTemplate restTemplate = new RestTemplate();
        String url = "%s/%s".formatted(environments.getProperty("backend.url"),
                request.getRequestURI().substring(5));
        if (request.getQueryString() != null) url += "?" + request.getQueryString();
        HttpHeaders headers = new HttpHeaders();
        headers.set(SESSION_HEADER, request.getHeader(SESSION_HEADER));
        HttpEntity httpEntity = new HttpEntity(headers);
        ResponseEntity<Resource> resp;
        ServletOutputStream out = response.getOutputStream();
        try {
            resp = restTemplate.exchange(url, HttpMethod.valueOf(request.getMethod()), httpEntity, Resource.class);
            response.setStatus(resp.getStatusCode().value());
            resp.getHeaders().forEach((header, values) -> response.setHeader(header, String.join(",", values))); // https://www.rfc-editor.org/rfc/rfc7230#section-3.2.2
            if (resp.hasBody())
                IOUtils.copyLarge(resp.getBody().getInputStream(), out);
        } catch (HttpStatusCodeException e) {
            response.sendError(e.getStatusCode().value(), e.getResponseBodyAsString());
        }
        out.flush();
    }

    @CrossOrigin(origins = "http://localhost:5173")
    @GetMapping(value = "/api/study/{accession}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getStudy(@PathVariable String accession) throws Exception {
        Resource resource = new ClassPathResource(accession + ".json");
        if (resource.exists()) {
            byte[] fileData = Files.readAllBytes(resource.getFile().toPath());
            String jsonContent = new String(fileData);
            return ResponseEntity.ok(jsonContent);
        }
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://www.ebi.ac.uk/biostudies/files/%s/%s.json".formatted(accession, accession);
        String body = restTemplate.getForObject(url, String.class);
        return ResponseEntity.ok(body);
    }

    @RequestMapping(value = {"/signin/**", "/edit/**", "/files/**", "/help/**", "/logout/**"})
    public String redirect() {
        return "forward:/";
    }

}
