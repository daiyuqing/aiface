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
      name: 'getRank',
      success: res => {
        var data=[];
        var result = res.result;
        var openids=[];
        var fileIDs=[];
        for(let i =0;i<result.length;i++){
          if(data.length<50){
            if(result[i].fileID){
              if (openids.indexOf(result[i]._openid)==-1){
                data.push(result[i]);
                openids.push(result[i]._openid);
                fileIDs.push(result[i].fileID)
              }
            }
          }else{
            break;
          }
        }
        wx.cloud.getTempFileURL({
          fileList: fileIDs,
          success: res => {
            for (let i = 0; i < data.length; i++) {
              data[i].tempFileURL = res.fileList[i].tempFileURL;
            }
            self.setData({ rankList: data })
            console.log(data)
            wx.hideLoading()
            // self.addFace(data,0)
          },
          fail: err => {
            wx.hideLoading()
          }
        })
      },
      fail: error => {
        console.log(error)
        wx.hideLoading()
      }
    })
  },
  addFace:function(data,i){
    var self=this;
    wx.request({
      method: 'POST',
      url: 'https://aip.baidubce.com/rest/2.0/face/v3/detect?access_token=' + app.globalData.access_token, //仅为示例，并非真实的接口地址
      data: {
        "image_type": "URL",
        'image': data[i].tempFileURL,
        "face_field": "age"
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log(res.data)
        if (res.data.error_code!=0){
          self.addFace(data, ++i)
          return
        }
        var face_token = res.data.result.face_list[0].face_token
        console.log("face_token:"+face_token, "_id:"+data[i]._id)
        wx.request({
          method: 'POST',
          url: 'https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/add?access_token=' + app.globalData.access_token,
          data: {
            "image_type": "FACE_TOKEN",
            'image': face_token,
            "group_id": "aiface",
            "user_info": data[i]._openid,
            "user_id": data[i]._id
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            console.log(res)
            setTimeout(function(){
              self.addFace(data,++i)
            },1000)
          },
          fail(error) {

          }
        })
      },
      fail(error) {

      }
    })
  },
  showPhoto:function(e){
    if (e.currentTarget.dataset.isPublic==1){
      var url = e.currentTarget.dataset.url;
      wx.previewImage({
        current: '', // 当前显示图片的http链接
        urls: [url] // 需要预览的图片http链接列表
      })
    }else{
      wx.showToast({
        icon: 'none',
        title: '作者不允许查看哦~',
      })
    }
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