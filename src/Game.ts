import * as PIXI from "pixi.js"
import { Scene } from './Scene';
import { WIDTH, HEIGHT, GlobalParam, POS_X, FLAGS } from './global'
import { Key } from './key'
import { Tora } from './Tora'
import { GraphicManager } from './GraphicManager'
import { Sound } from './Sound'
import { Enemy } from "./Enemy";
import { GameOver } from './GameOver'
import { Ground } from "./Ground";
import { Shot } from "./Shot";
import { Laser } from "./Laser";
const FPS_UPDATE_FREQ = 20
const text_style = new PIXI.TextStyle({
    fontFamily: "Arial",
    fontSize: 16,
    fill: [0xffffff]
})
export class Game extends Scene {
    private score_text: PIXI.Text
    private stage: number = 1
    private curTime: number
    private prevTime: number
    private countFrame: number = 0
    private key: Key
    private fpsContainer: PIXI.Container
    private fpsText: PIXI.Text
    private fpsBox: PIXI.Graphics
    private releaseFlag: boolean = false
    private score: number = 0
    private adding_score: number = 0
    private adding_score_disp_time: number = 0
    private time: number = 0
    //private background: BackGround
    private Tora: Tora
    private enemys: Enemy[] = []
    private ground: Ground
    private shots = []
    private enemy_shots = []
    private enemy_laser = []
    private click_flg: boolean = false
    private text: PIXI.Text
    constructor(private container: PIXI.Container) {
        super()
        this.release = () => {
            this.releaseFlag = true
            Sound.stop("bgm")
        }
        //this.background = new BackGround(container, this.stage)
        const inst = GraphicManager.GetInstance()
        inst.SetLoadedFunc(() => {
            this.ground = new Ground()
            this.Tora = new Tora(this.ground, this.create_shot)
            Enemy.create_shot = this.create_enemy_shot
            Enemy.create_laser = this.create_enemy_laser
            this.key = Key.GetInstance()
            this.curTime = new Date().getTime() - 1000 * FPS_UPDATE_FREQ / 60
            this.initFpsContainer()
            this.make_text()
            this.loop()
        })
        Sound.play("bgm", true, GlobalParam.bgm_volume)
    }
    private obj_update() {
        Enemy.px = this.Tora.getx()
        Enemy.py = this.Tora.gety()
        this.ground.update()
        this.Tora.update()
        this.enemys.forEach(n => n.update())
        this.shots.forEach(n => n.update())
        this.enemy_shots.forEach(n => n.update())
        this.enemy_laser.forEach(n => n.update())
        let list = this.ground.generate_enemy()
        list.forEach(n => {
            let e = new Enemy(this.ground, n)
            this.enemys.push(e)
        })
        this.shot_check_collision()
        if (this.player_check_collision()) {
            Sound.stop("bgm")
            Sound.play("explosion", false, GlobalParam.se_volume * 2)
            this.gameover()
            this.releaseFlag = true
        }
        if (this.Tora.check_fall()) {
            Sound.stop("bgm")
            Sound.play("explosion", false, GlobalParam.se_volume)
            this.gameover()
            this.releaseFlag = true
        }
        this.enemys = this.enemys.filter(n => n.flag)
        this.shots = this.shots.filter(n => n.flag)
        this.enemy_shots = this.enemy_shots.filter(n => n.flag)
        this.enemy_laser = this.enemy_laser.filter(n => n.flag)
    }
    private player_check_collision() {
        let px = this.Tora.getx(), py = this.Tora.gety()
        let flag: boolean = false
        this.enemys.forEach(n => {
            if (n.collision(px, py - 10, 5)) flag = true
        })
        this.enemy_shots.forEach(n => {
            if (n.collision(px, py - 10, 0)) flag = true
        })
        this.enemy_laser.forEach(n => {
            if (n.collision(px, py - 10, 0)) flag = true
        })
        return flag
    }
    private shot_check_collision(){
        this.enemys.forEach(n => {
            if(n.type != "toge"){
                let damage = 0, id_list = []
                this.shots.forEach(n2 => {
                    if (n.collision(n2.getx(), n2.gety(), 10)){
                        damage++
                        id_list.push(n2.id)
                    }
                })
                if (n.damage(damage, id_list)){
                    this.AddScore(20)
                }
            }
        })
    }
    private gameover() {
        GlobalParam.data.score = this.score
        let inst = new GameOver(this.container, () => {
            Sound.stop("all")
            Sound.play("decide", false, GlobalParam.se_volume)
            if (this.key.IsPress_Now("r")) {
                this.Tora.release()
                this.Tora = new Tora(this.ground, this.create_shot)
                this.releaseFlag = false
                this.loop()
                inst.release()
            }
            else {
                this.exitCurrentScene()
                this.gotoScene("title")
            }
        })
    }
    private loop = () => {
        if (this.releaseFlag) return
        requestAnimationFrame(this.loop)
        if (GlobalParam.pause_flag) return
        if(!this.click_flg){
            this.time++
            if(this.time % 20 == 0)this.text.alpha = 0.8 - this.text.alpha
            return
        }
        if (this.time % 10 == 0) this.AddScore(1)
        if(FLAGS.game_clear == true)this.gotoScene("scoreBoard")
        this.key.RenewKeyData()
        //this.background.update()
        this.obj_update()
        this.update_score_text()
        if (this.countFrame % FPS_UPDATE_FREQ === 0) {
            this.prevTime = this.curTime
            this.curTime = new Date().getTime()
            this.updateFPS(this.curTime - this.prevTime)
        }
        this.countFrame++
        this.time++
        if (this.key.IsPress("cancel")) {
            Sound.play("cancel", false, GlobalParam.se_volume)
            this.gotoScene("back")
        }
    }
    private create_shot = (x, y, v, angle) => {
        this.shots.push(new Shot(x, y, v, angle, "tiger_shot"))
    }
    private create_enemy_shot = (x, y, v, angle: number) => {
        this.enemy_shots.push(new Shot(x, y, v, angle, "enemy_shot"))
    }
    private create_enemy_laser = (data, thick, time, color) => {
        this.enemy_laser.push(new Laser(data, thick, time, color))
    }
    private AddScore = (score: number) => {
        this.score += score
        if(score >= 5){
            this.adding_score += score
            this.adding_score_disp_time = 10
        }
        else{
            this.adding_score_disp_time--
            if(this.adding_score_disp_time < 0)this.adding_score = 0
        }
    }
    private make_text(){
        this.text = new PIXI.Text("Click to Start", new PIXI.TextStyle({
            fontFamily: "Arial",
            fontWeight: "normal",
            fontSize: 30,
            fill: [0xffffff, 0xeeeeee]
        }))
        this.text.interactive = true
        this.text.anchor.set(0.5)
        this.text.position.set(WIDTH / 2, HEIGHT / 2)
        this.text.alpha = 0.8
        this.text.addListener('mousedown', () => {
            this.click_flg = true, this.time = 0
            this.container.removeChild(this.text)
            Sound.play("powerup", false, 1.5)
        })
        this.container.addChild(this.text)
    }
    private orgRound(value, base) {
        return Math.round(value * base) / base;
    }
    private updateFPS(delta: number) {
        if (this.fpsText) {
            this.fpsContainer.removeChild(this.fpsText)
            this.fpsText.destroy()
        }
        this.fpsText = new PIXI.Text("FPS:" + this.orgRound(1000 * FPS_UPDATE_FREQ / delta, 100).toFixed(2), {
            fontFamily: "Arial", fontSize: WIDTH / 30, fill: 0xdddddd
        })
        if (!this.fpsBox) {
            this.fpsBox = new PIXI.Graphics()
            this.fpsBox.lineStyle(2, 0xcccccc, 1, 1.0)
            this.fpsBox.beginFill(0x0000ff, 0.3)
            this.fpsBox.drawRect(0, 0, this.fpsText.width, this.fpsText.height)
            this.fpsBox.endFill()
            this.fpsContainer.addChild(this.fpsBox)
            this.fpsContainer.x = WIDTH - this.fpsText.width - 3
            this.fpsContainer.y = 3
        }
        this.fpsContainer.addChild(this.fpsText)
    }
    private initFpsContainer() {
        this.fpsContainer = new PIXI.Container()
        this.fpsContainer.zIndex = 1
        this.container.addChild(this.fpsContainer)
    }
    private update_score_text() {
        this.container.removeChild(this.score_text)
        if (this.score_text) {
            this.score_text.destroy()
        }
        let score_text = " score : " + this.score
        if(this.adding_score_disp_time > 0){
            score_text += "   (+" + this.adding_score + ")"
        }
        this.score_text = new PIXI.Text(score_text, text_style)
        this.score_text.position.set(0, HEIGHT)
        this.score_text.anchor.x = 0
        this.score_text.anchor.y = 1.0
        this.container.addChild(this.score_text)
    }
}