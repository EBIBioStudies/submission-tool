package uk.ac.ebi.biostudies.submissiontool.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.http.ContentDisposition;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/biostudies/submissions")
public class FileListController {

  public static final String SESSION_HEADER = "x-session-token";
  private final ObjectMapper objectMapper = new ObjectMapper();
  @Autowired
  private Environment environments;

  @CrossOrigin(origins = "*")
  @GetMapping(value = "/filelist/{*path}", produces = MediaType.TEXT_PLAIN_VALUE)
  public Mono<Void> getFileList(@PathVariable String path,
      @RequestHeader(SESSION_HEADER) String token,
      ServerHttpResponse response) {
    response.getHeaders().setContentType(MediaType.TEXT_PLAIN);
    response.getHeaders().setContentDisposition(
        ContentDisposition.attachment()
            .filename(path.substring(path.lastIndexOf('/') + 1) + ".tsv")
            .build());

    DataBufferFactory bufferFactory = response.bufferFactory();

    return getFilesReactive("user" + path, token)
        .map(line -> bufferFactory.wrap((line + "\n").getBytes(StandardCharsets.UTF_8)))
        .as(bufferFlux -> response.writeWith(bufferFlux))
        .onErrorResume(e -> {
          DataBuffer errorBuffer = bufferFactory.wrap(
              "Error generating filelist\n".getBytes(StandardCharsets.UTF_8));
          return response.writeWith(Mono.just(errorBuffer));
        });
  }

  private Flux<String> getFilesReactive(String path, String token) {
    WebClient webClient = WebClient.builder()
        .baseUrl(environments.getProperty("backend.url"))
        .defaultHeader(SESSION_HEADER, token)
        .build();

    // Construct full URI with base URL to avoid localhost fallback
    String fullPath;
    if (path.startsWith("user/")) {
      fullPath = path;
    } else {
      fullPath = "user/" + path;
    }

    URI uri = UriComponentsBuilder.fromHttpUrl(environments.getProperty("backend.url"))
        .path("/files/")
        .path(fullPath)
        .build(false) // disables encoding to preserve slashes
        .toUri();

    return webClient.get()
        .uri(uri)
        .retrieve()
        .bodyToMono(String.class)
        .flatMapMany(body -> {
          try {
            JsonNode[] files = objectMapper.readValue(body, JsonNode[].class);
            return Flux.fromArray(files);
          } catch (Exception e) {
            return Flux.error(e);
          }
        })
        .flatMap(entry -> {
          if ("FILE".equalsIgnoreCase(entry.get("type").asText())) {
            String sanitizedPath = entry.get("path").asText() + "/" + entry.get("name").asText();
            if (sanitizedPath.startsWith("user/")) {
              sanitizedPath = sanitizedPath.substring(5);
            }
            return Flux.just(sanitizedPath);
          } else if ("DIR".equalsIgnoreCase(entry.get("type").asText())) {
            String nextPath = entry.get("path").asText() + "/" + entry.get("name").asText();
            return getFilesReactive(nextPath, token);
          } else {
            return Flux.empty();
          }
        });
  }
}
