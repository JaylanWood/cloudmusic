{
    let view = {
        el: '.page>main',
        init() {
            this.$el = $(this.el)
        },
        template: `
            <h1>新建歌曲</h1>
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
                <div class="row actions">
                    <button type="submit">保存</button>
                </div>
            </form>
        `,
        render(data = {}) { // data={} ES6语法 如果传的data是undefined，那就默认是空对象。
            let placeholders = ['name', 'artist', 'url', 'id']
            let html = this.template
            placeholders.map((string) => {
                html = html.replace(`__${string}__`, data[string] || '')
            })
            $(this.el).html(html)
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
            id: ''
        },
        create(data) {
            var Song = AV.Object.extend('Song');
            var song = new Song();
            song.set({
                name,
                artist,
                url,
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
        }
    }
    let controller = {
        init() {
            this.view = view
            this.view.init()
            this.model = model
            this.bindEvents()
            this.view.render(this.model.data)
            window.eventHub.on('upload', (data) => {
                this.view.render(data)
            })
        },
        bindEvents() {
            this.view.$el.on('submit', 'form', (eee) => {
                eee.preventDefault()
                let needs = ['name', 'artist', 'url']
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
            })
        }

    }
    controller.init(view, model)
}