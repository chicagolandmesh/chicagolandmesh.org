# ============================================================================ #
# DEVELOPMENT
# ============================================================================ #

.PHONY: dev
dev: build/pmtiles build/map/assets
	docker compose up -d
	docker compose logs -f

# Run the development server without pulling map assets or tiles
.PHONY: dev/site
dev/site:
	@if [[ ! -e ".env" ]]; then cp .example.env .env; fi
	@mkdir -p docs/assets/javascripts
	@touch docs/assets/javascripts/map.dev.js
	@touch docs/assets/stylesheets/map.dev.css
	docker compose up mkdocs caddy

.PHONY: clean
clean:
	docker compose down --rmi local
	rm -rf $(SITE_OUTPUT)
	rm -rf $(MAP_TILES_DIR)
	rm -rf $(MAP_FONTS)
	rm -rf $(MAP_SPRITES)
	rm -rf $(MAP_JS_DIR)
	rm -f $(MAP_CSS_DIR)/map.*.css
	rm -rf .cache
	rm -rf venv
	rm -rf javascript/map/node_modules
	rm -rf __pycache__
	rm -rf api/map/bin
	rm -rf api/map/tmp

# ============================================================================ #
# BUILD
# ============================================================================ #

BOTTOM_LEFT_LNGLAT := -92.575556,35.995556
TOP_RIGHT_LNGLAT   := -84.495833,43.591667

MAP_TILES_DIR  := data
MAP_MIDWEST_PM := $(MAP_TILES_DIR)/midwest.pmtiles
MAP_GLOBE_PM   := $(MAP_TILES_DIR)/globe.pmtiles

MAP_ASSET_DIR := docs/assets
MAP_FONTS     := $(MAP_ASSET_DIR)/fonts
MAP_SPRITES   := $(MAP_ASSET_DIR)/sprites
MAP_JS_DIR    := $(MAP_ASSET_DIR)/javascripts
MAP_CSS_DIR   := $(MAP_ASSET_DIR)/stylesheets

SITE_OUTPUT := dist

$(MAP_MIDWEST_PM) $(MAP_GLOBE_PM):
	@echo 'Pulling map tiles...'
	@go install github.com/protomaps/go-pmtiles@latest
	@mkdir -p $(MAP_TILES_DIR)
	@mapfile=$$(curl -s https://build-metadata.protomaps.dev/builds.json | jq -r '.[-1] | .key') && \
	go-pmtiles extract https://build.protomaps.com/$$mapfile $(MAP_MIDWEST_PM) --bbox=$(BOTTOM_LEFT_LNGLAT),$(TOP_RIGHT_LNGLAT) && \
	go-pmtiles extract https://build.protomaps.com/$$mapfile $(MAP_GLOBE_PM) --maxzoom=7

.PHONY: build/pmtiles
build/pmtiles: $(MAP_MIDWEST_PM) $(MAP_GLOBE_PM)

.PHONY: build/api
build/api:
	@echo 'Building api/map...'
	cd api/map \
	&& CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build -o ./bin/api ./cmd/server

$(MAP_FONTS) $(MAP_SPRITES):
	@echo 'Pulling map assets...'
	@tmp=$$(mktemp -d) && \
	curl -L -o $$tmp/assets.zip https://github.com/protomaps/basemaps-assets/archive/refs/heads/main.zip && \
	unzip -q $$tmp/assets.zip -d $$tmp && \
	mkdir -p $(MAP_ASSET_DIR) && \
	rm -rf $(MAP_FONTS) $(MAP_SPRITES) && \
	mv $$tmp/basemaps-assets-main/fonts   $(MAP_ASSET_DIR) && \
	mv $$tmp/basemaps-assets-main/sprites $(MAP_ASSET_DIR) && \
	rm -rf $$tmp

.PHONY: build/map/assets
build/map/assets: $(MAP_FONTS) $(MAP_SPRITES)

javascript/map/node_modules:
	cd javascript/map \
	&& bun install

.PHONY: build/map/js
build/map/js: javascript/map/node_modules $(wildcard javascript/map/src/js/*.js)
	@echo 'Building map js...'
	@rm -f $(MAP_JS_DIR)/map.*.js
	bun build ./javascript/map/src/js/main.js \
		--outdir $(MAP_JS_DIR) \
		--minify \
		--entry-naming map.[hash].min.[ext]

.PHONY: build/map/css
build/map/css: javascript/map/node_modules $(wildcard javascript/map/src/css/*.css) $(wildcard javascript/map/src/fonts/*.css)
	@echo 'Building map css...'
	@rm -f $(MAP_CSS_DIR)/map.*.css
	bun build ./javascript/map/src/css/main.css \
		--outdir $(MAP_CSS_DIR) \
		--minify \
		--entry-naming map.[hash].min.[ext]

.PHONY: build/map
build/map: build/map/js build/map/css build/map/assets

venv/bin/activate:
	@echo 'Setting up virtual python environment...'
	python3 -m venv venv \
	&& . venv/bin/activate \
	&& pip install mkdocs-material mkdocs-glightbox mkdocs-minify-plugin

dist/index.html: venv/bin/activate $(wildcard docs/**/*) $(wildcard overrides/**/*) mkdocs.yml
	@echo 'Building site...'
	. venv/bin/activate \
    && mkdocs build -d $(SITE_OUTPUT)

.PHONY: build/site
build/site: build/map dist/index.html

# ============================================================================ #
# PRODUCTION
# ============================================================================ #

PROD_HOST := xenspec@chicagolandmesh.org

.PHONY: deploy/hashicon
deploy/hashicon:
	docker buildx build -t hashicon -o type=docker,dest=- api/hashicon \
	  | ssh $(PROD_HOST) 'docker load'

.PHONY: deploy/pmtiles
deploy/pmtiles:
	rsync -vcP ./$(MAP_MIDWEST_PM) $(PROD_HOST):~/data/
	rsync -vcP ./$(MAP_GLOBE_PM) $(PROD_HOST):~/data/

.PHONY: deploy/api
deploy/api:
	docker buildx build -t map-api -o type=docker,dest=- api/map \
	  | ssh $(PROD_HOST) 'docker load'

.PHONY: deploy/site
deploy/site:
	rsync -vrP --delete ./dist/ $(PROD_HOST):~/site/

.PHONY: deploy/caddy
deploy/caddy:
	docker buildx build -t caddy-cloudflare -o type=docker,dest=- remote/production \
	  | ssh $(PROD_HOST) 'docker load'

.PHONY: deploy/config
deploy/config:
	rsync -vP ./remote/production/Caddyfile $(PROD_HOST):~
	rsync -vP ./remote/production/compose.yml $(PROD_HOST):~

.PHONY: deploy
deploy: deploy/hashicon build/pmtiles deploy/pmtiles deploy/api build/site deploy/site deploy/caddy deploy/config
	ssh -t $(PROD_HOST) '\
	    docker compose up -d && \
		docker compose logs -f --tail 10 \
	'
