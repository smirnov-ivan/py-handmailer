const router = new VueRouter({
    hashbang: true,
    routes: [
        {
            path: '/',
            component: mainComponent
        },
        {
            path: '/userlists',
            component: userLists
        },
        {
            path: '/templates',
            component: templateComponent
        },
        {
            path: '/mailing',
            component: createMailingComponent
        },
        {
            path: '/config',
            component: mailConfigComponent
        }
    ]
})