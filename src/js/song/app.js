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
            }
            if (status === 'playing') {
                this.$el.find('.disc-container').addClass('playing')
            } else {
                this.$el.find('.disc-container').removeClass('playing')
            }
            
        },
        play() {
            this.$el.find('audio')[0].play()
        },
        pause() {
            this.$el.find('audio')[0].pause()
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