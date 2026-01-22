package uk.ac.ebi.biostudies.submissiontool.controllers;

import java.util.Map;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/biostudies/submissions")
@CrossOrigin(origins = "*")
public class RorController {

  private final WebClient webClient;

  public RorController(WebClient.Builder builder) {
    this.webClient = builder.baseUrl("https://api.ror.org").build();
  }

  @GetMapping("/ror/organizations")
  public Mono<Map<String, Object>> getOrganizations(@RequestParam String query) {
    return webClient.get()
        .uri(uriBuilder -> uriBuilder.path("/v2/organizations").queryParam("query", query).build())
        .retrieve().bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
        });
  }
}