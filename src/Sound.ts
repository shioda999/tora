import sound from 'pixi-sound'
export class Sound {
    private static data: sound.Sound[] = []
    private static id_list: string[] = []
    public static load(fileName: string, id: string) {
        const index = this.id_list.indexOf(id)
        if (index !== -1) {
            return
        }
        fileName = "asset/" + fileName
        this.data.push(sound.Sound.from({ url: fileName, preload: true }))
        this.id_list.push(id)
    }
    public static play(id: string, loop = false, volume) {
        const index = this.id_list.indexOf(id)
        if (index === -1) return
        const inst: any = this.data[this.id_list.indexOf(id)]
        inst.volume = volume
        if (loop) {
            inst.play().on('end', () => {
                Sound.play(id, loop, volume)
            })
        }
        else inst.play()
    }
    public static pause(id: string) {
        const index = this.id_list.indexOf(id)
        if (index === -1) return
        this.data[this.id_list.indexOf(id)].pause()
    }
    public static stop(id: string) {
        const index = this.id_list.indexOf(id)
        if (id === "all") {
            this.data.forEach(n => n.pause())
        }
        if (index === -1) return
        this.data[this.id_list.indexOf(id)].pause()
    }
    public static set_volume(id: string, volume: number) {
        const index = this.id_list.indexOf(id)
        if (index === -1) return
        this.data[this.id_list.indexOf(id)].volume = volume
    }
    public static set_master_volume(volume: number) {
        sound.volumeAll = volume
    }
}