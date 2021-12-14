// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  cloud.openapi.security
    .imgSecCheck({
      media: {
        contentType: 'image/png',
        value: event.img
      }
    })
    .then(result => {
      return result;
    })
    .catch(err => {
      return err;
    })
}