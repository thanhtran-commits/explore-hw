# EXPLORE Homework — static site served by nginx. Dokploy: Build type = Dockerfile, port 80.
FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
WORKDIR /usr/share/nginx/html
RUN rm -f index.html 50x.html
COPY index.html catalog.js engine.js types-rw.js ./
COPY lessons ./lessons
COPY assets ./assets
# /preview/ = trial copy of the next design (only its page + engine differ; everything else is shared via symlinks)
COPY preview ./preview
RUN cd preview && ln -s ../assets assets && ln -s ../lessons lessons && ln -s ../catalog.js catalog.js && ln -s ../types-rw.js types-rw.js
# index.html is written as a page body (the claude.ai preview adds the document head itself) → give it a full head here
# Cloudflare keeps .js files at its edge for up to 30 min → stamp every script URL with this build's version,
# so a new deploy shows up at once (engine.js adds the same ?v= to the lesson packs it loads later)
RUN V=$(date +%Y%m%d%H%M%S) \
 && sed -i -E "s#src=\"([^\"?]+\.js)\"#src=\"\1?v=$V\"#g" index.html \
 && { printf '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f8f5ef"><script>window.EXPLORE_BUILD="%s"</script></head><body>\n' "$V"; cat index.html; printf '\n</body></html>\n'; } > /tmp/i.html && mv /tmp/i.html index.html \
 && cd preview && sed -i -E "s#src=\"([^\"?]+\.js)\"#src=\"\1?v=$V\"#g" index.html \
 && { printf '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#FBF6EC"><meta name="robots" content="noindex"><script>window.EXPLORE_BUILD="%s"</script></head><body>\n' "$V"; cat index.html; printf '\n</body></html>\n'; } > /tmp/p.html && mv /tmp/p.html index.html
EXPOSE 80
