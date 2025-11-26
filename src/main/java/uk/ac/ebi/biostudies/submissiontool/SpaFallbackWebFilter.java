package uk.ac.ebi.biostudies.submissiontool;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.net.URI;

@Component
public class SpaFallbackWebFilter implements WebFilter {

  private static final Logger log = LoggerFactory.getLogger(SpaFallbackWebFilter.class);

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
    String path = exchange.getRequest().getURI().getPath();
    String method = exchange.getRequest().getMethod().name();

    // Only handle GET requests
    if (!"GET".equalsIgnoreCase(method)) {
      return chain.filter(exchange);
    }

    // Redirect /biostudies/submissions (without slash) to /biostudies/submissions/ (with slash)
    if (path.equals("/biostudies/submissions")) {
      exchange.getResponse().setStatusCode(HttpStatus.MOVED_PERMANENTLY);
      exchange.getResponse().getHeaders().setLocation(URI.create("/biostudies/submissions/"));
      return exchange.getResponse().setComplete();
    }

    // Only handle paths under /biostudies/submissions/
    if (!path.startsWith("/biostudies/submissions/")) {
      return chain.filter(exchange);
    }

    // Skip API calls, config, and static resources
    if (path.startsWith("/biostudies/submissions/api/") ||
        path.equals("/biostudies/submissions/config") ||
        path.startsWith("/biostudies/submissions/filelist/") ||
        path.startsWith("/biostudies/submissions/assets/") ||
        path.startsWith("/biostudies/submissions/images/") ||
        path.equals("/biostudies/submissions/favicon.ico")) {
      return chain.filter(exchange);
    }

    // For files with extensions, let them pass through
    if (path.contains(".") && !path.endsWith("/")) {
      return chain.filter(exchange);
    }

    // For SPA routes, serve index.html
    log.debug("Serving index.html for SPA route: {}", path);
    return serveIndexHtml(exchange);
  }

  private Mono<Void> serveIndexHtml(ServerWebExchange exchange) {
    try {
      ClassPathResource indexHtml = new ClassPathResource("static/index.html");
      if (!indexHtml.exists()) {
        exchange.getResponse().setStatusCode(HttpStatus.NOT_FOUND);
        return exchange.getResponse().setComplete();
      }

      exchange.getResponse().setStatusCode(HttpStatus.OK);
      exchange.getResponse().getHeaders().setContentType(MediaType.TEXT_HTML);

      DataBuffer buffer = exchange.getResponse().bufferFactory()
          .wrap(indexHtml.getInputStream().readAllBytes());

      return exchange.getResponse().writeWith(Mono.just(buffer))
          .doOnError(error -> DataBufferUtils.release(buffer));
    } catch (Exception e) {
      log.error("Error serving index.html", e);
      exchange.getResponse().setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
      return exchange.getResponse().setComplete();
    }
  }
}
