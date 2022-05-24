//app.js
App({
  onLaunch: function () {
    var self=this;
    wx.cloud.init({
      env: 'ai2-4guv919ha7d2b68c',
      traceUser:true
    })
    self.globalData.db = wx.cloud.database({
      env: 'ai2-4guv919ha7d2b68c'
    })
    wx.cloud.callFunction({
      name: 'login',
      complete: res => {
        self.globalData.openid = res.result.openid;
        self.globalData.access_token = res.result.access_token;
        // 获取用户信息
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                success: res => {
                  self.addUser(res.userInfo)
                  self.globalData.userInfo = res.userInfo;
                }
              })
            }
          }
        })
      }
    })
    // 登录
    wx.login({
      success: res => {
        console.log(res)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  //把照片存到服务器
  savePhoto:function(path,callback){
    var self=this;
    let date=new Date();
    wx.cloud.uploadFile({
      cloudPath: 'newphoto/' + date.getFullYear() +'/'+(date.getMonth()+1)+'/'+date.getDate()+'/'+ new Date().getTime()+'.png',
      filePath: path, // 文件路径
      success: res => {
        callback(res.fileID);
        self.globalData.db.collection('photos').add({
          data: {
            nickName: self.globalData.userInfo.nickName,
            fileID: res.fileID,
            time: new Date().toLocaleString(),
            create_time: self.globalData.db.serverDate()
          },
          success: function (res) {
            console.log(res)
          }
        })
      },
      fail: err => {
        // handle error
      }
    })
  },
  //添加用户到数据库中
  addUser: function (userInfo){
    var self=this;
    self.globalData.db.collection('users').where({
      _openid:self.globalData.openid // 填入当前用户 openid
    }).get({
      success: function (res) {
        if(res.data.length==0){
          self.globalData.db.collection('users').add({
            data: {
              userInfo: userInfo,
              create_time: self.globalData.db.serverDate()
            },
            success: function (res) {
              console.log(res)
            }
          })
        }else{
          self.globalData.db.collection('users').doc(res.data[0]._id).update({
            data: {
              userInfo: userInfo,
              update_time: self.globalData.db.serverDate()
            },
            success: function (res) {
              console.log(res)
            }
          })
        }
      }
    })
  },
  //图片审核
  censor: function (path,callback){
    var self = this;
    wx.getImageInfo({
      src: path,
      success (res) {
        console.log(res.width)
        console.log(res.height)
        if(res.width<750&&res.height<1334){
          var data=wx.getFileSystemManager().readFileSync(path);
          wx.cloud.callFunction({
            name:'imgSecCheck',
            data:{
              img:data
            },
            success:function(){
              callback()
            }
          })
        }else{
          callback()
        }
      }
    })
    
    return;
    wx.request({
      method: 'POST',
      url: 'https://aip.baidubce.com/rest/2.0/solution/v1/img_censor/v2/user_defined?access_token=' + self.globalData.access_token,
      data: {
        'image': data,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success(res) {
        console.log(res)
        if(res.data.conclusionType==1){
          callback()
        }else{
          wx.hideLoading()
          wx.showModal({
            title: '照片识别失败',
            content: '上传内容违规~',
            showCancel: false,
          })
        }
      },
      fail(error) {
        callback();
      }
    })
  },
  //人脸搜索
  searchFace: function (face_token,callback){
    var self = this;
    wx.request({
      method: 'POST',
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/search?access_token=' + self.globalData.access_token,
      data: {
        "image_type": "FACE_TOKEN",
        'image': face_token,
        "group_id_list": "aiface"
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res)
        var user_list = res.data.result.user_list
        if (user_list && user_list.length > 0 && user_list[0].score > 80) {
          wx.hideLoading()
          wx.showModal({
            title: '照片识别失败',
            content: '好看的脸只能上传一次哦~',
            showCancel: false,
          })
        } else {
         callback();
        }
      },
      fail(error) {
        callback();
      }
    })
  },
  // 人脸注册用户删除
  deleteFace:function(photo_id){
    var self = this;
    wx.request({
      method: 'POST',
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/delete?access_token=' + self.globalData.access_token,
      data: {
        "group_id": "aiface",
        "user_id": photo_id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res)
      },
      fail(error) {

      }
    })
  },
  //人脸注册
  addFace: function (photo_id,face_token){
    var self=this;
    wx.request({
      method: 'POST',
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/add?access_token=' + self.globalData.access_token,
      data: {
        "image_type": "FACE_TOKEN",
        'image': face_token,
        "group_id": "aiface",
        "user_info": self.globalData.userInfo._openid,
        "user_id": photo_id
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res)
      },
      fail(error) {

      }
    })
  },
  globalData: {
    access_token:"24.c066a77127c77481e956dbbc2c2e8137.2592000.1642070727.282335-16719910",
    userInfo: null,
    openid:''
  }
})