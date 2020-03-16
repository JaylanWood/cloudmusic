{
    let view = {
        el: 'section.songs',
        template: `
            <li>
                <h3>{{song.name}}</h3>
                <p>
                    <svg class="icon icon-sq">
                    <use xlink:href="#icon-sq"></use>
                    </svg>
                    {{song.artist}}
                </p>
                <a class="playButton" href="./song.html?id={{song.id}}">
                    <svg class="icon icon-play">
                    <use xlink:href="#icon-play"></use>
                    </svg>
                </a>
            </li>
        `,
        init() {
            this.$el = $(this.el)
        },
        render(data) {
            let {
                songs
            } = data
            songs.map((song) => {
                let $li = $(this.template
                    .replace('{{song.name}}', song.name)
                    .replace('{{song.artist}}', song.artist)
                    .replace('{{song.id}}', song.id)
                )
                this.$el.find('.list').append($li)
            })
        }
    }
    let model = {
        data: {
            songs: []
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
        init() {
            this.view = view
            this.view.init()
            this.model = model
            this.model.find().then((data) => {
                this.view.render(this.model.data)
            })
        }
    }
    controller.init(view, model)
}