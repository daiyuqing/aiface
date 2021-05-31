// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  return await db.collection('faces').doc(event.id).update({
    // data 传入需要局部更新的数据
    data: {
      status: 2
    }
  })
}