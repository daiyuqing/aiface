// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
exports.main = async (event, context) => {
  var rank = await db.collection('faces').orderBy('beauty', 'desc').orderBy('fileID', 'asc').limit(50).get();
  var fileList=[];
  for(var i=0;i<rank.data.length;i++){
    if (rank.data[i].fileID){
      fileList.push(rank.data[i].fileID);
    }else{
      fileList.push("cloud://aiface-k8f2i.6169-aiface-k8f2i-1259597768/photo/威少/1562748597998.png");
    }
  }
  const result = await cloud.getTempFileURL({
    fileList: fileList,
  })
  for (var i = 0; i < rank.data.length; i++) {
    rank.data[i].tempFileURL = result.fileList[i].tempFileURL;
  }
  return rank.data
}