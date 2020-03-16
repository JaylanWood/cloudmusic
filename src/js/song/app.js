{
    let view = {
        el: '#app',
        init() {
            this.$el = $(this.el)
        },
        render(data) {
            let {
                song,
                status
            } = data
            this.$el.css('background-image', `url(${song.cover})`)
            this.$el.find('img.cover').attr('src', song.cover)
            if (this.$el.find('audio').attr('src') !== song.url) {
                let audio = this.$el.find('audio').attr('src', song.url).get(0)
                // audio 的 ended 事件不会冒泡，需要把事件发布给 eventHub。
                audio.onended = () => {
                    window.eventHub.emit('songEnd')
                }
                audio.ontimeupdate = () => {
                    this.showLyrics(audio.currentTime)
                }
            }
            if (status === 'playing') {
                this.$el.find('.disc-container').addClass('playing')
            } else {
                this.$el.find('.disc-container').removeClass('playing')
            }
            this.$el.find('.song-description>h1').text(song.name)
            let {
                lyrics
            } = song
            lyrics.split('\n').map((string) => {
                // <p data-time="167.45">我想和你看棒球</p>
                let p = document.createElement('p')
                // 正则
                let regex = /\[([\d:.]+)\](.+)/
                // 返回数组 [0:"[03:46.840]我想和你看棒球", 1:"03:46.840", 2:"我想和你看棒球"]
                let matches = string.match(regex)

                if (matches) {
                    p.textContent = matches[2]
                    let time = matches[1]
                    let parts = time.split(':')
                    let minutes = parts[0]
                    let seconds = parts[1]
                    let newTime = parseInt(minutes, 10) * 60 + parseFloat(seconds, 10)
                    p.setAttribute('data-time', newTime)
                } else {
                    p.textContent = string
                }

                this.$el.find('.lyrics>.lines').append(p)
            })
        },
        play() {
            this.$el.find('audio')[0].play()
        },
        pause() {
            this.$el.find('audio')[0].pause()
        },
        showLyrics(time) {
            let allP = this.$el.find('.lyrics>.lines>p')
            let p
            for (let i = 0; i < allP.length; i++) {
                if (i === allP.length - 1) {
                    p = allP[i]
                    break
                } else {
                    let currentTime = allP.eq(i).attr('data-time')
                    let nextTime = allP.eq(i + 1).attr('data-time')
                    // 如果播放的time在currentTime和nextTime之间，说明allP[i]就是当前要显示的歌词。
                    if (currentTime <= time && time < nextTime) {
                        p = allP[i]
                        break
                    }
                }
            }
            // getBoundingClientRect()方法返回元素的大小及其相对于视口的位置。
            // p是当先要显示的歌词
            // lines是所有p拼在一起的元素
            // lyrics是显示歌词的窗框
            // 歌词滚动，就是lines向上平移
            let pHeight = p.getBoundingClientRect().top // p到窗口顶的高度
            let linesHeight = this.$el.find('.lyrics>.lines')[0].getBoundingClientRect().top // lines到窗口顶的高度
            let height = pHeight - linesHeight // lines要上滚的高度
            this.$el.find('.lyrics>.lines').css({
                transform: `translateY(${-(height-25)}px)`
            })
            $(p).addClass('active').siblings('.active').removeClass('active')
        }
    }
    let model = {
        data: {
            song: {
                id: '',
                name: '',
                artist: '',
                url: ''
            },
            status: 'paused',
        },
        get(id) {
            var query = new AV.Query('Song')
            return query.get(id).then((song) => {
                Object.assign(this.data.song, {
                    id: song.id,
                    ...song.attributes
                })
                return song
            })
        }
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.view.init()
            this.model = model
            let id = this.getSongId()
            this.model.get(id).then(() => {
                this.view.render(this.model.data)
            })
            this.bindEvents()


        },
        bindEvents() {
            $(this.view.el).on('click', '.icon-play', () => {
                this.model.data.status = 'playing'
                this.view.render(this.model.data)
                this.view.play()
            })
            $(this.view.el).on('click', '.icon-pause', () => {
                this.model.data.status = 'paused'
                this.view.render(this.model.data)
                this.view.pause()
            })
            window.eventHub.on('songEnd', () => {
                this.model.data.status = 'paused'
                this.view.render(this.model.data)
            })
        },
        getSongId() {
            let search = window.location.search
            if (search.indexOf('?') === 0) {
                search = search.substring(1)
            }

            // array = [id=123,a=1]
            let array = search.split('&').filter((v => v)) // v=>v v是真就要，假就不要。过滤空字符串。
            let id = ''

            for (let i = 0; i < array.length; i++) {
                let keyValue = array[i].split('=') // keyvalue = [id,123]
                let key = keyValue[0] // key = id
                let value = keyValue[1] // value = 123
                if (key === 'id') {
                    id = value
                    break
                }
            }
            return id
        }
    }
    controller.init(view, model)
}