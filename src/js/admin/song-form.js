{
    let view = {
        el: '.page>main',
        init() {
            this.$el = $(this.el)
        },
        template: `
            <form class="form">
                <div class="row">
                    <label>歌名</label>
                    <input name="name" type="text" value="__name__">
                </div>
                <div class="row">
                    <label>歌手</label>
                    <input name="artist" type="text" value="__artist__">
                </div>
                <div class="row">
                    <label>外链</label>
                    <input name="url" type="text" value="__url__">
                </div>
                <div class="row">
                    <label>封面</label>
                    <input name="cover" type="text" value="__cover__">
                </div>
                <div class="row">
                    <label>歌词</label>
                    <textarea cols=100 rows=10 name="lyrics">__lyrics__</textarea>
                </div>
                <div class="row actions">
                    <button type="submit">保存</button>
                </div>
            </form>
        `,
        render(data = {}) { // data={} ES6语法 如果传的data是undefined，那就默认是空对象。
            let placeholders = ['name', 'artist', 'url', 'id', 'cover', 'lyrics']
            let html = this.template
            placeholders.map((string) => {
                html = html.replace(`__${string}__`, data[string] || '')
            })
            $(this.el).html(html)
            if (data.id) {
                $(this.el).prepend('<h1>编辑歌曲</h1>')
            } else {
                $(this.el).prepend('<h1>新建歌曲</h1>')
            }
        },
        reset() {
            this.render({})
        }
    }
    let model = {
        data: {
            name: '',
            artist: '',
            url: '',
            id: '',
            cover: '',
            lyrics: ''
        },
        create(data) {
            var Song = AV.Object.extend('Song');
            var song = new Song();
            song.set({
                name,
                artist,
                url,
                cover,
                lyrics
            } = data);
            return song.save().then((newSong) => {
                let {
                    id,
                    attributes
                } = newSong
                this.data = {
                    id,
                    ...attributes
                }
            })
        },
        update(data) {
            var song = AV.Object.createWithoutData('Song', this.data.id);
            song.set({
                name: data.name,
                artist: data.artist,
                url: data.url,
                cover: data.cover,
                lyrics: data.lyrics
            });
            return song.save().then((response) => {
                Object.assign(this.data, data)
                return response
            })
        }

    }
    let controller = {
        init() {
            this.view = view
            this.view.init()
            this.model = model
            this.bindEvents()
            this.view.render(this.model.data)
            window.eventHub.on('select', (data) => {
                this.model.data = data
                this.view.render(this.model.data)
            })
            window.eventHub.on('new', (data) => {
                if (this.model.data.id) {
                    this.model.data = {}
                } else {
                    Object.assign(this.model.data, data)
                }
                this.view.render(this.model.data)
            })
        },
        create() {
            let needs = ['name', 'artist', 'url', 'cover', 'lyrics']
            let data = {}
            needs.map((string) => {
                data[string] = this.view.$el.find(`[name="${string}"]`).val()
            })
            this.model.create(data).then(() => {
                this.view.reset()
                // 把data深拷贝，以免data被song-form以外的人改
                let string = JSON.stringify(this.model.data)
                let object = JSON.parse(string)
                window.eventHub.emit('create', object)

            })
        },
        update() {
            let needs = ['name', 'artist', 'url', 'cover', 'lyrics']
            let data = {}
            needs.map((string) => {
                data[string] = this.view.$el.find(`[name="${string}"]`).val()
            })
            this.model.update(data).then(() => {
                window.eventHub.emit('update', JSON.parse(JSON.stringify(this.model.data)))
            })
        },
        bindEvents() {
            this.view.$el.on('submit', 'form', (eee) => {
                eee.preventDefault()
                if (this.model.data.id) {
                    this.update()
                } else {
                    this.create()
                }
            })
        }

    }
    controller.init(view, model)
}