"""產生網站用的線稿插圖（軸測圖）。

python3 tools/build-art.py  →  輸出到 legacy-site/media/art/（svc-*.svg 與 proc-*.svg）
- svc-*：服務卡片用，黑底白線
- proc-*：流程動畫用，米白底黑線；class="d" 的線會被 JS 依序「畫」出來
"""
import json
import math
import os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "legacy-site", "media", "art")
ADJ = None
LAST = None
INK, PAPER, TILE, WHITE = "#1C1A17", "#F4EFE6", "#1C1A17", "#FBF8F2"


def f(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


class Scene:
    """軸測投影：x 軸往右下、y 軸往左下、z 往上。看得到 top、x 最大面、y 最大面。"""

    def __init__(self, w, h, k, ox, oy, mode="paper", alpha=24, beta=36, ys=0.86, fit=None):
        if ADJ:
            sc, tx, ty = ADJ
            k, ox, oy = k * sc, ox * sc + tx, oy * sc + ty
        self.w, self.h, self.k, self.ox, self.oy = w, h, k, ox, oy
        self.fit = fit or ((36, 30, w - 72, h - 60) if mode == "tile" else (30, 26, w - 60, h - 52))
        self.bb = [1e9, 1e9, -1e9, -1e9]
        a, b = math.radians(alpha), math.radians(beta)
        self.ax = (math.cos(a) * k, math.sin(a) * k)
        self.ay = (-math.cos(b) * k * ys, math.sin(b) * k * ys)
        self.mode = mode
        self.fill = PAPER if mode == "paper" else TILE
        self.els = []

    # ---------- 投影 ----------
    def p(self, x, y, z):
        X = self.ox + x * self.ax[0] + y * self.ay[0]
        Y = self.oy + x * self.ax[1] + y * self.ay[1] - z * self.k
        b = self.bb
        b[0], b[1], b[2], b[3] = min(b[0], X), min(b[1], Y), max(b[2], X), max(b[3], Y)
        return (X, Y)
        return (self.ox + x * self.ax[0] + y * self.ay[0], self.oy + x * self.ax[1] + y * self.ay[1] - z * self.k)

    def pts(self, ps):
        return " ".join(f"{f(a)},{f(b)}" for a, b in (self.p(*q) for q in ps))

    def plane(self, kind, c):
        """回傳把平面上 (u, v) 映到螢幕的 SVG matrix。v 往「下」為正（給文字用）。"""
        if kind == "top":   # z=c，u 沿 x、v 沿 y
            o = self.p(0, 0, c)
            return (self.ax[0], self.ax[1], self.ay[0], self.ay[1], o[0], o[1])
        if kind == "xz":    # y=c，u 沿 x、v 沿 -z
            o = self.p(0, c, 0)
            return (self.ax[0], self.ax[1], 0, self.k, o[0], o[1])
        if kind == "yz":    # x=c，u 沿 y、v 沿 -z
            o = self.p(c, 0, 0)
            return (self.ay[0], self.ay[1], 0, self.k, o[0], o[1])

    @staticmethod
    def mtx(m):
        return "matrix(" + " ".join(f"{v:.4f}" for v in m) + ")"

    # ---------- 輸出元素 ----------
    def add(self, s):
        self.els.append(s)

    def poly(self, ps, cls="d", fill=True, extra=""):
        fl = f' fill="{self.fill}"' if fill else ' fill="none"'
        self.add(f'<polygon class="{cls}" points="{self.pts(ps)}"{fl}{extra}/>')

    def line(self, a, b, cls="d"):
        (x1, y1), (x2, y2) = self.p(*a), self.p(*b)
        self.add(f'<path class="{cls}" d="M{f(x1)} {f(y1)}L{f(x2)} {f(y2)}"/>')

    def path3(self, ps, cls="d", close=False, fill=False):
        s = "M" + " L".join(f"{f(a)} {f(b)}" for a, b in (self.p(*q) for q in ps)) + ("Z" if close else "")
        fl = f' fill="{self.fill}"' if fill else ""
        self.add(f'<path class="{cls}" d="{s}"{fl}/>')

    def box(self, x, y, z, w, d, h, cls="d", faces="tlr"):
        X, Y, Z = x + w, y + d, z + h
        if "r" in faces:
            self.poly([(X, y, z), (X, Y, z), (X, Y, Z), (X, y, Z)], cls)
        if "l" in faces:
            self.poly([(x, Y, z), (X, Y, z), (X, Y, Z), (x, Y, Z)], cls)
        if "t" in faces:
            self.poly([(x, y, Z), (X, y, Z), (X, Y, Z), (x, Y, Z)], cls)
        # 流程圖：整塊物件的外輪廓再描一次粗線，內部的折線維持細，立體感比較清楚
        # 只有三面都畫的完整方塊才自動描外框；少一面的（開口箱子、另外畫出紙口的機器）外框會橫跨缺的那一面
        if self.mode == "paper" and cls == "d" and set(faces) == set("tlr"):
            C = []
            if "r" in faces: C += [(X, y, z), (X, Y, z), (X, Y, Z), (X, y, Z)]
            if "l" in faces: C += [(x, Y, z), (X, Y, z), (X, Y, Z), (x, Y, Z)]
            if "t" in faces: C += [(x, y, Z), (X, y, Z), (X, Y, Z), (x, Y, Z)]
            self.outline([self.p(*q) for q in C])
        elif self.mode == "paper" and cls == "d" and "l" in faces and "r" in faces:
            self.outline_path([(x, Y, Z), (x, Y, z), (X, Y, z), (X, y, z), (X, y, Z)])

    def outline(self, P, min_size=16):
        H = self.hull(P)
        if len(H) < 3:
            return
        xs, ys = [q[0] for q in H], [q[1] for q in H]
        if math.hypot(max(xs) - min(xs), max(ys) - min(ys)) < min_size:
            return  # 小零件（按鈕、標籤）不加粗框，免得變成一團
        self.add('<path class="d o" fill="none" d="M' + " L".join(f"{f(a)} {f(b)}" for a, b in H) + 'Z"/>')

    def outline_path(self, ps, close=False):
        """照著給的 3D 點描一條外輪廓粗線（形狀不是凸的、或不想封口時用）。"""
        self.add('<path class="d o" fill="none" d="M' + " L".join(f"{f(a)} {f(b)}" for a, b in (self.p(*q) for q in ps)) + ('Z"/>' if close else '"/>'))

    def circle_pts(self, kind, cx, cy, c, r, n=56, a0=0, a1=360):
        out = []
        for i in range(n + 1):
            t = math.radians(a0 + (a1 - a0) * i / n)
            u, v = cx + r * math.cos(t), cy + r * math.sin(t)
            if kind == "top":
                out.append((u, v, c))
            elif kind == "xz":
                out.append((u, c, v))
            else:
                out.append((c, u, v))
        return out

    def ellipse(self, kind, cx, cy, c, r, cls="d", fill=True):
        self.path3(self.circle_pts(kind, cx, cy, c, r), cls, close=True, fill=fill)

    def hull(self, P):
        P = sorted(set(P))
        if len(P) < 3:
            return P
        def cross(o, a, b):
            return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
        lo, up = [], []
        for q in P:
            while len(lo) >= 2 and cross(lo[-2], lo[-1], q) <= 0:
                lo.pop()
            lo.append(q)
        for q in reversed(P):
            while len(up) >= 2 and cross(up[-2], up[-1], q) <= 0:
                up.pop()
            up.append(q)
        return lo[:-1] + up[:-1]

    def cylinder(self, axis, a, b, c0, c1, r, cls="d", cap=True):
        """axis: 'x' | 'y' | 'z'。(a, b) 是另外兩軸上的圓心，c0..c1 是軸向範圍。"""
        if axis == "z":
            e0, e1 = self.circle_pts("top", a, b, c0, r), self.circle_pts("top", a, b, c1, r)
            kind, cc = "top", c1
        elif axis == "y":
            e0, e1 = self.circle_pts("xz", a, b, c0, r), self.circle_pts("xz", a, b, c1, r)
            kind, cc = "xz", c1
        else:
            e0, e1 = self.circle_pts("yz", a, b, c0, r), self.circle_pts("yz", a, b, c1, r)
            kind, cc = "yz", c1
        H = self.hull([self.p(*q) for q in e0 + e1])
        s = "M" + " L".join(f"{f(x)} {f(y)}" for x, y in H) + "Z"
        self.add(f'<path class="{cls}" d="{s}" fill="{self.fill}"/>')
        if cap:
            self.ellipse(kind, a, b, cc, r, cls)
        if self.mode == "paper" and cls == "d":
            self.outline(H)

    def text(self, kind, c, u, v, s, size=7, cls="tx", anchor="start", weight=None):
        m = self.plane(kind, c)
        if kind == "yz":  # y 軸在畫面上往左，文字要反過來才不會鏡像
            m, u = (-m[0], -m[1], m[2], m[3], m[4], m[5]), -u
        w = f' font-weight="{weight}"' if weight else ""
        self.add(f'<text class="{cls}" transform="{self.mtx(m)}" x="{f(u)}" y="{f(v)}" font-size="{size}" text-anchor="{anchor}"{w}>{s}</text>')

    def sticker(self, kind, c, u, v, w, rot=0):
        """公司 logo 貼紙：貼在某個面上（跟著那個面的透視），稍微歪一點像手貼的。"""
        h = w * 214 / 346
        m = self.plane(kind, c)
        self.add(f'<g class="tx" transform="{self.mtx(m)}"><image href="media/art/sticker-logo.png" x="{f(u)}" y="{f(v)}" width="{f(w)}" height="{f(h)}"'
                 f' transform="rotate({rot} {f(u + w / 2)} {f(v + h / 2)})" preserveAspectRatio="xMidYMid meet"/></g>')

    def raw(self, s):
        self.add(s)

    # ---------- 存檔 ----------
    def save(self, name, label):
        global LAST
        if ADJ is None:
            LAST = (self.bb, self.fit)
            return
        if self.mode == "paper":
            style = (f"svg{{fill:none;stroke:{INK};stroke-width:1.3;stroke-linecap:round;stroke-linejoin:round}}"
                     f".f{{stroke-width:.75;stroke-opacity:.62}}.h{{stroke-width:.6;stroke-opacity:.45}}"
                     f".b{{stroke-width:2}}.tx{{fill:{INK};stroke:none;font-family:'Noto Sans TC','PingFang TC',sans-serif;letter-spacing:.06em}}"
                     f".ink{{fill:{INK}}}")
        else:
            style = (f"svg{{fill:none;stroke:{WHITE};stroke-width:1.15;stroke-linecap:round;stroke-linejoin:round}}"
                     f".f{{stroke-width:.7;stroke-opacity:.6}}.h{{stroke-width:.55;stroke-opacity:.42}}"
                     f".b{{stroke-width:1.8}}.tx{{fill:{WHITE};stroke:none;font-family:'Noto Sans TC','PingFang TC',sans-serif;letter-spacing:.08em}}"
                     f".ink{{fill:{WHITE}}}")
        body = "\n".join(self.els)
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" role="img" aria-label="{label}">'
               f"<style>{style}</style>\n{body}\n</svg>\n")
        with open(os.path.join(OUT, name), "w", encoding="utf-8") as fh:
            fh.write(svg)


