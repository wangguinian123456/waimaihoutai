const express = require('express')
const index = express.Router()
const db = require('../utils/db')
const session = require('../utils/setsession')
const checkLogin = require('../utils/checkLogin')
const fs = require('fs')
index.use(session)



index.get('/index', checkLogin, (req, res) => {
    let sql = 'select count(*) as admin_users_num from admin_users'
    console.log(sql);
    db.query(sql, (err, data, fields) => {
        let arr = []
        arr.push(data[0].admin_users_num)
        let sql = 'select count(*) as user_num from users'
        db.query(sql, (err, data, fields) => {
            arr.push(data[0].user_num)
            let sql = 'select count(*) as shop_num from shoplists'
            db.query(sql, (err, data, fields) => {
                arr.push(data[0].shop_num)
                let sql = 'select count(*) as food_num from goods'
                db.query(sql, (err, data, fields) => {
                    arr.push(data[0].food_num)
                    let sql = 'select count(*) as order_num from orders'
                    db.query(sql, (err, data, fields) => {
                        arr.push(data[0].order_num)
                        res.render('Index/index', { title: '后台首页', arr: arr, uname: req.session.uname })
                    })
                })
            })

        })

    })
})




module.exports = index