// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
exports.main = async (event, context) => {
  var rank= await db.collection('faces').orderBy('beauty','desc').limit(50).get();
  var fileList=[];
  for(var i=0;i<rank.length;i++){
    fileList .push(rank[i].fileID);
  }
  const result = await cloud.getTempFileURL({
    fileList: fileList,
  })
  return result.fileList
}