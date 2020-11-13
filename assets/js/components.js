const storage = {
    ul: {},
    templates: {}
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
            type: 1,
            curTpl: null,
            props: [],
            stage: 1,
        }
    },
    methods: {
        send() {
            if (!this.ul) return

            if (this.type == 2) {
                text = this.storage.templates[this.curTpl].text
                this.storage.templates[this.curTpl].props.forEach((element, i) => {
                    text = text.replace(new RegExp(`%${element}%`, 'g'), this.props[i])
                })
                body = JSON.stringify({
                    name: this.ul,
                    subject: this.storage.templates[this.curTpl].subject,
                    text
                })
            } else {
                body = JSON.stringify({
                    name: this.ul,
                    subject: this.subject,
                    text: this.text
                })
            }

            this.stage = 2
            fetch('/sendmail', {
                method: 'POST',
                body
            })
            .then(() => this.stage = 1)
            .catch(err => {
                alert('Got an error! Check console!')
                console.error(err)
                this.stage = 1
            })

            this.subject = ''
            this.text = ''
        }
    },
    computed: {
        getProps() {
            return this.storage.templates[this.curTpl] ? this.storage.templates[this.curTpl].props : []
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
            storage,
            name: '',
            text: '',
            subject: '',
            props: [''],
            isEdit: false,
            editName: null,
            editSubj: '',
            editText: '',
            editProps: ['']
        }
    },
    methods: {
        filterProps() {
            return this.props.filter(i => i !== '')
        },
        addTemplate() {
            let body = {}
            body[this.name] = {
                subject: this.subject,
                text: this.text,
                props: this.filterProps(this.props)
            }
            fetch('/commitTemplates',{
                method: 'POST',
                body: JSON.stringify(body)
            }).then(async res => {
                alert('Saved!')
                this.storage.templates = update(this.storage.templates, await res.json())
            })

            this.name = ''
            this.subject = ''
            this.text = ''
            this.props = ['']
        },
        edit(name) {
            this.editName = name
            this.editSubj = this.storage.templates[name].subject
            this.editText = this.storage.templates[name].text
            this.editProps = this.storage.templates[name].props
            this.isEdit = true
        },
        save() {
            let body = {}
            body[this.editName] = {
                subject: this.editSubj,
                text: this.editText,
                props: this.editProps.filter(i => i !== '')
            }
            fetch('/commitTemplates',{
                method: 'POST',
                body: JSON.stringify(body)
            }).then(async res => {
                this.storage.templates = update(this.storage.templates, await res.json())
            })
        },
        rm(name) {
            this.close()
            fetch('/deleteTemplate', {
                method: 'POST',
                body: JSON.stringify({ name })
            })

            delete this.storage.templates[name]
            
        },
        close() {
            this.editName = ''
            this.editSubj = ''
            this.editText = ''
            this.editProps = ['']
            this.isEdit = false
        }
    }
}
