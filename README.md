# treadle-demos

Website demo videos for Treadle, built with Remotion (1920x1080, 30 fps).

- `src/ClipboardDemo.tsx`: clipboard tile demo (copy on Mac, tap on iPad, paste)
- `src/ScreenshotDemo.tsx`: "Screenshot the whole screen" key demo
- `videos/`: rendered MP4s
- `public/`: trimmed, aligned Mac and iPad clips (VP9), app icon, Inter font
- `tools/cuts.py`, `tools/cuts2.py`: ffmpeg scripts that cut and align the raw screen recordings (the raw recordings are not stored here)

## Render

    npm install
    npx remotion render ClipboardDemo videos/treadle-clipboard-demo.mp4
    npx remotion render ScreenshotDemo videos/treadle-screenshot-demo.mp4

`npx remotion studio` opens the preview.

## Serve

Deployed to Railway as a static file server (Caddy, no build runtime) so the
marketing site pulls each clip by URL instead of bundling it. The `Dockerfile`
serves `videos/` and `public/` with CORS, Range support and a day-long media
cache; `index.html` backs the health check. Pushing a re-render redeploys the
host, so the URLs update automatically.

    https://<railway-domain>/videos/treadle-clipboard-demo.mp4
