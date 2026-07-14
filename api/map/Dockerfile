FROM --platform=$BUILDPLATFORM golang:1.26-alpine AS builder

WORKDIR /src

ARG TARGETOS
ARG TARGETARCH

RUN apk add --no-cache musl-dev wget tar python3

RUN wget -qO- https://musl.cc/x86_64-linux-musl-cross.tgz | tar xz -C /opt

ENV PATH="/opt/x86_64-linux-musl-cross/bin:$PATH"
ENV CC=x86_64-linux-musl-gcc
ENV CXX=x86_64-linux-musl-g++

COPY go.mod go.sum ./
RUN go mod download

COPY internal/data ./internal/data
COPY scripts ./scripts
RUN go generate ./...

COPY . .
RUN CGO_ENABLED=1 GOOS=$TARGETOS GOARCH=$TARGETARCH CC=$CC CXX=$CXX \
    go build -trimpath -ldflags="-linkmode external -extldflags '-static'" -o ./bin/api ./cmd/server


FROM alpine

COPY --from=builder /src/bin/api /usr/local/bin/api

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/api"]
