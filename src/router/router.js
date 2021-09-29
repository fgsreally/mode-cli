import Vue from 'vue';
import Router from 'vue-router';
import _import from './_import';
Vue.use(Router);

export default new Router({routes: [
    {
        path: 'login',
        name: 'login',
        component: _import('login'),
        },
    {
        path: 'regis',
        name: 'regis',
        component: _import('regis'),
        children:[{
                path: 'regisadmin',
                name: 'regisadmin',
                component: _import('regis/regisadmin'),
                children:[{
                        path: 'son',
                        name: 'son',
                        component: _import('regis/regisadmin/son'),
                        
                    },]
            }, {
                path: 'regisuser',
                name: 'regisuser',
                component: _import('regis/regisuser'),
                
            }, ]},
  
    {
        path: 'c1',
        name: 'c1',
        component: _import('coming/c1'),
        },
    {
        path: 'c2',
        name: 'c2',
        component: _import('coming/c2'),
        },
  ]})