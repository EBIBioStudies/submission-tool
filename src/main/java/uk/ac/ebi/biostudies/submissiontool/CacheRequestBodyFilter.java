package uk.ac.ebi.biostudies.submissiontool;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpRequestDecorator;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Component
public class CacheRequestBodyFilter implements GlobalFilter, Ordered {

  private static final Logger log = LoggerFactory.getLogger(CacheRequestBodyFilter.class);
  private static final long MAX_CACHEABLE_SIZE = 1024 * 1024; // 1 MB

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
    String method = exchange.getRequest().getMethod().name();
    String path = exchange.getRequest().getURI().getPath();
    String contentType = exchange.getRequest().getHeaders().getFirst("Content-Type");

    if (!"POST".equalsIgnoreCase(method) &&
        !"PUT".equalsIgnoreCase(method) &&
        !"PATCH".equalsIgnoreCase(method)) {
      return chain.filter(exchange);
    }

    // Skip file uploads and multipart
    if (path.contains("/upload") ||
        (contentType != null && contentType.contains("multipart/form-data"))) {
      log.debug("Skipping body caching for file upload: {}", path);
      return chain.filter(exchange);
    }

    // Skip large requests
    String contentLengthStr = exchange.getRequest().getHeaders().getFirst("Content-Length");
    if (contentLengthStr != null) {
      long contentLength = Long.parseLong(contentLengthStr);
      if (contentLength > MAX_CACHEABLE_SIZE) {
        log.debug("Skipping body caching for large request ({} bytes): {}", contentLength, path);
        return chain.filter(exchange);
      }
    }

    return DataBufferUtils.join(exchange.getRequest().getBody())
        .defaultIfEmpty(exchange.getResponse().bufferFactory().allocateBuffer(0))
        .flatMap(dataBuffer -> {
          byte[] bytes = new byte[dataBuffer.readableByteCount()];
          dataBuffer.read(bytes);
          DataBufferUtils.release(dataBuffer);

          ServerHttpRequest decorator = new ServerHttpRequestDecorator(exchange.getRequest()) {
            @Override
            public Flux<DataBuffer> getBody() {
              if (bytes.length > 0) {
                DataBuffer buffer = exchange.getResponse().bufferFactory().wrap(bytes);
                return Flux.just(buffer);
              }
              return Flux.empty();
            }
          };

          return chain.filter(exchange.mutate().request(decorator).build());
        });
  }

  @Override
  public int getOrder() {
    return Ordered.HIGHEST_PRECEDENCE;
  }
}