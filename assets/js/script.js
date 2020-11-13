const app = new Vue({
    router,
    el: '#app',
    data() {
        return {
            storage
        }
    },
    created() {
        fetch('/getUsersLists')
        .then(async res => {
            this.storage.ul = await res.json()
        })
        fetch('/getTemplates')
        .then(async res => {
            this.storage.templates = await res.json()
        })
    }
})