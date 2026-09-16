const http = require("http");
const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const port = process.env.PORT || 3000;
const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".md": "text/markdown; charset=utf-8"
};

function sendFile(response, filePath) {
    fs.readFile(filePath, (error, data) => {
        if (error) {
            response.writeHead(error.code === "ENOENT" ? 404 : 500, {
                "Content-Type": "text/plain; charset=utf-8"
            });
            response.end(error.code === "ENOENT" ? "Not Found" : "Server Error");
            return;
        }

        const extension = path.extname(filePath);
        response.writeHead(200, {
            "Content-Type": contentTypes[extension] || "application/octet-stream"
        });
        response.end(data);
    });
}

function sendApplicationResult(response) {
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(`<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>申請完了 | Future Summit 2026</title>
    <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
    <main class="result-page">
        <div class="result-card">
            <span class="eyebrow">Application received</span>
            <h1>申請を受け付けました</h1>
            <p>入力内容を確認のうえ、登録したメールアドレスへ案内をお送りします。</p>
            <a class="btn btn-primary" href="/html/index.html">大会トップへ戻る</a>
        </div>
    </main>
</body>
</html>`);
}

const server = http.createServer((request, response) => {
    if (request.method === "POST" && request.url === "/apply") {
        request.resume();
        request.on("end", () => sendApplicationResult(response));
        return;
    }

    if (request.method !== "GET") {
        response.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Method Not Allowed");
        return;
    }

    const requestPath = decodeURIComponent(request.url.split("?")[0]);
    const relativePath = requestPath === "/" ? "/html/index.html" : requestPath;
    const filePath = path.normalize(path.join(rootDir, relativePath));

    if (!filePath.startsWith(rootDir)) {
        response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        response.end("Forbidden");
        return;
    }

    sendFile(response, filePath);
});

server.listen(port, () => {
    console.log(`Future Summit is running at http://localhost:${port}`);
});
