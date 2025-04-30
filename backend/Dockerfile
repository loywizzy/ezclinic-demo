FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download && go build -o server .

FROM alpine
WORKDIR /root/
ENV PORT=8080
COPY --from=builder /app/server .
CMD ["./server"]