# ======================================================================
# 共用小物件
# ======================================================================
def book_flat(S, x, y, z, w, d, h, spine=None, cover=None, cls="d"):
    """平放的書：書背在 y 最大面（左前），書口在 x 最大面。"""
    S.box(x, y, z, w, d, h, cls)
    X, Y = x + w, y + d
    t = min(1.6, h * 0.18)
    # 書口：上下封面板厚度 + 紙張細線
    S.line((X, y + 1.5, z + t), (X, Y - 2, z + t), "f")
    S.line((X, y + 1.5, z + h - t), (X, Y - 2, z + h - t), "f")
    n = max(2, int((h - 2 * t) / 2.2))
    for i in range(1, n):
        zz = z + t + (h - 2 * t) * i / n
        S.line((X, y + 3, zz), (X, Y - 3, zz), "h")
    # 書背：兩條壓線
    S.line((x + 7, Y, z + 0.8), (x + 7, Y, z + h - 0.8), "f")
    S.line((X - 7, Y, z + 0.8), (X - 7, Y, z + h - 0.8), "f")
    if spine:
        S.text("xz", Y, x + w / 2, -(z + h / 2) + 2.4, spine, size=min(6.5, h * 0.55), anchor="middle")
    if cover:
        cover(S, x, y, z + h, w, d)


def sheet_stack(S, x, y, z, w, d, n, gap=1.1, cls="d"):
    """一疊紙：外框 + 側邊細線。"""
    h = n * gap
    S.box(x, y, z, w, d, h, cls)
    for i in range(1, n):
        zz = z + i * gap
        S.line((x + w, y, zz), (x + w, y + d, zz), "h")
        S.line((x, y + d, zz), (x + w, y + d, zz), "h")


def text_lines(S, kind, c, u, v, widths, gap, cls="f"):
    for i, wd in enumerate(widths):
        vv = v + i * gap
        if kind == "top":
            S.line((u, vv, c), (u + wd, vv, c), cls)
        elif kind == "xz":
            S.line((u, c, vv), (u + wd, c, vv), cls)
        else:
            S.line((c, u, vv), (c, u + wd, vv), cls)


def cup(S, cx, cy, h=16, r=9):
    """馬克杯：杯盤 + 杯身 + 杯口 + 右側環狀把手。"""
    S.ellipse("top", cx, cy, 0, r + 7, "d")
    S.ellipse("top", cx, cy, 0.6, r + 2, "h", fill=False)
    S.cylinder("z", cx, cy, 1, 1 + h, r)
    S.ellipse("top", cx, cy, 1 + h, r - 1.6, "f", fill=False)
    zm, ro, ri = 1 + h * 0.55, h * 0.3, h * 0.3 - 2.6
    outer = [(cx + r - 1 + ro * math.cos(math.radians(t)), cy, zm + ro * math.sin(math.radians(t))) for t in range(-85, 86, 10)]
    inner = [(cx + r - 1 + ri * math.cos(math.radians(t)), cy, zm + ri * math.sin(math.radians(t))) for t in range(85, -86, -10)]
    S.path3(outer + inner, "d", close=True, fill=True)


def pen(S, x, y, z, L, r=2.2):
    """鋼筆：沿 x 軸的圓桿 + 筆尖 + 筆夾。"""
    cz = z + r
    S.cylinder("x", y, cz, x, x + L - 9, r)
    ring = S.circle_pts("yz", y, cz, x + L - 9, r)
    H = S.hull([S.p(*q) for q in ring] + [S.p(x + L, y, cz)])
    S.add('<path class="d" d="M' + " L".join(f"{f(a)} {f(b)}" for a, b in H) + f'Z" fill="{S.fill}"/>')
    S.line((x + L - 9, y, cz), (x + L - 1, y, cz), "h")
    S.line((x + L * 0.62, y - r, cz), (x + L * 0.62, y + r, cz), "f")
    S.path3([(x + 4, y, cz + r), (x + 4, y, cz + r + 1.4), (x + 20, y, cz + r + 1.4), (x + 22, y, cz + r)], "d")


