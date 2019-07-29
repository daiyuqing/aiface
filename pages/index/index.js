//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    src: '/images/timg.jpg',
    id:'',
    face:{
      age:22,
      beauty: 86,
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
    console.log(e)
    if(e.detail.userInfo==undefined){return}
    if (app.globalData.userInfo==null) {
      app.addUser(e.detail.userInfo);
      app.globalData.userInfo=e.detail.userInfo;
    }
    var self=this;
    wx.chooseImage({
      sizeType: ['compressed'],
      success: res => {
        console.log(res)
        wx.showLoading({title: '分析照片中'})
        var path = res.tempFilePaths[0];
        app.savePhoto(path,function(fileID){
          var data=wx.getFileSystemManager().readFileSync(path,'base64');
          self.recognize(data, fileID);
        });
      },
      fail:error=>{
        console.log(error)
      }
    })
  },
  recognize:function(data,fileID){
    var self = this;
    wx.request({
      method: 'POST',
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/detect?access_token='+app.globalData.access_token, //仅为示例，并非真实的接口地址
      data: {
        "image_type": "BASE64",
        'image': data,
        "face_field": "age,beauty,expression,face_shape,gender,glasses,race,quality,eye_status,emotion,face_type"
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        wx.hideLoading()
        if (res.data.error_code == 0) {
          var result = res.data.result.face_list[0];
          if (result.face_type.type =='cartoon'){
            wx.showModal({
              title: '照片识别失败',
              content: '照片中无真实人脸',
              showCancel: false,
              duration: 2000
            })
            return;
          }
          result.beauty = parseInt(result.beauty);
          if (result.beauty >= 90) { result.beauty = 89 }
          var face_token = res.data.result.face_list[0].face_token;
          app.searchFace(face_token,function(){
            self.setData({ face: result, src: 'data:image/png;base64,' + data  })
            wx.showModal({
              title: '照片识别成功',
              content: '您的照片颜值打分' + (result.beauty + 10) + '分,您可点击右上角分享按钮邀请好友一起测试',
              showCancel: false,
              success(res) {
                self.saveResult(fileID, result.beauty, result, 1, face_token);
              }
            })
          });
        } else if (res.data.error_code == 222202){
          wx.showModal({
            title: '照片识别失败',
            content: '照片中无人脸',
            showCancel: false,
            duration: 2000
          })
        } else{
          wx.showModal({
            title: '照片识别失败',
            content: res.data.error_msg,
            showCancel: false,
            duration: 2000
          })
        }
      },
      fail(error){
        console.log(error)
        wx.hideLoading();
        wx.showToast({
          title: '照片识别失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  saveResult: function (fileID, beauty, result, isPublic, face_token){
    var self=this;
    app.globalData.db.collection('faces').add({
      data: {
        userInfo: app.globalData.userInfo,
        nickName: app.globalData.userInfo.nickName,
        beauty: beauty,
        fileID: fileID,
        result: result,
        create_time: app.globalData.db.serverDate(),
        isPublic:isPublic,
        status:1,
        face_token: face_token,
        time: new Date().toLocaleString()
      },
      success: function (res) {
        console.log(res)
        self.setData({ id: res._id });
        if (beauty>85){
          app.addFace(res._id, face_token)
        }
      }
    })
  },
  getResult:function(id){
    var self=this;
    wx.showLoading({
      title: '加载中',
    })
    app.globalData.db.collection('faces').where({
      _id:id
    }).get({
      success: function (res) {
        var data=res.data[0];
        if(res.data.length>0){
          wx.cloud.getTempFileURL({
            fileList: [data.fileID],
            success: res => {
              wx.hideLoading();
              self.setData({
                id:id,
                face: data.result,
                src:res.fileList[0].tempFileURL
              })
            },
            fail: err => {
              wx.hideLoading()
            }
          })
        }
      }
    });
  },
  onLoad: function (options) {
    wx.showShareMenu({
      withShareTicket: true
    })
    var id = options.id;
    if(id){
      this.getResult(id);
    }
  },
  onShareAppMessage: function () {
    return {
      title: '我的颜值打分' + (this.data.face.beauty+10)+'分，你有我颜值高吗？',
      path: '/pages/index/index?id=' + this.data.id
    }
  }
})
