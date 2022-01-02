import * as PIXI from "pixi.js"
import { WIDTH, HEIGHT, SPEED, inv_Phi, MyRand, FLAGS, FREQ } from './global'
import { Key } from './key'
import { Screen } from './Screen'
import { GraphicManager } from './GraphicManager'
const N = 20
const W = WIDTH / N
const GROUND = HEIGHT * 0.7
const HIGH = HEIGHT * 0.3
const NORMAL = 0
const HOLL = 1
const MOUNTAIN = 2
const BOSS = 10

const DEPTH = HEIGHT * 2

const LIMIT = 6

const dEFEAT_BOSS_INTERVAL = 200

export class Ground {
    private container: PIXI.Container
    private ground: PIXI.Graphics[] = []
    private time: number = 0
    private high: number[] = []
    private r: MyRand
    private r2: MyRand
    private holl_c: number = 0
    private toge_num: number = 0
    private toge_c: number = 0
    private level: number = 0
    private last_holl_size: number = 0
    private mount_c: number = 0
    private interval = {}
    private state: number = NORMAL
    private make_boss: boolean = false
    private defeat_boss_interval: number = dEFEAT_BOSS_INTERVAL
    constructor() {
        this.r = new MyRand(2022)
        this.r2 = new MyRand(2022)
        this.container = Screen.init().getContainer()
        for (let i = 0; i <= N + 2; i++) {
            this.high.push(HEIGHT * 0.7)
            this.make_ground(HEIGHT * 0.7, HEIGHT * 0.7)
        }
    }
    public update() {
        this.ground.forEach((n) => n.x -= SPEED)
        let temp = this.ground.filter((n) => n.x < -W)
        this.ground = this.ground.filter((n) => n.x >= -W)
        for (let i = 0; i < temp.length; i++) {
            this.high = this.high.slice(1)
            this.get_next_height()
        }
        if(this.state != BOSS){
            this.time++;
            if (this.time % 500 == 0) {
                this.level++
                if(this.level % 5 == 0)this.state = BOSS, this.make_boss = true
            }
        }
        else if(FLAGS.defeat_boss){
            this.defeat_boss_interval--
            if(this.defeat_boss_interval < 0){
                FLAGS.defeat_boss = false
                this.defeat_boss_interval = dEFEAT_BOSS_INTERVAL
                if(this.level >= 10) FLAGS.game_clear = true
                else this.state = NORMAL
            }
        }
        temp.forEach((n) => { this.container.removeChild(n); n.destroy(); n = null; })
    }
    private check(id: string){
        if (this.interval[id] == undefined){
            this.interval[id] = FREQ[id][this.level]
            return false
        }
        if(FREQ[id][this.level] > 0 && this.interval[id] < 0){
            this.interval[id] = FREQ[id][this.level] + this.r2.rand() % 60 - 30
            return true
        }
        return false
    }
    public generate_enemy() {
        let enemy_list = []
        if(this.state == BOSS){
            if(this.make_boss){
                if(this.level == 5)enemy_list.push("warship")
                if(this.level == 10)enemy_list.push("boss")
                this.make_boss = false
            }
            return enemy_list
        }
        if(this.genarate_toge())enemy_list.push("toge")
        for(const key in this.interval){
            this.interval[key]--
        }
        if(this.state != HOLL && !this.is_edge() && this.check("tank")){
            enemy_list.push("tank")
        }
        else if(this.state != HOLL && !this.is_edge() && this.check("base")){
            enemy_list.push("base")
        }
        else if(this.check("plane")){
            enemy_list.push("plane")
        }
        else if(this.check("helicopter")){
            enemy_list.push("helicopter")
        }
        else if(this.check("ufo")){
            enemy_list.push("ufo")
        }
        return enemy_list
    }
    private genarate_toge(){
        if (Math.floor(this.time / (W / SPEED)) == Math.floor((this.time - 1) / (W / SPEED)) || this.state == HOLL || this.state == BOSS || this.is_edge()){
            return false
        }
        let f: boolean
        if (this.toge_num) f = (this.r.rand() % 6 <= 2)
        else f = this.r.rand() % 5 == 0
        if (this.toge_c && this.toge_num == 0) f = false, this.toge_c--
        if (f && this.toge_num < (LIMIT - this.last_holl_size - 1)) {
            this.toge_num++
            this.toge_c = 5
            if(this.r.rand() % 10 < 8){
                return true
            }
        }
        else this.toge_num = 0
        return false
    }
    private is_edge() {
        let id
        for (id = 0; id < N + 2; id++) {
            if (this.ground[id].x + W > WIDTH + 16 - W * 3 / 2) break
        }
        return this.high[id + 1] == DEPTH
    }
    private get_next_height() {
        let new_h: number = HEIGHT
        let prev_h: number, d: number
        switch (this.state) {
            case BOSS:
                new_h = HEIGHT * 0.8 + this.r2.rand() % 20
                this.high.push(new_h)
                this.make_ground(this.high[this.high.length - 2], new_h)
                break
            case NORMAL:
                for (let i = this.high.length - 1; i >= 0; i--) {
                    if (this.high[i] != DEPTH) {
                        prev_h = this.high[i] + (this.high.length - 1 - i) * (this.r.rand() % 20 - 9)
                        prev_h = Math.max(HIGH, Math.min(prev_h, HEIGHT * 0.9))
                        if (i == this.high.length - 1) this.last_holl_size = 0
                        break
                    }
                }
                d = inv_Phi(this.r.rand() % 1000 / 1000) * 10
                new_h = prev_h + d
                new_h = Math.max(HIGH, Math.min(new_h, HEIGHT * 0.9))
                this.high.push(new_h)
                this.make_ground(prev_h, new_h)
                if (this.r.rand() % Math.max(18 - this.level, 5) == 0 && this.toge_c == 0) {
                    if (this.level >= 5 && this.r.rand() % 40 == 0) {
                        this.state = MOUNTAIN
                    }
                    else this.state = HOLL, this.holl_c = 0
                }
                break
            case HOLL:
                if (this.holl_c >= 2 && this.r.rand() % Math.min(4, 2 + Math.floor(this.level / 10)) == 0
                    || this.holl_c >= LIMIT) {
                    this.state = NORMAL
                    this.last_holl_size = this.holl_c
                }
                this.holl_c++
                this.high.push(DEPTH)
                this.make_ground(DEPTH, DEPTH)
                break
            case MOUNTAIN:
                for (let i = this.high.length - 1; i >= 0; i--) {
                    if (this.high[i] != DEPTH) {
                        prev_h = this.high[i] + (this.high.length - 1 - i) * (this.r.rand() % 20 - 9)
                        prev_h = Math.max(HIGH, Math.min(prev_h, HEIGHT * 0.9))
                        if (i == this.high.length - 1) this.last_holl_size = 0
                        break
                    }
                }
                d = inv_Phi(this.r.rand() % 1000 / 1000) * 25
                new_h = prev_h + d
                new_h = Math.max(HIGH, Math.min(new_h, HEIGHT * 0.9))
                this.high.push(new_h)
                this.make_ground(prev_h, new_h)
                this.mount_c++
                if (this.mount_c >= 60 && this.mount_c % 10 == 0 && this.r.rand() % 10 == 0) {
                    this.state = NORMAL
                    this.mount_c = 0
                }
                break
        }
    }
    private make_ground(h1: number, h2: number) {
        let x: number
        if (this.ground.length == 0) x = 0
        else x = this.ground[this.ground.length - 1].x + W
        let g = new PIXI.Graphics()
        h1 = Math.min(HEIGHT, h1)
        h2 = Math.min(HEIGHT, h2)
        g.beginFill(0x525200, 1)
        g.drawPolygon([0, h1, 0, HEIGHT, W, HEIGHT, W, h2])
        g.endFill()
        g.x = x
        g.zIndex = -1
        this.ground.push(g)
        this.container.addChild(g)
        g = null
    }
    public get_groundHeight(x: number) {
        let id: number
        x -= W * 3 / 2
        for (id = 0; id < N + 2; id++) {
            if (this.ground[id].x + W > x) break
        }
        let _x = this.ground[id].x
        let H1 = this.high[id], H2 = this.high[id + 1], H3 = this.high[id + 2]
        if (H1 == DEPTH) H1 = Math.min(H2, H3)
        if (H2 == DEPTH) H2 = Math.min(H1, H3)
        if (H3 == DEPTH) H3 = Math.min(H1, H2)
        let h1 = (H2 * (x - _x) + H1 * (_x + W - x)) / W
        let h2 = H2
        let h3 = (H3 * (x - _x) + H2 * (_x + W - x)) / W
        return Math.max(h1, h2, h3)
    }
    public release() {
        let container = Screen.init().getContainer()
        this.ground.filter((n) => container.removeChild(n))
    }
}