# ======================================================================
# 服務卡片（黑底白線）
# ======================================================================
def svc_textbook():
    S = Scene(400, 300, 1.25, 168, 92, mode="tile")
    books = [
        (0, 0, 0, 120, 84, 15, "國語"),
        (4, 3, 15, 114, 80, 13, "數學"),
        (-2, 1, 28, 118, 83, 16, "自然科學"),
        (6, 5, 44, 110, 77, 12, "社會"),
    ]
    for x, y, z, w, d, h, sp in books[:-1]:
        book_flat(S, x, y, z, w, d, h, sp)

    def cover(S, x, y, z, w, d):
        S.poly([(x + 10, y + 10, z), (x + w - 10, y + 10, z), (x + w - 10, y + d - 10, z), (x + 10, y + d - 10, z)], "f", fill=False)
        S.ellipse("top", x + w * 0.62, y + d * 0.42, z, 13, "f", fill=False)
        S.ellipse("top", x + w * 0.62, y + d * 0.42, z, 7, "h", fill=False)
        text_lines(S, "top", z, x + 18, y + 20, [34, 22], 7)
        S.text("top", z, x + 18, y + d - 20, "國民中學 · 第二冊", size=6.5, cls="tx")
    x, y, z, w, d, h, sp = books[-1]
    book_flat(S, x, y, z, w, d, h, sp, cover)
    # 鉛筆
    zt, py = 0, 104
    S.box(30, py, zt, 76, 5, 5)
    S.poly([(106, py, zt), (117, py + 2.5, zt + 2.5), (106, py + 5, zt + 5)], "d")
    S.line((106, py, zt + 5), (117, py + 2.5, zt + 2.5), "f")
    S.line((106, py + 5, zt), (117, py + 2.5, zt + 2.5), "f")
    S.box(24, py, zt, 6, 5, 5)
    S.line((34, py + 5, zt + 2.5), (100, py + 5, zt + 2.5), "h")
    S.save("svc-textbook.svg", "教科書印刷")


def svc_digital():
    S = Scene(400, 300, 1.12, 150, 70, mode="tile")
    # 主機
    S.box(0, 0, 0, 150, 72, 96)
    Y, X = 72, 150
    # 正面：上門、三個紙匣
    S.poly([(8, Y, 44), (88, Y, 44), (88, Y, 90), (8, Y, 90)], "f", fill=False)
    S.poly([(92, Y, 44), (142, Y, 44), (142, Y, 90), (92, Y, 90)], "f", fill=False)
    for i in range(3):
        z0 = 6 + i * 12.5
        S.poly([(8, Y, z0), (142, Y, z0), (142, Y, z0 + 10.5), (8, Y, z0 + 10.5)], "f", fill=False)
        S.line((62, Y, z0 + 7.5), (88, Y, z0 + 7.5), "d")
    S.line((84, Y, 50), (84, Y, 64), "d")
    for i in range(5):
        S.line((96 + i * 3, Y, 80), (96 + i * 3, Y, 86), "h")
    S.text("xz", Y, 14, -82, "DIGITAL PRESS", size=5.5)
    # 側面散熱孔
    for i in range(8):
        S.line((X, 12 + i * 6, 70), (X, 12 + i * 6, 86), "h")
    # 上方出紙槽與紙
    S.box(20, 10, 96, 90, 50, 4)
    sheet_stack(S, 30, 16, 100, 66, 38, 5)
    # 觸控螢幕
    S.box(124, 56, 96, 4, 4, 14)
    S.poly([(112, 60, 110), (146, 60, 110), (146, 66, 126), (112, 66, 126)], "d")
    S.poly([(115, 60.6, 112), (143, 60.6, 112), (143, 65.4, 124), (115, 65.4, 124)], "f", fill=False)
    # 狀態燈
    S.cylinder("z", 10, 8, 96, 116, 3.4)
    for zz in (101, 106, 111):
        S.path3(S.circle_pts("top", 10, 8, zz, 3.4, a0=-40, a1=140), "f")
    # 右側出紙台與成品
    S.box(150, 14, 44, 34, 44, 3)
    S.poly([(184, 14, 47), (184, 58, 47), (192, 58, 52), (192, 14, 52)], "d")
    sheet_stack(S, 154, 20, 47, 28, 32, 6)
    # 前方兩本樣書
    book_flat(S, 160, 92, 0, 46, 34, 6)
    book_flat(S, 163, 94, 6, 40, 30, 5)
    S.save("svc-digital.svg", "數位短版印刷")


def svc_hardcover():
    S = Scene(400, 300, 1.25, 196, 64, mode="tile")
    # 平裝書（後方平放）
    book_flat(S, -42, -6, 0, 78, 104, 9, "平裝")
    # 精裝書（直立）：封面在 y 最大面、書背在 x 最大面
    x, y, z, w, d, h = 0, 34, 0, 86, 26, 118
    X, Y, Z = x + w, y + d, z + h
    bulge = 7
    def arc(zz, inset=0, n=16):
        return [(X + bulge * math.sin(math.pi * i / n) - inset, y + 1.5 + (d - 3) * i / n, zz) for i in range(n + 1)]
    # 圓弧書背（往外凸）：外框取上下兩條弧的外輪廓
    H = S.hull([S.p(*q) for q in arc(z) + arc(Z) + [(X, y, z), (X, y, Z), (X, Y, z), (X, Y, Z)]])
    S.add('<path class="d" d="M' + " L".join(f"{f(a)} {f(b)}" for a, b in H) + f'Z" fill="{S.fill}"/>')
    S.poly([(x, Y, z), (X, Y, z), (X, Y, Z), (x, Y, Z)])
    S.path3([(x, y, Z), (X, y, Z)] + arc(Z)[1:-1] + [(X, Y, Z), (x, Y, Z)], "d", close=True, fill=True)
    S.path3(arc(z)[8:], "d")
    # 書頂：書板包住書頁
    S.path3([(x + 3, y + 2.5, Z), (X - 2, y + 2.5, Z)] + [(X - 2 + 4 * math.sin(math.pi * i / 12), y + 2.5 + (d - 5) * i / 12, Z) for i in range(1, 12)] + [(X - 2, Y - 2.5, Z), (x + 3, Y - 2.5, Z)], "f", close=True)
    for i in range(1, 5):
        yy = y + 2.5 + (d - 5) * i / 5
        S.line((x + 5, yy, Z), (X - 4, yy, Z), "h")
    # 竹節：沿著書背弧度的凸線，頂部花布
    for zz in (20, 32, 86, 98):
        S.path3(arc(zz), "f")
    S.path3(arc(Z - 3.5), "h")
    # 封面靠書背的溝槽
    S.line((X - 7, Y, 2), (X - 7, Y, Z - 2), "h")
    # 封面：燙金框 + 書名
    S.poly([(x + 10, Y, 12), (X - 10, Y, 12), (X - 10, Y, Z - 12), (x + 10, Y, Z - 12)], "f", fill=False)
    S.poly([(x + 14, Y, 16), (X - 14, Y, 16), (X - 14, Y, Z - 16), (x + 14, Y, Z - 16)], "h", fill=False)
    S.ellipse("xz", x + w / 2, 70, Y, 13, "f", fill=False)
    S.text("xz", Y, x + w / 2, -42, "HARDCOVER", size=6, anchor="middle")
    S.line((x + 28, Y, 34), (X - 28, Y, 34), "h")
    # 書籤帶從底部垂出
    S.poly([(x + 62, Y, 1), (x + 66, Y, 1), (x + 66, Y, -16), (x + 64, Y, -13), (x + 62, Y, -16)], "d")
    # 前方一本攤平的小冊
    book_flat(S, 100, 74, 0, 60, 44, 5)
    S.save("svc-hardcover.svg", "精裝平裝書籍")


