//app.js
App({
  onLaunch: function () {
    var self=this;
    wx.cloud.init({
      env: 'aiface-k8f2i',
      traceUser:true
    })
    self.globalData.db = wx.cloud.database({
      env: 'aiface-k8f2i'
    })
    wx.cloud.callFunction({
      name: 'login',
      complete: res => {
        console.log('callFunction test result: ', res)
        self.globalData.openid = res.result.openid;
      }
    })
    // 登录
    wx.login({
      success: res => {
        console.log(res)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              self.addUser(res.userInfo)
              self.globalData.userInfo=res.userInfo;
            }
          })
        }
      }
    })
  },
  addUser: function (userInfo){
    var self=this;
    self.globalData.db.collection('users').where({
      _openid:self.globalData.openid // 填入当前用户 openid
    }).get({
      success: function (res) {
        if(res.data.length==0){
          self.globalData.db.collection('users').add({
            data: {
              userInfo: userInfo
            },
            success: function (res) {
              console.log(res)
            }
          })
        }else{
          self.globalData.db.collection('users').doc(res.data[0]._id).update({
            data: {
              userInfo: userInfo
            },
            success: function (res) {
              console.log(res)
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    openid:''
  }
})