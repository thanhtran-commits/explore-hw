# EXPLORE Homework — static site served by nginx. Dokploy: Build type = Dockerfile, port 80.
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
RUN rm -f index.html 50x.html
COPY index.html catalog.js engine.js types-rw.js ./
COPY lessons ./lessons
COPY assets ./assets
# index.html is written as a page body (the claude.ai preview adds the document head itself) → give it a full head here
RUN { printf '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f8f5ef"></head><body>\n'; cat index.html; printf '\n</body></html>\n'; } > /tmp/i.html && mv /tmp/i.html index.html
EXPOSE 80
