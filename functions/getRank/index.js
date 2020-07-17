// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  var rank1 = await db.collection('faces').orderBy('beauty', 'desc').where({
    status: _.neq(2)
  }).field({
    _openid: true,
    _id: true,
    isPublic: true,
    nickName: true,
    fileID:true,
    face_token:true,
    beauty: true
  }).limit(100).get();
  var rank2 = await db.collection('faces').orderBy('beauty', 'desc').where({
    status: _.neq(2)
  }).skip(100).field({
    _openid: true,
    _id: true,
    isPublic: true,
    nickName: true,
    fileID: true,
    face_token: true,
    beauty: true
  }).limit(100).get();
  var rank=rank1.data.concat(rank2.data);
  return rank
}