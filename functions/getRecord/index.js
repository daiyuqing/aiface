// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var record = await db.collection('faces').orderBy('create_time', 'desc').where({
    status: _.neq(2),
    _openid: wxContext.OPENID
  }).field({
    _openid: true,
    _id: true,
    isPublic: true,
    nickName: true,
    fileID: true,
    create_time: true,
    status: true,
    beauty: true
  }).get();
  return record;
}