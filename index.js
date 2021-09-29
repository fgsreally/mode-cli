#!/usr/bin/env node

const fs = require('fs');
const ejs = require('ejs');

function getRootPath() {
    return process.cwd() + `/${String(process.argv[2]||'src')}`
}

function getOutPath() {
    return process.cwd() + `/${String(process.argv[3]||'src/router/router.js')}`
}

let Re = new RegExp(/.vue$/);
let fPath = getRootPath()
let res = Object.create(null)
let array = []
let ret = {
    1: [],
    2: [],
    3: [],
    4: [],
} //防止层级过深，四级应该足够了

function travelAll(filepath, obj) {
    let files = fs.readdirSync(filepath)
    obj.children = Object.create(null)

    files.forEach(file => {
        if (fs.statSync(`${filepath}/${file}`).isDirectory() && file != 'components') {
            obj.children[file] = {}
            travelAll(`${filepath}/${file}`, obj.children[file])
        }
        if (Re.test(file)) {
            obj.name = ''
            obj.name = file.replace(/.vue$/, '')

        }
    })

}


function parser(obj, str) {
    if (obj.name) {
        array.push(str)
    }
    if (obj.children) {
        for (let i in obj.children) {
            console.log(i)

            parser(obj.children[i], `${str}/${i}`)
        }
    }
}

function divide(arr) {
    arr.forEach(str => {
        let len = str.length;
        let num = 0
        for (let i = 0; i < len; i++) {
            str[i] === '/' && num++
        }
        if (num > 4) {
            console.warn('存在过深层级的页面')
        } else {
            ret[num].push(str)
        }
    })
}

function treeAdd(arr1, arr2) {
    let arr = []
    arr1.forEach(str1 => {
        for (let i = 0; i < arr2.length; i++) {
            if (str1.indexOf(arr2[i]) === 0) {
                console.log(str1);
                return false
            }
        }
        arr.push(str1.match(/(?<=\/).*(?=\/)/)[0])
    })

    function unique(arr) {
        return Array.from(new Set(arr))
    }
    return unique(arr)
}

travelAll(fPath, res)
parser(res, '')
divide(array)
console.log(array)
console.log(res)
console.log(ret)

let mode = `<% for(let key in obj){ let a=obj[key].children;let oldValue1;if(init){oldValue1=init+'/'+key}else{oldValue1=key};if(obj[key].name){%>
    {
        path: '<%=key %>',
        name: '<%=key %>',
        component: _import('<%=oldValue1 %>'),
        children:[<%for(let key in a){let b=a[key].children;let oldValue2=oldValue1+'/'+key;if(a[key].name){%>{
                path: '<%=key %>',
                name: '<%=key %>',
                component: _import('<%=oldValue2 %>'),
                children:[<%for(let key in b){let c=b[key].children;let oldValue3=oldValue2+'/'+key;if(b[key].name){%>{
                        path: '<%=key %>',
                        name: '<%=key %>',
                        component: _import('<%=oldValue3 %>'),
                        children:[<%for(let key in c){let oldValue4=oldValue3+'/'+key;if(c[key].name){%>{
                                path: '<%=key %>',
                                name: '<%=key %>',
                                component: _import('<%=oldValue4 %>'),
                                children:[]
                            },<%}} %>]
                    },<%}} %>]
            }, <%}} %>]},<%}} %>
  `
let part = ejs.render(mode, {
    obj: res.children,
    init: false
})
treeAdd(ret[2], ret[1]).forEach((value) => {
    console.log('part', part)
    part += ejs.render(mode, {
        obj: res.children[value].children,
        init: value
    })
})
// treeAdd(ret[3], ret[2]).forEach((value)=>{
//     part+=ejs.render(mode, {
//     obj: res.children[value].children,
//     init:value
// })}) 



let outString = `import Vue from 'vue';
import Router from 'vue-router';
import _import from './_import';
Vue.use(Router);

export default new Router({routes: [${part}]})`
outString = outString.replace(/children:\[\]/g, '')

fs.writeFileSync(getOutPath(), outString)