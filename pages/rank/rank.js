// pages/page/rank.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rankList:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showShareMenu({
      withShareTicket: true
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.showLoading({
      title: '排名加载中..',
    })
  },
  getRankList:function(){
    var self = this;
    wx.cloud.callFunction({
      name: 'rank',
      success: res => {
        console.log(res)
        self.setData({ rankList: res.result })
        wx.hideLoading()
      },
      fail: error => {
        console.log(error)
        wx.hideLoading()
      }
    })
  },
  showPhoto:function(e){
    return
    var url=e.currentTarget.dataset.url;
    wx.previewImage({
      current: '', // 当前显示图片的http链接
      urls: [url] // 需要预览的图片http链接列表
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getRankList()
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