import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const port = Number(process.env.PORT ?? 3000);
const dist = join(process.cwd(), 'dist');
const upstream = 'https://api.horizonxi.com/api/v1/chars/lfp';
const types = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml' };

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

  if (url.pathname === '/api/lfp') {
    try {
      const apiResponse = await fetch(upstream, { signal: AbortSignal.timeout(10_000) });
      response.writeHead(apiResponse.status, {
        'Cache-Control': 'no-store',
        'Content-Type': apiResponse.headers.get('content-type') ?? 'application/json; charset=utf-8',
      });
      response.end(await apiResponse.text());
    } catch (error) {
      console.error('Unable to fetch HorizonXI LFP data:', error);
      response.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ error: 'HorizonXI data is temporarily unavailable.' }));
    }
    return;
  }

  const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const candidate = normalize(join(dist, requestedPath));
  const filePath = candidate.startsWith(dist) && existsSync(candidate) ? candidate : join(dist, 'index.html');

  try {
    if (!(await stat(filePath)).isFile()) throw new Error('Not a file');
    response.writeHead(200, { 'Content-Type': types[extname(filePath)] ?? 'application/octet-stream' });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Application build not found. Run npm run build first.');
  }
});

server.listen(port, () => console.log(`HorizonXI Seeker listening on port ${port}`));
