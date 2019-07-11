//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    src: '/images/timg.jpg',
    id:'',
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
    if (app.globalData.userInfo==null) {
      app.addUser(e.detail.userInfo);
      app.globalData.userInfo=e.detail.userInfo;
    }
    var self=this;
    wx.chooseImage({
      // sizeType: ['compressed'],
      success: res => {
        console.log(res)
        wx.showLoading({title: '分析照片中'})
        var path = res.tempFilePaths[0];
        app.savePhoto(path,function(fileID){
          var data=wx.getFileSystemManager().readFileSync(path,'base64');
          self.setData({ src: 'data:image/png;base64,' + data });
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
          result.beauty=parseInt(result.beauty);
          if(result.beauty>=90){result.beauty=89}
          self.setData({ face: result })
          wx.showModal({
            title: '照片识别成功',
            content: '您的照片颜值打分' +( result.beauty+10)+',您是否愿意本张照片被其他用户看到？',
            confirmText:'愿意',
            cancelText:'不愿意',
            success(res) {
              if (res.confirm) {
                self.saveResult(fileID, result.beauty, result,1);
              } else if (res.cancel) {
                self.saveResult(fileID, result.beauty, result, 0);
              }
            }
          })
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
  saveResult: function (fileID, beauty, result,isPublic){
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
        time: new Date().toLocaleString()
      },
      success: function (res) {
        console.log(res)
        self.setData({ id: res._id });
      }
    })
  },
  getResult:function(id){
    var self=this;
    app.globalData.db.collection('faces').where({
      _id:id
    }).get({
      success: function (res) {
        var data=res.data[0];
        if(res.data.length>0){
          wx.cloud.getTempFileURL({
            fileList: [data.fileID],
            success: res => {
              self.setData({
                id:id,
                face: data.result,
                src:res.fileList[0].tempFileURL
              })
            },
            fail: err => {
              // handle error
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
      title: '我正在使用识图测颜值，可以给你的颜值打分排名！推荐你也试试~',
      path: '/pages/index/index?id=' + this.data.id
    }
  }
})
