{
    let view = {
        el: '#songList-container',
        template: `
            <ul class="songList">
            </ul>
        `,
        render(data) {
            // 渲染模版出来
            let $el = $(this.el)
            $el.html(this.template)
            // 根据data把<li></li>做成数组
            let {
                songs,
                selectedSongID
            } = data
            let liList = songs.map((song) => {
                let $li = $('<li></li>').text(song.name).attr('data-song-id', song.id)
                if (song.id === selectedSongID) {
                    $li.addClass('active')
                }
                return $li
            })
            // 把li数组放到ul上
            $el.find('ul').empty()
            liList.map((domLi) => {
                $el.find('ul').append(domLi)
            })
        },
        clearActive() {
            $(this.el).find('.active').removeClass('active')
        },
    }
    let model = {
        data: {
            songs: [], // [{id:1,name:'1'},{id:2,name:'2'}]
            selectedSongID: undefined
        },
        find() {
            var query = new AV.Query('Song')
            return query.find().then((songs) => {
                this.data.songs = songs.map((song) => {
                    return {
                        id: song.id,
                        ...song.attributes
                    }
                })
                return songs
            })
        }
    }
    let controller = {
        init(view, model) {
            this.view = view
            this.model = model
            this.view.render(this.model.data)
            this.bindEvents()
            this.bindEvenHub()
            this.getAllSongs()
        },
        getAllSongs() {
            return this.model.find().then(() => {
                this.view.render(this.model.data)
            })
        },
        bindEvents() {
            $(this.view.el).on('click', 'li', (eee) => {
                let $li = $(eee.currentTarget)
                let songID = $li.attr('data-song-id')
                // 把选中歌曲的ID记录在model，让view渲染
                this.model.data.selectedSongID = songID
                this.view.render(this.model.data)

                let data
                let songs = this.model.data.songs
                for (let i = 0; i < songs.length; i++) {
                    if (songs[i].id === songID) {
                        data = songs[i]
                        break
                    }
                }
                window.eventHub.emit('select', JSON.parse(JSON.stringify(data)))
            })
        },
        bindEvenHub() {
            window.eventHub.on('create', (songData) => {
                this.model.data.songs.push(songData)
                this.view.render(this.model.data)
            })
            window.eventHub.on('new', () => {
                this.view.clearActive()
            })
            window.eventHub.on('update', (song) => {
                let songs = this.model.data.songs
                for (let i = 0; i < songs.length; i++) {
                    if (songs[i].id === song.id) {
                        Object.assign(songs[i], song)
                    }
                }
                this.view.render(this.model.data)
            })
        }
    }
    controller.init(view, model)
}