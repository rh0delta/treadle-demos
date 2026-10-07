# syntax=docker/dockerfile:1

# No build step: the MP4s/WebMs are committed already-rendered. Caddy just serves them.
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
# The two asset dirs + a root index for the health check. Everything else in the
# repo (src/, tools/, package.json) is render tooling and is not served.
COPY videos /srv/videos
COPY public /srv/public
COPY index.html /srv/index.html
# Railway sets $PORT; Caddy reads it in the Caddyfile.
EXPOSE 8080
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
