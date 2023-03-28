const express = require('express')
const bodyParser = require('body-parser');
//引入cookie-parser
let cookieParser = require("cookie-parser");
const getsha1 = require('../utils/getsha1');
const db = require('../utils/db')
const api = express.Router()
//使用cookie-parer
api.use(cookieParser());
//开放vue前端接口
//开放给vue项目商家列表数据json格式接口
api.get("/shoplists", function (req, res) {
    // console.log('1111');
    // res.end();
    db.query('select * from shoplists', function (error, results, fields) {
        if (error) throw error;
        //设置字符集
        res.setHeader('content-type', 'text/html;charset=utf-8');
        res.write(JSON.stringify(results));
        res.end();
    });
});
//用户模块 登录注册开放接口（路由一定是唯一）
//注册
api.get("/registeruser", (req, res) => {
    //获取表单的提交数据
    let name = req.query.name;
    let pass1 = req.query.pass;
    // let newpassword = getsha1(pass1);
    //数据的入库
    //mysql预处理
    //准备sql语句
    // let sql = "insert into users(username,pass)values('" + name + "','" + newpassword + "')";
    let sql = "insert into users(username,pass)values('" + name + "','" + pass1 + "')";

    //执行
    db.query(sql, (error, results, fields) => {
        // console.log(results);
        //判断
        if (results.affectedRows > 0) {
            res.write(JSON.stringify({ 'msg': 'ok' }));
            res.end();
        } else {
            // res.redirect("/add");
            res.write(JSON.stringify({ 'msg': 'error' }));
            res.end();
        }

    });

    // });
});
//执行登录接口
api.post("/loginuser", (req, res) => {
    //获取name和pass
    let name = req.body.name;
    let pass = req.body.pass;
    // console.log(name,pass)
    //把name和pass做对比=》stu数据表做对比
    //对比name和数据库name
    db.query('select * from users where username="' + name + '"', (error, results, fields) => {
        // console.log(results);
        if (results.length <= 0) {
            //用户名有误
            res.write(JSON.stringify({ 'msg': 'usernameiserror' }));
            res.end();
        } else {
            //用户名ok 检测密码
            // let newpassword = getsha1(pass);
            // if (newpassword == results[0].pass) {
            //     res.write(JSON.stringify({ 'msg': 'ok' }));
            //     res.end();
            // } else {
            //     res.write(JSON.stringify({ 'msg': 'userpassiserror' }));
            //     res.end();
            // }
            if (pass == results[0].pass) {
                res.cookie('name', name, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true });
                res.write(JSON.stringify({ 'msg': 'ok', 'name': req.cookies.name }));
                res.end();
            } else {
                res.write(JSON.stringify({ 'msg': 'userpassiserror' }));
                res.end();
            }
        }

    });


});

//获取cookie中用户的名字
api.get('/userinfos', function (req, res) {
    if (!req.cookies.name) {
        res.write(JSON.stringify({ 'msg1': 'no login' }));
        res.end();
    } else {
        res.write(JSON.stringify({ 'msg': req.cookies.name }));
        res.end();
    }
});
//退出接口
api.get("/vuelogout", function (req, res) {
    //cookie清除
    res.clearCookie('name');
    res.write(JSON.stringify({ 'msg': 0 }));
    res.end();
});
//获取单个商家的信息接口
api.get("/shoplistone", function (req, res) {
    let id = req.query.id;
    //获取单个shoplists表数据
    db.query("select * from shoplists where id=" + id, function (error, results, fields) {
        res.setHeader('content-type', 'text/html;charset=utf-8');
        res.write(JSON.stringify(results[0]));
        res.end();
    });

});

api.get("/vueshopgoods", function (req, res) {
    let id = req.query.id;
    db.query("select * from goods where shoplist_id=" + id, function (error, results, fields) {
        res.setHeader('content-type', 'text/html;charset=utf-8');
        res.write(JSON.stringify(results));
        res.end();
    });

});

//商家评价列表接口
api.get("/vuecomments", function (req, res) {
    let id = req.query.id;
    db.query("select * from comments where shoplist_id=" + id, function (error, results, fields) {
        res.setHeader('content-type', 'text/html;charset=utf-8');
        res.write(JSON.stringify(results));
        res.end();
    });

});
//添加收货地址
api.post("/addaddress", (req, res) => {
    let name = req.body.name;
    let phone = req.body.phone;
    let address = req.body.address;
    let username = req.body.username;
    let sql = "insert into address(realname,phone,address,username)values('" + name + "','" + phone + "','" + address + "','" + username + "')";

    db.query(sql, (error, results, fields) => {
        // console.log(results);
        if (results.affectedRows > 0) {
            res.write(JSON.stringify({ 'msg': 'ok' }));
            res.end();
        } else {
            res.write(JSON.stringify({ 'msg': 'error' }));
            res.end();
        }

    });

});
//获取用户收货地址
api.get("/usersaddress", function (req, res) {
    let username = req.query.username;
    //获取stu表数据
    db.query("select * from address where username='" + username + "'", function (error, results, fields) {
        res.setHeader('content-type', 'text/html;charset=utf-8');
        res.write(JSON.stringify(results));
        res.end();
    });

});

