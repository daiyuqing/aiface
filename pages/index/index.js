//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    src: '/images/timg.jpg',
    face:{
      age:22,
      beauty: 76,
      gender: { type: "female"},
      emotion: { type: "neutral" },
      expression: { type: "none"},
      face_shape: { type: "oval"},
      glasses: { type: "none" },
      race: { type: "yellow" },
    },
    userInfo: {},
    hasUserInfo: false,
    emotion:{
      angry: '愤怒',
      disgust: '厌恶',
      fear: '恐惧' ,
      happy: '高兴',
      sad: '伤心' ,
      surprise: '惊讶' ,
      neutral: '无情绪'
    },
    face_shape:{
      square: '正方形' ,
      triangle: '三角形',
       oval: '椭圆' ,
       heart: '心形' ,
       round: '圆形'
    },
    expression:{
      none: '不笑',smile: '微笑',laugh: '大笑'
    },
    glasses:{
      none: '无眼镜',common: '普通眼镜',sun: '墨镜'
    },
    race:{
      yellow: '黄种人' ,white: '白种人', black: '黑种人', arabs: '阿拉伯人'
    },
  },
  //事件处理函数
  selectPhoto: function(e) {
    app.globalData.userInfo=e.detail.userInfo;
    app.addUser(e.detail.userInfo);
    var self=this;
    wx.chooseImage({
      success: res => {
        var path = res.tempFilePaths[0];
        wx.cloud.uploadFile({
          cloudPath: 'photo/' + e.detail.userInfo.nickName +'/'+ new Date().getTime()+'.png',
          filePath: path, // 文件路径
          success: res => {
            self.recognize(path, res.fileID)
          },
          fail: err => {
            // handle error
          }
        })
        wx.showLoading({
          title: '分析照片中',
        })
       
      }
    })
  },
  recognize:function(path,url){
    var self = this;
    wx.getFileSystemManager().readFile({
      filePath: path, //选择图片返回的相对路径
      encoding: 'base64', //编码格式
      success: res => { //成功的回调
        // console.log('data:image/png;base64,' + res.data)
        self.setData({ src: 'data:image/png;base64,' + res.data })
        wx.request({
          method: 'POST',
          url: 'https://aip.baidubce.com/rest/2.0/face/v3/detect', //仅为示例，并非真实的接口地址
          data: {
            "access_token": "24.786bd0ac15d45fb2b13c3977f3aac0a2.2592000.1564899556.282335-16719910",
            "image_type": "BASE64",
            'image': res.data,
            "face_field": "age,beauty,expression,face_shape,gender,glasses,race,quality,eye_status,emotion,face_type"
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded' // 默认值
          },
          success(res) {
            wx.hideLoading()
            if (res.data.error_code == 0) {
              var result = res.data.result.face_list[0];
              result.beauty=parseInt(result.beauty);
              self.setData({ face: result })
              app.globalData.db.collection('photos').add({
                data: {
                  userInfo: app.globalData.userInfo,
                  photo: url,
                  result: result
                },
                success: function (res) {
                  console.log(res)
                }
              })
            } else {
              wx.showModal({
                title: '照片识别失败',
                content: res.data.error_msg,
                showCancel: false,
                success(res) {

                }
              })
            }
          }
        })
      }
    })
  },
  onLoad: function () {
    
  },
})
