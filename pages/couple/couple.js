const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    src1:'/images/dengchao.jpg',
    src2:'/images/sunli.jpg',
    score:80
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  selectPhoto:function(e){
    app.globalData.userInfo = e.detail.userInfo;
    app.addUser(e.detail.userInfo);
    var self = this;
    wx.chooseImage({
      count:2,
      success: res => {
        var path1 = res.tempFilePaths[0];
        var path2 = res.tempFilePaths[1];
        var fileID1='';
        var fileID2 = '';
        var base64_1='';
        var base64_2 = '';
        wx.cloud.uploadFile({
          cloudPath: 'photo/' + e.detail.userInfo.nickName + '/' + new Date().getTime() + '.png',
          filePath: path1, // 文件路径
          success: res => {
            fileID1 = res.fileID;
            wx.getFileSystemManager().readFile({
              filePath: path1, //选择图片返回的相对路径
              encoding: 'base64', //编码格式
              success: res => { //成功的回调
                base64_1=res.data;
                self.setData({ src1: 'data:image/png;base64,' + res.data})
                if (base64_2!=''){
                  self.recognize(path1, path2, fileID1, fileID2, base64_1, base64_2)
                }
              }
            });
          },
          fail: err => {
            wx.hideLoading()
          }
        })
        wx.cloud.uploadFile({
          cloudPath: 'photo/' + e.detail.userInfo.nickName + '/' + new Date().getTime() + '.png',
          filePath: path2, // 文件路径
          success: res => {
            fileID2 = res.fileID;
            wx.getFileSystemManager().readFile({
              filePath: path2, //选择图片返回的相对路径
              encoding: 'base64', //编码格式
              success: res => { //成功的回调
                base64_2 = res.data;
                self.setData({ src2: 'data:image/png;base64,' + res.data })
                if (base64_1 != '') {
                  self.recognize(path1, path2, fileID1, fileID2, base64_1, base64_2)
                }
              }
            });
          },
          fail: err => {
            wx.hideLoading()
          }
        })
        wx.showLoading({
          title: '分析照片中',
        })
      }
    });
  },
  recognize: function (path1, path2, fileID1, fileID2, base64_1, base64_2){
    var self=this;
    wx.request({
      method: 'POST',
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/match?access_token=24.786bd0ac15d45fb2b13c3977f3aac0a2.2592000.1564899556.282335-16719910', //仅为示例，并非真实的接口地址
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
        console.log(res)
        if (res.data.error_code == 0) {
          var score = res.data.result.score;
          score = parseInt(score*3);
          self.setData({score:score})
          app.globalData.db.collection('couples').add({
            data: {
              userInfo: app.globalData.userInfo,
              fileID1: fileID1,
              fileID2: fileID2,
              score: score,
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
            showCancel: false,
            success(res) {

            }
          })
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.request({
      method: 'POST',
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/match?access_token=24.786bd0ac15d45fb2b13c3977f3aac0a2.2592000.1564899556.282335-16719910', //仅为示例，并非真实的接口地址
      data: [
        {
          "image": "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1562515592956&di=c8692933b174ec007ebacbbd96dc695a&imgtype=0&src=http%3A%2F%2Fimage13.m1905.cn%2Fuploadfile%2F2014%2F1223%2F20141223050349732.jpg",
          "image_type": "URL"
        },
        {
          "image": "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1562515622857&di=eeea45b9297157b464717d99e85f3a51&imgtype=0&src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fitem%2F201503%2F21%2F20150321152452_EcLZZ.jpeg",
          "image_type": "URL",
        }
      ],
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res)
        if (res.data.error_code == 0) {
          console.log(res)
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