def svc_corporate():
    S = Scene(400, 300, 1.2, 176, 70, mode="tile")
    # 年報（後方平放）
    def cover(S, x, y, z, w, d):
        S.text("top", z, x + 10, y + 18, "ANNUAL", size=8, weight=500)
        S.text("top", z, x + 10, y + 27, "REPORT 2026", size=8, weight=500)
        S.path3([(x + 10, y + d - 18, z), (x + 26, y + d - 30, z), (x + 40, y + d - 24, z), (x + w - 10, y + d - 42, z)], "f")
        S.line((x + 10, y + d - 10, z), (x + w - 10, y + d - 10, z), "h")
    book_flat(S, -30, -20, 0, 92, 70, 6, None, cover)
    # 三折頁（直立、鋸齒）
    base = [(52, 6), (88, 22), (124, 6), (160, 22)]
    H = 66
    panels = [(base[i], base[i + 1]) for i in range(3)]
    for i, ((x0, y0), (x1, y1)) in enumerate(panels):
        S.poly([(x0, y0, 0), (x1, y1, 0), (x1, y1, H), (x0, y0, H)])
        def at(t, zz):
            return (x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, zz)
        if i == 0:
            S.path3([at(0.2, 58), at(0.8, 58), at(0.8, 70), at(0.2, 70)], "f", close=True)
        for j, (a, b) in enumerate([(0.15, 0.85), (0.15, 0.7), (0.15, 0.8), (0.15, 0.6)]):
            zz = (46 if i == 0 else 66) - j * 7
            S.path3([at(a, zz), at(b, zz)], "h")
        if i == 1:
            S.path3([at(0.2, 18), at(0.8, 18), at(0.8, 36), at(0.2, 36)], "f", close=True)
            S.path3([at(0.2, 18), at(0.45, 30), at(0.6, 24), at(0.8, 34)], "h")
        if i == 2:
            pts = [at(0.5 + 0.18 * math.cos(math.radians(a)) / 1, 26 + 8 * math.sin(math.radians(a))) for a in range(0, 361, 15)]
            S.path3(pts, "f", close=True)
    # 名片（前方一疊）
    sheet_stack(S, 70, 64, 0, 56, 34, 7, gap=1.2)
    zc = 8.4
    S.ellipse("top", 84, 81, zc, 6, "f", fill=False)
    S.line((96, 76, zc), (118, 76, zc), "f")
    S.line((96, 82, zc), (112, 82, zc), "h")
    S.line((96, 87, zc), (115, 87, zc), "h")
    # 散落的一張名片
    S.poly([(30, 82, 0), (84, 92, 0), (80, 124, 0), (26, 114, 0)])
    S.save("svc-corporate.svg", "企業形象印刷品")


def svc_custom():
    S = Scene(400, 300, 1.2, 150, 66, mode="tile")
    # 攤平的盒型刀模（實線為裁切、虛線為摺線）
    ox, oy, W, D, Hh = -40, 40, 52, 34, 22
    net = [(0, 0), (W + Hh, 3), (W + Hh, D - 3), (W, D), (W, D + Hh), (0, D + Hh), (0, D), (-Hh, D - 3), (-Hh, 3),
           (0, 0), (0, -Hh), (0, -Hh - D), (5, -Hh - D - 10), (W - 5, -Hh - D - 10), (W, -Hh - D), (W, 0)]
    net = [(0, 0), (0, -Hh), (0, -Hh - D), (5, -Hh - D - 10), (W - 5, -Hh - D - 10), (W, -Hh - D), (W, -Hh), (W, 0),
           (W + Hh, 3), (W + Hh, D - 3), (W, D), (W, D + Hh), (0, D + Hh), (0, D), (-Hh, D - 3), (-Hh, 3)]
    S.poly([(ox + u, oy + v, 0) for u, v in net], "d")
    for (u1, v1), (u2, v2) in [((0, 0), (W, 0)), ((0, D), (W, D)), ((0, -Hh), (W, -Hh)), ((0, -Hh - D), (W, -Hh - D)),
                               ((0, 0), (0, D)), ((W, 0), (W, D))]:
        (x1, y1), (x2, y2) = S.p(ox + u1, oy + v1, 0), S.p(ox + u2, oy + v2, 0)
        S.add(f'<path class="f" stroke-dasharray="3 2.5" d="M{f(x1)} {f(y1)}L{f(x2)} {f(y2)}"/>')
    S.ellipse("top", ox + W / 2, oy + D / 2, 0, 8, "h", fill=False)
    S.text("top", 0, ox + 6, oy - Hh - D / 2 + 2, "LID", size=5.5)
    # 折好的盒子，盒蓋半開
    bx, by, bw, bd, bh = 92, -40, 56, 40, 34
    S.box(bx, by, 0, bw, bd, bh)
    S.poly([(bx + 3, by + 3, bh), (bx + bw - 3, by + 3, bh), (bx + bw - 3, by + bd - 3, bh), (bx + 3, by + bd - 3, bh)], "f", fill=False)
    a = math.radians(64)
    L = bd
    lid = [(bx, by, bh), (bx + bw, by, bh), (bx + bw, by + L * math.cos(a) * -1 + 0, bh + L * math.sin(a)), (bx, by - L * math.cos(a), bh + L * math.sin(a))]
    S.poly(lid)
    # 色票扇
    px, py = 64, 96
    for i, ang in enumerate([-8, 6, 20, 34, 48]):
        t = math.radians(ang)
        def rp(u, v):
            return (px + u * math.cos(t) - v * math.sin(t), py + u * math.sin(t) + v * math.cos(t), 0)
        S.poly([rp(0, -6), rp(78, -6), rp(78, 6), rp(0, 6)])
        for j in range(4):
            S.path3([rp(30 + j * 12, -6), rp(30 + j * 12, 6)], "h")
    S.ellipse("top", px + 4, py, 0, 2.6, "d", fill=False)
    # 四角裁切線
    S.save("svc-custom.svg", "客製化印刷服務")


