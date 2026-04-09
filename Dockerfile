FROM squidfunk/mkdocs-material:latest
RUN pip install \
    mkdocs-glightbox \
    mkdocs-minify-plugin \
    click==8.2.1 # https://github.com/squidfunk/mkdocs-material/issues/8478#issue-3476831556
