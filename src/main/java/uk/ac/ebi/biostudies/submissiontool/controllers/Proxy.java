package uk.ac.ebi.biostudies.submissiontool.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.util.Collections;
import java.util.Objects;

@Controller
public class Proxy {

    public static final String SESSION_HEADER = "x-session-token";

    private final Environment environments;
    private final RestTemplate restTemplate;
    Logger logger = LoggerFactory.getLogger(Proxy.class);

    public Proxy(RestTemplate restTemplate, Environment environments) {
        this.restTemplate = restTemplate;
        this.environments = environments;
    }
    @CrossOrigin(origins = "*")
    @RequestMapping(value = {
            "/api/files/**",
            "/api/submissions/drafts/**",
            "/api/submissions",
            "/api/auth/login",
            "/api/auth/logout",
            "/api/auth/activate",
            "/api/auth/retryact",
            "/api/auth/password/reset",
            "/api/auth/register"
    }, method = {RequestMethod.GET, RequestMethod.DELETE, RequestMethod.POST, RequestMethod.PUT})
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

        // Add existing headers
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

        HttpEntity<Object> httpEntity = new HttpEntity<>( files!=null ? bodyMap : getUpdatedRequestBody(url, requestBody) , headers);
        ResponseEntity<Resource> resp;
        ServletOutputStream out = response.getOutputStream();
        try {
            logger.debug("Proxying {}", url);
            resp = restTemplate.exchange(url, HttpMethod.valueOf(request.getMethod()), httpEntity, Resource.class);
            response.setStatus(resp.getStatusCode().value());
            resp.getHeaders().forEach((header, values) -> {
                if (header!=null && !header.equalsIgnoreCase("Transfer-Encoding"))// must not return chunked data or the fetch request will wait
                    response.setHeader(header, String.join(",", values));
            }); // https://www.rfc-editor.org/rfc/rfc7230#section-3.2.2
            if (resp.hasBody())
                IOUtils.copyLarge(Objects.requireNonNull(resp.getBody()).getInputStream(), out);
        } catch (HttpStatusCodeException e) {
            response.setStatus(e.getStatusCode().value());
            e.getResponseHeaders().forEach((header, values) -> {
                    response.setHeader(header, String.join(",", values));
            });
            out.print(e.getResponseBodyAsString());
            System.err.println("Error: "+ url );
            e.printStackTrace();
        }
        out.flush();
        out.close();
        logger.debug("Proxied {}", url);
    }

    private String getUpdatedRequestBody(String url, String requestBody) {
        if (url.contains("/auth/retryact") || url.contains("/auth/activation") || url.contains("password/reset")) {
            requestBody = requestBody.substring(0,requestBody.length()-1)
                    + ", \"instanceKey\":\""+ environments.getProperty("backend.instance-key") +"\"}";
        }
        return requestBody;
    }

    @RequestMapping(value = {
            "/signin/**",
            "/signup/**",
            "/reset/**",
            "/activation/**",
            "/drafts/**",
            "/edit/**",
            "/files/**",
            "/help/**",
            "/logout/**"})
    public String redirect() {
        return "forward:/";
    }

}