# ======================================================================
# 流程（米白底黑線，class d 會被依序畫出）
# ======================================================================
def proc_brief():
    S = Scene(640, 400, 1.32, 300, 118, fit=(60, 118, 540, 270))
    # 桌面
    S.box(-20, -10, -6, 250, 150, 6)
    # 色票扇
    px, py = 160, 6
    for ang in [96, 112, 128, 144]:
        t = math.radians(ang)
        def rp(u, v):
            return (px + u * math.cos(t) - v * math.sin(t), py + u * math.sin(t) + v * math.cos(t), 0)
        S.poly([rp(0, -5), rp(70, -5), rp(70, 5), rp(0, 5)])
        for j in range(3):
            S.path3([rp(34 + j * 12, -5), rp(34 + j * 12, 5)], "h")
    # 攤開的樣書
    bx, by = 4, 8
    S.poly([(bx, by, 0), (bx + 70, by, 0), (bx + 70, by + 48, 0), (bx, by + 48, 0)])
    S.path3([(bx + 2, by + 2, 0.5), (bx + 34, by + 2, 3), (bx + 34, by + 46, 3), (bx + 2, by + 46, 0.5)], "d", close=True, fill=True)
    S.path3([(bx + 34, by + 2, 3), (bx + 68, by + 2, 0.5), (bx + 68, by + 46, 0.5), (bx + 34, by + 46, 3)], "d", close=True, fill=True)
    for i in range(5):
        S.line((bx + 8, by + 10 + i * 6, 1.5), (bx + 28, by + 10 + i * 6, 2.6), "h")
    S.path3([(bx + 40, by + 8, 2.6), (bx + 62, by + 8, 1), (bx + 62, by + 26, 1), (bx + 40, by + 26, 2.6)], "f", close=True)
    S.path3([(bx + 40, by + 26, 2.6), (bx + 48, by + 16, 2.3), (bx + 54, by + 22, 1.9), (bx + 62, by + 12, 1)], "h")
    # 規格單（夾板）：一行一項
    cx, cy = 92, 46
    S.box(cx, cy, 0, 74, 58, 2)
    S.poly([(cx + 5, cy + 5, 2.2), (cx + 69, cy + 5, 2.2), (cx + 69, cy + 54, 2.2), (cx + 5, cy + 54, 2.2)], "f", fill=False)
    S.box(cx + 30, cy - 2, 2, 14, 7, 3)
    S.text("top", 2.4, cx + 37, cy + 15.5, "印刷需求單", size=5.6, cls="tx", anchor="middle", weight=500)
    S.line((cx + 12, cy + 19, 2.4), (cx + 62, cy + 19, 2.4), "h")
    rows = []
    for i, t in enumerate(["規格", "數量", "預算", "期程"]):
        v = cy + 27 + i * 7.4
        rows.append(v)
        S.poly([(cx + 12, v - 4.2, 2.4), (cx + 16.6, v - 4.2, 2.4), (cx + 16.6, v + 0.4, 2.4), (cx + 12, v + 0.4, 2.4)], "d", fill=False)
        S.text("top", 2.4, cx + 20, v + 0.6, t, size=4.6, cls="tx")
        S.line((cx + 34, v, 2.4), (cx + 62, v, 2.4), "h")
    # 咖啡杯
    cup(S, 200, 92)
    # 手機
    S.box(30, 86, 0, 26, 48, 2.5)
    S.poly([(32, 88, 2.6), (54, 88, 2.6), (54, 132, 2.6), (32, 132, 2.6)], "f", fill=False)
    # 筆
    pen(S, 100, 116, 0, 54)
    # 打勾（最後畫）
    for v in rows:
        S.path3([(cx + 12.8, v - 2.2, 2.5), (cx + 14.2, v - 0.6, 2.5), (cx + 17.6, v - 5.4, 2.5)], "d ck")
    # 對話框（平面，不做透視）
    S.raw('<path class="d o" fill="#F4EFE6" d="M96 34H232Q248 34 248 50V86Q248 102 232 102H140L112 124L118 102H96Q80 102 80 86V50Q80 34 96 34Z"/>')
    S.raw('<path class="f" d="M100 56H226M100 70H206M100 84H170"/>')
    S.raw('<g transform="translate(60 0)"><path class="d o" fill="#F4EFE6" d="M446 52H550Q566 52 566 68V96Q566 112 550 112H530L544 134L506 112H446Q430 112 430 96V68Q430 52 446 52Z"/>'
          '<circle class="dot" cx="474" cy="82" r="3.6"/><circle class="dot" cx="498" cy="82" r="3.6"/><circle class="dot" cx="522" cy="82" r="3.6"/></g>')
    S.save("proc-1.svg", "需求洽談：規格單、樣書、色票")


def proc_proof():
    S = Scene(640, 400, 1.3, 300, 92, fit=(40, 30, 470, 344))
    # 標準光源看樣台（D50）
    W, D, H = 200, 110, 120
    S.poly([(0, 0, 0), (W, 0, 0), (W, 0, H), (0, 0, H)])            # 背板內側
    S.poly([(0, 0, 0), (0, D, 0), (0, D, H), (0, 0, H)])            # 左側板內側
    S.poly([(0, 0, 0), (W, 0, 0), (W, D, 0), (0, D, 0)])            # 底板
    for i in range(1, 6):
        S.line((0, 0, H * i / 6), (W, 0, H * i / 6), "h")
    # 底板上的打樣
    sx, sy, sw, sd = 34, 18, 120, 82
    S.poly([(sx, sy, 0.3), (sx + sw, sy, 0.3), (sx + sw, sy + sd, 0.3), (sx, sy + sd, 0.3)])
    for (cx, cy, dx, dy) in [(sx, sy, -1, -1), (sx + sw, sy, 1, -1), (sx + sw, sy + sd, 1, 1), (sx, sy + sd, -1, 1)]:
        S.line((cx + dx * 3, cy, 0.3), (cx + dx * 10, cy, 0.3), "f")
        S.line((cx, cy + dy * 3, 0.3), (cx, cy + dy * 10, 0.3), "f")
    S.poly([(sx + 10, sy + 8, 0.3), (sx + 70, sy + 8, 0.3), (sx + 70, sy + 50, 0.3), (sx + 10, sy + 50, 0.3)], "f", fill=False)
    S.path3([(sx + 10, sy + 50, 0.3), (sx + 30, sy + 28, 0.3), (sx + 44, sy + 40, 0.3), (sx + 58, sy + 22, 0.3), (sx + 70, sy + 36, 0.3)], "f")
    S.ellipse("top", sx + 58, sy + 16, 0.3, 4, "f", fill=False)
    text_lines(S, "top", 0.3, sx + 78, sy + 10, [32, 26, 30, 18, 28, 22], 6, "h")
    for k in range(7):
        u = sx + 10 + k * 14
        S.poly([(u, sy + 60, 0.3), (u + 11, sy + 60, 0.3), (u + 11, sy + 71, 0.3), (u, sy + 71, 0.3)], "d sw", extra=f' data-k="{k}"')
    # 右側板（外側）+ 上方燈罩
    S.box(W, 0, 0, 5, D, H)
    S.box(-5, 0, H, W + 10, D + 6, 14)
    S.text("xz", D + 6, 8, -(H + 4.2), "D50 · 標準光源", size=6.2)
    for i in range(10):
        S.line((W + 5, 12 + i * 9, H + 3), (W + 5, 12 + i * 9, H + 11), "h")
    # 放大鏡（data-role loupe，JS 沿著色階移動）
    lx, ly = sx + 16, sy + 66
    g = []
    S.raw('<g data-role="loupe">')
    S.cylinder("z", lx, ly, 0.3, 10, 9, "d")
    S.ellipse("top", lx, ly, 10, 6.5, "f", fill=False)
    S.box(lx + 7, ly - 1.5, 4, 22, 3, 3)
    S.raw("</g>")
    a = S.p(1, 0, 0)
    o = S.p(0, 0, 0)
    S.raw(f'<g data-role="dir" data-x="{f(a[0] - o[0])}" data-y="{f(a[1] - o[1])}"></g>')
    # 旁邊立著的色票本
    S.box(-46, 30, 0, 14, 40, 60)
    for i in range(1, 6):
        S.line((-32, 30 + i * 6.5, 2), (-32, 30 + i * 6.5, 58), "h")
    # 校色 OK 章（平面）
    S.raw('<g data-role="stamp" opacity="0"><g transform="rotate(-8 552 60)"><rect x="498" y="40" width="108" height="40" rx="4" class="b"/><text class="tx" x="552" y="66" font-size="15" text-anchor="middle" letter-spacing=".16em">校色 OK</text></g></g>')
    S.save("proc-2.svg", "打樣校色：標準光源看樣台")


