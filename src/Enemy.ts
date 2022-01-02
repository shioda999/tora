import * as PIXI from "pixi.js"
import { WIDTH, HEIGHT, GlobalParam, SPEED, G, MyRand, FLAGS } from './global'
import { Key } from './key'
import { Screen } from './Screen'
import { GraphicManager } from './GraphicManager'
import { Ground } from "./Ground"
import { Effect } from './Effect'
import { Sound } from "./Sound"

const rand = new MyRand(2022)
enum state{
    INIT,
    SHOT,
    IVAL,
    SHOT2,
    MOVE,
    SHOT3,
    LASER,
    FALL
}
export class Enemy {
    public static create_shot
    public static create_laser
    public static px: number
    public static py: number
    private x: number = WIDTH + 16
    private y: number = 0
    private vx: number = 0
    private vy: number = 0
    private radius: number = 0
    private sprite: PIXI.Sprite
    public flag: boolean = true
    private cnt: number = 0
    private hp: number = 1
    private id_list = []
    private damage_cnt: number = 0
    private state: number = state.INIT
    private laser_data = {x:0, y:0, angle: 0}
    constructor(private ground: Ground, public type="toge") {
        let z = -2
        switch(this.type){
        case "toge":
        case "tank":
        case "base":
            this.y = this.ground.get_groundHeight(this.x)
            this.hp = 3
            break
        case "ufo":
            this.y = rand.rand() % (Math.max(this.ground.get_groundHeight(this.x), HEIGHT * 0.7) - 130) + 100
            z = 0
            break
        case "plane":
            this.y = rand.rand() % 30 + 40
            break
        case "helicopter":
            this.y = rand.rand() % 60 + 100
            this.hp = 3
            break
        case "warship":
        case "boss":
            this.hp = 300
            if(this.type == "warship")this.hp = 400
            this.y = HEIGHT * 0.4
            this.x = WIDTH * 2
            break
        }
        let graph = GraphicManager.GetInstance()
        this.sprite = graph.GetSprite(this.type)

        let container = Screen.init().getContainer()
        container.addChild(this.sprite)
        this.sprite.anchor.set(0.5)
        this.sprite.position.set(this.x, this.y)
        this.sprite.zIndex = z
        this.radius = this.sprite.height / 2
    }
    public update() {
        if(!this.flag)return
        this.x -= SPEED
        switch(this.type){
        case "ufo":
            const speed = 10
            this.x -= Math.cos(this.cnt * Math.PI / 180 * speed) * 30 * Math.PI / 180 * speed
            break
        case "tank":
            if(this.cnt % 60 == 0){
                if((this.x * 1234 + this.y * 987 + this.cnt) % 10 < 5)this.vx = 1.5
                else this.vx = -0.5
            }
            else if(this.cnt % 60 <= 40){
                let height = this.ground.get_groundHeight(this.x)
                if (Math.abs(height - this.y) < 5){
                    this.x += this.vx
                    this.y = height
                }
                else this.cnt = 40
            }
            else{
                if(this.cnt % 60 == 50){
                    Enemy.create_shot(this.x - 45, this.y - this.radius * 1.2, 3, Math.atan2(Enemy.py - this.y, Enemy.px - this.x))
                }
            }
            break
        case "plane":
            this.x -= 2
            if(this.cnt % 30 == 0){
                Enemy.create_shot(this.x - 30, this.y - this.radius, 4, Math.atan2(Enemy.py - this.y, Enemy.px + 200 - this.x))
            }
            break
        case "base":
            if(this.cnt % 60 == 20){
                Enemy.create_shot(this.x - 30, this.y - this.radius * 0.5, 2, Math.atan2(Enemy.py - this.y, (Enemy.px - this.x) * 0.5) + Math.PI * 0.1)
                Enemy.create_shot(this.x - 30, this.y - this.radius * 0.5, 2, Math.atan2(Enemy.py - this.y, (Enemy.px - this.x) * 0.5))
                Enemy.create_shot(this.x - 30, this.y - this.radius * 0.5, 2, Math.atan2(Enemy.py - this.y, (Enemy.px - this.x) * 0.5) - Math.PI * 0.1)
            }
            break
        case "helicopter":
            this.y += Math.cos(this.cnt * Math.PI / 30) * 0.5
            if(this.x >= WIDTH * 0.8)this.x += SPEED - 2.5
            else {
                this.x += SPEED
                if(this.cnt % 12 == 6){
                    Enemy.create_shot(this.x - 30, this.y - this.radius * 0.5, 2.5, Math.atan2(Enemy.py - this.y, (Enemy.px - this.x + 30) * 0.5)
                     + Math.PI * (this.y * 987654 % 5 - 3) / 10)
                }
            }
            break
        case "warship":
            this.move_warship()
            break
        case "boss":
            this.move_boss()
            break
        }
        if(this.type == "warship")
            this.sprite.position.set(this.x, this.y)
        else
            this.sprite.position.set(this.x, this.y - this.sprite.height / 2)
        if (this.x < -SPEED * 3) this.flag = false, this.release()
        if (this.damage_cnt > 0){
            this.damage_cnt--
            this.sprite.tint=0xffaaaa
            this.sprite.alpha = 3.0
            this.sprite.blendMode = PIXI.BLEND_MODES.HUE
            if(this.damage_cnt == 0){
                this.sprite.tint=0xffffff
                this.sprite.alpha = 1.0
                this.sprite.blendMode = PIXI.BLEND_MODES.NORMAL
            }
        }
        this.cnt++
    }
    public collision(px: number, py: number, r:number = 0) {
        if(!this.flag)return false
        return Math.sqrt(Math.pow(this.x - px, 2) + Math.pow(this.y - py, 2)) <= this.radius + r
    }
    public damage(v, id_list){
        id_list.forEach(i => {
            if (this.id_list.indexOf(i) == -1){
                this.hp -= v
                this.id_list.push(i)
                this.damage_cnt = 10
                Sound.play("hit", false, 0.5)
            }
        })
        if(this.hp <= 0){
            this.flag = false
            this.release()
            let large = 1.0
            if(this.type == "base")large = 2.0
            if(this.type == "warship")large = 6
            new Effect(this.x, this.y, "explosion", large)
        }
        return !this.flag
    }
    public release() {
        let container = Screen.init().getContainer()
        container.removeChild(this.sprite)
        this.sprite.destroy()
        this.sprite = null
        this.laser_data.x = -1
        if(this.type == "warship" || this.type == "boss"){
            FLAGS.defeat_boss = true
        }
    }
    private move_warship(){
        this.x += SPEED
        switch(this.state){
            case state.INIT:
                this.x += -2
                if(this.x <= WIDTH * 0.8)this.state = state.SHOT
                break
            case state.SHOT:
                if(this.cnt % 30 == 0){
                    for(let i = 0; i < 360; i += 36){
                        let angle = (i + this.cnt % 90 / 30 * 12) * Math.PI / 180
                        Enemy.create_shot(this.x, this.y + 20, 1.5, angle)
                    }
                }
                if(this.hp < 300){
                    this.state = state.IVAL, this.cnt = 0
                    new Effect(this.x, this.y + 20, "explosion", 3)
                }
                break
            case state.IVAL:
                this.cnt++
                if(this.cnt >= 100){
                    if(this.hp > 150)this.state = state.SHOT2
                    else this.state = state.LASER
                    this.cnt = 0
                }
                break
            case state.SHOT2:
                let f = false
                this.cnt %= 500
                if(this.cnt < 100)this.y--, f = true
                else if (this.cnt < 200){
                    if(this.cnt % 2 == 0){
                        Enemy.create_shot(this.x, this.y + 20, 3 + this.cnt % 4, -Math.PI)
                        Sound.play("shot", false, 0.5)
                    }
                }
                else if(this.cnt < 350) this.y++, f = true
                else if (this.cnt < 450){
                    if(this.cnt % 2 == 0){
                        Enemy.create_shot(this.x, this.y + 20, 3 + this.cnt % 4, -Math.PI)
                        Sound.play("shot", false, 0.5)
                    }
                }
                else if(this.cnt < 500)this.y--, f = true
                if(f && this.cnt % 20 == 0){
                    for(let i = -30; i <=30; i += 30){
                        let angle = i * Math.PI / 180
                        Enemy.create_shot(this.x, this.y + 20, 1.5, angle + Math.atan2(Enemy.py - this.y, (Enemy.px - this.x) * 0.5))
                    }
                }
                if(this.hp < 200){
                    this.state = state.MOVE, this.cnt = 0
                    new Effect(this.x, this.y + 20, "explosion", 3)
                }
                break
            case state.MOVE:
                if(Math.abs(this.y - HEIGHT * 0.4) > 3){
                    if(this.y > HEIGHT * 0.4)this.y -= 1.5
                    else this.y += 1.5
                }
                else if(this.cnt > 50)
                    this.state = state.LASER, this.cnt = 0
                break
            case state.LASER:
                this.cnt %= 500
                this.laser_data.x = this.x
                this.laser_data.y = this.y
                this.laser_data.angle = Math.PI
                if(this.cnt % 250 == 50)Enemy.create_laser(this.laser_data, 50, 150, 0x00ffff)
                if(this.cnt < 100)this.y--
                else if(this.cnt < 350) this.y++
                else if(this.cnt < 500)this.y--
                break
        }
    }
    private move_boss(){
        this.x += SPEED
        switch(this.state){
            case state.INIT:
                this.x += -2.5
                if(this.x <= WIDTH * 0.8)this.state = state.SHOT
                break
            case state.SHOT:
                if(this.cnt % 25 == 0){
                    for(let i = -50; i <=50; i += 25){
                        let angle = i * Math.PI / 180
                        Enemy.create_shot(this.x, this.y - 10, 3.5, angle + Math.atan2(Enemy.py - this.y, (Enemy.px - this.x) * 0.5))
                    }
                }
                if(this.hp < 250)this.state = state.IVAL, this.cnt = 0
                break
            case state.IVAL:
                this.cnt++
                if(this.cnt >= 80){
                    if(this.hp > 140)this.state = state.SHOT2
                    else this.state = state.SHOT3
                    this.cnt = 0
                }
                break
            case state.SHOT2:
                this.cnt %= 180
                if(this.cnt < 50)this.y-=2
                else if(this.cnt < 140) this.y+=2
                else if(this.cnt < 180)this.y-=2
                if(this.cnt % 18 == 0){
                    for(let i = -35; i <=35; i += 35){
                        let angle = i * Math.PI / 180
                        let speed = 2.5 + (this.cnt % 30) / 25
                        Enemy.create_shot(this.x, this.y - 10, speed, angle + Math.atan2(Enemy.py - this.y, (Enemy.px - this.x) * 0.5))
                    }
                }
                if(this.hp < 220)this.state = state.MOVE, this.cnt = 0
                break
            case state.MOVE:
                if(Math.abs(this.y - HEIGHT * 0.4) > 3){
                    if(this.y > HEIGHT * 0.4)this.y -= 3
                    else this.y += 3
                }
                else if(this.cnt > 50)
                    this.state = state.LASER, this.cnt = 0
                break
            case state.LASER:
                if(this.cnt % 20 == 10){
                    for(let i = -80; i < 80; i += 40){
                        let angle = i * Math.PI / 180
                        let speed = 1.5 + (this.cnt % 40) / 20
                        Enemy.create_shot(this.x, this.y - 10, speed, angle + Math.atan2(Enemy.py - this.y, (Enemy.px - this.x) * 0.5))
                    }
                }
                if(this.cnt % 120 == 90){
                    let data = {x: 0, y:0, angle:0}
                    data.x = this.x - 5
                    data.y = this.y - 60
                    data.angle = Math.atan2(Enemy.py - data.y, Enemy.px - data.x)
                    Enemy.create_laser(data, 5, 50)
                    data = { ...data }
                    data.x = this.x
                    data.y = this.y - 15
                    data.angle = Math.atan2(Enemy.py - data.y, Enemy.px - data.x)
                    Enemy.create_laser(data, 5, 50)
                    data = { ...data }
                    data.x = this.x + 20
                    data.y = this.y
                    data.angle = Math.atan2(Enemy.py - data.y, Enemy.px - data.x)
                    Enemy.create_laser(data, 5, 50)
                }
                if(this.hp < 140)this.state = state.IVAL, this.cnt = 0
                break
            case state.SHOT3:
                this.cnt %= 350
                if(this.cnt < 240){
                    if(this.cnt % 60 == 0){
                        this.vx = ((this.cnt * 1234 + this.x * 9876 + this.y * 456) % (WIDTH * 0.2) + WIDTH * 0.75 - this.x) / 60
                        this.vy = ((this.cnt * 9876 + this.x * 1234 + this.y * 654) % (HEIGHT * 0.4) + 40 - this.y) / 60
                    }
                    else{
                        this.x += this.vx
                        this.y += this.vy
                    }
                    if(this.cnt % 18 == 0){
                        for(let i = -100; i < 100; i += 25){
                            let angle = i * Math.PI / 180
                            Enemy.create_shot(this.x, this.y - 10, 2.5, angle + Math.atan2(Enemy.py - this.y, (Enemy.px - this.x) * 0.5))
                        }
                    }
                }
                else {
                    for(let speed = 3; speed < 5; speed += 1){
                        Enemy.create_shot(this.x, this.y - 10, speed, Math.atan2(Enemy.py - this.y, (Enemy.px - this.x) * 0.5))
                        Enemy.create_shot(this.x, this.y - 10, speed, Math.atan2(Enemy.py - this.y, (Enemy.px - this.x) * 0.5) + Math.PI * 0.2)
                        Enemy.create_shot(this.x, this.y - 10, speed, Math.atan2(Enemy.py - this.y, (Enemy.px - this.x) * 0.5) - Math.PI * 0.2)
                        Enemy.create_shot(this.x, this.y - 10, speed, Math.atan2(Enemy.py - this.y, (Enemy.px - this.x) * 0.5) + Math.PI * 0.4)
                        Enemy.create_shot(this.x, this.y - 10, speed, Math.atan2(Enemy.py - this.y, (Enemy.px - this.x) * 0.5) - Math.PI * 0.4)
                        Sound.play("shot", false, 0.5)
                    }
                }
                if(this.hp < 80)this.state = state.FALL, this.cnt = 0
                break
            case state.FALL:
                if(this.cnt <= 120){
                    if(this.cnt % 10 == 0){
                        let dx = (this.cnt * 1234 + this.x * 9876 + this.y * 456) % 64 - 32
                        let dy = (this.cnt * 9876 + this.x * 1234 + this.y * 654) % 64 - 32
                        new Effect(this.x + dx, this.y + dy, "explosion", 1.5)
                    }
                }
                else{
                    this.y++
                    if(this.y > this.ground.get_groundHeight(this.x)){
                        for(let i = 0; i < 360; i += 30){
                            let angle = i * Math.PI / 180
                            for(let speed = 8; speed <= 12; speed += 1)
                                Enemy.create_shot(this.x, this.y - 10, speed, angle)
                        }
                        this.release()
                        this.flag = false
                        new Effect(this.x, this.y, "explosion", 6)
                    }
                }
        }
    }
}