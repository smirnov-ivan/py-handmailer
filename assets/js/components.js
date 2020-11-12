const storage = {
    ul: {}
}

const update = (old, news) => {
    for (let key in news) {
        old[key] = news[key]
    }
    return old
}

const getComponent = name => {
    return document
    .getElementsByClassName('component '+name)[0]
    .outerHTML.replace(/\/%/g, '{{').replace(/%\//g, '}}')
}

const mainComponent = {
    template: '<h3>Hand mailer<p>)</p></h3>'
}

const mailConfigComponent = {
    template: getComponent('emailConfig'),
    data() {
        return {
            data: {}
        }
    },
    methods: {
        save() {
            fetch('/commitConfig', {
                method: 'POST',
                body: JSON.stringify(this.data)
            })
        }
    },
    created() {
        fetch('/getConfig')
        .then(async res => this.data = await res.json())
    }
}

const createMailingComponent = {
    template: getComponent('createMailing'),
    data() {
        return {
            storage,
            ul: null,
            text: '',
            subject: '',
            stage: 1,
        }
    },
    methods: {
        send() {
            if (!this.ul) return

            fetch('/sendmail', {
                method: 'POST',
                body: JSON.stringify({
                    name: this.ul,
                    subject: this.subject,
                    text: this.text
                })
            })
            .then(() => alert('OK'))
            .catch(err => {
                alert('Got an error! Check console!')
                console.error(err)
            })
            
            this.subject = ''
            this.text = ''
        }
    }
}

const userLists = {
    template: getComponent('userlists'),
    data() {
        return {
            isEdit: false,
            editName: '',
            editText: '',
            storage,
            input: 1,
            form: null,
            render: true,
            data: {
                option: 1,
                name: '',
                text: ''
            }
        }
    },
    methods: {
        edit(name) {
            this.editName = name
            this.editText = this.storage.ul[name].join('\n')
            this.isEdit = true
        },
        close() {
            this.isEdit = false
        },
        rm() {
            this.isEdit = false
            fetch('/deleteUsersList', {
                method: 'POST',
                body: JSON.stringify({name: this.editName})
            })
            this.render = false
            delete this.storage.ul[this.editName]
            this.render = true
        },
        save() {
            let body = {}
            body[this.editName] = this.editText.split('\n')
            fetch('/commitUsersLists', {
                method: 'POST',
                body: JSON.stringify(body)
            }).then(async res => {
                this.render = false
                this.storage.ul = update(this.storage.ul, await res.json())
                this.render = true
            }).catch(err => {
                alert('Got an error!')
                console.error(err)
            })
            this.isEdit = false
        },  
        submit() {
            if (this.input == 2) {
                let body = {}
                body[this.data.name] = this.data.text.split('\n')
                this.data.name = ''
                this.data.text = ''
                fetch('/commitUsersLists', {
                    method: 'POST',
                    body: JSON.stringify(body)
                }).then(async res => {
                    this.render = false
                    this.storage.ul = update(this.storage.ul, await res.json())
                    this.render = true
                }).catch(err => {
                    alert('Got an error!')
                    console.error(err)
                })
            } else {
                const fData = new FormData()
                fData.append('file', this.$refs.file.files[0])
                fetch('/commitUsersLists', {
                    method: 'POST',
                    body: fData
                }).then(async res => {
                    this.render = false
                    this.storage.ul = update(this.storage.ul, await res.json())
                    this.render = true
                }).catch(err => {
                    alert('Got an error!')
                    console.error(err)
                })
            }
        }
    },
    computed: {
        getData() {
            return this.storage.ul
        }
    }
}

const templateComponent = {
    template: getComponent('template'),
    data() {
        return {
            
        }
    }
}
