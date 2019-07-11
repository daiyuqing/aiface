const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  showPhoto: function (e) {
    var fileID = e.currentTarget.dataset.fileId;
    wx.cloud.getTempFileURL({
      fileList: [fileID],
      success: res => {
        // get temp file URL
        console.log(res.fileList)
        wx.previewImage({
          current: '', // 当前显示图片的http链接
          urls: [res.fileList[0].tempFileURL] // 需要预览的图片http链接列表
        })
      },
      fail: err => {
        // handle error
      }
    })
    
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var self = this;
    app.globalData.db.collection('faces').where({
      _openid: app.globalData.openid
    }).get({
      success: function (res) {
        console.log(res)
        self.setData({ data: res.data });
      }
    })
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