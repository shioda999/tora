import json
import os
import glob
import sys
import cv2

try:
    from msvcrt import getch
except ImportError:
    import sys
    import tty
    import termios
    def getch():
            fd = sys.stdin.fileno()
            old = termios.tcgetattr(fd)
            try:
                tty.setraw(fd)
                return sys.stdin.read(1)
            finally:
                termios.tcsetattr(fd, termios.TCSADRAIN, old)

# Unicode制御文字のエイリアス
SPACE = 32
ENTER = 13
BACK = 8
TAB = 9
ESC = 27

def input_key():
    key = ord(getch())
    if key == SPACE:
        return "SPACE"
    if key == BACK:
        return "BACK"
    if key == ENTER:
        return "ENTER"
    elif key == TAB:
        return "TAB"
    elif key == ESC:
        return "ESC"
    elif key == 224:
        key = ord(getch())
        if key == 72:
            return "UP"
        elif key == 80:
            return "DOWN"
        elif key == 75:
            return "LEFT"
        elif key == 77:
            return "RIGHT"
        return "ERROR"
    else:
        return chr(key)

def select_item(item, disp = 8):
    pos = 0
    L = 80
    if len(item) == 0:
        return
    while True:
        s = max(0, min(len(item) - disp, pos - disp // 2))
        e = min(s + disp, len(item))
        for i in range(s, e):
            if i == e - 1 and e != len(item):
                print("   (以下略)" + " " * (L - 11))
                break
            print(('→ ' if i == pos else '   ') + item[i] + " " * (L - len(item[i])))
        
        c = input_key()
        if c == "UP":
            pos -= 1
        elif c == "DOWN":
            pos += 1
        elif c in ["ENTER", "SPACE", "z", "Z"]:
            return item[pos]
        elif c in ["x", "X", "ESC", "BACK"]:
            return None
        pos = (pos + len(item)) % len(item)
        set = ""
        for _ in range(s, e):
            set += "\033[1A\r"
        sys.stdout.write(set)

def gif2png(path):
    gif = cv2.VideoCapture(path)
    images = []
    while True:
        is_success, img = gif.read()
        if is_success:
            images.append(img)
        else:
            break
    path = path[:-4]+".png"
    cv2.imwrite(path, cv2.hconcat(images))
    return (path, len(images))
    


def make_json_data(path, w_num):
    data = {}
    img = cv2.imread(path)
    h_num = 1
    frame = {}
    basename = os.path.basename(path)
    name = basename[:-4]
    w = img.shape[1] / w_num
    h = img.shape[0] / h_num
    for i in range(h_num):
        for j in range(w_num):
            frame[name + "_" + str(i * w_num + j) + ".png"] = {
                "frame":{"x":j*w,"y":i*h,"w":w,"h":h},
                "rotated":False,
                "trimmed":True,
                "spriteSourceSize":{"x":0,"y":0,"w":w,"h":h},
			    "sourceSize": {"w": w, "h": h}
            }
    data["frames"] = frame
    data["meta"] = {
        "image": basename,
        "format": "RGBA8888",
		"size": {"w":img.shape[1],"h":img.shape[0]},
		"scale": "1.0"
    }
    return data

def save_json(filename, data):
    dump = json.dumps(data, indent=4)
    with open(filename, 'w') as f:
        print(dump, file=f)

def main():
    dir = glob.glob("./**", recursive=True)
    item = []
    for e in dir:
        if len(e) >= 4 and e[-4:] == ".gif":
            item.append(e)
    select = select_item(item)
    if select == None:
        return
    path, num = gif2png(select)
    data = make_json_data(path, num)
    save_json(select[:-4] + "_sprite.json", data)

if __name__ == "__main__":
    main()