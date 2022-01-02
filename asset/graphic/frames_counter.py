import json
import os
import glob
import sys

def save_json(filename, data):
    dump = json.dumps(data, indent=4)
    with open(filename, 'w') as f:
        print(dump, file=f)

def main():
    dir = glob.glob("./asset/**", recursive=True)
    out = {}
    for e in dir:
        if len(e) >= 4 and e[-5:] == ".json":
            with open(e, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if 'frames' in data:
                    out[e] = len(data['frames'])
    save_json("./asset/graphic/frames_num.json", out)
if __name__ == "__main__":
    main()