def proc_press():
    """依倚樂廠內的數位輪轉機：左邊紙捲架 → 主機（螢幕、鍵盤、燈號、上方排風）→ Phenix330 → 出紙輸送台"""
    S = Scene(640, 400, 0.98, 120, 176, alpha=18, beta=40, ys=0.8)
    # 地面陰影線
    S.poly([(-30, -14, 0), (400, -14, 0), (400, 96, 0), (-30, 96, 0)], "h", fill=False)
    # ---------- 主機背後的排風箱 ----------
    S.box(116, 16, 152, 54, 40, 34)
    for i in range(6):
        S.line((116 + 8 + i * 7, 56, 158), (116 + 8 + i * 7, 56, 180), "h")
    S.cylinder("z", 132, 26, 186, 200, 7)
    # ---------- 紙捲架 ----------
    S.box(-6, 6, 0, 52, 70, 14)
    S.box(2, 8, 14, 6, 4, 58)
    S.cylinder("y", 22, 52, 10, 72, 36)
    for r in (27, 18):
        S.ellipse("xz", 22, 52, 72, r, "h", fill=False)
    S.ellipse("xz", 22, 52, 72, 7)
    # 紙捲中心會轉的放射線
    m = S.plane("xz", 72)
    S.raw(f'<g transform="{S.mtx(m)}"><g data-role="spin" data-cx="22" data-cy="-52">'
          + "".join(f'<path class="h" vector-effect="non-scaling-stroke" d="M{f(22 + 9 * math.cos(math.radians(a)))} {f(-52 + 9 * math.sin(math.radians(a)))}L{f(22 + 33 * math.cos(math.radians(a)))} {f(-52 + 33 * math.sin(math.radians(a)))}"/>' for a in range(0, 360, 45))
          + "</g></g>")
    S.box(36, 8, 14, 6, 4, 58)
    # 紙帶（從紙捲頂端送進主機）
    S.path3([(22, 14, 88), (40, 14, 96), (60, 14, 104), (72, 14, 108), (72, 66, 108), (60, 66, 104), (40, 66, 96), (22, 66, 88)], "d", close=True, fill=True)
    S.line((22, 66, 88), (22, 66, 80), "h")
    # ---------- 主機 ----------
    x0, x1, Y = 72, 192, 80
    S.box(x0, 0, 0, x1 - x0, Y, 152)
    S.line((x0, Y, 6), (x1, Y, 6), "f")
    # 黑玻璃門 + 反光
    S.poly([(122, Y, 10), (186, Y, 10), (186, Y, 146), (122, Y, 146)], "d", fill=False)
    for i, (a, b) in enumerate([(130, 160), (140, 178), (152, 186)]):
        S.line((a, Y, 140), (b, Y, 60 - i * 12), "h")
    S.line((126, Y, 76), (126, Y, 88), "d")
    # 左側面板：螢幕、鍵盤、急停鈕
    S.poly([(78, Y, 70), (116, Y, 70), (116, Y, 146), (78, Y, 146)], "f", fill=False)
    S.box(80, Y, 100, 34, 5, 28)
    S.poly([(83, Y + 5, 103), (111, Y + 5, 103), (111, Y + 5, 125), (83, Y + 5, 125)], "f", fill=False)
    text_lines(S, "xz", Y + 5, 86, 120, [18, 22, 14, 20], -4, "h")
    S.box(76, Y, 82, 38, 18, 3)
    for i in range(6):
        S.line((79 + i * 5.5, Y + 4, 85), (79 + i * 5.5, Y + 15, 85), "h")
    S.ellipse("xz", 118, 112, Y, 2.6, "d")
    # 燈號塔
    S.cylinder("z", 82, 74, 152, 176, 3.6)
    for zz in (160, 168):
        S.path3(S.circle_pts("top", 82, 74, zz, 3.6, a0=-30, a1=150), "f")
    # 側面縫線與散熱孔
    S.line((x1, 4, 90), (x1, Y - 4, 90), "f")
    for i in range(7):
        S.line((x1, 12 + i * 8, 112), (x1, 12 + i * 8, 136), "h")
    # ---------- Phenix330 ----------
    px0, px1, py0, py1, ph = 192, 290, 4, 78, 86
    # 開著的上蓋（在主體後方先畫）
    a = math.radians(72)
    L = py1 - py0
    ly, lz = py0 + L * math.cos(a), ph + L * math.sin(a)
    S.poly([(px0 + 2, py0, ph), (px1 - 2, py0, ph), (px1 - 2, ly, lz), (px0 + 2, ly, lz)])
    S.poly([(px0 + 8, py0 + 2, ph + 6), (px1 - 8, py0 + 2, ph + 6), (px1 - 8, ly + 1.2, lz - 6), (px0 + 8, ly + 1.2, lz - 6)], "h", fill=False)
    S.line(((px0 + px1) / 2, py0 + 1, ph + 4), ((px0 + px1) / 2, ly + 1, lz - 4), "h")
    S.box(px0, py0, 0, px1 - px0, py1 - py0, ph, faces="tl")
    S.line((px0 + 30, py0 + 6, ph), (px0 + 30, ly + 0.6, ph + 40), "f")
    S.line((px1 - 30, py0 + 6, ph), (px1 - 30, ly + 0.6, ph + 40), "f")
    # 控制面板
    S.line((px0, py1, 70), (px1, py1, 70), "d")
    for i, u in enumerate([200, 212, 224]):
        S.ellipse("xz", u, 78, py1, 2.4, "f", fill=False)
    S.poly([(240, py1, 72), (262, py1, 72), (262, py1, 82), (240, py1, 82)], "d", fill=False)
    S.ellipse("xz", 276, 77, py1, 3.4, "d")
    # 兩扇門
    S.poly([(198, py1, 6), (240, py1, 6), (240, py1, 64), (198, py1, 64)], "f", fill=False)
    S.poly([(242, py1, 6), (284, py1, 6), (284, py1, 64), (242, py1, 64)], "f", fill=False)
    S.line((236, py1, 30), (236, py1, 40), "d")
    S.line((246, py1, 30), (246, py1, 40), "d")
    # ---------- Phenix 右側：出紙口（方正的開口，紙在裡面疊好從這裡推出）----------
    gy0, gy1, gz0, gz1 = py0 + 12, py1 - 12, 34, 64
    def sp(pts):
        return "M" + " L".join(f"{f(a)} {f(b)}" for a, b in (S.p(*q) for q in pts)) + "Z"
    face = [(px1, py0, 0), (px1, py1, 0), (px1, py1, ph), (px1, py0, ph)]
    hole = [(px1, gy0, gz0), (px1, gy1, gz0), (px1, gy1, gz1), (px1, gy0, gz1)]
    S.add(f'<path class="d" fill-rule="evenodd" fill="{PAPER}" d="{sp(face)} {sp(hole)}"/>')
    S.poly([(px1, gy0 + 2.5, gz0), (px1, gy1 - 2.5, gz0), (px1, gy1 - 2.5, gz1 - 2.5), (px1, gy0 + 2.5, gz1 - 2.5)], "h", fill=False)
    S.outline([S.p(xx, yy, zz) for xx in (px0, px1) for yy in (py0, py1) for zz in (0, ph)])
    # ---------- 後方較低的平台：接住推出來的整疊 ----------
    cx0, cx1, cy0, cy1, ch = px1, px1 + 96, py0 + 6, py1 - 6, gz0
    S.box(cx0, cy0, 0, cx1 - cx0, cy1 - cy0, ch)
    S.poly([(cx0 + 8, cy1, 7), (cx1 - 8, cy1, 7), (cx1 - 8, cy1, ch - 8), (cx0 + 8, cy1, ch - 8)], "f", fill=False)
    for i in range(1, 8):
        yy = cy0 + i * (cy1 - cy0) / 8
        S.line((cx0 + 3, yy, ch), (cx1 - 3, yy, ch), "h")
    # ---------- 紙在機器裡一張張疊起來（從出紙口看得到），最後整疊推到平台 ----------
    # 疊紙由 JS 依進度畫：在機器裡的部分只從出紙口看得到，推出去的部分完整畫出
    o, a1, a2, az = S.p(0, 0, 0), S.p(1, 0, 0), S.p(0, 1, 0), S.p(0, 0, 1)
    vec = lambda q: f"{q[0]-o[0]:.4f},{q[1]-o[1]:.4f}"
    sx0, sw = px1 - 52, 46
    S.raw(f'<g data-role="axes" data-o="{o[0]:.3f},{o[1]:.3f}" data-ax="{vec(a1)}" data-ay="{vec(a2)}" data-az="{vec(az)}"'
          f' data-stack="{sx0},{sw},{gy0 + 4},{gy1 - gy0 - 8},{gz0},1.8,14,{px1},{px1 + 22 - sx0}"></g>')
    S.raw(f'<defs><clipPath id="stackclip"><path d="{sp(hole)}"/></clipPath></defs>')
    S.raw('<g data-role="stackIn" clip-path="url(#stackclip)"></g><g data-role="stackOut"></g>')
    S.save("proc-3.svg", "正式印製：倚樂的數位輪轉機與 Phenix330")