//生成订单接口
api.post("/addorder", (req, res) => {
    let order_num = req.body.order_num;
    let address_id = req.body.address_id;
    let food_totalprice = req.body.food_totalprice;
    let username = req.body.username;
    let sql = "insert into orders(order_num,address_id,food_totalprice,username)values('" + order_num + "','" + address_id + "','" + food_totalprice + "','" + username + "')";
    console.log(sql);
    db.query(sql, (error, results, fields) => {
        console.log(results);
        if (results.affectedRows > 0) {
            res.write(JSON.stringify({ 'msg': 'ok', 'insertid': results.insertId }));
            res.end();
        } else {
            res.write(JSON.stringify({ 'msg': 'error' }));
            res.end();
        }

    });

});
//获取登录用户的订单数据接口
api.get("/userorders", function (req, res) {
    let username = req.query.username;
    //获取stu表数据
    db.query("select * from orders where username='" + username + "'", function (error, results, fields) {
        res.setHeader('content-type', 'text/html;charset=utf-8');
        res.write(JSON.stringify(results));
        res.end();
    });

});
//生成订单详情接口
api.post("/addordergoods", (req, res) => {
    let foodname = req.body.foodname;
    let pic = req.body.pic;
    let count = req.body.count;
    let orders_id = req.body.orders_id;
    let sql = "insert into orders_goods(foodname,pic,count,orders_id)values('" + foodname + "','" + pic + "','" + count + "','" + orders_id + "')";
    db.query(sql, (error, results, fields) => {
        // console.log(results);
        if (results.affectedRows > 0) {
            res.write(JSON.stringify({ 'msg': 'ok', 'insertid': results.insertId }));
            res.end();
        } else {
            res.write(JSON.stringify({ 'msg': 'error' }));
            res.end();
        }

    });

});
//获取订单的详情数据接口
api.get("/orderinfos", function (req, res) {
    let orders_id = req.query.orders_id;
    //获取stu表数据
    db.query("select * from orders_goods where orders_id=" + orders_id, function (error, results, fields) {
        res.setHeader('content-type', 'text/html;charset=utf-8');
        res.write(JSON.stringify(results));
        res.end();
    });

});
//获取用户详情信息接口
api.get("/usermessage", function (req, res) {
    let name = req.query.name;
    //获取单个shoplists表数据
    db.query("select * from user_info where userinfo_name='" + name + "'", function (error, results, fields) {
        if (results.length == 0) {
            res.setHeader('content-type', 'text/html;charset=utf-8');
            res.write(JSON.stringify({ "realname": "" }));
            res.end();
        } else {
            res.setHeader('content-type', 'text/html;charset=utf-8');
            res.write(JSON.stringify(results[0]));
            res.end();
        }

    });

});
//插入会员详情接口
api.post("/insertuserinfo", (req, res) => {
    let username = req.body.username;
    let phone = req.body.phone;
    let email = req.body.email;
    let userinfo_name = req.body.userinfo_name
    // console.log(username,phone,email,hobby,userinfo_name)
    let sql = "insert into user_info(realname,phone,email,userinfo_name)values('" + username + "','" + phone + "','" + email + "','" + userinfo_name + "')";
    console.log(sql)
    db.query(sql, (error, results, fields) => {
        // console.log(results);
        if (results.affectedRows > 0) {
            res.write(JSON.stringify({ 'msg': 'ok', 'insertid': results.insertId }));
            res.end();
        } else {
            res.write(JSON.stringify({ 'msg': 'error' }));
            res.end();
        }

    });

});
//修改用户详情接口
api.post("/updateuserinfo", (req, res) => {
    let username = req.body.username;
    let phone = req.body.phone;
    let email = req.body.email;
    let userinfo_name = req.body.userinfo_name
    let sql = "update user_info set realname='" + username + "',phone='" + phone + "',email='" + email + "'where userinfo_name='" + userinfo_name + "'";
    db.query(sql, (error, results, fields) => {
        // console.log(results);
        if (results.affectedRows > 0) {
            res.write(JSON.stringify({ 'msg': 'ok' }));
            res.end();
        } else {
            res.write(JSON.stringify({ 'msg': 'error' }));
            res.end();
        }

    });

});
//修改用户头像详情接口
api.post("/updateuserpic", (req, res) => {
    let headerpic = req.body.headerpic;
    let userinfo_name = req.body.userinfo_name
    let sql = "update user_info set pic='" + headerpic + "' where userinfo_name='" + userinfo_name + "'";
    // console.log(sql)
    db.query(sql, (error, results, fields) => {
        // console.log(results);
        if (results.affectedRows > 0) {
            res.write(JSON.stringify({ 'msg': 'ok' }));
            res.end();
        } else {
            res.write(JSON.stringify({ 'msg': 'error' }));
            res.end();
        }

    });

});

//搜索商家接口
api.post("/searchshop", function (req, res) {
    let keyword = req.body.keyword;
    db.query(`select * from shoplists where  shopname like "%${keyword}%"`, (err, results, fields) => {
        if (results.length > 0) {
            res.write(JSON.stringify(results));
            res.end();
        } else {
            res.write(JSON.stringify({ 'msg': 'error' }));
            res.end();
        }
    })

});


//关键字搜索商品接口
api.post("/searchfood", function (req, res) {
    let keyword = req.body.keyword;
    db.query(`select * from goods where  foodname like "%${keyword}%"`, (err, results, fields) => {
        if (results.length > 0) {
            res.write(JSON.stringify(results));
            res.end();
        } else {
            res.write(JSON.stringify({ 'msg': 'error' }));
            res.end();
        }
    })

});


//封装搜索你食品的接口
api.post("/searchfoods", function (req, res) {
    let foodname = req.body.foodname;
    db.query("select * from goods where foodname='" + foodname + "'", (err, results, fields) => {
        res.setHeader('content-type', 'text/html;charset=utf-8');
        res.write(JSON.stringify(results));
        res.end();
    })

});
// 暴露接口
module.exports = api

