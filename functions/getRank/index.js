// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var rank1 = await db.collection('faces').orderBy('beauty', 'desc').field({
    _openid: true,
    _id: true,
    isPublic: true,
    nickName: true,
    fileID:true,
    face_token:true,
    beauty: true
  }).limit(100).get();
  var rank2 = await db.collection('faces').orderBy('beauty', 'desc').skip(100).field({
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