def proc_pack():
    S = Scene(640, 400, 1.3, 268, 126)
    # 工作桌
    S.box(-30, -10, -6, 160, 110, 6)
    # 一疊成品書
    for i, (dx, dy) in enumerate([(0, 0), (2, -1), (-1, 1), (1, 0)]):
        book_flat(S, 0 + dx, 10 + dy, i * 11, 70, 50, 11)
    # 品檢單 + 勾
    S.poly([(-20, 70, 0.2), (30, 70, 0.2), (30, 96, 0.2), (-20, 96, 0.2)])
    text_lines(S, "top", 0.2, -14, 76, [30, 24, 34], 6, "h")
    S.text("top", 0.3, -14, 93, "逐冊檢驗 OK", size=6, cls="tx")
    # 要放進箱子的書（JS 移動）
    S.raw('<g data-role="book" style="opacity:0">')
    book_flat(S, 0, 10, 44, 70, 50, 11, None, None, "bk")
    S.raw("</g>")
    a1, o = S.p(1, 0, 0), S.p(0, 0, 0)
    a2 = S.p(0, 1, 0)
    az = S.p(0, 0, 1)
    S.raw(f'<g data-role="axes" data-ax="{f(a1[0]-o[0])},{f(a1[1]-o[1])}" data-ay="{f(a2[0]-o[0])},{f(a2[1]-o[1])}" data-az="{f(az[0]-o[0])},{f(az[1]-o[1])}"></g>')
    # ---------- 紙箱 ----------
    bx, by, bw, bd, bh = 150, 4, 96, 66, 58
    S.poly([(bx, by, 0), (bx + bw, by, 0), (bx + bw, by, bh), (bx, by, bh)])         # 後壁內側
    S.poly([(bx, by, 0), (bx, by + bd, 0), (bx, by + bd, bh), (bx, by, bh)])         # 左壁內側
    S.raw('<g data-role="boxfront">')
    S.box(bx, by, 0, bw, bd, bh, "d", faces="lr")
    S.raw("</g>")
    S.line((bx + bw, by + bd, 8), (bx + bw, by + bd, bh - 8), "h")
    S.sticker("xz", by + bd, bx + 8, -50, 46, rot=-4)
    # 「小心輕放」易碎貼紙：白底、紅框、兩個向上箭頭
    m = S.plane("xz", by + bd)
    u0, v0, w, h, RED = bx + 60, -31, 28, 23, "#C4122F"
    cx = u0 + w / 2
    arrows = "".join(f'<path d="M{f(ax)} {f(v0 + 13.2)}V{f(v0 + 4.6)}M{f(ax - 2.6)} {f(v0 + 7.2)}L{f(ax)} {f(v0 + 4.4)}L{f(ax + 2.6)} {f(v0 + 7.2)}"/>' for ax in (cx - 4.2, cx + 4.2))
    S.raw(f'<g class="tx" transform="{S.mtx(m)}"><g transform="rotate(3 {f(cx)} {f(v0 + h / 2)})">'
          f'<rect x="{f(u0)}" y="{f(v0)}" width="{w}" height="{h}" rx="2.2" fill="#FFFFFF" stroke="#1C1A17" stroke-width=".55"/>'
          f'<rect x="{f(u0 + 1.6)}" y="{f(v0 + 1.6)}" width="{w - 3.2}" height="{h - 3.2}" rx="1.2" fill="none" stroke="{RED}" stroke-width=".6"/>'
          f'<g fill="none" stroke="{RED}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">{arrows}</g>'
          f'<text x="{f(cx)}" y="{f(v0 + 19.4)}" font-size="4.6" font-weight="700" text-anchor="middle" fill="{RED}" letter-spacing=".3">小心輕放</text>'
          '</g></g>')
    # 四片蓋：先蓋左右兩片短蓋，再蓋前後兩片長蓋，最後貼封箱膠帶（JS 依進度換影格）
    L = bd / 2
    def flap(hinge, t):
        ang = math.radians(150 * (1 - t))           # 150° 打開 → 0° 蓋平
        c, z = math.cos(ang), bh + L * math.sin(ang)
        if hinge == "L":
            xx = bx + L * c
            return S.pts([(bx, by, bh), (bx, by + bd, bh), (xx, by + bd, z), (xx, by, z)])
        if hinge == "R":
            xx = bx + bw - L * c
            return S.pts([(bx + bw, by, bh), (bx + bw, by + bd, bh), (xx, by + bd, z), (xx, by, z)])
        if hinge == "B":
            yy = by + L * c
            return S.pts([(bx, by, bh), (bx + bw, by, bh), (bx + bw, yy, z), (bx, yy, z)])
        yy = by + bd - L * c
        return S.pts([(bx, by + bd, bh), (bx + bw, by + bd, bh), (bx + bw, yy, z), (bx, yy, z)])
    for hinge, t0, t1 in (("L", 0.80, 0.86), ("R", 0.82, 0.88), ("B", 0.87, 0.93), ("F", 0.89, 0.95)):
        frames = [flap(hinge, i / 20) for i in range(21)]
        S.raw(f'<polygon class="d" data-role="flap{hinge}" data-t0="{t0}" data-t1="{t1}" fill="{PAPER}" points="{frames[0]}" data-frames=\'{json.dumps(frames)}\'/>')
    # 封箱膠帶
    p0, p1 = S.p(bx, by + bd / 2, bh + 0.5), S.p(bx + bw, by + bd / 2, bh + 0.5)
    S.raw(f'<path data-role="tape" class="tape" d="M{f(p0[0])} {f(p0[1])}L{f(p0[0])} {f(p0[1])}" data-to="{f(p1[0])},{f(p1[1])}"/>')
    S.save("proc-4.svg", "品檢包裝：逐冊檢查後裝箱")


