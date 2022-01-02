import * as PIXI from "pixi.js"
import { Key } from './key'
import { WIDTH, HEIGHT } from './global'
import { Screen } from './Screen'
export class Fade {
    private count: number = 0
    private filter
    constructor(container: PIXI.Container, private callback: () => any) {
        Key.GetInstance().SetInactive()
        const effect = new PIXI.Container()
        let scale = Screen.get_scale()
        effect.filterArea = new PIXI.Rectangle(container.x, container.y, WIDTH * scale, HEIGHT * scale);
        container.addChild(effect);
        try {
            this.filter = new PIXI.Filter(null, shaderFrag,
                {
                    time: 0,
                    len: 800,
                    center_x: container.x + WIDTH / 2,
                    center_y: container.y + HEIGHT / 2
                });
            effect.filters = [this.filter];
        }
        catch {
            alert("GLSLのコードにエラーがあります。")
        }
        this.loop()
    }
    private loop = () => {
        this.filter.uniforms.time += 0.02
        if (this.count++ < 50) requestAnimationFrame(this.loop)
        else {
            Key.GetInstance().SetActive()
            this.callback()
        }
    }
}
const shaderFrag = `
precision highp float;

varying vec2 vTextureCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;
uniform float time;
uniform float len;
uniform float center_x, center_y;

void main() {
    const float PI_2 = 1.57079633;
    vec2 scr = vTextureCoord * inputSize.xy + outputFrame.xy;
    vec2 center = vec2(center_x, center_y);
    float x = length(scr - center) / len * 3.0 - 3.0 + sin(time * PI_2) * 6.0;
    x = min(x, 1.0);
    gl_FragColor = vec4(0.0 * x, 0.0 * x, 0.0 * x, x);
}
`;