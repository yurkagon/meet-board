#!/usr/bin/env python3
import math
import struct
import zlib
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "images"


def blend(dst, src):
    sr, sg, sb, sa = src
    if sa <= 0:
        return dst
    dr, dg, db, da = dst
    a = sa / 255.0
    ia = 1.0 - a
    return (
        int(sr * a + dr * ia),
        int(sg * a + dg * ia),
        int(sb * a + db * ia),
        int(255 * (a + (da / 255.0) * ia)),
    )


class Canvas:
    def __init__(self, size, scale=4, bg=(0, 0, 0, 0)):
        self.size = size
        self.scale = scale
        self.w = size * scale
        self.h = size * scale
        self.pixels = [bg for _ in range(self.w * self.h)]

    def put(self, x, y, color):
        if 0 <= x < self.w and 0 <= y < self.h:
            i = y * self.w + x
            self.pixels[i] = blend(self.pixels[i], color)

    def rounded_rect(self, x, y, w, h, r, color):
        s = self.scale
        x0, y0, x1, y1, rr = [int(v * s) for v in (x, y, x + w, y + h, r)]
        for py in range(y0, y1):
            for px in range(x0, x1):
                cx = min(max(px, x0 + rr), x1 - rr - 1)
                cy = min(max(py, y0 + rr), y1 - rr - 1)
                if (px - cx) ** 2 + (py - cy) ** 2 <= rr ** 2:
                    self.put(px, py, color)

    def circle(self, cx, cy, r, color):
        s = self.scale
        cx, cy, rr = int(cx * s), int(cy * s), int(r * s)
        for py in range(cy - rr, cy + rr + 1):
            for px in range(cx - rr, cx + rr + 1):
                if (px - cx) ** 2 + (py - cy) ** 2 <= rr ** 2:
                    self.put(px, py, color)

    def polygon(self, points, color):
        s = self.scale
        pts = [(int(x * s), int(y * s)) for x, y in points]
        min_y = max(min(y for _, y in pts), 0)
        max_y = min(max(y for _, y in pts), self.h - 1)
        for y in range(min_y, max_y + 1):
            xs = []
            for i, (x1, y1) in enumerate(pts):
                x2, y2 = pts[(i + 1) % len(pts)]
                if (y1 <= y < y2) or (y2 <= y < y1):
                    xs.append(x1 + (y - y1) * (x2 - x1) / (y2 - y1))
            xs.sort()
            for i in range(0, len(xs), 2):
                if i + 1 < len(xs):
                    for x in range(math.ceil(xs[i]), math.floor(xs[i + 1]) + 1):
                        self.put(x, y, color)

    def line(self, x1, y1, x2, y2, width, color):
        s = self.scale
        x1, y1, x2, y2, width = [v * s for v in (x1, y1, x2, y2, width)]
        min_x = int(max(min(x1, x2) - width, 0))
        max_x = int(min(max(x1, x2) + width, self.w - 1))
        min_y = int(max(min(y1, y2) - width, 0))
        max_y = int(min(max(y1, y2) + width, self.h - 1))
        dx, dy = x2 - x1, y2 - y1
        length2 = dx * dx + dy * dy
        radius = width / 2
        for py in range(min_y, max_y + 1):
            for px in range(min_x, max_x + 1):
                t = 0 if length2 == 0 else max(0, min(1, ((px - x1) * dx + (py - y1) * dy) / length2))
                nx, ny = x1 + t * dx, y1 + t * dy
                if (px - nx) ** 2 + (py - ny) ** 2 <= radius * radius:
                    self.put(px, py, color)

    def save_png(self, path):
        rows = []
        for y in range(self.size):
            row = bytearray([0])
            for x in range(self.size):
                samples = []
                for sy in range(self.scale):
                    for sx in range(self.scale):
                        samples.append(self.pixels[(y * self.scale + sy) * self.w + (x * self.scale + sx)])
                row.extend(round(sum(p[i] for p in samples) / len(samples)) for i in range(4))
            rows.append(bytes(row))
        raw = b"".join(rows)
        with open(path, "wb") as f:
            f.write(b"\x89PNG\r\n\x1a\n")
            self._chunk(f, b"IHDR", struct.pack(">IIBBBBB", self.size, self.size, 8, 6, 0, 0, 0))
            self._chunk(f, b"IDAT", zlib.compress(raw, 9))
            self._chunk(f, b"IEND", b"")

    @staticmethod
    def _chunk(f, kind, data):
        f.write(struct.pack(">I", len(data)))
        f.write(kind)
        f.write(data)
        f.write(struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF))


def draw_mark(c, monochrome=False):
    k = c.size / 512

    def s(v):
        return v * k

    white = (255, 255, 255, 255)
    teal = white if monochrome else (17, 216, 176, 255)
    blue = white if monochrome else (71, 128, 224, 255)
    shadow = (0, 30, 90, 55) if not monochrome else (0, 0, 0, 0)

    c.rounded_rect(s(88), s(120), s(336), s(300), s(42), shadow)
    c.rounded_rect(s(70), s(100), s(340), s(300), s(42), white)
    c.rounded_rect(
        s(102),
        s(170),
        s(276),
        s(198),
        s(24),
        (5, 45, 128, 255) if not monochrome else (0, 0, 0, 0),
    )

    for x in (160, 310):
        c.rounded_rect(s(x), s(58), s(34), s(94), s(17), white)

    c.rounded_rect(s(214), s(188), s(56), s(56), s(13), teal)
    c.rounded_rect(s(292), s(188), s(56), s(56), s(13), blue)
    c.rounded_rect(s(214), s(268), s(56), s(56), s(13), blue)
    c.rounded_rect(s(292), s(268), s(56), s(56), s(13), teal)
    c.line(s(306), s(292), s(324), s(310), s(14), white)
    c.line(s(323), s(310), s(352), s(276), s(14), white)

    c.polygon([(s(98), s(214)), (s(210), s(256)), (s(210), s(445)), (s(98), s(390))], white)
    c.rounded_rect(s(116), s(210), s(72), s(194), s(8), white)
    c.circle(s(184), s(318), s(9), (14, 71, 166, 255) if not monochrome else (0, 0, 0, 0))


def draw_background(path, size):
    c = Canvas(size, scale=2, bg=(0, 67, 178, 255))
    for y in range(c.h):
        for x in range(c.w):
            nx = x / max(c.w - 1, 1)
            ny = y / max(c.h - 1, 1)
            r = int(13 + 6 * (1 - ny))
            g = int(70 + 40 * (1 - ny) + 14 * nx)
            b = int(194 + 34 * (1 - nx))
            c.pixels[y * c.w + x] = (r, g, b, 255)
    c.save_png(path)


def main():
    draw_background(OUT / "android-icon-background.png", 512)

    foreground = Canvas(512, scale=4)
    draw_mark(foreground)
    foreground.save_png(OUT / "android-icon-foreground.png")

    mono = Canvas(432, scale=4)
    draw_mark(mono, monochrome=True)
    mono.save_png(OUT / "android-icon-monochrome.png")

    splash = Canvas(228, scale=4)
    draw_mark(splash, monochrome=True)
    splash.save_png(OUT / "splash-icon.png")


if __name__ == "__main__":
    main()
