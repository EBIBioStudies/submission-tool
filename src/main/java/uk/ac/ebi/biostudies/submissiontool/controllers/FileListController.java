package uk.ac.ebi.biostudies.submissiontool.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.http.ContentDisposition;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/biostudies/submissions")
public class FileListController {

  private static final Logger log = LoggerFactory.getLogger(FileListController.class);

  public static final String SESSION_HEADER = "x-session-token";

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

    // Add header first
    DataBuffer headerBuffer = bufferFactory.wrap("Files\n".getBytes(StandardCharsets.UTF_8));
    Flux<DataBuffer> initialFlux = Flux.just(headerBuffer);

    return Flux.concat(initialFlux,
            getFilesReactive(path, token)
                .onErrorResume(e -> {
                  log.error("Error generating filelist for path: {}", path, e);
                  return Flux.just(
                      "Error generating filelist \t Please send this file to biostudies@ebi.ac.uk to help us fix the issue.",
                      "Message \t " + e.getMessage() + " [path=" + path + " ]",
                      "Cause \t " + e.getCause().toString(),
                      "Stacktrace \t " + Arrays.stream(e.getStackTrace()).map(StackTraceElement::toString).collect(Collectors.joining("\n\t"))
                  );
                })
                .map(line -> bufferFactory.wrap((line + "\n").getBytes(StandardCharsets.UTF_8))))
        .as(response::writeWith);
  }

  private Flux<String> getFilesReactive(String path, String token) {
    WebClient webClient = WebClient.builder()
        .baseUrl(environments.getProperty("backend.url"))
        .defaultHeader(SESSION_HEADER, token)
        .build();

    URI uri = UriComponentsBuilder.fromHttpUrl(environments.getProperty("backend.url"))
        .path("/files/user/query")
        .build(false) // disables encoding to preserve slashes
        .toUri();

    if (path.startsWith("/")) {
      path = path.substring(1);
    }

    return webClient.post()
        .uri(uri)
        .contentType(MediaType.APPLICATION_JSON)
        .bodyValue(Collections.singletonMap("path", path))
        .retrieve()
        .bodyToFlux(JsonNode.class)
        .flatMap(entry -> {
          String sanitizedPath = entry.get("path").asText() + "/" + entry.get("name").asText();
          if (sanitizedPath.startsWith("user/")) {
            sanitizedPath = sanitizedPath.substring("user/".length());
          }
          if ("FILE".equalsIgnoreCase(entry.get("type").asText())) {
            return Flux.just(sanitizedPath);
          } else if ("DIR".equalsIgnoreCase(entry.get("type").asText())) {
            return getFilesReactive(sanitizedPath, token);
          } else {
            return Flux.empty();
          }
        });
  }
}
