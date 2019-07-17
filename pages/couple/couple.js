import Canvas from '../../utils/canvas.js'
const app = getApp()
Page({
  ...Canvas.options,
  /**
   * 页面的初始数据
   */
  data: {
    src1:'/images/dengchao.jpg',
    src2:'/images/sunli.jpg',
    score:80,
    ...Canvas.data,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.draw('runCanvas', this.data.score, 1000);
  },
  selectPhoto:function(e){
    if (e.detail.userInfo == undefined) { return }
    if (app.globalData.userInfo == null) {
      app.addUser(e.detail.userInfo);
      app.globalData.userInfo = e.detail.userInfo;
    }
    var self = this;
    wx.chooseImage({
      count:2,
      sizeType: [ 'compressed'],
      success: res => {
        if (res.tempFilePaths.length<2){
          wx.showModal({
            title: '评分失败',
            content: '请上传两张照片',
            showCancel: false
          })
          return;
        }
        wx.showLoading({title: '分析照片中'});
        var path1 = res.tempFilePaths[0];
        var path2 = res.tempFilePaths[1];
        app.savePhoto(path1,function(fileID1){
          app.savePhoto(path2,function(fileID2){
            var data1=wx.getFileSystemManager().readFileSync(path1,'base64');
            var data2=wx.getFileSystemManager().readFileSync(path2,'base64');
            self.setData({ 
              src1: 'data:image/png;base64,' + data1,
              src2: 'data:image/png;base64,' + data2 
            });
            self.recognize(fileID1, fileID2, data1, data2);
          });
        });
      }
    });
  },
  recognize: function ( fileID1, fileID2, base64_1, base64_2){
    var self=this;
    wx.request({
      method: 'POST',
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/match?access_token='+app.globalData.access_token, //仅为示例，并非真实的接口地址
      data: [
        {
          "image": base64_1,
          "image_type": "BASE64"
        },
        {
          "image": base64_2,
          "image_type": "BASE64",
        }
      ],
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        wx.hideLoading()
        if (res.data.error_code == 0) {
          var score = res.data.result.score;
          score = parseInt(score*3);
          if(score>=100){score=99;}
          self.setData({score:score})
          self.draw('runCanvas', score, 1000);
          app.globalData.db.collection('couples').add({
            data: {
              userInfo: app.globalData.userInfo,
              nickname: app.globalData.userInfo.nickName,
              fileID1: fileID1,
              fileID2: fileID2,
              score: score,
              create_time: app.globalData.db.serverDate(),
              time:new Date().toLocaleString()
            },
            success: function (res) {
              console.log(res)
            }
          })
        } else {
          wx.showModal({
            title: '照片识别失败',
            content: res.data.error_msg,
            showCancel: false
          })
        }
      },
      fail(error){
        wx.hideLoading();
        wx.showToast({
          title: '照片识别失败',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})