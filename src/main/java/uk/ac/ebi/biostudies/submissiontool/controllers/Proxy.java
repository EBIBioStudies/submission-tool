package uk.ac.ebi.biostudies.submissiontool.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RequestCallback;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.Objects;

@Controller
public class Proxy {

    public static final String SESSION_HEADER = "x-session-token";
    private static final String[] ALLOWED_URLS = {"/api/login", "/api/logout"};

    private final Environment environments;
    private final RestTemplate restTemplate;

    public Proxy(RestTemplate restTemplate, Environment environments) {
        this.restTemplate = restTemplate;
        this.environments = environments;
    }

//    @CrossOrigin(origins = "http://localhost:5173")
//    @PostMapping(value = "/api/{*path}")
//    public ResponseEntity<String> postFile(@PathVariable String path, @RequestParam("file") MultipartFile file, @RequestHeader(SESSION_HEADER) String token) throws Exception {
//        String url = "%s/%s".formatted(environments.getProperty("backend.url"), path.startsWith("/") ? path.substring(1) : path);
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.set(SESSION_HEADER, token);
//        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
//
//        MultiValueMap<String, Object> bodyMap = new LinkedMultiValueMap<>();
//        bodyMap.add("file", file);
//
//        HttpEntity<MultiValueMap<String, Object>> httpEntity = new HttpEntity<>(bodyMap, headers);
//
//        String resp;
//        try {
//            resp = restTemplate.postForObject(url, httpEntity, String.class);
//        } catch (HttpStatusCodeException e) {
//            e.printStackTrace();
//            return ResponseEntity.status(e.getStatusCode()).headers(e.getResponseHeaders()).body(e.getResponseBodyAsString());
//        }
//        return ResponseEntity.ok(resp);
//    }
//
//    @CrossOrigin(origins = "http://localhost:5173")
//    @PostMapping(value = "/api/{*path}", produces = MediaType.APPLICATION_JSON_VALUE)
//    public ResponseEntity<String> postResponse(@PathVariable String path, @RequestBody(required = false) String body ) throws Exception {
//        String url = "%s/%s".formatted(environments.getProperty("backend.url"), path.startsWith("/") ? path.substring(1) : path);
//        Map<String, Object> jsonObject = new ObjectMapper().readValue(body, Map.class);
//        String response;
//        try {
//            response = restTemplate.postForObject(url, jsonObject, String.class);
//        } catch (HttpStatusCodeException e) {
//            return ResponseEntity.status(e.getStatusCode()).headers(e.getResponseHeaders()).body(e.getResponseBodyAsString());
//        }
//        return ResponseEntity.ok(response);
//    }

    @CrossOrigin(origins = "http://localhost:5173")
    @RequestMapping(value = {
            "/api/files/**",
            "/api/submissions/drafts/**",
            "/api/submissions",
            "/api/auth/login",
            "/api/auth/logout"

    }, method = {RequestMethod.GET, RequestMethod.DELETE, RequestMethod.POST, RequestMethod.PUT, RequestMethod.OPTIONS})
    public void getResponse(@RequestParam(required = false) MultipartFile files,
                            @RequestBody(required = false) String requestBody,
                            HttpServletRequest request,
                            HttpServletResponse response) throws Exception {


        // Test code starts. Serve local version if it exists
        // TODO: Remove this
        String accession  = request.getRequestURI().split("/")[request.getRequestURI().split("/").length-2];
        Resource resource = new ClassPathResource(accession+".json");
        if (resource.exists()) {
            byte[] fileData = Files.readAllBytes(resource.getFile().toPath());
            String jsonContent = new String(fileData);
            response.getWriter().print(jsonContent);
            response.flushBuffer();
            return;
        }
        // Test code ends


        String url = "%s/%s".formatted(environments.getProperty("backend.url"), request.getRequestURI().substring(5));
        if (request.getQueryString() != null) url += "?" + request.getQueryString();

        HttpHeaders headers = new HttpHeaders();
        headers.set(SESSION_HEADER, request.getHeader(SESSION_HEADER));
        Collections.list(request.getHeaderNames()).forEach(header -> headers.set(header, String.join(",", request.getHeader(header) )));

        MultiValueMap<String, Object> bodyMap = new LinkedMultiValueMap<>();
        if (files!=null) {
            bodyMap.add("files", new ByteArrayResource(files.getBytes()) {
                @Override
                public String getFilename() {
                    return files.getOriginalFilename();
                }
            });
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        }

        HttpEntity httpEntity = new HttpEntity( files!=null ? bodyMap : requestBody , headers);
        ResponseEntity<Resource> resp;
        ServletOutputStream out = response.getOutputStream();
        try {
            resp = restTemplate.exchange(url, HttpMethod.valueOf(request.getMethod()), httpEntity, Resource.class);
            response.setStatus(resp.getStatusCode().value());
            resp.getHeaders().forEach((header, values) -> response.setHeader(header, String.join(",", values))); // https://www.rfc-editor.org/rfc/rfc7230#section-3.2.2
            if (resp.hasBody())
                IOUtils.copyLarge(Objects.requireNonNull(resp.getBody()).getInputStream(), out);
        } catch (HttpStatusCodeException e) {
            response.sendError(e.getStatusCode().value(), e.getResponseBodyAsString());
            System.err.println("Error: "+ url );
            e.printStackTrace();
        }
        out.flush();
    }

//    @CrossOrigin(origins = "http://localhost:5173")
//    @GetMapping(value = "/api/study/{accession}", produces = MediaType.APPLICATION_JSON_VALUE)
//    public ResponseEntity<String> getStudy(@PathVariable String accession) throws Exception {
//        Resource resource = new ClassPathResource(accession + ".json");
//        if (resource.exists()) {
//            byte[] fileData = Files.readAllBytes(resource.getFile().toPath());
//            String jsonContent = new String(fileData);
//            return ResponseEntity.ok(jsonContent);
//        }
//        RestTemplate restTemplate = new RestTemplate();
//        String url = "https://www.ebi.ac.uk/biostudies/files/%s/%s.json".formatted(accession, accession);
//        String body = restTemplate.getForObject(url, String.class);
//        return ResponseEntity.ok(body);
//    }

    @RequestMapping(value = {"/signin/**", "/edit/**", "/files/**", "/help/**", "/logout/**"})
    public String redirect() {
        return "forward:/";
    }

}