def proc_ship():
    S = Scene(640, 400, 1.12, 150, 142, alpha=20, beta=38, ys=0.82, fit=(12, 16, 616, 368))
    # 道路
    S.poly([(-24, 40, 0), (236, 40, 0), (236, 112, 0), (-24, 112, 0)], "f", fill=False)
    for i in range(6):
        x = -14 + i * 42
        S.line((x, 80, 0), (x + 22, 80, 0), "h")
    # 目的地：書店
    hx, hy = 182, -40
    S.box(hx, hy, 0, 90, 70, 72)
    S.poly([(hx - 2, hy + 70, 72), (hx + 92, hy + 70, 72), (hx + 92, hy + 70, 84), (hx - 2, hy + 70, 84)])
    S.text("xz", hy + 70, hx + 45, -75.5, "BOOKS · 書店", size=7, anchor="middle")
    S.poly([(hx + 8, hy + 70, 0), (hx + 30, hy + 70, 0), (hx + 30, hy + 70, 42), (hx + 8, hy + 70, 42)], "f", fill=False)
    S.poly([(hx + 40, hy + 70, 14), (hx + 82, hy + 70, 14), (hx + 82, hy + 70, 50), (hx + 40, hy + 70, 50)], "f", fill=False)
    for i in range(1, 4):
        S.line((hx + 40, hy + 70, 14 + i * 9), (hx + 82, hy + 70, 14 + i * 9), "h")
    # 遮雨棚
    S.poly([(hx + 36, hy + 70, 56), (hx + 86, hy + 70, 56), (hx + 86, hy + 80, 48), (hx + 36, hy + 80, 48)])
    for i in range(1, 6):
        S.line((hx + 36 + i * 8.3, hy + 70, 56), (hx + 36 + i * 8.3, hy + 80, 48), "h")
    for i in range(3):
        S.poly([(hx + 90, hy + 10 + i * 20, 30), (hx + 90, hy + 22 + i * 20, 30), (hx + 90, hy + 22 + i * 20, 50), (hx + 90, hy + 10 + i * 20, 50)], "f", fill=False)
    # ---------- 貨車 ----------
    a1, o = S.p(1, 0, 0), S.p(0, 0, 0)
    S.raw(f'<g data-role="truck" data-x="{f(a1[0]-o[0])}" data-y="{f(a1[1]-o[1])}">')
    tx, ty = 0, 52
    # 速度線
    S.raw('<g data-role="speed">')
    for i, zz in enumerate([22, 34, 46]):
        S.line((tx - 40 - i * 6, ty + 40, zz), (tx - 12, ty + 40, zz), "f")
    S.raw("</g>")
    Ys = ty + 40
    WR, WZ, AR = 9, 9, 11.5
    wheels_x = (tx + 18, tx + 76, tx + 110)
    def wheel(wx, wy, cap=True):
        S.cylinder("y", wx, WZ, wy - 6, wy, WR, cap=cap)
        if cap:
            S.ellipse("xz", wx, WZ, wy, 6, "f", fill=False)
            m = S.plane("xz", wy)
            spokes = "".join(
                f'<path class="f" vector-effect="non-scaling-stroke" d="M{f(wx + 2.4 * math.cos(math.radians(90 + k * 72)))} {f(-WZ + 2.4 * math.sin(math.radians(90 + k * 72)))}'
                f'L{f(wx + 5.6 * math.cos(math.radians(90 + k * 72)))} {f(-WZ + 5.6 * math.sin(math.radians(90 + k * 72)))}"/>' for k in range(5))
            S.raw(f'<g transform="{S.mtx(m)}"><g data-role="wheelspin" data-cx="{f(wx)}" data-cy="{f(-WZ)}">{spokes}'
                  f'<circle class="d" vector-effect="non-scaling-stroke" cx="{f(wx)}" cy="{f(-WZ)}" r="2.2" fill="{PAPER}"/>'
                  f'<circle class="f" vector-effect="non-scaling-stroke" cx="{f(wx)}" cy="{f(-WZ - 1.2)}" r="0.45"/></g></g>')
    # 另一側的輪子（從車底下露出一點）
    for wx in wheels_x:
        wheel(wx, ty + 9, cap=False)
    # 這一側的輪子：稍微往內，外面有輪拱包住
    for wx in wheels_x:
        wheel(wx, Ys - 1.5)
    def notched(x0, x1, zb, top_pts, wxs):
        """側面輪廓：底邊在輪子處挖出圓弧輪拱。top_pts 是由後往前的上緣 (x, z)。"""
        pts = [(x0, zb)]
        for wx in wxs:
            if not (x0 < wx < x1):
                continue
            dx = math.sqrt(AR * AR - (zb - WZ) ** 2)
            a0 = math.degrees(math.atan2(zb - WZ, -dx))
            a1 = math.degrees(math.atan2(zb - WZ, dx))
            pts.append((wx - dx, zb))
            for i in range(1, 16):
                t = math.radians(a0 + (a1 - a0) * i / 16)
                pts.append((wx + AR * math.cos(t), WZ + AR * math.sin(t)))
            pts.append((wx + dx, zb))
        pts.append((x1, zb))
        return pts + top_pts
    def fender(wx, y):
        S.path3([(wx + (AR + 1.6) * math.cos(math.radians(t)), y, WZ + (AR + 1.6) * math.sin(math.radians(t))) for t in range(158, 21, -8)], "d")
    # 貨櫃
    X1 = tx + 96
    S.poly([(X1, ty, 14), (X1, Ys, 14), (X1, Ys, 60), (X1, ty, 60)])
    S.poly([(tx, ty, 60), (X1, ty, 60), (X1, Ys, 60), (tx, Ys, 60)])
    side = notched(tx, X1, 14, [(X1, 60), (tx, 60)], wheels_x[:2])
    S.poly([(u, Ys, v) for u, v in side])
    S.outline_path([(u, Ys, v) for u, v in side[:-2]] + [(X1, ty, 14), (X1, ty, 60), (tx, ty, 60), (tx, Ys, 60)], close=True)
    for wx in wheels_x[:2]:
        fender(wx, Ys)
    for i in range(1, 6):
        S.line((X1, ty + i * 6.6, 17), (X1, ty + i * 6.6, 58), "h")
    S.sticker("xz", Ys, tx + 18, -56, 58, rot=-3)
    # 車頭：側面輪廓（斜擋風玻璃），前輪處一樣有輪拱
    cx, y0, y1 = tx + 98, ty + 2, ty + 38
    S.poly([(cx + 24, y0, 14), (cx + 24, y1, 14), (cx + 24, y1, 25), (cx + 24, y0, 25)])             # 車頭正面
    S.poly([(cx + 24, y0, 25), (cx + 24, y1, 25), (cx + 14, y1, 36), (cx + 14, y0, 36)])             # 擋風玻璃
    S.poly([(cx, y0, 36), (cx + 14, y0, 36), (cx + 14, y1, 36), (cx, y1, 36)])                       # 車頂
    cab = notched(cx, cx + 24, 14, [(cx + 24, 25), (cx + 14, 36), (cx, 36)], wheels_x[2:])
    S.poly([(u, y1, v) for u, v in cab])
    S.outline_path([(u, y1, v) for u, v in cab[:-3]] + [(cx + 24, y0, 14), (cx + 24, y0, 25), (cx + 14, y0, 36), (cx, y0, 36), (cx, y1, 36)], close=True)
    fender(wheels_x[2], y1)
    S.poly([(cx + 23, y0 + 3, 26.5), (cx + 23, y1 - 3, 26.5), (cx + 15.4, y1 - 3, 34), (cx + 15.4, y0 + 3, 34)], "h", fill=False)
    S.poly([(cx + 3, y1, 24), (cx + 12, y1, 24), (cx + 12, y1, 33), (cx + 3, y1, 33)], "f", fill=False)
    S.line((cx + 24, y0 + 4, 18), (cx + 24, y0 + 10, 18), "d")
    S.line((cx + 24, y1 - 10, 18), (cx + 24, y1 - 4, 18), "d")
    S.line((cx + 24, y0 + 13, 16), (cx + 24, y1 - 13, 16), "f")
    S.raw("</g>")
    S.save("proc-5.svg", "出貨配送：貨車送到書店")


if __name__ == "__main__":
    for fn in (svc_textbook, svc_digital, svc_hardcover, svc_corporate, svc_custom,
               proc_brief, proc_proof, proc_press, proc_pack, proc_ship):
        ADJ = None
        fn()
        (x0, y0, x1, y1), (fx, fy, fw, fh) = LAST
        sc = min(fw / (x1 - x0), fh / (y1 - y0))
        ADJ = (sc, fx + (fw - (x1 - x0) * sc) / 2 - x0 * sc, fy + (fh - (y1 - y0) * sc) / 2 - y0 * sc)
        fn()
    print("done")
