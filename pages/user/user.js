var util=require('../../utils/util.js');
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
    wx.showLoading({
      title: '记录加载中..',
    })
  },
  showPhoto: function (e) {
    var url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: '', // 当前显示图片的http链接
      urls: [url] // 需要预览的图片http链接列表
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
    app.globalData.db.collection('faces').orderBy('create_time', 'desc').where({
      _openid: app.globalData.openid
    }).field({
      _openid: true,
      _id: true,
      isPublic: true,
      nickName: true,
      fileID: true,
      create_time:true,
      beauty: true
    }).get({
      success: function (res) {
        console.log(res)
        var data = []
        var fileIDs=[];
        for (var i = 0; i < res.data.length; i++) {
          if (res.data[i].fileID && res.data[i].create_time) {
            res.data[i].time = util.formatTime(res.data[i].create_time);
            data.push(res.data[i]);
            fileIDs.push(res.data[i].fileID)
          }
        }
        wx.cloud.getTempFileURL({
          fileList: fileIDs,
          success: res => {
            for (let i = 0; i < data.length; i++) {
              data[i].tempFileURL = res.fileList[i].tempFileURL;
            }
            self.setData({ data: data })
            wx.hideLoading()
          },
          fail: err => {
            wx.hideLoading()
          }
        })
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