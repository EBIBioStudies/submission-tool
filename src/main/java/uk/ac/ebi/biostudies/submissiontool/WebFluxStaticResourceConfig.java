package uk.ac.ebi.biostudies.submissiontool;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.ServerResponse;

import static org.springframework.web.reactive.function.server.RequestPredicates.GET;
import static org.springframework.web.reactive.function.server.RouterFunctions.route;
import static org.springframework.web.reactive.function.server.ServerResponse.ok;

@Configuration
public class WebFluxStaticResourceConfig {

  @Bean
  @Order(1) // High priority for static resources
  public RouterFunction<ServerResponse> staticResourceRouter() {
    return route(GET("/biostudies/submissions/assets/{*path}"), request -> {
      String path = request.pathVariable("path");
      Resource resource = new ClassPathResource("static/assets/" + path);

      if (!resource.exists()) {
        return ServerResponse.notFound().build();
      }

      // Determine content type based on file extension
      MediaType mediaType = getMediaType(path);

      return ok()
          .contentType(mediaType)
          .bodyValue(resource);
    })
        .andRoute(GET("/biostudies/submissions/images/{*path}"), request -> {
          String path = request.pathVariable("path");
          Resource resource = new ClassPathResource("static/images/" + path);

          if (!resource.exists()) {
            return ServerResponse.notFound().build();
          }

          // Determine content type based on file extension
          MediaType mediaType = getMediaType(path);

          return ok()
              .contentType(mediaType)
              .bodyValue(resource);
        })
        .andRoute(GET("/biostudies/submissions/favicon.ico"), request -> {
          Resource resource = new ClassPathResource("static/favicon.ico");
          if (!resource.exists()) {
            return ServerResponse.notFound().build();
          }
          return ok()
              .contentType(MediaType.parseMediaType("image/x-icon"))
              .bodyValue(resource);
        });
    // NOTE: SPA fallback removed - will be handled by a custom filter or controller
  }

  private MediaType getMediaType(String path) {
    if (path.endsWith(".js")) {
      return MediaType.parseMediaType("application/javascript");
    } else if (path.endsWith(".css")) {
      return MediaType.parseMediaType("text/css");
    } else if (path.endsWith(".html")) {
      return MediaType.TEXT_HTML;
    } else if (path.endsWith(".json")) {
      return MediaType.APPLICATION_JSON;
    } else if (path.endsWith(".png")) {
      return MediaType.IMAGE_PNG;
    } else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
      return MediaType.IMAGE_JPEG;
    } else if (path.endsWith(".svg")) {
      return MediaType.parseMediaType("image/svg+xml");
    } else if (path.endsWith(".woff") || path.endsWith(".woff2")) {
      return MediaType.parseMediaType("font/woff2");
    } else if (path.endsWith(".ttf")) {
      return MediaType.parseMediaType("font/ttf");
    } else {
      return MediaType.APPLICATION_OCTET_STREAM;
    }
  }
}