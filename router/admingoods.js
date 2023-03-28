const express = require('express')
const admingoods = express.Router()

const checkLogin = require('../utils/checkLogin')
const session = require('../utils/setsession')
const db = require('../utils/db')
// 引入formidable
const formidable = require('formidable')
const fs = require('fs')
admingoods.use(session)

// 引入阿里oss云存储
const co = require('co')
const OSS = require('ali-oss')
// 配置
const client = new OSS({
  region: "oss-cn-beijing", // 地域
  accessKeyId: "LTAI5t86RLsg2oUrJP5exzRh", // keyid
  accessKeySecret: "uA0EBwPvJJFlyc7n29m9O8IfZdFlCt", // 秘钥
  bucket: "guishiyuan"
})

const ali_oss = {
  bucket: "guishiyuan", // 仓库名称
  endPoint: "oss-cn-beijing.aliyuncs.com" // 地域节点
}


//搜索操作

admingoods.get('/goodssearch', checkLogin, (req, res) => {
  let { keywords } = req.query
  db.query(`select goods.id,goods.foodname,goods.descr,goods.price,goods.foodpic from goods where  goods.foodname like "%${keywords}%"`, (err, data, fields) => {
    res.render('AdminGoods/admingoodslist', {
      title: '商家图书列表',
      data: data,
      uname: req.session.uname
    })
  })
})




// 商家食品信息展示
admingoods.get('/goodslist', checkLogin, (req, res) => {
  let sql = `select goods.id,goods.foodname,goods.descr,goods.price,goods.foodpic,shoplists.shopname from goods,shoplists where goods.shoplist_id = shoplists.id`
  db.query(sql, (err, data, fields) => {
    res.render('AdminGoods/admingoodslist', {
      title: '商家图书列表',
      data: data,
      uname: req.session.uname
    })
  })
})


// 商家食品添加页面
admingoods.get('/goodsadd', checkLogin, (req, res) => {
  let sql = `select id,shopname from shoplists`
  db.query(sql, (err, data, fields) => {
    res.render('AdminGoods/admingoodsadd', {
      title: '商家图书添加',
      data: data,
      uname: req.session.uname
    })
  })

})

// 食品添加操作
admingoods.post('/goodsdoadd', checkLogin, (req, res) => {
  const form = formidable({
    keepExtensions: true, // 保留图片的后缀名
    uploadDir: './uploads', // 上传图片的存储目录
    multiples: true //允许多图片上传
  })

  form.parse(req, (err, fields, files) => {
    let {
      foodname,
      descr,
      price,
      shoplist_id
    } = fields
    let {
      newFilename,
      filepath
    } = files.foodpic

    // 将数据存储在云服务中
    co(function* () {
      client.useBucket(ali_oss.bucket)  //选中存储的仓库
      //pic 上传文件名字 filePath 上传文件路径
      var result = yield client.put(newFilename, filepath);
      //上传之后删除本地文件
      fs.unlinkSync(filepath);
      // res.setHeader('content-type','text/html;charset=utf-8');
      res.end(JSON.stringify({ status: '100', msg: '上传成功' }));

    }).catch((err) => {
      res.end(JSON.stringify({
        status: '101',
        msg: '上传失败 ',
        error: JSON.stringify(err)
      }));
    })
    // 传入数据库
    let sql = `insert into goods(foodname,foodpic,descr,price,shoplist_id) values('${foodname}','${newFilename}','${descr}','${price}',${shoplist_id})`
    db.query(sql, (err, results, fields) => {
      if (results.affectedRows > 0) {
        res.redirect('/admin/goodslist')
      } else {
        res.redirect('/admin/goodsadd')
      }
    })
  })
})



//商品删除页面

admingoods.get('/goodsdel', checkLogin, (req, res) => {
  let { id } = req.query
  let sql = `delete from goods where id = ${id}`
  db.query(sql, (err, data, fields) => {
    console.log(data);
      let {
          affectedRows
      } = data
      if (err) {
          throw err
      } else {
          if (affectedRows > 0) {
              res.send('<script>alert("删除成功");window.location.href="/admin/goodslist"</script>')
          } else {
              res.send('<script>alert("删除失败");window.location.href="/admin/goodslist"</script>')
          }
      }
  })
})









//商品更新操作

admingoods.get('/goodsupdate', checkLogin, (req, res) => {
  let { id } = req.query
  let sql = `select goods.foodname,goods.descr,goods.price,goods.foodpic,goods.shoplist_id,shoplists.id,shoplists.shopname from goods,shoplists where goods.id=${id} `
  // console.log(sql)
  db.query(sql, (err, data, fields) => {
    // console.log(data)
    res.render('AdminGoods/admingoodsupdate', { title: '修改', id: id, data: data, uname: req.session.uname })

  })
})



admingoods.post('/gooddoupdate', (req, res) => {
  const form = formidable({
    keepExtensions: true,
    uploadDir: './uploads',
    multiples: true
  })

  form.parse(req, (err, data, files) => {
    let { foodname, price, descr, id, shoplist_id } = data
    let { newFilename, filepath, size } = files.newfoodpic
    if (size > 0) {
      co(function* () {
        client.useBucket(ali_oss.bucket)  //选中存储的仓库
        //pic 上传文件名字 filePath 上传文件路径
        var result = yield client.put(newFilename, filepath);
        //上传之后删除本地文件
        fs.unlinkSync(filepath);
        // res.setHeader('content-type','text/html;charset=utf-8');
        res.end(JSON.stringify({ status: '100', msg: '上传成功' }));

      }).catch((err) => {
        res.end(JSON.stringify({
          status: '101',
          msg: '上传失败 ',
          error: JSON.stringify(err)
        }));
      })
      let sql = `update goods set shoplist_id='${shoplist_id}',foodname='${foodname}',descr='${descr}' ,price='${price}',foodpic='${newFilename}' where goods.id=${id}`

      db.query(sql, (err, data, fields) => {
        let {
          affectedRows
        } = data
        if (err) {
          throw err
        } else {
          if (affectedRows > 0) {
            res.send('<script>alert("更新成功");window.location.href="/admin/goodslist"</script>')
          } else {
            res.send('<script>alert("更新失败");window.location.href="/admin/goodsupdate"</script>')
          }
        }
      })

    } else {
      let sql = `update goods set shoplist_id='${shoplist_id}',foodname='${foodname}',descr='${descr}' ,price='${price} ' where goods.id=${id} `
      db.query(sql, (err, data, fields) => {
        let {
          affectedRows
        } = data
        if (err) {
          throw err
        } else {
          if (affectedRows > 0) {
            //执行上传图片资源到阿里oss仓库的程序
            res.send('<script>alert("更新成功");window.location.href="/admin/goodslist"</script>')
          } else {
            res.send('<script>alert("更新失败");window.location.href="/admin/goodsupdate"</script>')
          }
        }
      })

    }

  })
})


module.exports = admingoods